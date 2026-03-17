import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('costing');
  const [fabricConsumptionFromFormula, setFabricConsumptionFromFormula] = useState(null);
  
  // Persistence state
  const [lastSaved, setLastSaved] = useState(null);
  const [savedCostings, setSavedCostings] = useState(() => {
    const saved = localStorage.getItem('garmentcalc_saved_costings');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedTNAs, setSavedTNAs] = useState(() => {
    const saved = localStorage.getItem('garmentcalc_saved_tnas');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync saved items to localStorage
  useEffect(() => {
    localStorage.setItem('garmentcalc_saved_costings', JSON.stringify(savedCostings));
  }, [savedCostings]);

  useEffect(() => {
    localStorage.setItem('garmentcalc_saved_tnas', JSON.stringify(savedTNAs));
  }, [savedTNAs]);

  const saveCosting = (costing) => {
    setSavedCostings(prev => {
      const newList = [costing, ...prev.filter(c => c.id !== costing.id)].slice(0, 30);
      return newList;
    });
  };

  const deleteCosting = (id) => {
    setSavedCostings(prev => prev.filter(c => c.id !== id));
  };

  const saveTNA = (tna) => {
    setSavedTNAs(prev => {
      const newList = [tna, ...prev.filter(t => t.id !== tna.id)].slice(0, 30);
      return newList;
    });
  };

  const deleteTNA = (id) => {
    setSavedTNAs(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    activeTab,
    setActiveTab,
    fabricConsumptionFromFormula,
    setFabricConsumptionFromFormula,
    lastSaved,
    setLastSaved,
    savedCostings,
    saveCosting,
    deleteCosting,
    savedTNAs,
    saveTNA,
    deleteTNA
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
