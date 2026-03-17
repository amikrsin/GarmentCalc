import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { EMBELLISHMENT_TYPES } from '../../../constants/embellishments';

const EmbellishmentsSection = ({ embellishments, currency = 'USD', onChange }) => {
  const addRow = () => {
    const newRow = {
      id: `emb-${Date.now()}`,
      type: EMBELLISHMENT_TYPES[0].name,
      qty: 1,
      rate: 0,
    };
    onChange([...embellishments, newRow]);
  };

  const removeRow = (id) => {
    onChange(embellishments.filter(e => e.id !== id));
  };

  const updateRow = (id, field, value) => {
    onChange(embellishments.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="space-y-4">
      {embellishments.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-xs text-gray-400 mb-4">No embellishments added to this style</p>
          <button
            onClick={addRow}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
          >
            Add Embellishment
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {embellishments.map((emb) => {
              const typeInfo = EMBELLISHMENT_TYPES.find(t => t.name === emb.type);
              return (
                <div key={emb.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white border border-gray-100 rounded-xl items-center">
                  <div className="col-span-5">
                    <select
                      value={emb.type}
                      onChange={(e) => updateRow(emb.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm outline-none"
                    >
                      {EMBELLISHMENT_TYPES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={emb.qty}
                        onChange={(e) => updateRow(emb.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-gray-300 uppercase">
                        {typeInfo?.unit}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={emb.rate}
                        onChange={(e) => updateRow(emb.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm outline-none pl-6"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300">
                        {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'BDT' ? '৳' : '$'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeRow(emb.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={addRow}
            className="flex items-center space-x-2 text-xs font-bold text-[#4A90E2] hover:text-[#357abd] transition-colors px-4 py-2"
          >
            <Plus size={14} />
            <span>Add Another Embellishment</span>
          </button>
        </>
      )}
    </div>
  );
};

export default EmbellishmentsSection;
