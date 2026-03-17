import React, { useState } from 'react';
import { calcDHU } from '../../utils/formulaCalculations';

const DHUCalculator = () => {
  const [defects, setDefects] = useState('');
  const [pieces, setPieces] = useState('');

  const result = calcDHU(parseFloat(defects) || 0, parseFloat(pieces) || 0);

  const getStatusColor = (val) => {
    if (val < 1) return 'text-green-600 bg-green-50';
    if (val <= 3) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">DHU Calculator</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Total Defects</label>
          <input
            type="number"
            value={defects}
            onChange={(e) => setDefects(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Pieces Checked</label>
          <input
            type="number"
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className={`px-3 py-1 rounded-full text-lg font-bold ${getStatusColor(result)}`}>
          {result.toFixed(2)}%
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 italic">Formula: (Defects / Pieces) * 100</p>
        </div>
      </div>
    </div>
  );
};

export default DHUCalculator;
