import React, { useState, useEffect, useRef } from 'react';
import { useApp, DEFAULT_PREFERENCES } from '../../context/AppContext';
import { useOrders } from '../../context/OrdersContext';
import { useToast } from '../../context/ToastContext';
import { exportBackupJSON, parseBackupFile } from '../../utils/backupUtils';
import { getStorageUsage, saveToStorage } from '../../utils/storage';
import { FREE_ACTIVE_ORDER_LIMIT } from '../../utils/licenseManager';
import PWAInstallButton from '../pwa/PWAInstallButton';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  Settings as SettingsIcon,
  Building2,
  DatabaseBackup,
  Crown,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const SettingsPanel = () => {
  const {
    preferences,
    setPreferences,
    isSettingsOpen,
    setIsSettingsOpen,
    settingsTab,
    setSettingsTab,
    backupMeta,
    backupStatus,
    recordBackupNow,
    recordRestoreNow,
    isPro,
    license,
    activateLicense,
    deactivateLicense,
  } = useApp();
  const { orders, restoreOrders, activeOrdersCount } = useOrders();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(preferences);
  const [storageInfo, setStorageInfo] = useState({ usedKB: 0, percentUsed: 0 });

  // Restore state
  const fileInputRef = useRef(null);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [restoreError, setRestoreError] = useState('');

  // License key form state
  const [licenseInput, setLicenseInput] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [licenseError, setLicenseError] = useState('');

  useEffect(() => {
    if (isSettingsOpen) {
      setFormData({ ...DEFAULT_PREFERENCES, ...preferences });
      setStorageInfo(getStorageUsage());
      setPendingBackup(null);
      setRestoreError('');
      setLicenseError('');
    }
  }, [isSettingsOpen, preferences]);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setPreferences({
      ...formData,
      defaultExchangeRate: Number(formData.defaultExchangeRate) || 84.5,
      defaultOverheadPct: Number(formData.defaultOverheadPct) || 10,
      defaultProfitPct: Number(formData.defaultProfitPct) || 12,
    });
    showToast('Company profile & default settings saved', 'success');
    setIsSettingsOpen(false);
  };

  const handleExportBackup = () => {
    const { filename, exportedAt, orderCount } = exportBackupJSON({ orders, preferences });
    recordBackupNow(exportedAt);
    setStorageInfo(getStorageUsage());
    showToast(`Backup exported (${orderCount} orders) — ${filename}`, 'success');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseBackupFile(event.target?.result || '');
      if (!result.valid) {
        setRestoreError(result.error);
        setPendingBackup(null);
      } else {
        setPendingBackup(result);
      }
    };
    reader.onerror = () => {
      setRestoreError('Failed to read the selected file.');
      setPendingBackup(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = (mode) => {
    if (!pendingBackup?.data) return;

    const { orders: importedOrders, preferences: importedPrefs, currentCosting, currentTna, savedCostings } =
      pendingBackup.data;

    restoreOrders(importedOrders, mode);

    if (importedPrefs) {
      setPreferences((prev) => ({
        ...DEFAULT_PREFERENCES,
        ...prev,
        ...importedPrefs,
      }));
    }
    if (mode === 'replace') {
      if (currentCosting) saveToStorage('garmentcalc_current_costing', currentCosting);
      if (currentTna) saveToStorage('garmentcalc_current_tna', currentTna);
      if (savedCostings) saveToStorage('garmentcalc_saved_costings', savedCostings);
    }

    const nowIso = new Date().toISOString();
    recordRestoreNow(nowIso);
    recordBackupNow(nowIso);
    setStorageInfo(getStorageUsage());
    setPendingBackup(null);

    showToast(
      mode === 'merge'
        ? `Merged backup into your workspace (${importedOrders.length} orders checked)`
        : `Workspace restored cleanly (${importedOrders.length} orders)`,
      'success'
    );
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    setLicenseError('');
    setIsVerifyingKey(true);
    try {
      const res = await activateLicense(licenseInput);
      if (res.valid) {
        showToast('GarmentCalc Pro activated successfully!', 'success');
        setLicenseInput('');
      } else {
        setLicenseError(res.error || 'Invalid license key.');
      }
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const uniqueBuyersCount = new Set(orders.map((o) => (o.buyerName || '').trim()).filter(Boolean)).size;

  const tabs = [
    { id: 'company', label: 'Company & PDF', icon: Building2 },
    { id: 'backup', label: 'Backup & Restore', icon: DatabaseBackup, badge: backupStatus.isOverdue && orders.length > 0 },
    { id: 'license', label: isPro ? 'Pro Plan' : 'Upgrade / Key', icon: Crown },
  ];

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5 text-[#1A3C5C]">
                <SettingsIcon size={18} />
                <h3 className="font-bold text-base tracking-tight">Workspace Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 hover:bg-gray-200/70 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Tab Bar */}
            <div className="px-6 pt-4 shrink-0">
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        active
                          ? 'bg-white text-[#1A3C5C] shadow-xs'
                          : 'text-gray-500 hover:text-[#1A3C5C]'
                      }`}
                    >
                      <Icon size={14} className={active ? 'text-[#E8622A]' : 'text-gray-400'} />
                      <span className="truncate">{tab.label}</span>
                      {tab.badge && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Backup recommended" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Panels */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* TAB 1: Company Profile & Costing Defaults */}
              {settingsTab === 'company' && (
                <form onSubmit={handleSavePreferences} className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-[#1A3C5C]">
                    Company Name, Address, and Contact Info appear automatically on the letterhead of every Buyer-Ready Costing PDF and TNA Export.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Merchandiser / Your Name</label>
                      <input
                        type="text"
                        value={formData.userName || ''}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                        placeholder="e.g. Amit Kumar Singh"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Company Name (PDF Header)</label>
                      <input
                        type="text"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                        placeholder="e.g. Apex Apparel Exports Pvt. Ltd."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Company Address (PDF Header)</label>
                    <textarea
                      rows={2}
                      value={formData.companyAddress || ''}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none resize-none"
                      placeholder="Plot 42, Udyog Vihar Phase IV, Gurugram, Haryana 122015, India"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Contact Info (Email · Phone · Website)</label>
                    <input
                      type="text"
                      value={formData.companyContact || ''}
                      onChange={(e) => setFormData({ ...formData, companyContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                      placeholder="merchandising@company.com | +91 98100 00000 | www.company.com"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Costing Calculation Defaults
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Ex. Rate (INR)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.defaultExchangeRate}
                          onChange={(e) => setFormData({ ...formData, defaultExchangeRate: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tabular-nums focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Overhead %</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.defaultOverheadPct}
                          onChange={(e) => setFormData({ ...formData, defaultOverheadPct: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tabular-nums focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Profit %</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.defaultProfitPct}
                          onChange={(e) => setFormData({ ...formData, defaultProfitPct: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tabular-nums focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    <Save size={16} />
                    <span>Save Company Profile & Defaults</span>
                  </button>
                </form>
              )}

              {/* TAB 2: Backup & Restore */}
              {settingsTab === 'backup' && (
                <div className="space-y-5">
                  {/* Status Overview */}
                  <div
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                      backupStatus.isOverdue && orders.length > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {backupStatus.isOverdue && orders.length > 0 ? (
                        <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                      )}
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">
                          {backupStatus.hasBackedUp
                            ? `Last backup: ${format(new Date(backupMeta.lastBackupAt), 'dd MMM yyyy, p')}`
                            : 'No backup file exported yet'}
                        </p>
                        <p className="text-xs opacity-85">
                          Your data lives locally in this browser. Export a weekly .json backup to prevent accidental browser cache loss or move to another PC.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Data Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-500">Total Orders</p>
                      <p className="text-lg font-bold text-[#1A3C5C] font-mono tabular-nums">{orders.length}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-500">Buyers</p>
                      <p className="text-lg font-bold text-[#1A3C5C] font-mono tabular-nums">{uniqueBuyersCount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-500">Local Size</p>
                      <p className="text-lg font-bold text-[#1A3C5C] font-mono tabular-nums">{storageInfo.usedKB} KB</p>
                    </div>
                  </div>

                  {/* Export & Import Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                      <Download size={16} />
                      <span>Export Backup (.json)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 hover:border-[#1A3C5C] text-[#1A3C5C] rounded-xl text-sm font-bold transition-colors"
                    >
                      <Upload size={16} />
                      <span>Import / Restore (.json)</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Smart PWA Install Option (auto-hides when installed) */}
                  <PWAInstallButton variant="settings" />

                  {restoreError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{restoreError}</span>
                    </div>
                  )}

                  {/* Safe Restore Confirmation Box */}
                  {pendingBackup && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">
                          Backup Ready to Restore
                        </p>
                        <p className="text-xs text-gray-700">
                          Found <strong>{pendingBackup.summary.orderCount} orders</strong> across{' '}
                          <strong>{pendingBackup.summary.buyerCount} buyers</strong>
                          {pendingBackup.summary.exportedAt && (
                            <> (exported {format(new Date(pendingBackup.summary.exportedAt), 'dd MMM yyyy')})</>
                          )}
                          . Choose how to restore:
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmRestore('merge')}
                          className="px-3.5 py-2 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Merge (Keep Existing + Add New)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmRestore('replace')}
                          className="px-3.5 py-2 bg-[#E8622A] hover:bg-[#d15624] text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Replace All Current Data
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingBackup(null)}
                          className="px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Plan & Pro License */}
              {settingsTab === 'license' && (
                <div className="space-y-5">
                  {isPro ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <ShieldCheck size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-emerald-900">GarmentCalc Pro Active</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              License Key: <span className="font-mono font-bold">{license.licenseKey}</span>
                            </p>
                            {license.activatedAt && (
                              <p className="text-xs text-emerald-700">
                                Activated on {format(new Date(license.activatedAt), 'dd MMM yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deactivateLicense();
                            showToast('Switched back to Free tier', 'info');
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-red-200 hover:text-red-600 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                        >
                          Deactivate
                        </button>
                      </div>
                      <p className="text-xs text-emerald-800 border-t border-emerald-200/80 pt-3">
                        Unlimited Active Orders, Buyer-Ready Costing PDFs, and TNA Excel/CSV exports are fully unlocked.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</p>
                          <p className="text-base font-bold text-[#1A3C5C] mt-0.5">Free Tier</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {activeOrdersCount} of {FREE_ACTIVE_ORDER_LIMIT} active orders used · Quick Formulas always free
                          </p>
                        </div>
                        <Crown size={24} className="text-[#E8622A] shrink-0" />
                      </div>

                      <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label
                            htmlFor="settings-license-input"
                            className="flex items-center gap-1.5 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider"
                          >
                            <KeyRound size={14} className="text-[#E8622A]" />
                            <span>Enter Pro License Key</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLicenseInput('PRO-2026-DEMO');
                              setLicenseError('');
                            }}
                            className="text-xs font-semibold text-[#E8622A] hover:underline"
                          >
                            Fill test key: PRO-2026-DEMO
                          </button>
                        </div>

                        <form onSubmit={handleActivateLicense} className="flex flex-col sm:flex-row gap-2">
                          <input
                            id="settings-license-input"
                            type="text"
                            value={licenseInput}
                            onChange={(e) => {
                              setLicenseInput(e.target.value);
                              if (licenseError) setLicenseError('');
                            }}
                            placeholder="PRO-2026-DEMO"
                            className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono uppercase text-[#1A3C5C] focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isVerifyingKey || !licenseInput.trim()}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A3C5C] hover:bg-[#142d45] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            {isVerifyingKey ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Checking...</span>
                              </>
                            ) : (
                              <span>Activate Pro</span>
                            )}
                          </button>
                        </form>

                        {licenseError && (
                          <p className="text-xs font-medium text-red-600 flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            <span>{licenseError}</span>
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
