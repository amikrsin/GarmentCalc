import React from 'react';
import { Plus, Trash2, Calculator, Settings } from 'lucide-react';

const FabricTable = ({ fabrics, currency = 'USD', onChange }) => {
  const addRow = () => {
    if (fabrics.length >= 4) return;
    const newRow = {
      id: `fab-${Date.now()}`,
      name: fabrics.length === 1 ? 'Lining' : fabrics.length === 2 ? 'Collar' : 'Contrast',
      description: '',
      composition: '',
      gsm: 180,
      widthInches: 58,
      consumptionMode: 'manual',
      consumption: 0,
      garmentLengthCm: 0,
      garmentWidthCm: 0,
      widthEfficiencyPct: 85,
      panels: 2,
      wastage: 8,
      shrinkage: 3,
      price: 0,
      calculatedConsumption: 0,
    };
    onChange([...fabrics, newRow]);
  };

  const removeRow = (id) => {
    if (fabrics.length <= 1) return;
    onChange(fabrics.filter(f => f.id !== id));
  };

  const updateRow = (id, field, value) => {
    onChange(fabrics.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <div className="space-y-4">
      {fabrics.map((fabric, index) => (
        <div key={fabric.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 relative">
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={fabric.name}
              onChange={(e) => updateRow(fabric.id, 'name', e.target.value)}
              className="bg-transparent border-none font-bold text-[#1A3C5C] text-sm focus:ring-0 p-0 w-1/2"
            />
            {index > 0 && (
              <button onClick={() => removeRow(fabric.id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
              <input
                type="text"
                value={fabric.description}
                onChange={(e) => updateRow(fabric.id, 'description', e.target.value)}
                placeholder="e.g. Single Jersey"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Composition</label>
              <input
                type="text"
                value={fabric.composition}
                onChange={(e) => updateRow(fabric.id, 'composition', e.target.value)}
                placeholder="e.g. 100% Cotton"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">GSM</label>
              <input
                type="number"
                value={fabric.gsm}
                onChange={(e) => updateRow(fabric.id, 'gsm', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 py-2 border-y border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Consumption Mode:</span>
            <div className="flex bg-white p-1 rounded-lg border border-gray-100">
              <button
                onClick={() => updateRow(fabric.id, 'consumptionMode', 'manual')}
                className={`flex items-center space-x-1 px-3 py-1 text-[10px] font-bold rounded-md transition-all ${fabric.consumptionMode === 'manual' ? 'bg-[#1A3C5C] text-white' : 'text-gray-400'}`}
              >
                <Settings size={12} />
                <span>Manual</span>
              </button>
              <button
                onClick={() => updateRow(fabric.id, 'consumptionMode', 'auto')}
                className={`flex items-center space-x-1 px-3 py-1 text-[10px] font-bold rounded-md transition-all ${fabric.consumptionMode === 'auto' ? 'bg-[#E8622A] text-white' : 'text-gray-400'}`}
              >
                <Calculator size={12} />
                <span>Auto-Calc</span>
              </button>
            </div>
          </div>

          {fabric.consumptionMode === 'manual' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Consumption (kg/pc)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fabric.consumption}
                  onChange={(e) => updateRow(fabric.id, 'consumption', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price / kg ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={fabric.price}
                  onChange={(e) => updateRow(fabric.id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Wastage %</label>
                <input
                  type="number"
                  value={fabric.wastage}
                  onChange={(e) => updateRow(fabric.id, 'wastage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shrinkage %</label>
                <input
                  type="number"
                  value={fabric.shrinkage}
                  onChange={(e) => updateRow(fabric.id, 'shrinkage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={fabric.garmentLengthCm}
                  onChange={(e) => updateRow(fabric.id, 'garmentLengthCm', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={fabric.garmentWidthCm}
                  onChange={(e) => updateRow(fabric.id, 'garmentWidthCm', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fabric Width (in)</label>
                <input
                  type="number"
                  value={fabric.widthInches}
                  onChange={(e) => updateRow(fabric.id, 'widthInches', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price / kg ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={fabric.price}
                  onChange={(e) => updateRow(fabric.id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {fabrics.length < 4 && (
        <button
          onClick={addRow}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-[#1A3C5C] hover:border-[#1A3C5C] hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 text-xs font-bold"
        >
          <Plus size={16} />
          <span>Add Fabric Row</span>
        </button>
      )}
    </div>
  );
};

export default FabricTable;
