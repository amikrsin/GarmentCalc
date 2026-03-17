import React, { useState } from 'react';
import { calcFabricConsumption } from '../../utils/formulaCalculations';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

const ConsumptionCalculator = () => {
  const { setFabricConsumptionFromFormula, setActiveTab } = useApp();
  const [length, setLength] = useState('70');
  const [width, setWidth] = useState('50');
  const [gsm, setGsm] = useState('180');
  const [widthEff, setWidthEff] = useState('85');
  const [wastage, setWastage] = useState('8');

  const result = calcFabricConsumption(
    parseFloat(length) || 0, 
    parseFloat(width) || 0,
    parseFloat(gsm) || 0,
    parseFloat(widthEff) || 0, 
    parseFloat(wastage) || 0
  );

  const handleUseInCosting = () => {
    setFabricConsumptionFromFormula(parseFloat(result.toFixed(3)));
    setActiveTab('costing');
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest border-b border-gray-50 pb-2">Fabric Consumption</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Length (cm)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Width (cm)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">GSM</label>
          <input
            type="number"
            value={gsm}
            onChange={(e) => setGsm(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Width Eff %</label>
          <input
            type="number"
            value={widthEff}
            onChange={(e) => setWidthEff(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-1">Waste %</label>
          <input
            type="number"
            value={wastage}
            onChange={(e) => setWastage(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#E8622A]"
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#1A3C5C]">{result.toFixed(3)} kg/pc</span>
          <button
            onClick={handleUseInCosting}
            className="mt-1 flex items-center space-x-1 text-[10px] font-bold text-[#E8622A] hover:underline"
          >
            <span>Use in Costing</span>
            <ArrowRight size={10} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 italic">Formula: ((L*W*GSM)/10^7)/Eff + Waste</p>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionCalculator;
