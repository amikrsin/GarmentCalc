import React, { useState } from 'react';
import { calcCapacityOutput } from '../../utils/formulaCalculations';

const CapacityCalculator = () => {
  const [machines, setMachines] = useState('30');
  const [hours, setHours] = useState('8');
  const [smv, setSmv] = useState('15');
  const [eff, setEff] = useState('65');
  const [qty, setQty] = useState('');

  const dailyOutput = calcCapacityOutput(
    parseFloat(machines) || 0,
    parseFloat(hours) || 0,
    parseFloat(smv) || 0,
    parseFloat(eff) || 0
  );

  const daysToComplete = qty && dailyOutput > 0 ? Math.ceil(parseFloat(qty) / dailyOutput) : 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2 lg:col-span-1">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">Capacity Output</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Machines</label>
          <input
            type="number"
            value={machines}
            onChange={(e) => setMachines(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Hours/Day</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">SMV</label>
          <input
            type="number"
            value={smv}
            onChange={(e) => setSmv(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Efficiency %</label>
          <input
            type="number"
            value={eff}
            onChange={(e) => setEff(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 border-t border-gray-50 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Daily Output:</span>
          <span className="text-sm font-bold text-[#1A3C5C]">{Math.floor(dailyOutput)} pieces</span>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-[10px] font-medium text-gray-400">Target Qty:</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="pieces"
            className="flex-1 px-2 py-0.5 text-xs border border-gray-200 rounded"
          />
        </div>
        {parseFloat(daysToComplete) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Days to Complete:</span>
            <span className="text-sm font-bold text-[#E8622A]">{daysToComplete} days</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapacityCalculator;
