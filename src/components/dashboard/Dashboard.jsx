import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { exportBackupJSON } from '../../utils/backupUtils';
import { getOrderUrgency } from '../../utils/orderAlerts';
import { FREE_ACTIVE_ORDER_LIMIT } from '../../utils/licenseManager';
import SendAlertModal from '../orders/SendAlertModal';
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  Package,
  Ship,
  TrendingUp,
  Clock,
  DatabaseBackup,
  X,
  BellRing,
  Crown,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    orders,
    activeOrdersCount,
    seedDemoOrder,
    activeFilter,
    setActiveFilter,
    activeBuyer,
    setActiveBuyer,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  } = useOrders();
  const {
    setIsNewOrderModalOpen,
    preferences,
    isPro,
    openUpgradeModal,
    openSettings,
    backupStatus,
    recordBackupNow,
    backupBannerDismissed,
    dismissBackupBanner,
  } = useApp();
  const { showToast } = useToast();

  const [alertOrder, setAlertOrder] = useState(null);

  const isFreeLimitReached = !isPro && activeOrdersCount >= FREE_ACTIVE_ORDER_LIMIT;
  const showBackupWarning = !backupBannerDismissed && orders.length > 0 && backupStatus.isOverdue;

  const handleCreateOrderClick = () => {
    if (isFreeLimitReached) {
      openUpgradeModal('Unlimited Active Orders');
      return;
    }
    setIsNewOrderModalOpen(true);
  };

  const handleLoadSampleOrder = () => {
    if (isFreeLimitReached) {
      openUpgradeModal('Unlimited Active Orders');
      return;
    }
    seedDemoOrder();
    showToast('Sample Nordstrom Polo order loaded with Costing & TNA', 'success');
  };

  const handleQuickBackup = () => {
    const { filename, exportedAt, orderCount } = exportBackupJSON({ orders, preferences });
    recordBackupNow(exportedAt);
    showToast(`Backup saved (${orderCount} orders) — ${filename}`, 'success');
  };

  // 1. Calculations for Summary Bar
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => !o.isArchived);
    const critical = activeOrders.filter((o) => getOrderUrgency(o).isCritical);
    const shipSoon = activeOrders.filter((o) => {
      const daysLeft = differenceInDays(new Date(o.shipDate), new Date());
      return o.status !== 'SHIPPED' && daysLeft >= 0 && daysLeft <= 30;
    });
    const totalFobValue = activeOrders
      .filter((o) => ['CONFIRMED', 'PRODUCTION', 'QC', 'PACKING'].includes(o.status))
      .reduce((acc, o) => acc + (o.totalFOBValue || 0), 0);

    return {
      total: activeOrders.length,
      critical: critical.length,
      shipSoon: shipSoon.length,
      fobValue: totalFobValue,
    };
  }, [orders]);

  // 2. Filtering & Sorting Logic
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => !o.isArchived);

    if (activeFilter === 'Critical Only') {
      result = result.filter((o) => {
        const urgency = getOrderUrgency(o);
        return urgency.isCritical || (urgency.daysToShip !== null && urgency.daysToShip <= 14 && o.status !== 'SHIPPED');
      });
    } else if (activeFilter !== 'All') {
      result = result.filter((o) => o.status === activeFilter.toUpperCase());
    }

    if (activeBuyer !== 'All Buyers') {
      result = result.filter((o) => o.buyerName === activeBuyer);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.poNumber?.toLowerCase().includes(q) ||
          o.buyerName?.toLowerCase().includes(q) ||
          o.styleName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'Ship Date ↑':
          return new Date(a.shipDate) - new Date(b.shipDate);
        case 'Ship Date ↓':
          return new Date(b.shipDate) - new Date(a.shipDate);
        case 'Created Date ↓':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'Buyer A→Z':
          return (a.buyerName || '').localeCompare(b.buyerName || '');
        case 'Order Value ↓':
          return (b.totalFOBValue || 0) - (a.totalFOBValue || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, activeFilter, activeBuyer, searchQuery, sortBy]);

  const buyers = useMemo(() => {
    const uniqueBuyers = [...new Set(orders.map((o) => o.buyerName))].filter(Boolean);
    return ['All Buyers', ...uniqueBuyers];
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Subtle 7-Day Backup Safety Banner */}
      <AnimatePresence>
        {showBackupWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3 text-amber-900">
              <DatabaseBackup size={18} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs sm:text-sm font-medium">
                {backupStatus.hasBackedUp
                  ? `It has been ${backupStatus.daysSinceBackup} days since your last local backup. Export a .json copy to keep your orders safe.`
                  : 'Your orders are saved only in this browser and have not been backed up yet. Export a .json copy to prevent data loss.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleQuickBackup}
                className="px-3.5 py-1.5 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                Backup Now (.json)
              </button>
              <button
                onClick={() => openSettings('backup')}
                className="px-3 py-1.5 bg-white border border-amber-200 hover:border-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Restore
              </button>
              <button
                onClick={dismissBackupBanner}
                className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                aria-label="Dismiss backup reminder"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morning Alert Banner + Plan Usage Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          {stats.critical > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle size={20} className="shrink-0" />
                <div className="text-sm">
                  <span className="font-bold">
                    {stats.critical} order{stats.critical > 1 ? 's' : ''} need your attention today
                  </span>
                  <span className="mx-2 text-red-300">·</span>
                  <span>Overdue milestones detected.</span>
                </div>
              </div>
              <button
                onClick={() => setActiveFilter('Critical Only')}
                className="text-xs font-bold uppercase tracking-wider text-red-700 hover:underline whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                View Critical Only →
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-green-700 shadow-sm">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-sm font-medium">
                All orders on track{preferences.userName ? ` — welcome back, ${preferences.userName.split(' ')[0]}` : ''}.
              </div>
            </div>
          )}
        </div>

        {/* Free Tier Active Order Quota Pill */}
        {!isPro && (
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 shadow-sm shrink-0">
            <div className="text-xs">
              <p className="font-bold text-[#1A3C5C] tabular-nums">
                {activeOrdersCount} / {FREE_ACTIVE_ORDER_LIMIT} Free Active Orders
              </p>
              <p className="text-gray-500">
                {isFreeLimitReached ? 'Limit reached — upgrade for unlimited' : 'Quick Formulas always free'}
              </p>
            </div>
            <button
              onClick={() => openUpgradeModal('Unlimited Active Orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8622A] hover:bg-[#d15624] text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <Crown size={13} />
              <span>Go Pro</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical', value: stats.critical, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Ship <30 Days', value: stats.shipSoon, icon: Ship, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'FOB Value', value: `$${stats.fobValue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl font-black text-[#1A3C5C] tabular-nums truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {['All', 'Enquiry', 'Sampling', 'Confirmed', 'Production', 'QC', 'Packing', 'Shipped', 'Critical Only'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeFilter === f
                    ? 'bg-[#1A3C5C] text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search style, buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
              />
            </div>
            <select
              value={activeBuyer}
              onChange={(e) => setActiveBuyer(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1A3C5C]/10"
            >
              {buyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1A3C5C]/10"
            >
              {['Ship Date ↑', 'Ship Date ↓', 'Created Date ↓', 'Buyer A→Z', 'Order Value ↓'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 sm:p-16 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
            <Package size={34} />
          </div>
          <div className="max-w-sm">
            <h3 className="text-lg font-bold text-[#1A3C5C]">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1.5">
              Create your first production order, restore a .json backup, or load a sample order to explore Costing, TNA & Critical Alerts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCreateOrderClick}
              className="flex items-center gap-2 px-5 py-3 bg-[#E8622A] hover:bg-[#d15624] text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              <Plus size={18} />
              <span>Add First Order</span>
            </button>
            <button
              onClick={handleLoadSampleOrder}
              className="flex items-center gap-2 px-5 py-3 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Sparkles size={16} />
              <span>Load Sample Order</span>
            </button>
            <button
              onClick={() => openSettings('backup')}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 hover:border-[#1A3C5C] text-[#1A3C5C] rounded-xl font-semibold text-sm transition-colors"
            >
              <DatabaseBackup size={16} />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
              onSendAlert={() => setAlertOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Critical Milestone Alert Modal */}
      <SendAlertModal
        order={alertOrder}
        isOpen={Boolean(alertOrder)}
        onClose={() => setAlertOrder(null)}
      />
    </div>
  );
};

const OrderCard = ({ order, onClick, onSendAlert }) => {
  const urgency = getOrderUrgency(order);
  const daysLeft = urgency.daysToShip ?? 0;

  const statusColors = {
    ENQUIRY: 'bg-slate-100 text-slate-600',
    SAMPLING: 'bg-blue-100 text-blue-600',
    CONFIRMED: 'bg-purple-100 text-purple-600',
    PRODUCTION: 'bg-orange-100 text-orange-600',
    QC: 'bg-yellow-100 text-yellow-700',
    PACKING: 'bg-teal-100 text-teal-600',
    SHIPPED: 'bg-green-100 text-green-600',
  };

  const overdueMilestone = urgency.overdueMilestones[0];
  const nextMilestone = order.tnaState?.milestones?.find((m) => !m.isComplete && m.status !== 'overdue');

  const completedCount = order.tnaState?.milestones?.filter((m) => m.isComplete).length || 0;
  const totalCount = order.tnaState?.milestones?.length || 0;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const latestComment = order.comments?.[0];

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 flex flex-col justify-between ${
        urgency.isCritical
          ? 'border-red-400'
          : order.tnaState?.milestones?.some((m) => m.status === 'at-risk')
          ? 'border-orange-300'
          : 'border-gray-100'
      }`}
    >
      <div>
        <div className="flex justify-between items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          <div className="flex items-center gap-2">
            {urgency.isCritical && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-wider">
                <AlertCircle size={12} />
                Critical
              </span>
            )}
            {urgency.needsAlert && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendAlert();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-colors whitespace-nowrap"
                title="Send WhatsApp or Email Alert"
              >
                <BellRing size={12} />
                <span>Send Alert</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="text-lg font-black text-[#1A3C5C] tracking-tight truncate">{order.poNumber}</h3>
            <span className="text-xs font-bold text-gray-500 truncate shrink-0 max-w-[45%]">{order.buyerName}</span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {order.styleName}
            {order.season ? ` — ${order.season}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty</p>
            <p className="text-sm font-black text-[#1A3C5C] tabular-nums">{(order.orderQty || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">FOB</p>
            <p className="text-sm font-black text-[#E8622A] tabular-nums">${(order.fobPrice || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</p>
            <p className="text-sm font-black text-[#1A3C5C] tabular-nums">${(order.totalFOBValue || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ship Date</p>
            <p className="text-sm font-bold text-[#1A3C5C] tabular-nums">{urgency.formattedShipDate}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-xl text-xs font-black tabular-nums ${
              daysLeft < 7
                ? 'bg-red-50 text-red-600'
                : daysLeft <= 30
                ? 'bg-orange-50 text-orange-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Clock size={12} className="inline mr-1 mb-0.5" />
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft} days left`}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-400">TNA Progress</span>
            <span className="text-[#1A3C5C] tabular-nums">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} className="h-full bg-[#1A3C5C]" />
          </div>
        </div>

        {overdueMilestone ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[11px] font-bold truncate">
              Delayed ({overdueMilestone.delayDays}d): {overdueMilestone.name}
            </span>
          </div>
        ) : nextMilestone ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={14} className="shrink-0" />
            <span className="text-[11px] font-medium truncate">
              Next: {nextMilestone.name} — {format(new Date(nextMilestone.date), 'dd MMM')}
            </span>
          </div>
        ) : null}

        {latestComment && (
          <div className="bg-gray-50 p-3 rounded-2xl space-y-1 mt-2">
            <p className="text-[11px] text-gray-600 italic line-clamp-2">"{latestComment.text}"</p>
            <p className="text-[10px] font-semibold text-gray-400">
              {latestComment.authorName} · {format(new Date(latestComment.timestamp), 'dd MMM, p')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
