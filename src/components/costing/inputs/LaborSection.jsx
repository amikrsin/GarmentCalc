import React, { useState } from 'react';
import { CATEGORY_METADATA } from '../../../constants/categories';
import { AlertCircle, CheckCircle2, Calculator, Info, Scissors, Droplets, Zap, Package } from 'lucide-react';
import StitchingCalculatorModal from './StitchingCalculatorModal';
import FinishingSection from './FinishingSection';

import { calcPerPieceStitching, calcSAMStitching, calcSalaryStitching } from '../../../utils/stitchingCalculations';

const LaborSection = ({ data, setData, currency = 'USD' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { labor, styleInfo, finishing, stitchingCalculator } = data;
  const category = styleInfo.category;
  const benchmarks = CATEGORY_METADATA[category]?.benchmarks || CATEGORY_METADATA['Other'].benchmarks;

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'BDT' ? '৳' : '$';

  const updateLabor = (field, value) => {
    setData(prev => ({
      ...prev,
      labor: { ...prev.labor, [field]: value }
    }));
  };

  const ValidationHint = ({ value, range, label }) => {
    const isLow = value < range[0];
    const isHigh = value > range[1];
    
    if (!value) return null;

    return (
      <div className={`mt-1 flex items-center space-x-1 text-[9px] font-bold uppercase ${isLow || isHigh ? 'text-orange-500' : 'text-emerald-500'}`}>
        {isLow || isHigh ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
        <span>
          {isLow ? 'Below' : isHigh ? 'Above' : 'Within'} Benchmark ({symbol}{range[0]}-{symbol}{range[1]})
        </span>
      </div>
    );
  };

  const finishingTotal = finishing.threadCuttingRate + 
                        (finishing.washingRequired ? finishing.washingRate : 0) + 
                        finishing.pressingRate;

  const totalCost = labor.cuttingCostPerPc + labor.stitchingCostPerPc + finishingTotal + labor.packingCostPerPc;

  return (
    <div className="space-y-10">
      {/* 5.1 Cutting Cost */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-4 h-4 text-indigo-600" />
            5.1 Cutting Cost
          </h3>
          <div className="text-sm font-bold text-slate-700">{symbol}{labor.cuttingCostPerPc.toFixed(2)}/pc</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cost / Pc ({currency})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{symbol}</span>
              <input
                type="number"
                step="0.01"
                value={labor.cuttingCostPerPc}
                onChange={(e) => updateLabor('cuttingCostPerPc', parseFloat(e.target.value) || 0)}
                className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
              />
            </div>
            <ValidationHint value={labor.cuttingCostPerPc} range={benchmarks.cutting} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SMV (Optional)</label>
            <input
              type="number"
              value={labor.smvCutting || ''}
              onChange={(e) => updateLabor('smvCutting', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="e.g. 2.5"
            />
          </div>
        </div>
      </div>

      {/* 5.2 Stitching Cost */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            5.2 Stitching Cost
          </h3>
          <div className="text-sm font-bold text-slate-700">{symbol}{labor.stitchingCostPerPc.toFixed(2)}/pc</div>
        </div>
        
        <div className="bg-white border-2 border-indigo-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-600">
                {symbol}{labor.stitchingCostPerPc.toFixed(2)} 
                <span className="text-sm font-normal text-slate-400 ml-1">/ pc</span>
              </div>
              {labor.stitchingSummary && !labor.stitchingManualOverride && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-tight border border-indigo-100">
                  <CheckCircle2 className="w-3 h-3" /> {labor.stitchingSummary}
                </div>
              )}
              {labor.stitchingManualOverride && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-tight border border-amber-100">
                  <AlertCircle className="w-3 h-3" /> Manual Override Enabled
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <Calculator className="w-4 h-4" />
                Open Stitching Calculator
              </button>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs">{symbol}</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Enter manually..."
                  value={labor.stitchingManualOverride ? labor.stitchingCostPerPc : ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setData(prev => ({
                      ...prev,
                      labor: {
                        ...prev.labor,
                        stitchingCostPerPc: val,
                        stitchingManualOverride: true
                      }
                    }));
                  }}
                  className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase pointer-events-none">Manual</div>
              </div>
            </div>
          </div>
          
          {labor.stitchingManualOverride && (
            <button 
              onClick={() => {
                let restoredCost = 0;
                let summary = '';
                
                if (stitchingCalculator.mode === 'per-piece') {
                  restoredCost = calcPerPieceStitching(stitchingCalculator.perPieceOps);
                  summary = `Per Piece · ${stitchingCalculator.perPieceOps.length} ops`;
                } else if (stitchingCalculator.mode === 'sam') {
                  restoredCost = calcSAMStitching(
                    stitchingCalculator.samOps,
                    stitchingCalculator.samInputs.laborRatePerMin,
                    stitchingCalculator.samInputs.efficiencyPct,
                    stitchingCalculator.samInputs.complexity
                  );
                  summary = `SAM Mode · ${stitchingCalculator.samInputs.complexity} · ${stitchingCalculator.samOps.length} ops`;
                } else if (stitchingCalculator.mode === 'salary') {
                  restoredCost = calcSalaryStitching(
                    stitchingCalculator.salaryInputs,
                    styleInfo.exchangeRate
                  );
                  summary = `Salary Based · ${stitchingCalculator.salaryInputs.basis}`;
                }

                setData(prev => ({
                  ...prev,
                  labor: {
                    ...prev.labor,
                    stitchingCostPerPc: restoredCost,
                    stitchingSummary: summary,
                    stitchingManualOverride: false
                  }
                }));
              }}
              className="mt-4 text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
            >
              Restore Calculator Result
            </button>
          )}
        </div>
        <ValidationHint value={labor.stitchingCostPerPc} range={benchmarks.stitching} />
      </div>

      {/* 5.3 Finishing Cost */}
      <FinishingSection data={data} setData={setData} currency={currency} />

      {/* 5.4 Packing Cost */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            5.4 Packing Cost
          </h3>
          <div className="text-sm font-bold text-slate-700">{symbol}{labor.packingCostPerPc.toFixed(2)}/pc</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cost / Pc ({currency})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{symbol}</span>
              <input
                type="number"
                step="0.01"
                value={labor.packingCostPerPc}
                onChange={(e) => updateLabor('packingCostPerPc', parseFloat(e.target.value) || 0)}
                className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
              />
            </div>
            <ValidationHint value={labor.packingCostPerPc} range={benchmarks.packing} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SMV (Optional)</label>
            <input
              type="number"
              value={labor.smvPacking || ''}
              onChange={(e) => updateLabor('smvPacking', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="e.g. 1.2"
            />
          </div>
        </div>
      </div>

      {/* Visual Breakdown Bar */}
      <div className="pt-8 border-t border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manufacturing Composition</span>
          <span className="text-sm font-black text-indigo-600">Total: {symbol}{totalCost.toFixed(2)}/pc</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: `${(labor.cuttingCostPerPc / totalCost) * 100}%` }} className="h-full bg-blue-400 transition-all duration-500" title="Cutting" />
          <div style={{ width: `${(labor.stitchingCostPerPc / totalCost) * 100}%` }} className="h-full bg-indigo-500 transition-all duration-500" title="Stitching" />
          <div style={{ width: `${(finishingTotal / totalCost) * 100}%` }} className="h-full bg-violet-400 transition-all duration-500" title="Finishing" />
          <div style={{ width: `${(labor.packingCostPerPc / totalCost) * 100}%` }} className="h-full bg-purple-300 transition-all duration-500" title="Packing" />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="text-[10px] font-bold text-slate-500 uppercase">Cut {symbol}{labor.cuttingCostPerPc.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <div className="text-[10px] font-bold text-slate-500 uppercase">Stitch {symbol}{labor.stitchingCostPerPc.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <div className="text-[10px] font-bold text-slate-500 uppercase">Finish {symbol}{finishingTotal.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-300" />
            <div className="text-[10px] font-bold text-slate-500 uppercase">Pack {symbol}{labor.packingCostPerPc.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <StitchingCalculatorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={data}
        setData={setData}
        currency={currency}
      />
    </div>
  );
};

export default LaborSection;
