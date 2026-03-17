import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CostingModule from './components/costing/CostingModule';
import TNAModule from './components/tna/TNAModule';
import FormulasPanel from './components/formulas/FormulasPanel';
import MyCostingsPanel from './components/layout/MyCostingsPanel';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const AppContent = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [restorePrompt, setRestorePrompt] = useState(null);
  const [costingRestoreData, setCostingRestoreData] = useState(null);
  const [tnaRestoreData, setTnaRestoreData] = useState(null);

  // Check for auto-saved data on load
  useEffect(() => {
    const savedCosting = localStorage.getItem('garmentcalc_current_costing');
    const savedTNA = localStorage.getItem('garmentcalc_current_tna');
    
    if (savedCosting) {
      const data = JSON.parse(savedCosting);
      setRestorePrompt({
        type: 'costing',
        name: data.styleInfo?.styleName || 'Untitled Costing',
        savedAt: data.lastSavedAt,
        data: data
      });
    } else if (savedTNA) {
      const data = JSON.parse(savedTNA);
      setRestorePrompt({
        type: 'tna',
        name: data.data?.styleName || 'Untitled TNA',
        savedAt: data.lastSavedAt,
        data: data
      });
    }
  }, []);

  const handleRestore = () => {
    if (restorePrompt.type === 'costing') {
      setCostingRestoreData(restorePrompt.data);
      setActiveTab('costing');
    } else {
      setTnaRestoreData(restorePrompt.data);
      setActiveTab('tna');
    }
    setRestorePrompt(null);
  };

  const handleStartFresh = () => {
    if (restorePrompt.type === 'costing') {
      localStorage.removeItem('garmentcalc_current_costing');
    } else {
      localStorage.removeItem('garmentcalc_current_tna');
    }
    setRestorePrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar onOpenSaved={() => setIsSavedPanelOpen(true)} />
      
      <main className="flex-grow relative">
        <AnimatePresence>
          {restorePrompt && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 p-5 mx-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 flex-shrink-0">
                    <span className="text-xl">📋</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A3C5C]">Restore previous session?</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {restorePrompt.name} — saved {restorePrompt.savedAt ? format(new Date(restorePrompt.savedAt), 'dd MMM, p') : 'recently'}
                    </p>
                    <div className="flex space-x-3 mt-4">
                      <button 
                        onClick={handleRestore}
                        className="flex-1 bg-[#E8622A] text-white py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#d15624] transition-colors"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={handleStartFresh}
                        className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                      >
                        Start Fresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'costing' && (
              <CostingModule 
                restoreData={costingRestoreData} 
                onRestored={() => setCostingRestoreData(null)} 
              />
            )}
            {activeTab === 'tna' && (
              <TNAModule 
                restoreData={tnaRestoreData} 
                onRestored={() => setTnaRestoreData(null)} 
              />
            )}
            {activeTab === 'formulas' && <FormulasPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <MyCostingsPanel 
        isOpen={isSavedPanelOpen} 
        onClose={() => setIsSavedPanelOpen(false)}
        onRestoreCosting={(state) => { setCostingRestoreData(state); setActiveTab('costing'); }}
        onRestoreTNA={(state) => { setTnaRestoreData(state); setActiveTab('tna'); }}
      />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
