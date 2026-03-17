import React from 'react';

const TNAInputs = ({ data, setData }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-[#1A3C5C] uppercase tracking-wider mb-6">Order Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Style Name / Order ID</label>
          <input
            type="text"
            name="styleName"
            value={data.styleName}
            onChange={handleChange}
            placeholder="e.g. PO-98765-DENIM"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Order Quantity</label>
          <input
            type="number"
            name="quantity"
            value={data.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Shipment Mode</label>
          <select
            name="shipmentMode"
            value={data.shipmentMode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          >
            <option value="Sea FCL">Sea FCL (4 days)</option>
            <option value="Sea LCL">Sea LCL (5 days)</option>
            <option value="Air Freight">Air Freight (1 day)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Final Ship Date (Ex-Factory)</label>
          <input
            type="date"
            name="shipDate"
            value={data.shipDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Production Lead Time (Days)</label>
          <input
            type="number"
            name="productionLeadDays"
            value={data.productionLeadDays}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fabric Lead Time (Days)</label>
          <input
            type="number"
            name="fabricLeadDays"
            value={data.fabricLeadDays}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Destination Country</label>
          <input
            type="text"
            name="destination"
            value={data.destination}
            onChange={handleChange}
            placeholder="e.g. USA"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="skipWeekends"
            name="skipWeekends"
            checked={data.skipWeekends}
            onChange={(e) => setData(prev => ({ ...prev, skipWeekends: e.target.checked }))}
            className="w-4 h-4 text-[#E8622A] border-gray-300 rounded focus:ring-[#E8622A]"
          />
          <label htmlFor="skipWeekends" className="text-xs font-medium text-gray-700 cursor-pointer">
            Skip Weekends & Indian Holidays (Working Days Only)
          </label>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Optional Milestones</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeSizeSet"
              checked={data.includeSizeSet ?? true}
              onChange={(e) => setData(prev => ({ ...prev, includeSizeSet: e.target.checked }))}
              className="w-4 h-4 text-[#E8622A] border-gray-300 rounded focus:ring-[#E8622A]"
            />
            <label htmlFor="includeSizeSet" className="text-xs font-medium text-gray-700 cursor-pointer">
              Include Size Set Sample
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includePPM"
              checked={data.includePPM ?? true}
              onChange={(e) => setData(prev => ({ ...prev, includePPM: e.target.checked }))}
              className="w-4 h-4 text-[#E8622A] border-gray-300 rounded focus:ring-[#E8622A]"
            />
            <label htmlFor="includePPM" className="text-xs font-medium text-gray-700 cursor-pointer">
              Include Pre-Production Meeting (PPM)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeInline"
              checked={data.includeInline ?? true}
              onChange={(e) => setData(prev => ({ ...prev, includeInline: e.target.checked }))}
              className="w-4 h-4 text-[#E8622A] border-gray-300 rounded focus:ring-[#E8622A]"
            />
            <label htmlFor="includeInline" className="text-xs font-medium text-gray-700 cursor-pointer">
              Include Inline Inspection
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeTOP"
              checked={data.includeTOP ?? true}
              onChange={(e) => setData(prev => ({ ...prev, includeTOP: e.target.checked }))}
              className="w-4 h-4 text-[#E8622A] border-gray-300 rounded focus:ring-[#E8622A]"
            />
            <label htmlFor="includeTOP" className="text-xs font-medium text-gray-700 cursor-pointer">
              Include TOP / Shipment Sample
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TNAInputs;
