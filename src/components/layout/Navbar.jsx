import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useOrders } from '../../context/OrdersContext';
import { FREE_ACTIVE_ORDER_LIMIT } from '../../utils/licenseManager';
import { ProActiveTag } from '../common/ProBadge';
import PWAInstallButton from '../pwa/PWAInstallButton';
import {
  LayoutDashboard,
  FunctionSquare,
  Plus,
  Settings,
  Bell,
  Crown,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setIsNewOrderModalOpen,
    openSettings,
    isPro,
    openUpgradeModal,
    backupStatus,
  } = useApp();
  const { orders, activeOrdersCount } = useOrders();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isFreeLimitReached = !isPro && activeOrdersCount >= FREE_ACTIVE_ORDER_LIMIT;
  const showBackupDot = backupStatus.isOverdue && orders.length > 0;

  const handleNewOrderClick = () => {
    if (isFreeLimitReached) {
      openUpgradeModal('Unlimited Active Orders');
      return;
    }
    setIsNewOrderModalOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'formulas', label: 'Quick Formulas', icon: FunctionSquare, path: '/formulas' },
  ];

  // Dynamically calculate notifications from orders list
  const notifications = useMemo(() => {
    let alerts = [];
    orders.forEach((order) => {
      if (order.isArchived) return;

      // 1. Overdue/At-Risk milestones
      if (order.tnaState?.milestones) {
        order.tnaState.milestones.forEach((m) => {
          if (m.status === 'overdue' && !m.isComplete) {
            alerts.push({
              id: `${order.id}-m-overdue-${m.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'tna',
              title: 'Overdue Milestone',
              text: `Milestone '${m.name}' is overdue`,
              severity: 'high',
            });
          } else if (m.status === 'at-risk' && !m.isComplete) {
            alerts.push({
              id: `${order.id}-m-atrisk-${m.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'tna',
              title: 'Milestone At Risk',
              text: `Milestone '${m.name}' is nearing target date`,
              severity: 'medium',
            });
          }
        });
      }

      // 2. Pending/Rejected approvals
      if (order.approvals) {
        order.approvals.forEach((app) => {
          if (app.status === 'SUBMITTED') {
            alerts.push({
              id: `${order.id}-app-submitted-${app.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'logistic',
              title: 'Approval Review Pending',
              text: `'${app.name}' submitted for review action.`,
              severity: 'medium',
            });
          } else if (app.status === 'REJECTED') {
            alerts.push({
              id: `${order.id}-app-rejected-${app.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'logistic',
              title: 'Sample Rejected',
              text: `'${app.name}' sample has been rejected`,
              severity: 'high',
            });
          }
        });
      }

      // 3. Imminent Shipments
      if (order.shipDate && order.status !== 'SHIPPED') {
        const diff = Math.ceil((new Date(order.shipDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 15) {
          alerts.push({
            id: `${order.id}-ship-soon`,
            orderId: order.id,
            poNumber: order.poNumber,
            styleName: order.styleName,
            tab: 'logistic',
            title: 'Shipment Countdown',
            text: `Ships in ${diff} days (${format(new Date(order.shipDate), 'dd MMM')})`,
            severity: 'critical',
          });
        }
      }
    });

    return alerts;
  }, [orders]);

  return (
    <nav className="bg-[#1A3C5C] text-white shadow-lg sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-[#E8622A] rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">
                G
              </div>
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">GarmentCalc</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      location.pathname === item.path
                        ? 'bg-[#E8622A] text-white shadow-md'
                        : 'text-gray-300 hover:bg-[#244b70] hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Smart PWA Install App Button (auto-hides in standalone mode) */}
            <PWAInstallButton variant="navbar" />

            {/* Pro / Upgrade trigger */}
            {isPro ? (
              <button
                onClick={() => openUpgradeModal(null)}
                className="hover:opacity-90 transition-opacity"
                title="Manage GarmentCalc Pro License"
              >
                <ProActiveTag />
              </button>
            ) : (
              <button
                onClick={() => openUpgradeModal(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300/30 text-amber-200 text-xs font-bold transition-colors whitespace-nowrap"
              >
                <Crown size={14} />
                <span>Upgrade Pro</span>
              </button>
            )}

            {/* Notifications panel bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-300 hover:text-white relative"
                title={`${notifications.length} Alerts`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Active Alerts</span>
                      <span className="text-xs font-semibold text-gray-500 tabular-nums">{notifications.length} items</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="px-5 py-8 text-center text-xs text-gray-400 font-medium italic">
                          No alerts detected in active orders.
                        </p>
                      ) : (
                        notifications.map((alert) => (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              navigate(`/orders/${alert.orderId}/${alert.tab}`);
                            }}
                            className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer space-y-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[11px] font-bold ${
                                  alert.severity === 'critical' || alert.severity === 'high'
                                    ? 'text-red-600'
                                    : 'text-[#1A3C5C]'
                                }`}
                              >
                                {alert.title}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-600 leading-snug">{alert.text}</p>
                            <div className="text-[11px] text-gray-400">
                              {alert.poNumber} · {alert.styleName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleNewOrderClick}
              className="flex items-center space-x-2 px-4 py-2 bg-[#E8622A] hover:bg-[#d15624] rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span>New Order</span>
            </button>

            <button
              onClick={() => openSettings('company')}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-300 hover:text-white relative"
              title={showBackupDot ? 'Settings (Backup recommended)' : 'Settings & Backup'}
            >
              <Settings size={20} />
              {showBackupDot && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#1A3C5C]" />
              )}
            </button>
          </div>

          {/* Mobile Quick Top-Right Actions (Install + Pro + Settings) */}
          <div className="flex md:hidden items-center gap-1.5">
            <PWAInstallButton variant="mobile" />
            <button
              onClick={() => openUpgradeModal(null)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-300/30 text-amber-200 text-[11px] font-bold"
            >
              <Crown size={13} />
              <span>{isPro ? 'Pro' : 'Upgrade'}</span>
            </button>
            <button
              onClick={() => openSettings('company')}
              className="p-2 text-gray-200 hover:bg-white/10 rounded-lg relative"
              aria-label="Workspace Settings"
            >
              <Settings size={19} />
              {showBackupDot && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#1A3C5C]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-t border-[#244b70]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-[#E8622A] text-white'
                : 'text-gray-300 hover:bg-[#244b70]'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-300 hover:bg-[#244b70] relative"
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-6 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <span>Alerts</span>
        </button>
        <button
          onClick={handleNewOrderClick}
          className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-300 hover:bg-[#244b70]"
        >
          <Plus size={18} />
          <span>New</span>
        </button>
      </div>

      {/* Mobile notifications overlay popup banner */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 bg-white text-gray-800 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[60] flex flex-col">
            <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Active Alerts</span>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-gray-500">
                Close
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
              {notifications.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-gray-400 font-medium italic">
                  No notifications detected.
                </p>
              ) : (
                notifications.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate(`/orders/${alert.orderId}/${alert.tab}`);
                    }}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left space-y-1"
                  >
                    <span
                      className={`text-[11px] font-bold block ${
                        alert.severity === 'critical' || alert.severity === 'high' ? 'text-red-600' : 'text-[#1A3C5C]'
                      }`}
                    >
                      {alert.title}
                    </span>
                    <p className="text-xs font-medium text-gray-600 leading-tight">{alert.text}</p>
                    <div className="text-[11px] text-gray-400">{alert.poNumber}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
