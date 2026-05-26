import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ClipboardList, Calendar, Trash2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const MyCostingsPanel = ({ onLoadCosting, onLoadTNA }) => {
  const { 
    isMyCostingsOpen, 
    setIsMyCostingsOpen, 
    savedCostings, 
    deleteCosting, 
    saveCosting,
    savedTNAs,
    deleteTNA,
    saveTNA
  } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('costings');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleLoadCosting = (item) => {
    onLoadCosting(item.state);
    setIsMyCostingsOpen(false);
    showToast(`Costing loaded: ${item.name}`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateCosting = (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      name: `Copy of ${item.name}`,
      savedAt: new Date().toISOString()
    };
    const result = saveCosting(newItem);
    if (result.success) {
      showToast('Costing duplicated', 'success');
    } else {
      showToast(result.message, 'warning');
    }
  };

  const handleDeleteCosting = (id) => {
    deleteCosting(id);
    showToast('Costing deleted', 'success');
    setDeleteConfirm(null);
  };

  const handleLoadTNA = (item) => {
    onLoadTNA(item.state);
    setIsMyCostingsOpen(false);
    showToast(`TNA loaded: ${item.name}`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateTNA = (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      name: `Copy of ${item.name}`,
      savedAt: new Date().toISOString()
    };
    const result = saveTNA(newItem);
    if (result.success) {
      showToast('TNA duplicated', 'success');
    } else {
      showToast(result.message, 'warning');
    }
  };

  const handleDeleteTNA = (id) => {
    deleteTNA(id);
    showToast('TNA deleted', 'success');
    setDeleteConfirm(null);
  };

  return (
    <AnimatePresence>
      {isMyCostingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMyCostingsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-[#1A3C5C] tracking-tight">My Saved Data</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {activeTab === 'costings' 
                    ? `${savedCostings.length} costings saved (30 max)` 
                    : `${savedTNAs.length} TNAs saved (30 max)`}
                </p>
              </div>
              <button 
                onClick={() => setIsMyCostingsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-gray-100/50 m-4 rounded-xl">
              <button
                onClick={() => setActiveTab('costings')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'costings' ? 'bg-white text-[#1A3C5C] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Costings
              </button>
              <button
                onClick={() => setActiveTab('tnas')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'tnas' ? 'bg-white text-[#1A3C5C] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                TNA Calendars
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {activeTab === 'costings' ? (
                savedCostings.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <ClipboardList size={32} className="text-gray-200" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">No costings saved yet</p>
                      <p className="text-sm text-gray-300 mt-1">Fill in a costing and click 💾 Save Costing</p>
                    </div>
                  </div>
                ) : (
                  savedCostings.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-[#1A3C5C] leading-tight">{item.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.buyerName || 'No Buyer'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300">{format(new Date(item.savedAt), 'dd MMM yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">FOB Price</p>
                          <p className="text-sm font-black text-[#E8622A]">${item.finalFOB?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Order Qty</p>
                          <p className="text-sm font-black text-[#1A3C5C]">{item.orderQty?.toLocaleString()} pcs</p>
                        </div>
                      </div>

                      {deleteConfirm === item.id ? (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Delete this costing? This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteCosting(item.id)}
                              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                              Yes, Delete
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 py-2 bg-white text-gray-400 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleLoadCosting(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-[#1A3C5C] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <ExternalLink size={12} />
                            Load
                          </button>
                          <button 
                            onClick={() => handleDuplicateCosting(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-[#1A3C5C] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <Copy size={12} />
                            Duplicate
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                savedTNAs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Calendar size={32} className="text-gray-200" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">No TNAs saved yet</p>
                      <p className="text-sm text-gray-300 mt-1">Fill in a TNA and click 💾 Save TNA</p>
                    </div>
                  </div>
                ) : (
                  savedTNAs.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-[#1A3C5C] leading-tight">{item.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.styleName || 'No Style'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300">{format(new Date(item.savedAt), 'dd MMM yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Ship Date</p>
                          <p className="text-sm font-black text-[#E8622A]">{format(new Date(item.shipDate), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Order Qty</p>
                          <p className="text-sm font-black text-[#1A3C5C]">{item.orderQty?.toLocaleString()} pcs</p>
                        </div>
                      </div>

                      {deleteConfirm === item.id ? (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Delete this TNA? This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteTNA(item.id)}
                              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                              Yes, Delete
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 py-2 bg-white text-gray-400 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleLoadTNA(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-[#1A3C5C] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <ExternalLink size={12} />
                            Load
                          </button>
                          <button 
                            onClick={() => handleDuplicateTNA(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-[#1A3C5C] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <Copy size={12} />
                            Duplicate
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MyCostingsPanel;
