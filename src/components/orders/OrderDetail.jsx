import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowLeft, 
  Edit3, 
  Archive, 
  Trash2, 
  Info, 
  Calculator, 
  Calendar, 
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OrderInfoTab from './OrderInfoTab';
import ActivityTab from './ActivityTab';
import ApprovalsLogisticsTab from './ApprovalsLogisticsTab';
import CostingModule from '../costing/CostingModule';
import TNAModule from '../tna/TNAModule';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, updateOrder, deleteOrder, archiveOrder, unarchiveOrder } = useOrders();
  const { preferences } = useApp();
  const { showToast } = useToast();

  const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C5C]">Order not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-[#E8622A] font-bold hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Order Info', icon: Info, path: '' },
    { id: 'costing', label: 'Costing', icon: Calculator, path: 'costing', alert: !order.costingState },
    { id: 'tna', label: 'TNA', icon: Calendar, path: 'tna', badge: order.tnaState?.milestones?.filter(m => m.status === 'overdue').length || 0 },
    { id: 'logistic', label: 'Approvals & Logistics', icon: Truck, path: 'logistic' },
    { id: 'activity', label: 'Activity & Logs', icon: MessageSquare, path: 'activity' },
  ];

  const currentTab = location.pathname.split('/').pop() === id ? 'info' : location.pathname.split('/').pop();

  const handleStatusChange = (newStatus) => {
    const note = window.prompt(`Explain why you are moving order to ${newStatus} (optional):`, '');
    if (note !== null) {
      updateOrder(id, { status: newStatus, statusNotes: note || `Shifted status to ${newStatus}` }, preferences?.userName || 'Merchandiser');
      showToast(`Status updated to ${newStatus}`, 'success');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${order.poNumber} permanently? This cannot be undone.`)) {
      deleteOrder(id);
      showToast('Order deleted', 'warning');
      navigate('/');
    }
  };

  const handleArchive = () => {
    if (order.isArchived) {
      unarchiveOrder(id);
      showToast('Order restored', 'success');
    } else {
      archiveOrder(id);
      showToast('Order archived', 'info');
      navigate('/');
    }
  };

  const statusPipeline = ['ENQUIRY', 'SAMPLING', 'CONFIRMED', 'PRODUCTION', 'QC', 'PACKING', 'SHIPPED'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Dashboard</span>
                  <ChevronRight size={12} />
                  <span>{order.buyerName}</span>
                </div>
                <h1 className="text-xl font-black text-[#1A3C5C] tracking-tight">
                  {order.poNumber} — {order.styleName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleArchive}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
              >
                <Archive size={16} />
                <span>{order.isArchived ? 'Restore' : 'Archive'}</span>
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
            {statusPipeline.map((status, i) => (
              <React.Fragment key={status}>
                <button
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    order.status === status 
                      ? 'bg-[#E8622A] text-white shadow-md' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
                {i < statusPipeline.length - 1 && (
                  <div className="w-4 h-px bg-gray-100 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`relative py-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  currentTab === tab.id ? 'text-[#1A3C5C]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
                {tab.alert && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />}
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
                {currentTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A3C5C]"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<OrderInfoTab order={order} />} />
          <Route 
            path="costing" 
            element={
              <CostingModule 
                restoreData={order.costingState} 
                onRestored={() => {}} 
                isOrderContext={true}
                orderId={order.id}
              />
            } 
          />
          <Route 
            path="tna" 
            element={
              <TNAModule 
                restoreData={order.tnaState} 
                onRestored={() => {}} 
                isOrderContext={true}
                orderId={order.id}
              />
            } 
          />
          <Route path="logistic" element={<ApprovalsLogisticsTab order={order} />} />
          <Route path="activity" element={<ActivityTab order={order} />} />
        </Routes>
      </div>
    </div>
  );
};

export default OrderDetail;
