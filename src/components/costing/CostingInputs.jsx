import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Scissors, Package, Truck, Globe, TrendingUp, Sparkles, Layers } from 'lucide-react';
import StyleInfoSection from './inputs/StyleInfoSection';
import FabricTable from './inputs/FabricTable';
import TrimsTable from './inputs/TrimsTable';
import EmbellishmentsSection from './inputs/EmbellishmentsSection';
import LaborSection from './inputs/LaborSection';
import CommercialSection from './inputs/CommercialSection';
import ExportCostsSection from './inputs/ExportCostsSection';
import MarginControls from './inputs/MarginControls';

const CostingInputs = ({ data, setData, onCategoryChange }) => {
  const [openSection, setOpenSection] = useState('style');

  const updateSection = (section, value) => {
    setData(prev => ({ ...prev, [section]: value }));
  };

  const sections = [
    { id: 'style', title: '1. Style Info', icon: <Info size={18} />, component: <StyleInfoSection data={data.styleInfo} onChange={(val) => updateSection('styleInfo', val)} onCategoryChange={onCategoryChange} /> },
    { id: 'fabric', title: '2. Primary Fabric', icon: <Layers size={18} />, component: <FabricTable fabrics={data.fabrics} currency={data.styleInfo.currency} onChange={(val) => updateSection('fabrics', val)} /> },
    { id: 'trims', title: '3. Trims & Accessories', icon: <Package size={18} />, component: <TrimsTable trims={data.trims} category={data.styleInfo.category} currency={data.styleInfo.currency} onChange={(val) => updateSection('trims', val)} /> },
    { id: 'embellishments', title: '4. Embellishments', icon: <Sparkles size={18} />, component: <EmbellishmentsSection embellishments={data.embellishments} currency={data.styleInfo.currency} onChange={(val) => updateSection('embellishments', val)} /> },
    { id: 'labor', title: '5. Labor & Manufacturing', icon: <Scissors size={18} />, component: <LaborSection data={data} setData={setData} currency={data.styleInfo.currency} /> },
    { id: 'commercial', title: '6. Commercial & Logistics', icon: <Truck size={18} />, component: <CommercialSection commercial={data.commercial} currency={data.styleInfo.currency} onChange={(val) => updateSection('commercial', val)} /> },
    { id: 'export', title: '7. Export Adjustments', icon: <Globe size={18} />, component: <ExportCostsSection exportCosts={data.exportCosts} currency={data.styleInfo.currency} onChange={(val) => updateSection('exportCosts', val)} /> },
    { id: 'margins', title: '8. Adjustments & Margin', icon: <TrendingUp size={18} />, component: <MarginControls margins={data.margins} currency={data.styleInfo.currency} onChange={(val) => updateSection('margins', val)} /> },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div 
          key={section.id} 
          className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
            openSection === section.id ? 'border-[#E8622A] shadow-lg' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <button
            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
            className="w-full px-6 py-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-xl transition-colors ${
                openSection === section.id ? 'bg-[#E8622A] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-[#1A3C5C]'
              }`}>
                {section.icon}
              </div>
              <span className={`font-bold text-sm tracking-tight ${
                openSection === section.id ? 'text-[#1A3C5C]' : 'text-gray-500'
              }`}>
                {section.title}
              </span>
            </div>
            {openSection === section.id ? (
              <ChevronUp size={20} className="text-[#E8622A]" />
            ) : (
              <ChevronDown size={20} className="text-gray-300" />
            )}
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${
            openSection === section.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
              {section.component}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CostingInputs;
