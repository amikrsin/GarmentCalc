import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage';

const AppContext = createContext();

const DEFAULT_PREFERENCES = {
  userName: '',
  companyName: '',
  defaultCurrency: 'USD',
  defaultExchangeRate: 84.50,
  defaultOverheadPct: 10,
  defaultProfitPct: 12,
  defaultFabricLeadDays: 30,
  defaultProductionLeadDays: 45,
  skipWeekends: true
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('costing');
  const [fabricConsumptionFromFormula, setFabricConsumptionFromFormula] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  
  // Save indicator state
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState(() => 
    loadFromStorage('garmentcalc_preferences', DEFAULT_PREFERENCES)
  );

  useEffect(() => {
    saveToStorage('garmentcalc_preferences', preferences);
  }, [preferences]);

  const triggerSaveIndicator = useCallback(() => {
    setShowSaveIndicator(true);
    const timeout = setTimeout(() => setShowSaveIndicator(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    fabricConsumptionFromFormula,
    setFabricConsumptionFromFormula,
    preferences,
    setPreferences,
    showSaveIndicator,
    triggerSaveIndicator,
    isSettingsOpen,
    setIsSettingsOpen,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen
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
