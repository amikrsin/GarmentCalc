import React from 'react';

const ExportCostsSection = ({ exportCosts, currency = 'USD', onChange }) => {
  const updateField = (field, value) => {
    onChange({ ...exportCosts, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customs / Import Duty %</label>
          <input
            type="number"
            step="0.1"
            value={exportCosts.customsDutyPct}
            onChange={(e) => updateField('customsDutyPct', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Agent Commission %</label>
          <input
            type="number"
            step="0.1"
            value={exportCosts.agentCommissionPct}
            onChange={(e) => updateField('agentCommissionPct', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Documentation / pc ({currency})</label>
          <input
            type="number"
            step="0.01"
            value={exportCosts.documentationPerPc}
            onChange={(e) => updateField('documentationPerPc', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-4">
          <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Incentives (Subtractions)</h4>
          <div>
            <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Duty Drawback %</label>
            <input
              type="number"
              step="0.1"
              value={exportCosts.dutyDrawbackPct}
              onChange={(e) => updateField('dutyDrawbackPct', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">GST Refund %</label>
            <input
              type="number"
              step="0.1"
              value={exportCosts.gstRefundPct}
              onChange={(e) => updateField('gstRefundPct', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCostsSection;
