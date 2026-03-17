import React, { useRef } from 'react';
import { CATEGORIES } from '../../../constants/categories';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const StyleInfoSection = ({ data, onChange, onCategoryChange }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'category' && onCategoryChange) {
      onCategoryChange(value);
    } else {
      onChange({
        ...data,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, garmentImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onChange({ ...data, garmentImage: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Form Fields */}
      <div className="space-y-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name (Header)</label>
          <input
            type="text"
            name="companyName"
            value={data.companyName}
            onChange={handleChange}
            placeholder="e.g. JM Jain LLP"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm font-bold"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Style Name / Order ID</label>
          <input
            type="text"
            name="styleName"
            value={data.styleName}
            onChange={handleChange}
            placeholder="e.g. SS24-Tee-01"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="e.g. Men's Basic Crew Neck T-Shirt"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Garment Category</label>
          <select
            name="category"
            value={data.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Season</label>
          <input
            type="text"
            name="season"
            value={data.season}
            onChange={handleChange}
            placeholder="e.g. SS25"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buyer Name</label>
          <input
            type="text"
            name="buyerName"
            value={data.buyerName}
            onChange={handleChange}
            placeholder="Buyer Name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Quantity (pcs)</label>
          <input
            type="number"
            name="orderQty"
            value={data.orderQty}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Costing Date</label>
          <input
            type="date"
            name="costingDate"
            value={data.costingDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Currency</label>
            <select
              name="currency"
              value={data.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm font-bold"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ex. Rate (to USD)</label>
            <input
              type="number"
              name="exchangeRate"
              value={data.exchangeRate}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8622A] focus:border-transparent outline-none transition-all text-sm font-bold"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Costing Type:</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => onChange({ ...data, costingType: 'internal' })}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${data.costingType === 'internal' ? 'bg-white text-[#1A3C5C] shadow-sm' : 'text-gray-400'}`}
              >
                Internal
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...data, costingType: 'quotation' })}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${data.costingType === 'quotation' ? 'bg-white text-[#E8622A] shadow-sm' : 'text-gray-400'}`}
              >
                Quotation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Image Upload */}
      <div className="flex flex-col">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Style Image / Sketch</label>
        <div 
          onClick={() => !data.garmentImage && fileInputRef.current?.click()}
          className={`relative flex-1 min-h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
            data.garmentImage 
              ? 'border-emerald-100 bg-emerald-50/30' 
              : 'border-gray-200 hover:border-[#E8622A] hover:bg-orange-50/30'
          }`}
        >
          {data.garmentImage ? (
            <div className="relative w-full h-full p-2">
              <img 
                src={data.garmentImage} 
                alt="Garment Preview" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                className="absolute top-4 right-4 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-100 transition-colors">
                <Upload size={20} className="text-gray-400 group-hover:text-[#E8622A]" />
              </div>
              <p className="text-xs font-bold text-gray-500 mb-1">Upload Design Sketch</p>
              <p className="text-[10px] text-gray-400">PNG, JPG or SVG (Max 5MB)</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        {data.garmentImage && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-[10px] font-bold text-[#E8622A] hover:underline flex items-center justify-center space-x-1"
          >
            <ImageIcon size={12} />
            <span>Change Image</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StyleInfoSection;
