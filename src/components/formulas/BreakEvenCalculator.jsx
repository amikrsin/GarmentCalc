import React, { useState } from 'react';
import { calcBreakEven } from '../../utils/formulaCalculations';

const BreakEvenCalculator = () => {
  const [fixed, setFixed] = useState('');
  const [price, setPrice] = useState('');
  const [variable, setVariable] = useState('');

  const result = calcBreakEven(
    parseFloat(fixed) || 0,
    parseFloat(price) || 0,
    parseFloat(variable) || 0
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">Break-Even Units</h4>
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-1">Fixed Cost</label>
            <input
              type="number"
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-1">Selling Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Variable Cost / pc</label>
          <input
            type="number"
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#1A3C5C]">{Math.ceil(result).toLocaleString()} units</span>
          <span className="text-[9px] text-gray-400 italic">Formula: Fixed / (Price - Var)</span>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCalculator;
