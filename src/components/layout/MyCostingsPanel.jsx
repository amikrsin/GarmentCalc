import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Copy, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MyCostingsPanel = ({ isOpen, onClose, onRestoreCosting, onRestoreTNA }) => {
  const { savedCostings, deleteCosting, saveCosting, savedTNAs, deleteTNA, saveTNA } = useApp();

  const handleDuplicateCosting = (costing) => {
    const duplicate = {
      ...costing,
      id: crypto.randomUUID(),
      name: `Copy of ${costing.name}`,
      savedAt: new Date().toISOString()
    };
    saveCosting(duplicate);
  };

  const handleDuplicateTNA = (tna) => {
    const duplicate = {
      ...tna,
      id: crypto.randomUUID(),
      name: `Copy of ${tna.name}`,
      savedAt: new Date().toISOString()
    };
    saveTNA(duplicate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#1A3C5C] text-white">
          <h2 className="text-lg font-bold flex items-center space-x-2">
            <span>My Saved Data</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Costings Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-[#E8622A] border-b border-orange-100 pb-2">
              <FileText size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Saved Costings</h3>
            </div>
            
            {savedCostings.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4 text-center">No saved costings yet.</p>
            ) : (
              <div className="space-y-3">
                {savedCostings.map((costing) => (
                  <div key={costing.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-orange-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-[#1A3C5C] text-sm">{costing.name}</h4>
                        <p className="text-[10px] text-gray-500">{costing.buyerName} • ${costing.finalFOB?.toFixed(2)} FOB</p>
                      </div>
                      <span className="text-[9px] text-gray-400">{format(new Date(costing.savedAt), 'dd MMM, p')}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { onRestoreCosting(costing.state); onClose(); }}
                        className="px-2 py-1 bg-[#1A3C5C] text-white text-[10px] font-bold rounded hover:bg-[#244b70]"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => handleDuplicateCosting(costing)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Delete this costing?')) deleteCosting(costing.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* TNAs Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-[#1A3C5C] border-b border-blue-100 pb-2">
              <Calendar size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Saved TNAs</h3>
            </div>
            
            {savedTNAs.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4 text-center">No saved TNAs yet.</p>
            ) : (
              <div className="space-y-3">
                {savedTNAs.map((tna) => (
                  <div key={tna.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-[#1A3C5C] text-sm">{tna.name}</h4>
                        <p className="text-[10px] text-gray-500">{tna.styleName} • {tna.quantity} pcs</p>
                      </div>
                      <span className="text-[9px] text-gray-400">{format(new Date(tna.savedAt), 'dd MMM, p')}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { onRestoreTNA(tna.state); onClose(); }}
                        className="px-2 py-1 bg-[#1A3C5C] text-white text-[10px] font-bold rounded hover:bg-[#244b70]"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => handleDuplicateTNA(tna)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Delete this TNA?')) deleteTNA(tna.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            All data is stored locally in your browser. Clearing browser cache may remove these records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyCostingsPanel;
