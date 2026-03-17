import React from 'react';
import DHUCalculator from './DHUCalculator';
import EfficiencyCalculator from './EfficiencyCalculator';
import ConsumptionCalculator from './ConsumptionCalculator';
import CapacityCalculator from './CapacityCalculator';
import BreakEvenCalculator from './BreakEvenCalculator';
import ProfitMarginCalculator from './ProfitMarginCalculator';
import { motion } from 'motion/react';

const FormulasPanel = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
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
    </motion.div>
  );
};

export default FormulasPanel;
