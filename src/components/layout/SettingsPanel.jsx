import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';

const SettingsPanel = () => {
  const { preferences, setPreferences, isSettingsOpen, setIsSettingsOpen } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(preferences);

  const handleSave = (e) => {
    e.preventDefault();
    setPreferences(formData);
    showToast('Preferences saved ✓', 'success');
    setIsSettingsOpen(false);
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[101] overflow-hidden"
          >
            <div className="p-4 border-bottom border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-[#1A3C5C]">
                <SettingsIcon size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">User Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Name</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none transition-all"
                  placeholder="Amit Kumar Singh"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none transition-all"
                  placeholder="JM Jain LLP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ex. Rate (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.defaultExchangeRate}
                    onChange={(e) => setFormData({ ...formData, defaultExchangeRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overhead %</label>
                  <input
                    type="number"
                    value={formData.defaultOverheadPct}
                    onChange={(e) => setFormData({ ...formData, defaultOverheadPct: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profit %</label>
                <input
                  type="number"
                  value={formData.defaultProfitPct}
                  onChange={(e) => setFormData({ ...formData, defaultProfitPct: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A3C5C] text-white rounded-xl font-bold text-sm hover:bg-[#142d45] transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                <Save size={16} />
                <span>Save Preferences</span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
