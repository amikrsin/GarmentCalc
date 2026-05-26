import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Tag, 
  Layers, 
  DollarSign, 
  Truck, 
  Factory, 
  FileText,
  Plus,
  Trash2,
  Paperclip,
  Download,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

const OrderInfoTab = ({ order }) => {
  const { updateOrder, addDocument, deleteDocument } = useOrders();
  const { preferences, triggerSaveIndicator } = useApp();

  const handleFieldChange = (field, value) => {
    updateOrder(order.id, { [field]: value });
    triggerSaveIndicator();
  };

  const handleSizeChange = (id, field, value) => {
    const newSizes = order.sizeBreakdown.map(s => 
      s.id === id ? { ...s, [field]: field === 'qty' ? (parseInt(value) || 0) : value } : s
    );
    const total = newSizes.reduce((acc, s) => acc + s.qty, 0);
    updateOrder(order.id, { 
      sizeBreakdown: newSizes,
      orderQty: total,
      totalFOBValue: total * (order.fobPrice || 0)
    });
    triggerSaveIndicator();
  };

  const addSize = () => {
    const newSize = { id: crypto.randomUUID(), name: 'New Size', qty: 0 };
    const newSizes = [...(order.sizeBreakdown || []), newSize];
    updateOrder(order.id, { sizeBreakdown: newSizes });
    triggerSaveIndicator();
  };

  const removeSize = (id) => {
    const newSizes = order.sizeBreakdown.filter(s => s.id !== id);
    const total = newSizes.reduce((acc, s) => acc + s.qty, 0);
    updateOrder(order.id, { 
      sizeBreakdown: newSizes,
      orderQty: total,
      totalFOBValue: total * (order.fobPrice || 0)
    });
    triggerSaveIndicator();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('File too large. Max 500KB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileInfo = {
        name: file.name,
        type: file.type,
        sizeKB: Math.round(file.size / 1024),
        data: event.target.result
      };
      addDocument(order.id, 'general', fileInfo, preferences.userName);
    };
    reader.readAsDataURL(file);
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const Input = ({ label, value, onChange, type = "text", placeholder = "", options = null }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {options ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Section title="Buyer Information" icon={User}>
        <Input label="Buyer Name" value={order.buyerName} onChange={(v) => handleFieldChange('buyerName', v)} />
        <Input label="Contact Name" value={order.buyerContact} onChange={(v) => handleFieldChange('buyerContact', v)} />
        <Input label="Email" value={order.buyerEmail} onChange={(v) => handleFieldChange('buyerEmail', v)} type="email" />
        <Input label="Phone" value={order.buyerPhone} onChange={(v) => handleFieldChange('buyerPhone', v)} />
        <Input label="PO Number" value={order.poNumber} onChange={(v) => handleFieldChange('poNumber', v)} />
        <Input label="PO Date" value={order.poDate} onChange={(v) => handleFieldChange('poDate', v)} type="date" />
      </Section>

      <Section title="Style Information" icon={Tag}>
        <Input label="Style Name" value={order.styleName} onChange={(v) => handleFieldChange('styleName', v)} />
        <Input 
          label="Category" 
          value={order.category} 
          onChange={(v) => handleFieldChange('category', v)} 
          options={['Knit T-Shirts / Polos', 'Woven Shirts', 'Denim / Bottoms', 'Sweaters / Knitwear', 'Outerwear / Jackets', 'Other']}
        />
        <Input label="Season" value={order.season} onChange={(v) => handleFieldChange('season', v)} />
        <Input label="Order Type" value={order.orderType} onChange={(v) => handleFieldChange('orderType', v)} options={['FOB', 'CMT', 'CM', 'LDP']} />
        <Input label="Fabric Composition" value={order.fabricComposition} onChange={(v) => handleFieldChange('fabricComposition', v)} placeholder="e.g. 100% Cotton" />
        <Input label="Fabric Description" value={order.fabricDescription} onChange={(v) => handleFieldChange('fabricDescription', v)} placeholder="e.g. Single Jersey 180 GSM" />
      </Section>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
            <Layers size={18} />
          </div>
          <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Quantities & Sizes</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {(order.sizeBreakdown || []).map(size => (
              <div key={size.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 group relative">
                <button 
                  onClick={() => removeSize(size.id)}
                  className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size Name</label>
                  <input
                    type="text"
                    value={size.name}
                    onChange={(e) => handleSizeChange(size.id, 'name', e.target.value)}
                    placeholder="e.g. XL"
                    className="w-full bg-transparent border-none p-0 text-sm font-black text-[#1A3C5C] focus:ring-0 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</label>
                  <input
                    type="number"
                    value={size.qty}
                    onChange={(e) => handleSizeChange(size.id, 'qty', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-sm font-bold text-[#1A3C5C] focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={addSize}
              className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:text-[#1A3C5C] hover:border-[#1A3C5C]/20 transition-all"
            >
              <Plus size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Add Size</span>
            </button>
          </div>
          <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Order Quantity</p>
              <p className="text-2xl font-black text-[#1A3C5C]">{order.orderQty.toLocaleString()} <span className="text-xs font-bold text-gray-400">PCS</span></p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colours / Variants</label>
              <input
                type="text"
                value={order.colours}
                onChange={(e) => handleFieldChange('colours', e.target.value)}
                placeholder="e.g. White, Navy, Grey"
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-[#1A3C5C] focus:ring-0 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <Section title="Pricing" icon={DollarSign}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FOB Price (per pc)</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              value={order.fobPrice || 0}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                updateOrder(order.id, { 
                  fobPrice: price,
                  totalFOBValue: price * order.orderQty
                });
                triggerSaveIndicator();
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-[#E8622A] focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total FOB Value</p>
          <p className="text-xl font-black text-[#1A3C5C] mt-1">${(order.totalFOBValue || 0).toLocaleString()}</p>
        </div>
        <Input label="Currency" value={order.currency} onChange={(v) => handleFieldChange('currency', v)} options={['USD', 'EUR', 'GBP', 'INR']} />
        <Input label="Exchange Rate (to INR)" value={order.exchangeRate} onChange={(v) => handleFieldChange('exchangeRate', parseFloat(v))} type="number" />
      </Section>

      <Section title="Shipping" icon={Truck}>
        <Input label="Final Ship Date" value={order.shipDate} onChange={(v) => handleFieldChange('shipDate', v)} type="date" />
        <Input label="Shipment Mode" value={order.shipmentMode} onChange={(v) => handleFieldChange('shipmentMode', v)} options={['Sea FCL', 'Sea LCL', 'Air', 'Courier']} />
        <Input label="Port of Loading" value={order.portOfLoading} onChange={(v) => handleFieldChange('portOfLoading', v)} options={['Nhava Sheva', 'Chennai', 'Kandla', 'Mundra', 'Other']} />
        <Input label="Destination Country" value={order.destinationCountry} onChange={(v) => handleFieldChange('destinationCountry', v)} />
        <Input label="Destination Port" value={order.destinationPort} onChange={(v) => handleFieldChange('destinationPort', v)} />
      </Section>

      <Section title="Factory" icon={Factory}>
        <Input label="Factory Name" value={order.factoryName} onChange={(v) => handleFieldChange('factoryName', v)} />
        <Input label="Contact Name" value={order.factoryContact} onChange={(v) => handleFieldChange('factoryContact', v)} />
        <Input label="Phone" value={order.factoryPhone} onChange={(v) => handleFieldChange('factoryPhone', v)} />
        <Input label="Location" value={order.factoryLocation} onChange={(v) => handleFieldChange('factoryLocation', v)} />
        <Input label="Factory Type" value={order.factoryType} onChange={(v) => handleFieldChange('factoryType', v)} options={['FOB', 'CMT', 'CM']} />
      </Section>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
              <FileText size={18} />
            </div>
            <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Order Documents</h3>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-[#1A3C5C] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#142d45] transition-all">
            <Plus size={16} />
            <span>Upload Document</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".jpg,.jpeg,.png,.pdf,.xlsx,.docx" />
          </label>
        </div>
        <div className="p-6">
          {order.documents?.filter(d => d.milestoneId === 'general').length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400 font-medium italic">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.documents?.filter(d => d.milestoneId === 'general').map(doc => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1A3C5C] shadow-sm flex-shrink-0">
                      <Paperclip size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#1A3C5C] truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.sizeKB}KB · {format(new Date(doc.uploadedAt), 'dd MMM')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        if (doc.type.startsWith('image/')) {
                          const win = window.open();
                          win.document.write(`<img src="${doc.data}" />`);
                        } else if (doc.type === 'application/pdf') {
                          const win = window.open();
                          win.document.write(`<iframe src="${doc.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        } else {
                          const link = document.createElement('a');
                          link.href = doc.data;
                          link.download = doc.name;
                          link.click();
                        }
                      }}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#1A3C5C] transition-colors"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button 
                      onClick={() => deleteDocument(order.id, doc.id)}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
        Last updated: {format(new Date(order.updatedAt), 'dd MMM yyyy, p')}
      </div>
    </div>
  );
};

export default OrderInfoTab;
