import React from 'react';
import CostPieChart from './CostPieChart';
import { Download, RotateCcw, AlertCircle, ShieldCheck, FileText, FileSpreadsheet, Save } from 'lucide-react';

const CostingOutputs = ({ data, results, breakdown, onExport, onExportExcel, onReset, onSave }) => {
  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'INR', symbol: '₹' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'BDT', symbol: '৳' },
  ];
  
  const selectedCurrency = currencies.find(c => c.code === data.styleInfo.currency) || currencies[0];
  const currencySymbol = selectedCurrency.symbol;
  
  // If the user is working in a non-USD currency, we assume the inputs are already in that currency.
  // The exchange rate should only be used if we were converting FROM a base (like USD) to another.
  // But the user wants the calculation to START in the selected currency.
  // So for the primary display, we use a rate of 1.
  const formatVal = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Grouping for Quotation View
  const quotationBreakdown = [
    { name: 'Fabric & Raw Material', value: results.fabricTotal, color: '#1A3C5C' },
    { name: 'Trims, CM & Finishing', value: results.trimsTotal + results.manufacturingTotal + results.embellishmentTotal, color: '#E8622A' },
    { name: 'Freight & Commercial', value: results.commercialTotal + results.exportTotal, color: '#7ED321' },
    { name: 'Service & Margin', value: results.overheadAmt + results.bufferAmt + results.reworkAmt + results.sampleCostPc + results.profitAmt, color: '#50E3C2' },
  ].map(item => ({
    ...item,
    percentage: (item.value / results.fobPrice) * 100
  }));

  const isInternal = data.styleInfo.costingType === 'internal';
  const activeBreakdown = isInternal ? breakdown : quotationBreakdown;

  return (
    <div className="space-y-6">
      {/* View Mode Badge */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
          isInternal 
            ? 'bg-blue-50 border-blue-100 text-blue-600' 
            : 'bg-orange-50 border-orange-100 text-orange-600'
        }`}>
          {isInternal ? <ShieldCheck size={14} /> : <FileText size={14} />}
          <span>{data.styleInfo.costingType} Costing Active</span>
        </div>
        {data.styleInfo.garmentImage && (
          <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shadow-sm">
            <img 
              src={data.styleInfo.garmentImage} 
              alt="Style" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* FOB Price Display */}
      <div className={`p-6 rounded-2xl shadow-xl relative overflow-hidden transition-colors duration-500 ${
        isInternal ? 'bg-[#1A3C5C]' : 'bg-[#E8622A]'
      } text-white`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-1">
            {isInternal ? 'Internal Net Cost' : 'Buyer Quotation Price'}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{currencySymbol}{formatVal(results.fobPrice)}</span>
            <span className="text-sm text-white/60">/ piece</span>
            {data.styleInfo.currency !== 'USD' && data.styleInfo.exchangeRate > 0 && (
              <span className="ml-4 px-2 py-1 bg-white/10 rounded text-[10px] font-bold">
                ≈ ${(results.fobPrice / data.styleInfo.exchangeRate).toFixed(2)} USD
              </span>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-white/40 uppercase">Total Value</p>
              <p className="text-lg font-semibold">{currencySymbol}{formatVal(results.totalFobValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase">Quantity</p>
              <p className="text-lg font-semibold">{data.styleInfo.orderQty.toLocaleString()} pcs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      {results.profitAmt / results.fobPrice < (data.margins.minAcceptableMarginPct / 100) && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-pulse">
          <AlertCircle size={18} />
          <span className="font-medium">Margin Health Alert! Below Floor.</span>
        </div>
      )}

      {/* Cost Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest mb-6">
          {isInternal ? 'Detailed Costing' : 'Price Composition'}
        </h3>
        <div className="space-y-4">
          {activeBreakdown.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-500 font-medium">{item.name}</span>
                </div>
                <div className="flex space-x-3">
                  <span className="font-bold text-[#1A3C5C]">{currencySymbol}{formatVal(item.value)}</span>
                  <span className="text-gray-300 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
            <span className="text-xs font-bold text-[#1A3C5C] uppercase">Final FOB Price</span>
            <span className="text-xl font-black text-[#1A3C5C]">{currencySymbol}{formatVal(results.fobPrice)}</span>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-[#1A3C5C] uppercase tracking-widest mb-4">Visual Composition</h3>
        <CostPieChart data={breakdown} />
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={onExport}
          className={`flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
            isInternal 
              ? 'bg-[#1A3C5C] hover:bg-[#142d45] text-white shadow-blue-100' 
              : 'bg-[#E8622A] hover:bg-[#d15624] text-white shadow-orange-100'
          }`}
        >
          <Download size={20} />
          <span>Export {isInternal ? 'Internal Sheet' : 'Buyer Quotation'}</span>
        </button>
        
        <button
          onClick={onSave}
          className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-[#1A3C5C] text-[#1A3C5C] hover:bg-gray-50 rounded-2xl font-bold transition-all active:scale-95"
        >
          <Save size={18} />
          <span>Save Costing</span>
        </button>

        <button
          onClick={onExportExcel}
          className="flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
        >
          <FileSpreadsheet size={18} />
          <span>Export Cost Sheet Excel</span>
        </button>

        <button
          onClick={onReset}
          className="py-3 flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-2xl transition-all active:scale-95 text-xs font-bold"
        >
          <RotateCcw size={16} />
          <span>Reset All Calculations</span>
        </button>
      </div>
    </div>
  );
};

export default CostingOutputs;
