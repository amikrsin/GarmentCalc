import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';

const NewOrderModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { preferences } = useApp();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    buyerName: '',
    styleName: '',
    category: 'Knit T-Shirts / Polos',
    orderType: 'FOB',
    initialStatus: 'ENQUIRY',
    shipDate: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
    orderQty: 1000,
    season: '',
    destinationCountry: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.buyerName) newErrors.buyerName = 'Buyer name is required';
    if (!formData.styleName) newErrors.styleName = 'Style name / PO is required';
    if (!formData.shipDate) newErrors.shipDate = 'Ship date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newOrder = createOrder(formData);
    showToast('Order created successfully ✓', 'success');
    onClose();
    navigate(`/orders/${newOrder.id}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-xl font-black text-[#1A3C5C] tracking-tight">Create New Order</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Step 1: Basic Information</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer Name *</label>
                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.buyerName ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all`}
                  placeholder="e.g. H&M, Zara"
                />
                {errors.buyerName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.buyerName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style Name / PO *</label>
                <input
                  type="text"
                  value={formData.styleName}
                  onChange={(e) => setFormData({ ...formData, styleName: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.styleName ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all`}
                  placeholder="e.g. PO-2026-HM-4521"
                />
                {errors.styleName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.styleName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                >
                  <option>Knit T-Shirts / Polos</option>
                  <option>Woven Shirts</option>
                  <option>Denim / Bottoms</option>
                  <option>Sweaters / Knitwear</option>
                  <option>Outerwear / Jackets</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Type</label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                  >
                    <option>FOB</option>
                    <option>CMT</option>
                    <option>CM</option>
                    <option>LDP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initial Status</label>
                  <select
                    value={formData.initialStatus}
                    onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                  >
                    <option value="ENQUIRY">Enquiry</option>
                    <option value="SAMPLING">Sampling</option>
                    <option value="CONFIRMED">Confirmed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Ship Date *</label>
                <input
                  type="date"
                  value={formData.shipDate}
                  onChange={(e) => setFormData({ ...formData, shipDate: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.shipDate ? 'border-red-300' : 'border-gray-100'} rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Qty</label>
                <input
                  type="number"
                  value={formData.orderQty}
                  onChange={(e) => setFormData({ ...formData, orderQty: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Season</label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                  placeholder="e.g. SS26"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</label>
                <input
                  type="text"
                  value={formData.destinationCountry}
                  onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                  placeholder="e.g. Germany"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] flex items-center justify-center gap-2 py-4 bg-[#1A3C5C] text-white rounded-2xl font-bold text-sm hover:bg-[#142d45] transition-all shadow-lg shadow-blue-100"
              >
                <span>Create Order</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewOrderModal;
