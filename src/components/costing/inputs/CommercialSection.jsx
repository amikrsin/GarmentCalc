import React from 'react';

const CommercialSection = ({ commercial, currency = 'USD', onChange }) => {
  const updateField = (field, value) => {
    onChange({ ...commercial, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Freight / pc ({currency})</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              value={commercial.freightPerPc}
              onChange={(e) => updateField('freightPerPc', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
            />
            <select
              value={commercial.shipmentMode}
              onChange={(e) => updateField('shipmentMode', e.target.value)}
              className="w-32 px-2 py-2 border border-gray-200 rounded-lg text-[10px] font-bold uppercase"
            >
              <option value="Sea FCL">Sea FCL</option>
              <option value="Sea LCL">Sea LCL</option>
              <option value="Air">Air</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Insurance %</label>
          <input
            type="number"
            step="0.1"
            value={commercial.insurancePct}
            onChange={(e) => updateField('insurancePct', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buying Commission %</label>
          <input
            type="number"
            step="0.1"
            value={commercial.buyingCommissionPct}
            onChange={(e) => updateField('buyingCommissionPct', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Charges %</label>
          <input
            type="number"
            step="0.1"
            value={commercial.bankChargesPct}
            onChange={(e) => updateField('bankChargesPct', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspection Charges / pc ({currency})</label>
          <input
            type="number"
            step="0.01"
            value={commercial.inspectionPerPc}
            onChange={(e) => updateField('inspectionPerPc', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Testing Charges / pc ({currency})</label>
          <input
            type="number"
            step="0.01"
            value={commercial.testingPerPc}
            onChange={(e) => updateField('testingPerPc', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CommercialSection;
