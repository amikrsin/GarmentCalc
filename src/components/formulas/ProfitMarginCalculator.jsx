import React, { useState } from 'react';
import { calcProfitMargin } from '../../utils/formulaCalculations';

const ProfitMarginCalculator = () => {
  const [fob, setFob] = useState('');
  const [cost, setCost] = useState('');

  const result = calcProfitMargin(parseFloat(fob) || 0, parseFloat(cost) || 0);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">Profit Margin %</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">FOB Price</label>
          <input
            type="number"
            value={fob}
            onChange={(e) => setFob(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Total Cost</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-lg font-bold ${result < 5 ? 'text-red-600' : 'text-green-600'}`}>
            {result.toFixed(2)}%
          </span>
          <span className="text-[9px] text-gray-400 italic">Formula: ((FOB - Cost) / FOB) * 100</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginCalculator;
