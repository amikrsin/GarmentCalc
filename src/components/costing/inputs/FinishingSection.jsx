import React from 'react';
import { Scissors, Droplets, Zap, Info } from 'lucide-react';
import { WASH_TYPES, PRESSING_TYPES } from '../../../constants/stitchingDefaults';

const FinishingSection = ({ data, setData, currency = 'USD' }) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'BDT' ? '৳' : '$';

  const updateFinishing = (field, value) => {
    setData(prev => ({
      ...prev,
      finishing: { ...prev.finishing, [field]: value }
    }));
  };

  const finishingTotal = data.finishing.threadCuttingRate + 
                        (data.finishing.qcCheckingRate || 0) +
                        (data.finishing.washingRequired ? data.finishing.washingRate : 0) + 
                        data.finishing.pressingRate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          5.3 Finishing Cost
        </h3>
        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Total: {symbol}{finishingTotal.toFixed(2)}/pc
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Thread Cutting */}
        <div className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Scissors className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Thread Cutting</h4>
                <div className="flex gap-1 mt-1">
                  {['Per Piece Rate', 'Contractual Worker Pool'].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFinishing('threadCuttingPaymentType', type)}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded transition-all ${
                        data.finishing.threadCuttingPaymentType === type
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{symbol}</span>
              <input 
                type="number" 
                step="0.01"
                value={data.finishing.threadCuttingRate}
                onChange={(e) => updateFinishing('threadCuttingRate', parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-right font-bold"
              />
            </div>
          </div>
        </div>

        {/* QC Checking */}
        <div className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Info className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">QC Checking</h4>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Final Inspection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{symbol}</span>
              <input 
                type="number" 
                step="0.01"
                value={data.finishing.qcCheckingRate}
                onChange={(e) => updateFinishing('qcCheckingRate', parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-right font-bold"
              />
            </div>
          </div>
        </div>

        {/* Washing */}
        <div className={`p-4 border rounded-xl shadow-sm transition-all ${data.finishing.washingRequired ? 'bg-white border-indigo-100' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${data.finishing.washingRequired ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                <Droplets className={`w-4 h-4 ${data.finishing.washingRequired ? 'text-indigo-600' : 'text-slate-500'}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Washing</h4>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Required: {data.finishing.washingRequired ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <button 
              onClick={() => updateFinishing('washingRequired', !data.finishing.washingRequired)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border ${
                data.finishing.washingRequired 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {data.finishing.washingRequired ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {data.finishing.washingRequired && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Wash Type</label>
                <select 
                  value={data.finishing.washType}
                  onChange={(e) => updateFinishing('washType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white font-medium"
                >
                  {WASH_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate / Pc ({currency})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{symbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={data.finishing.washingRate}
                    onChange={(e) => updateFinishing('washingRate', parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-right font-bold"
                  />
                </div>
              </div>
              <div className="col-span-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100 flex items-start gap-2">
                <Info className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-800 leading-tight">
                  Washing cost varies by vendor — get actual quote for bulk.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pressing / Ironing */}
        <div className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Zap className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Pressing / Ironing</h4>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Type: {data.finishing.pressingType}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pressing Type</label>
              <select 
                value={data.finishing.pressingType}
                onChange={(e) => updateFinishing('pressingType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white font-medium"
              >
                {PRESSING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate / Pc ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{symbol}</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={data.finishing.pressingRate}
                  onChange={(e) => updateFinishing('pressingRate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-right font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishingSection;
