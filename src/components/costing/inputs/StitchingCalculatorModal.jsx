import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calcPerPieceStitching, 
  calcSAMStitching, 
  calcSalaryStitching, 
  validateTotalSAM, 
  calcTheoreticalDailyOutput 
} from '../../../utils/stitchingCalculations';
import { 
  DEFAULT_OPERATIONS_BY_CATEGORY, 
  DEFAULT_SAM_BY_CATEGORY, 
  COMPLEXITY_MULTIPLIERS 
} from '../../../constants/stitchingDefaults';

const StitchingCalculatorModal = ({ isOpen, onClose, data, setData, currency = 'USD' }) => {
  const [activeTab, setActiveTab] = useState(data.stitchingCalculator.mode || 'per-piece');
  const [localCalculator, setLocalCalculator] = useState(data.stitchingCalculator);
  const category = data.styleInfo.category;
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'BDT' ? '৳' : '$';

  // Initialize with defaults if empty
  useEffect(() => {
    if (isOpen) {
      const newCalc = { ...data.stitchingCalculator };
      
      if (newCalc.perPieceOps.length === 0 && DEFAULT_OPERATIONS_BY_CATEGORY[category]) {
        newCalc.perPieceOps = DEFAULT_OPERATIONS_BY_CATEGORY[category].map((op, i) => ({
          id: `pp-${Date.now()}-${i}`,
          ...op
        }));
      }
      
      if (newCalc.samOps.length === 0 && DEFAULT_SAM_BY_CATEGORY[category]) {
        newCalc.samOps = DEFAULT_SAM_BY_CATEGORY[category].map((op, i) => ({
          id: `sam-${Date.now()}-${i}`,
          ...op
        }));
      }
      
      setLocalCalculator(newCalc);
      setActiveTab(newCalc.mode);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleApply = () => {
    let finalCost = 0;
    let summary = '';

    if (activeTab === 'per-piece') {
      finalCost = calcPerPieceStitching(localCalculator.perPieceOps);
      summary = `Per Piece · ${localCalculator.perPieceOps.length} ops`;
    } else if (activeTab === 'sam') {
      const { totalCost, totalSAM } = calcSAMStitching(
        localCalculator.samOps,
        localCalculator.samInputs.laborRatePerMin,
        localCalculator.samInputs.efficiencyPct,
        localCalculator.samInputs.complexity
      );
      finalCost = totalCost;
      summary = `SAM Mode · ${localCalculator.samInputs.complexity.charAt(0).toUpperCase() + localCalculator.samInputs.complexity.slice(1)} · ${localCalculator.samOps.length} ops · ${totalSAM.toFixed(1)} SAM`;
    } else if (activeTab === 'salary') {
      const { finalStitchingCost } = calcSalaryStitching(
        localCalculator.salaryInputs.salaryAmount,
        localCalculator.salaryInputs.workingDaysPerMonth,
        localCalculator.salaryInputs.hoursPerDay,
        localCalculator.salaryInputs.workersOnStyle,
        localCalculator.salaryInputs.lineDailyOutput,
        localCalculator.salaryInputs.overheadOnLaborPct,
        data.styleInfo.exchangeRate,
        localCalculator.salaryInputs.salaryCurrency,
        localCalculator.salaryInputs.basis
      );
      finalCost = finalStitchingCost;
      summary = `Salary Based · ${localCalculator.salaryInputs.basis.charAt(0).toUpperCase() + localCalculator.salaryInputs.basis.slice(1)}`;
    }

    setData(prev => ({
      ...prev,
      labor: {
        ...prev.labor,
        stitchingCostPerPc: finalCost,
        stitchingSummary: summary,
        stitchingManualOverride: false
      },
      stitchingCalculator: {
        ...localCalculator,
        mode: activeTab
      }
    }));
    onClose();
  };

  const addOperation = () => {
    if (activeTab === 'per-piece') {
      setLocalCalculator(prev => ({
        ...prev,
        perPieceOps: [...prev.perPieceOps, { id: Date.now(), name: '', ratePerPc: 0 }]
      }));
    } else if (activeTab === 'sam') {
      setLocalCalculator(prev => ({
        ...prev,
        samOps: [...prev.samOps, { id: Date.now(), name: '', sam: 0 }]
      }));
    }
  };

  const removeOperation = (id) => {
    if (activeTab === 'per-piece') {
      setLocalCalculator(prev => ({
        ...prev,
        perPieceOps: prev.perPieceOps.filter(op => op.id !== id)
      }));
    } else if (activeTab === 'sam') {
      setLocalCalculator(prev => ({
        ...prev,
        samOps: prev.samOps.filter(op => op.id !== id)
      }));
    }
  };

  const updateOperation = (id, field, value) => {
    if (activeTab === 'per-piece') {
      setLocalCalculator(prev => ({
        ...prev,
        perPieceOps: prev.perPieceOps.map(op => op.id === id ? { ...op, [field]: value } : op)
      }));
    } else if (activeTab === 'sam') {
      setLocalCalculator(prev => ({
        ...prev,
        samOps: prev.samOps.map(op => op.id === id ? { ...op, [field]: value } : op)
      }));
    }
  };

  const updateSamInputs = (field, value) => {
    setLocalCalculator(prev => ({
      ...prev,
      samInputs: { ...prev.samInputs, [field]: value }
    }));
  };

  const updateSalaryInputs = (field, value) => {
    setLocalCalculator(prev => ({
      ...prev,
      salaryInputs: { ...prev.salaryInputs, [field]: value }
    }));
  };

  // Current Results for Footer
  let currentCost = 0;
  let footerInfo = null;

  if (activeTab === 'per-piece') {
    currentCost = calcPerPieceStitching(localCalculator.perPieceOps);
    footerInfo = `Ops: ${localCalculator.perPieceOps.length}`;
  } else if (activeTab === 'sam') {
    const { totalCost, totalSAM } = calcSAMStitching(
      localCalculator.samOps,
      localCalculator.samInputs.laborRatePerMin,
      localCalculator.samInputs.efficiencyPct,
      localCalculator.samInputs.complexity
    );
    currentCost = totalCost;
    const theoreticalOutput = calcTheoreticalDailyOutput(totalSAM, localCalculator.samInputs.efficiencyPct);
    footerInfo = `Total SAM: ${totalSAM.toFixed(1)} min | Efficiency: ${localCalculator.samInputs.efficiencyPct}% | Output: ${Math.round(theoreticalOutput)} pcs/day`;
  } else if (activeTab === 'salary') {
    const { finalStitchingCost } = calcSalaryStitching(
      localCalculator.salaryInputs.salaryAmount,
      localCalculator.salaryInputs.workingDaysPerMonth,
      localCalculator.salaryInputs.hoursPerDay,
      localCalculator.salaryInputs.workersOnStyle,
      localCalculator.salaryInputs.lineDailyOutput,
      localCalculator.salaryInputs.overheadOnLaborPct,
      data.styleInfo.exchangeRate,
      localCalculator.salaryInputs.salaryCurrency,
      localCalculator.salaryInputs.basis
    );
    currentCost = finalStitchingCost;
    footerInfo = `Workers: ${localCalculator.salaryInputs.workersOnStyle} | Output: ${localCalculator.salaryInputs.lineDailyOutput} pcs/day`;
  }

  const samWarning = activeTab === 'sam' ? validateTotalSAM(
    localCalculator.samOps.reduce((acc, op) => acc + (Number(op.sam) || 0), 0),
    category
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-bottom flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-indigo-600" />
              Stitching Cost Calculator
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Style: <span className="font-medium text-slate-700">{data.styleInfo.styleName || 'N/A'}</span> | 
              Category: <span className="font-medium text-slate-700">{category}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-bottom px-6 bg-white">
          {['per-piece', 'sam', 'salary'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-bottom-2 transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'per-piece' ? 'Per Piece' : tab === 'sam' ? 'SAM Build-up' : 'Salary Based'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'per-piece' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Worker Type: Contractual — Per Piece Rate</h3>
                <button 
                  onClick={addOperation}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" /> Add Operation
                </button>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-bottom">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Operation Name</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-40">Rate/pc ({currency})</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">Cost/pc</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {localCalculator.perPieceOps.map((op) => (
                      <tr key={op.id} className="border-bottom hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={op.name}
                            onChange={(e) => updateOperation(op.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                            placeholder="Enter operation..."
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{symbol}</span>
                            <input 
                              type="number" 
                              value={op.ratePerPc}
                              onChange={(e) => updateOperation(op.id, 'ratePerPc', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-none focus:ring-0 pl-4 p-0 text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-700">
                          {symbol}{(op.ratePerPc || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => removeOperation(op.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-700">TOTAL</td>
                      <td></td>
                      <td className="px-4 py-3 text-sm text-indigo-600">{symbol}{currentCost.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sam' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Labor Rate / Min ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{symbol}</span>
                    <input 
                      type="number" 
                      step="0.001"
                      value={localCalculator.samInputs.laborRatePerMin}
                      onChange={(e) => updateSamInputs('laborRatePerMin', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Efficiency %</label>
                  <input 
                    type="number" 
                    value={localCalculator.samInputs.efficiencyPct}
                    onChange={(e) => updateSamInputs('efficiencyPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complexity</label>
                  <div className="flex gap-1">
                    {['basic', 'medium', 'complex'].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSamInputs('complexity', level)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          localCalculator.samInputs.complexity === level
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                        <div className="text-[10px] opacity-70">x{COMPLEXITY_MULTIPLIERS[level].toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Operation Table (SAM Build-up)</h3>
                  <button 
                    onClick={addOperation}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" /> Add Operation
                  </button>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-bottom">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Operation</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-24">SAM</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">Base Cost</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-40">With Complexity</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {localCalculator.samOps.map((op) => {
                        const efficiencyFactor = localCalculator.samInputs.efficiencyPct / 100;
                        const baseCost = (op.sam / efficiencyFactor) * localCalculator.samInputs.laborRatePerMin;
                        const withComplexity = baseCost * COMPLEXITY_MULTIPLIERS[localCalculator.samInputs.complexity];
                        
                        return (
                          <tr key={op.id} className="border-bottom hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2">
                              <input 
                                type="text" 
                                value={op.name}
                                onChange={(e) => updateOperation(op.id, 'name', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                                placeholder="Enter operation..."
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input 
                                type="number" 
                                step="0.1"
                                value={op.sam}
                                onChange={(e) => updateOperation(op.id, 'sam', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-500">
                              {symbol}{baseCost.toFixed(3)}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-slate-700">
                              {symbol}{withComplexity.toFixed(3)}
                            </td>
                            <td className="px-4 py-2">
                              <button 
                                onClick={() => removeOperation(op.id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold">
                      <tr>
                        <td className="px-4 py-3 text-sm text-slate-700">TOTAL</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {localCalculator.samOps.reduce((acc, op) => acc + (Number(op.sam) || 0), 0).toFixed(1)}
                        </td>
                        <td></td>
                        <td className="px-4 py-3 text-sm text-indigo-600">{symbol}{currentCost.toFixed(3)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {samWarning && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{samWarning}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Salary Basis</h3>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    {['monthly', 'daily'].map((basis) => (
                      <button
                        key={basis}
                        onClick={() => updateSalaryInputs('basis', basis)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                          localCalculator.salaryInputs.basis === basis
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {basis.charAt(0).toUpperCase() + basis.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        {localCalculator.salaryInputs.basis === 'monthly' ? 'Monthly Salary' : 'Daily Wage'}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={localCalculator.salaryInputs.salaryAmount}
                          onChange={(e) => updateSalaryInputs('salaryAmount', parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                        <select 
                          value={localCalculator.salaryInputs.salaryCurrency}
                          onChange={(e) => updateSalaryInputs('salaryCurrency', e.target.value)}
                          className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                    {localCalculator.salaryInputs.basis === 'monthly' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Working Days/Mo</label>
                        <input 
                          type="number" 
                          value={localCalculator.salaryInputs.workingDaysPerMonth}
                          onChange={(e) => updateSalaryInputs('workingDaysPerMonth', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hours/Day</label>
                      <input 
                        type="number" 
                        value={localCalculator.salaryInputs.hoursPerDay}
                        onChange={(e) => updateSalaryInputs('hoursPerDay', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Line Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Workers on this style</label>
                      <input 
                        type="number" 
                        value={localCalculator.salaryInputs.workersOnStyle}
                        onChange={(e) => updateSalaryInputs('workersOnStyle', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Line output (pcs/day)</label>
                      <input 
                        type="number" 
                        value={localCalculator.salaryInputs.lineDailyOutput}
                        onChange={(e) => updateSalaryInputs('lineDailyOutput', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Overhead on Labor %</label>
                      <input 
                        type="number" 
                        value={localCalculator.salaryInputs.overheadOnLaborPct}
                        onChange={(e) => updateSalaryInputs('overheadOnLaborPct', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Calculation Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  {(() => {
                    const { dailyCostPerWorker, minCostPerWorker, totalDailyLaborCost, stitchingCostPerPc, finalStitchingCost } = calcSalaryStitching(
                      localCalculator.salaryInputs.salaryAmount,
                      localCalculator.salaryInputs.workingDaysPerMonth,
                      localCalculator.salaryInputs.hoursPerDay,
                      localCalculator.salaryInputs.workersOnStyle,
                      localCalculator.salaryInputs.lineDailyOutput,
                      localCalculator.salaryInputs.overheadOnLaborPct,
                      data.styleInfo.exchangeRate,
                      localCalculator.salaryInputs.salaryCurrency,
                      localCalculator.salaryInputs.basis
                    );
                    const symbol = localCalculator.salaryInputs.salaryCurrency === 'INR' ? '₹' : '$';
                    
                    return (
                      <>
                        <div className="flex justify-between border-bottom pb-2">
                          <span className="text-slate-500">Daily Cost / Worker:</span>
                          <span className="font-medium">{symbol}{dailyCostPerWorker.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-bottom pb-2">
                          <span className="text-slate-500">Min Cost / Worker:</span>
                          <span className="font-medium">{symbol}{minCostPerWorker.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-bottom pb-2">
                          <span className="text-slate-500">Total Daily Labor Cost:</span>
                          <span className="font-medium">{symbol}{totalDailyLaborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-bottom pb-2">
                          <span className="text-slate-500">Stitching Cost / Pc:</span>
                          <span className="font-medium">{symbol}{stitchingCostPerPc.toFixed(2)}</span>
                        </div>
                        {localCalculator.salaryInputs.salaryCurrency === 'INR' && (
                          <div className="flex justify-between border-bottom pb-2 text-indigo-600">
                            <span>Cost / Pc in USD:</span>
                            <span className="font-bold">${(stitchingCostPerPc / data.styleInfo.exchangeRate).toFixed(3)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-bottom pb-2 font-bold text-indigo-600">
                          <span>Final Cost (with {localCalculator.salaryInputs.overheadOnLaborPct}% OH):</span>
                          <span className="text-lg">${finalStitchingCost.toFixed(3)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-top bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Stitching Cost Result</div>
            <div className="text-2xl font-black text-indigo-600">{symbol}{currentCost.toFixed(3)} <span className="text-sm font-normal text-slate-500">/ piece</span></div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-center md:justify-start">
              <Info className="w-3 h-3" /> {footerInfo}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="flex-1 md:flex-none px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              Use This Cost <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StitchingCalculatorModal;
