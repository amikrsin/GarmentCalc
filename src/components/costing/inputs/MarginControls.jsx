import React from 'react';

const MarginControls = ({ margins, currency = 'USD', onChange }) => {
  const updateField = (field, value) => {
    onChange({ ...margins, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Factory Overhead %</label>
            <span className="text-xs font-bold text-[#1A3C5C]">{margins.overheadPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            value={margins.overheadPct}
            onChange={(e) => updateField('overheadPct', parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A3C5C]"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Currency Risk Buffer %</label>
            <span className="text-xs font-bold text-[#1A3C5C]">{margins.currencyBufferPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={margins.currencyBufferPct}
            onChange={(e) => updateField('currencyBufferPct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A3C5C]"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Rework Allowance %</label>
            <span className="text-xs font-bold text-[#1A3C5C]">{margins.reworkAllowancePct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={margins.reworkAllowancePct}
            onChange={(e) => updateField('reworkAllowancePct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A3C5C]"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sample Cost ({currency})</label>
          <input
            type="number"
            value={margins.sampleCostTotal}
            onChange={(e) => updateField('sampleCostTotal', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
          <p className="mt-1 text-[8px] text-gray-400 italic">Amortized over order quantity</p>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Target Profit Margin %</label>
            <span className={`text-xs font-bold ${margins.targetProfitPct < margins.minAcceptableMarginPct ? 'text-red-500' : 'text-[#E8622A]'}`}>
              {margins.targetProfitPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={margins.targetProfitPct}
            onChange={(e) => updateField('targetProfitPct', parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E8622A]"
          />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Floor Margin %:</label>
          <input
            type="number"
            value={margins.minAcceptableMarginPct}
            onChange={(e) => updateField('minAcceptableMarginPct', parseInt(e.target.value) || 0)}
            className="w-12 px-2 py-1 border border-gray-200 rounded text-[10px] font-bold outline-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">GST Applicable</label>
            <input
              type="checkbox"
              checked={margins.gstApplicable}
              onChange={(e) => updateField('gstApplicable', e.target.checked)}
              className="w-4 h-4 text-[#1A3C5C] rounded focus:ring-[#1A3C5C]"
            />
          </div>
          {margins.gstApplicable && (
            <div className="flex items-center space-x-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">GST Rate %:</label>
              <input
                type="number"
                value={margins.gstPct}
                onChange={(e) => updateField('gstPct', parseInt(e.target.value) || 0)}
                className="w-12 px-2 py-1 border border-gray-200 rounded text-[10px] font-bold outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarginControls;
