import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { buildOrderCostingPayload } from '../../utils/orderCostingSummary';
import { generateCostingPDF } from '../costing/CostingPDF';
import { exportTNAToExcel, exportTNAToCSV } from '../../utils/tnaExport';
import { getOrderUrgency } from '../../utils/orderAlerts';
import ProBadge from '../common/ProBadge';
import SendAlertModal from './SendAlertModal';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Info,
  Calculator,
  Calendar,
  MessageSquare,
  ChevronRight,
  Truck,
  FileText,
  FileSpreadsheet,
  BellRing,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const { preferences, isPro, openUpgradeModal } = useApp();
  const { showToast } = useToast();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isTnaExportMenuOpen, setIsTnaExportMenuOpen] = useState(false);

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const urgency = useMemo(() => (order ? getOrderUrgency(order) : null), [order]);

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
    {
      id: 'tna',
      label: 'TNA',
      icon: Calendar,
      path: 'tna',
      badge: urgency?.overdueMilestones?.length || 0,
    },
    { id: 'logistic', label: 'Approvals & Logistics', icon: Truck, path: 'logistic' },
    { id: 'activity', label: 'Activity & Logs', icon: MessageSquare, path: 'activity' },
  ];

  const currentTab = location.pathname.split('/').pop() === id ? 'info' : location.pathname.split('/').pop();

  const handleStatusChange = (newStatus) => {
    const note = window.prompt(`Explain why you are moving order to ${newStatus} (optional):`, '');
    if (note !== null) {
      updateOrder(
        id,
        { status: newStatus, statusNotes: note || `Shifted status to ${newStatus}` },
        preferences?.userName || 'Merchandiser'
      );
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

  const handleExportCostingPDF = () => {
    if (!isPro) {
      openUpgradeModal('Buyer-Ready Costing PDF Export');
      return;
    }
    try {
      const payload = buildOrderCostingPayload(order, preferences);
      const fileName = generateCostingPDF(payload.data, payload.results, payload.quotation, {
        companyProfile: preferences,
        modeOverride: 'buyer',
      });
      showToast(`Buyer-ready Costing PDF downloaded (${fileName})`, 'success');
    } catch (err) {
      console.error('Costing PDF export failed:', err);
      showToast('Failed to generate Costing PDF', 'error');
    }
  };

  const handleExportTNA = (formatType = 'xlsx') => {
    setIsTnaExportMenuOpen(false);
    if (!isPro) {
      openUpgradeModal('TNA Excel & CSV Export');
      return;
    }
    try {
      if (formatType === 'csv') {
        const fileName = exportTNAToCSV({ order, preferences });
        showToast(`TNA Calendar exported to CSV (${fileName})`, 'success');
      } else {
        const fileName = exportTNAToExcel({ order, preferences });
        showToast(`TNA Calendar exported to Excel (${fileName})`, 'success');
      }
    } catch (err) {
      console.error('TNA export failed:', err);
      showToast('Failed to export TNA calendar', 'error');
    }
  };

  const statusPipeline = ['ENQUIRY', 'SAMPLING', 'CONFIRMED', 'PRODUCTION', 'QC', 'PACKING', 'SHIPPED'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 shrink-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span>Dashboard</span>
                  <ChevronRight size={12} />
                  <span className="truncate">{order.buyerName}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#1A3C5C] tracking-tight truncate">
                  {order.poNumber} — {order.styleName}
                </h1>
              </div>
            </div>

            {/* Order Action Toolbar: Exports + Critical Alert + Archive/Delete */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Conditional 1-Click Send Alert Button */}
              {urgency?.needsAlert && (
                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                >
                  <BellRing size={14} />
                  <span>Send Alert</span>
                </button>
              )}

              {/* 1-Click Buyer-Ready Costing PDF */}
              <button
                onClick={handleExportCostingPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
              >
                <FileText size={14} />
                <span>Export Costing PDF</span>
                <ProBadge locked={!isPro} size="xs" />
              </button>

              {/* 1-Click Export TNA to Excel / CSV */}
              <div className="relative">
                <div className="inline-flex rounded-xl shadow-sm">
                  <button
                    onClick={() => handleExportTNA('xlsx')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-l-xl text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Export TNA Excel</span>
                    <ProBadge locked={!isPro} size="xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTnaExportMenuOpen((prev) => !prev)}
                    className="px-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-r-xl border-l border-emerald-500/40 transition-colors"
                    aria-label="More TNA export formats"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {isTnaExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <button
                      onClick={() => handleExportTNA('xlsx')}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>Excel (.xlsx)</span>
                      <ProBadge locked={!isPro} size="xs" />
                    </button>
                    <button
                      onClick={() => handleExportTNA('csv')}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>CSV (.csv)</span>
                      <ProBadge locked={!isPro} size="xs" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleArchive}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              >
                <Archive size={14} />
                <span className="hidden sm:inline">{order.isArchived ? 'Restore' : 'Archive'}</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                title="Delete order"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="mt-5 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {statusPipeline.map((status, i) => (
              <React.Fragment key={status}>
                <button
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                    order.status === status
                      ? 'bg-[#E8622A] text-white shadow-md'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
                {i < statusPipeline.length - 1 && <div className="w-4 h-px bg-gray-100 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`relative py-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  currentTab === tab.id ? 'text-[#1A3C5C]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                {tab.alert && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums">
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
                isOrderContext={true}
                orderId={order.id}
              />
            }
          />
          <Route path="logistic" element={<ApprovalsLogisticsTab order={order} />} />
          <Route path="activity" element={<ActivityTab order={order} />} />
        </Routes>
      </div>

      {/* Critical Milestone Alert Modal */}
      <SendAlertModal
        order={order}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
};

export default OrderDetail;
