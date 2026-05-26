import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  AlertCircle, 
  CheckCircle2,
  Package,
  Ship,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    orders, 
    activeFilter, 
    setActiveFilter, 
    activeBuyer, 
    setActiveBuyer,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery
  } = useOrders();
  const { setIsNewOrderModalOpen, preferences } = useApp();

  // 1. Calculations for Summary Bar
  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => !o.isArchived);
    const critical = activeOrders.filter(o => {
      if (!o.tnaState?.milestones) return false;
      return o.tnaState.milestones.some(m => m.status === 'overdue');
    });
    const shipSoon = activeOrders.filter(o => {
      const daysLeft = differenceInDays(new Date(o.shipDate), new Date());
      return daysLeft >= 0 && daysLeft <= 30;
    });
    const totalFobValue = activeOrders
      .filter(o => ['CONFIRMED', 'PRODUCTION', 'QC', 'PACKING'].includes(o.status))
      .reduce((acc, o) => acc + (o.totalFOBValue || 0), 0);

    return {
      total: activeOrders.length,
      critical: critical.length,
      shipSoon: shipSoon.length,
      fobValue: totalFobValue
    };
  }, [orders]);

  // 2. Filtering & Sorting Logic
  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => !o.isArchived);

    // Status Filter
    if (activeFilter === 'Critical Only') {
      result = result.filter(o => {
        const isCritical = o.tnaState?.milestones?.some(m => m.status === 'overdue');
        const shipSoon = differenceInDays(new Date(o.shipDate), new Date()) <= 14;
        return isCritical || shipSoon;
      });
    } else if (activeFilter !== 'All') {
      result = result.filter(o => o.status === activeFilter.toUpperCase());
    }

    // Buyer Filter
    if (activeBuyer !== 'All Buyers') {
      result = result.filter(o => o.buyerName === activeBuyer);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.poNumber?.toLowerCase().includes(q) ||
        o.buyerName?.toLowerCase().includes(q) ||
        o.styleName?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'Ship Date ↑':
          return new Date(a.shipDate) - new Date(b.shipDate);
        case 'Ship Date ↓':
          return new Date(b.shipDate) - new Date(a.shipDate);
        case 'Created Date ↓':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'Buyer A→Z':
          return a.buyerName.localeCompare(b.buyerName);
        case 'Order Value ↓':
          return (b.totalFOBValue || 0) - (a.totalFOBValue || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, activeFilter, activeBuyer, searchQuery, sortBy]);

  const buyers = useMemo(() => {
    const uniqueBuyers = [...new Set(orders.map(o => o.buyerName))].filter(Boolean);
    return ['All Buyers', ...uniqueBuyers];
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Morning Alert Banner */}
      <AnimatePresence>
        {stats.critical > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <div className="text-sm">
                <span className="font-bold">{stats.critical} orders need your attention today</span>
                <span className="mx-2 text-red-300">·</span>
                <span>Approaching ship dates and overdue milestones detected.</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilter('Critical Only')}
              className="text-xs font-bold uppercase tracking-widest text-red-700 hover:underline"
            >
              View Critical Only →
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-green-700 shadow-sm"
          >
            <CheckCircle2 size={20} />
            <div className="text-sm font-medium">All orders on track — good morning {preferences.userName.split(' ')[0]}!</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical', value: stats.critical, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', suffix: stats.critical > 0 ? ' 🔴' : '' },
          { label: 'Ship <30 Days', value: stats.shipSoon, icon: Ship, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'FOB Value', value: `$${stats.fobValue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-[#1A3C5C]">{stat.value}{stat.suffix}</p>
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
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f 
                    ? 'bg-[#1A3C5C] text-white shadow-md' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-64">
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
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1A3C5C]/10"
            >
              {buyers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1A3C5C]/10"
            >
              {['Ship Date ↑', 'Ship Date ↓', 'Created Date ↓', 'Buyer A→Z', 'Order Value ↓'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
            <Package size={40} />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-bold text-[#1A3C5C]">No orders found</h3>
            <p className="text-sm text-gray-400 mt-2">Adjust your filters or add your first order to get started.</p>
          </div>
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#E8622A] text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add First Order</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onClick }) => {
  const daysLeft = differenceInDays(new Date(order.shipDate), new Date());
  
  const statusColors = {
    ENQUIRY: 'bg-slate-100 text-slate-600',
    SAMPLING: 'bg-blue-100 text-blue-600',
    CONFIRMED: 'bg-purple-100 text-purple-600',
    PRODUCTION: 'bg-orange-100 text-orange-600',
    QC: 'bg-yellow-100 text-yellow-700',
    PACKING: 'bg-teal-100 text-teal-600',
    SHIPPED: 'bg-green-100 text-green-600',
  };

  const overdueMilestone = order.tnaState?.milestones?.find(m => m.status === 'overdue');
  const nextMilestone = order.tnaState?.milestones?.find(m => !m.isComplete && m.status !== 'overdue');
  
  const completedCount = order.tnaState?.milestones?.filter(m => m.isComplete).length || 0;
  const totalCount = order.tnaState?.milestones?.length || 0;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const latestComment = order.comments?.[0];

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 ${
        overdueMilestone ? 'border-red-500' : 
        order.tnaState?.milestones?.some(m => m.status === 'at-risk') ? 'border-orange-400' : 'border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status]}`}>
          {order.status}
        </span>
        {overdueMilestone && (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-wider">
            <AlertCircle size={12} />
            Overdue
          </span>
        )}
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-lg font-black text-[#1A3C5C] tracking-tight truncate">{order.poNumber}</h3>
          <span className="text-sm font-bold text-gray-400">{order.buyerName}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{order.styleName} — {order.season}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty</p>
          <p className="text-sm font-black text-[#1A3C5C]">{order.orderQty.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">FOB</p>
          <p className="text-sm font-black text-[#E8622A]">${order.fobPrice?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</p>
          <p className="text-sm font-black text-[#1A3C5C]">${(order.totalFOBValue || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ship Date</p>
          <p className="text-sm font-bold text-[#1A3C5C]">{format(new Date(order.shipDate), 'dd MMM yyyy')}</p>
        </div>
        <div className={`px-3 py-1 rounded-xl text-xs font-black ${
          daysLeft < 7 ? 'bg-red-50 text-red-600' :
          daysLeft < 30 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
        }`}>
          <Clock size={12} className="inline mr-1 mb-0.5" />
          {daysLeft} days left
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-50">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-400">TNA Progress</span>
            <span className="text-[#1A3C5C]">{completedCount}/{totalCount}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-[#1A3C5C]"
            />
          </div>
        </div>

        {overdueMilestone ? (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">⚠️ {overdueMilestone.name}</span>
          </div>
        ) : nextMilestone ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">Next: {nextMilestone.name} — {format(new Date(nextMilestone.date), 'dd MMM')}</span>
          </div>
        ) : null}

        {latestComment && (
          <div className="bg-gray-50 p-3 rounded-2xl space-y-1 mt-2">
            <p className="text-[11px] text-gray-600 italic line-clamp-2">"{latestComment.text}"</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {latestComment.authorName} · {format(new Date(latestComment.timestamp), 'dd MMM, p')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
