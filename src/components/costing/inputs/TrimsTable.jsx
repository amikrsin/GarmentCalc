import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { STANDARD_TRIMS, CATEGORY_TRIMS } from '../../../constants/trimDefaults';

const TrimsTable = ({ trims, category, currency = 'USD', onChange }) => {
  // Auto-load defaults when category changes
  useEffect(() => {
    if (trims.length === 0) {
      const defaults = [
        ...STANDARD_TRIMS,
        ...(CATEGORY_TRIMS[category] || [])
      ].map((t, i) => ({ ...t, id: `trim-${Date.now()}-${i}` }));
      onChange(defaults);
    }
  }, [category]);

  const addRow = () => {
    const newRow = {
      id: `trim-${Date.now()}`,
      name: 'New Trim',
      qty: 1,
      unit: 'pc',
      price: 0,
    };
    onChange([...trims, newRow]);
  };

  const removeRow = (id) => {
    onChange(trims.filter(t => t.id !== id));
  };

  const updateRow = (id, field, value) => {
    onChange(trims.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="space-y-4">
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-gray-400 uppercase">
        <div className="col-span-5">Trim Item</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-2">Unit</div>
        <div className="col-span-2">Price/Unit ({currency})</div>
        <div className="col-span-1"></div>
      </div>
      
      <div className="space-y-2">
        {trims.map((trim) => (
          <div key={trim.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-3 bg-white border border-gray-100 rounded-xl items-center">
            <div className="col-span-5">
              <input
                type="text"
                value={trim.name}
                onChange={(e) => updateRow(trim.id, 'name', e.target.value)}
                className="w-full px-2 py-1 border-none focus:ring-0 text-sm font-medium text-gray-700"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.001"
                value={trim.qty}
                onChange={(e) => updateRow(trim.id, 'qty', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-100 rounded text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={trim.unit}
                onChange={(e) => updateRow(trim.id, 'unit', e.target.value)}
                className="w-full px-2 py-1 border border-gray-100 rounded text-sm outline-none text-center"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                value={trim.price}
                onChange={(e) => updateRow(trim.id, 'price', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-100 rounded text-sm outline-none"
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => removeRow(trim.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center space-x-2 text-xs font-bold text-[#E8622A] hover:text-[#d15624] transition-colors px-4 py-2"
      >
        <Plus size={14} />
        <span>Add Custom Trim</span>
      </button>
    </div>
  );
};

export default TrimsTable;
