import React, { useState } from 'react';
import { calcLineEfficiency } from '../../utils/formulaCalculations';

const EfficiencyCalculator = () => {
  const [produced, setProduced] = useState('');
  const [available, setAvailable] = useState('');

  const result = calcLineEfficiency(parseFloat(produced) || 0, parseFloat(available) || 0);

  const getLabel = (val) => {
    if (val < 50) return { text: 'Poor', color: 'text-[#EF4444] bg-red-50' };
    if (val < 65) return { text: 'Below Avg', color: 'text-[#F97316] bg-orange-50' };
    if (val < 75) return { text: 'Average', color: 'text-[#EAB308] bg-yellow-50' };
    if (val < 85) return { text: 'Good', color: 'text-[#84CC16] bg-lime-50' };
    return { text: 'Excellent', color: 'text-[#22C55E] bg-green-50' };
  };

  const label = getLabel(result);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">Line Efficiency</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Produced Min</label>
          <input
            type="number"
            value={produced}
            onChange={(e) => setProduced(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Available Min</label>
          <input
            type="number"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#1A3C5C]">{result.toFixed(1)}%</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${label.color}`}>{label.text}</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 italic">Formula: (Prod / Avail) * 100</p>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyCalculator;
