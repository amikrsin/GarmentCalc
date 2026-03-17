import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Calendar, FunctionSquare, FolderOpen } from 'lucide-react';

const Navbar = ({ onOpenSaved }) => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'costing', label: 'Costing Calculator', icon: Calculator },
    { id: 'tna', label: 'TNA Calendar', icon: Calendar },
    { id: 'formulas', label: 'Quick Formulas', icon: FunctionSquare },
  ];

  return (
    <nav className="bg-[#1A3C5C] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('costing')}>
              <div className="w-8 h-8 bg-[#E8622A] rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">G</div>
              <span className="text-xl font-bold tracking-tight">GarmentCalc</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#E8622A] text-white shadow-md'
                        : 'text-gray-300 hover:bg-[#244b70] hover:text-white'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <button 
              onClick={onOpenSaved}
              className="flex items-center space-x-2 px-4 py-2 bg-[#244b70] hover:bg-[#2d5c8a] rounded-lg text-sm font-bold transition-all border border-white/10"
            >
              <FolderOpen size={18} />
              <span>My Costings</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile tabs */}
      <div className="md:hidden flex border-t border-[#244b70]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#E8622A] text-white'
                : 'text-gray-300 hover:bg-[#244b70]'
            }`}
          >
            <tab.icon size={20} />
            <span>{tab.id === 'costing' ? 'Costing' : tab.id === 'tna' ? 'TNA' : 'Formulas'}</span>
          </button>
        ))}
        <button
          onClick={onOpenSaved}
          className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-300 hover:bg-[#244b70]"
        >
          <FolderOpen size={20} />
          <span>Saved</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
