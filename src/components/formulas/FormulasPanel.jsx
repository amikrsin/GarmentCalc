import React, { useState } from 'react';
import DHUCalculator from './DHUCalculator';
import EfficiencyCalculator from './EfficiencyCalculator';
import ConsumptionCalculator from './ConsumptionCalculator';
import CapacityCalculator from './CapacityCalculator';
import BreakEvenCalculator from './BreakEvenCalculator';
import ProfitMarginCalculator from './ProfitMarginCalculator';
import AdvancedConsumptionCalculator from './AdvancedConsumptionCalculator';
import { motion } from 'motion/react';
import { Sparkles, Layers, List } from 'lucide-react';

const FormulasPanel = () => {
  const [activeTab, setActiveTab] = useState('advanced'); // 'advanced' or 'quick'

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Workspace Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5 mb-8">
        <div>
          <h2 className="text-xl font-black text-[#1A3C5C] uppercase tracking-wide">Dynamic Formula Center</h2>
          <p className="text-xs text-gray-500 font-medium">Verify production KPIs, line capacities, and spec fabrication metrics.</p>
        </div>
        
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100 gap-1.5 self-start">
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'advanced'
                ? 'bg-white text-[#1A3C5C] shadow-md font-extrabold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles size={14} className="text-[#E8622A]" />
            <span>Fabric CAD Consumption</span>
          </button>
          
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white text-[#1A3C5C] shadow-md font-extrabold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={14} className="text-[#1A3C5C]" />
            <span>Quick Calculators</span>
          </button>
        </div>
      </div>

      {activeTab === 'advanced' ? (
        <AdvancedConsumptionCalculator />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DHUCalculator />
            <EfficiencyCalculator />
            <ConsumptionCalculator />
            <CapacityCalculator />
            <BreakEvenCalculator />
            <ProfitMarginCalculator />
          </div>
          
          <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A3C5C] uppercase tracking-wider mb-4">Formula Reference Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs text-gray-600">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">DHU</span>
                <span>(Total Defects / Total Pieces Checked) × 100</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">Line Efficiency</span>
                <span>(Produced Minutes / Available Minutes) × 100</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">Capacity Output</span>
                <span>(Machines × Hours × 60 / SMV) × Efficiency %</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">Break-Even</span>
                <span>Fixed Cost / (Selling Price - Variable Cost)</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">Fabric Cost/pc</span>
                <span>Consumption × Price × (1 + Wastage %)</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold">FOB Price</span>
                <span>(Material + CM + Overhead) × (1 + Profit %)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default FormulasPanel;
