import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useOrders } from '../../context/OrdersContext';
import { 
  LayoutDashboard, 
  FunctionSquare, 
  Plus, 
  Settings, 
  Bell, 
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsNewOrderModalOpen, setIsSettingsOpen } = useApp();
  const { orders } = useOrders();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'formulas', label: 'Quick Formulas', icon: FunctionSquare, path: '/formulas' },
  ];

  // Dynamically calculate notifications from orders list
  const notifications = useMemo(() => {
    let alerts = [];
    orders.forEach(order => {
      // 1. Overdue/At-Risk milestones
      if (order.tnaState?.milestones) {
        order.tnaState.milestones.forEach(m => {
          if (m.status === 'overdue' && !m.isComplete) {
            alerts.push({
              id: `${order.id}-m-overdue-${m.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'tna',
              title: 'Overdue Milestone ⏱️',
              text: `Milestone '${m.name}' is OVERDUE!`,
              severity: 'high'
            });
          } else if (m.status === 'at-risk' && !m.isComplete) {
            alerts.push({
              id: `${order.id}-m-atrisk-${m.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'tna',
              title: 'Milestone At Risk ⚠️',
              text: `Milestone '${m.name}' is nearing target date!`,
              severity: 'medium'
            });
          }
        });
      }

      // 2. Pending/Rejected approvals
      if (order.approvals) {
        order.approvals.forEach(app => {
          if (app.status === 'SUBMITTED') {
            alerts.push({
              id: `${order.id}-app-submitted-${app.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'logistic',
              title: 'Approval Review Pending 📤',
              text: `'${app.name}' submitted for review action.`,
              severity: 'medium'
            });
          } else if (app.status === 'REJECTED') {
            alerts.push({
              id: `${order.id}-app-rejected-${app.id}`,
              orderId: order.id,
              poNumber: order.poNumber,
              styleName: order.styleName,
              tab: 'logistic',
              title: 'Sample Rejected ❌',
              text: `'${app.name}' sample has been REJECTED!`,
              severity: 'high'
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
            title: 'Shipment Countdown 🛳️',
            text: `Ships in ${diff} days (${format(new Date(order.shipDate), 'dd MMM')})!`,
            severity: 'critical'
          });
        }
      }
    });

    return alerts;
  }, [orders]);

  return (
    <nav className="bg-[#1A3C5C] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-[#E8622A] rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">G</div>
              <span className="text-xl font-bold tracking-tight">GarmentCalc</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
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
          
          <div className="hidden md:flex items-center space-x-3">
            {/* Notifications panel bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-300 hover:text-white relative"
                title={`${notifications.length} Alerts`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-bounce">
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
                    className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-[#1A3C5C] uppercase tracking-wider">Active Alerts</span>
                      <span className="px-2 py-0.5 bg-[#E8622A]/10 text-[#E8622A] text-[9px] font-black rounded-full uppercase tracking-wider">{notifications.length} Info</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="px-5 py-8 text-center text-xs text-gray-400 font-medium italic">No alerts detected in active orders.</p>
                      ) : (
                        notifications.map(alert => (
                          <div 
                            key={alert.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              navigate(`/orders/${alert.orderId}/${alert.tab}`);
                            }}
                            className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer space-y-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black tracking-wider text-[#1A3C5C] uppercase">{alert.title}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'high' ? 'bg-orange-500' : 'bg-blue-400'
                              }`} />
                            </div>
                            <p className="text-xs font-medium text-gray-600 leading-snug">{alert.text}</p>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Order: {alert.poNumber} — {alert.styleName}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsNewOrderModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#E8622A] hover:bg-[#d15624] rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
              <span>New Order</span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-300 hover:text-white"
              title="Settings"
            >
              <Settings size={20} />
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
            <item.icon size={20} />
            <span>{item.label.split(' ')[0]}</span>
          </button>
        ))}
        {/* Mobile alert bubble indicators */}
        <button
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
          }}
          className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-300 hover:bg-[#244b70] relative"
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-5 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <span>Alerts</span>
        </button>
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-300 hover:bg-[#244b70]"
        >
          <Plus size={20} />
          <span>New</span>
        </button>
      </div>

      {/* Mobile notifications overlay popup banner */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 bg-white text-gray-800 rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-[60] flex flex-col">
            <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-[#1A3C5C] uppercase tracking-wider">Active Mobile Alerts</span>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-gray-400">Close</button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
              {notifications.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-gray-400 font-medium italic">No notifications detected.</p>
              ) : (
                notifications.map(alert => (
                  <div 
                    key={alert.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate(`/orders/${alert.orderId}/${alert.tab}`);
                    }}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-wider text-[#1A3C5C] uppercase">{alert.title}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                    </div>
                    <p className="text-xs font-medium text-gray-650 leading-tight">{alert.text}</p>
                    <div className="text-[9px] font-bold text-gray-400">Order: {alert.poNumber}</div>
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
