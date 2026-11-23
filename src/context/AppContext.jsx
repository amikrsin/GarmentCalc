import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import {
  loadLicenseState,
  saveLicenseState,
  verifyLicenseKey,
  DEFAULT_LICENSE_STATE,
} from '../utils/licenseManager';
import {
  loadBackupMeta,
  saveBackupMeta,
  getBackupStatus,
} from '../utils/backupUtils';

const AppContext = createContext();

export const DEFAULT_PREFERENCES = {
  userName: '',
  companyName: '',
  companyAddress: '',
  companyContact: '',
  defaultCurrency: 'USD',
  defaultExchangeRate: 84.50,
  defaultOverheadPct: 10,
  defaultProfitPct: 12,
  defaultFabricLeadDays: 30,
  defaultProductionLeadDays: 45,
  skipWeekends: true,
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('costing');
  const [fabricConsumptionFromFormula, setFabricConsumptionFromFormula] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('company');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Upgrade to Pro modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTriggerFeature, setUpgradeTriggerFeature] = useState(null);

  // Save indicator state
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // Preferences state with safe migration for newly added Company Profile fields
  const [preferences, setPreferences] = useState(() => {
    const stored = loadFromStorage('garmentcalc_preferences', null);
    return {
      ...DEFAULT_PREFERENCES,
      ...(stored && typeof stored === 'object' ? stored : {}),
    };
  });

  // License state (Free vs. Pro) with safe migration
  const [license, setLicense] = useState(() => loadLicenseState());

  // Backup metadata state for 7-day data safety reminder
  const [backupMeta, setBackupMeta] = useState(() => loadBackupMeta());
  const [backupBannerDismissed, setBackupBannerDismissed] = useState(false);

  useEffect(() => {
    saveToStorage('garmentcalc_preferences', preferences);
  }, [preferences]);

  useEffect(() => {
    saveLicenseState(license);
  }, [license]);

  useEffect(() => {
    saveBackupMeta(backupMeta);
  }, [backupMeta]);

  const isPro = license?.plan === 'pro';

  const backupStatus = useMemo(
    () => getBackupStatus(backupMeta.lastBackupAt),
    [backupMeta.lastBackupAt]
  );

  const triggerSaveIndicator = useCallback(() => {
    setShowSaveIndicator(true);
    const timeout = setTimeout(() => setShowSaveIndicator(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const openSettings = useCallback((tab = 'company') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  const openUpgradeModal = useCallback((featureName = null) => {
    setUpgradeTriggerFeature(featureName);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeTriggerFeature(null);
  }, []);

  const activateLicense = useCallback(async (rawKey) => {
    const result = await verifyLicenseKey(rawKey);
    if (result.valid) {
      const nextState = {
        plan: 'pro',
        licenseKey: result.licenseKey,
        activatedAt: result.activatedAt,
        source: result.source,
        email: result.email || null,
      };
      setLicense(nextState);
    }
    return result;
  }, []);

  const deactivateLicense = useCallback(() => {
    setLicense({ ...DEFAULT_LICENSE_STATE });
  }, []);

  const recordBackupNow = useCallback((timestamp = new Date().toISOString()) => {
    setBackupMeta((prev) => ({
      ...prev,
      lastBackupAt: timestamp,
    }));
    setBackupBannerDismissed(false);
  }, []);

  const recordRestoreNow = useCallback((timestamp = new Date().toISOString()) => {
    setBackupMeta((prev) => ({
      ...prev,
      lastRestoredAt: timestamp,
    }));
  }, []);

  const dismissBackupBanner = useCallback(() => {
    setBackupBannerDismissed(true);
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
    settingsTab,
    setSettingsTab,
    openSettings,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen,
    // Freemium / Pro License
    license,
    isPro,
    activateLicense,
    deactivateLicense,
    isUpgradeModalOpen,
    upgradeTriggerFeature,
    openUpgradeModal,
    closeUpgradeModal,
    // Backup & Data Safety
    backupMeta,
    backupStatus,
    recordBackupNow,
    recordRestoreNow,
    backupBannerDismissed,
    dismissBackupBanner,
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
