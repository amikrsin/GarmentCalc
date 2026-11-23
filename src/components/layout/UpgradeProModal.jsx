import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { FREE_ACTIVE_ORDER_LIMIT, getGumroadCheckoutUrl } from '../../utils/licenseManager';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Crown,
  Check,
  KeyRound,
  FileText,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const UpgradeProModal = () => {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    upgradeTriggerFeature,
    isPro,
    license,
    activateLicense,
    deactivateLicense,
  } = useApp();
  const { showToast } = useToast();

  const [keyInput, setKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const gumroadUrl = getGumroadCheckoutUrl();

  const handleActivate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);
    try {
      const res = await activateLicense(keyInput);
      if (res.valid) {
        showToast('GarmentCalc Pro activated! All export & order limits unlocked.', 'success');
        setKeyInput('');
        closeUpgradeModal();
      } else {
        setErrorMsg(res.error || 'Invalid license key.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFillDemoKey = () => {
    setKeyInput('PRO-2026-DEMO');
    setErrorMsg('');
  };

  const handleDeactivate = () => {
    deactivateLicense();
    showToast('Switched back to Free plan.', 'info');
  };

  return (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpgradeModal}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#1A3C5C] text-white flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Crown size={15} />
                  <span>GarmentCalc Pro</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {isPro
                    ? 'Your Pro License is Active'
                    : upgradeTriggerFeature
                    ? `Unlock ${upgradeTriggerFeature}`
                    : 'Upgrade for Unlimited Orders & Buyer Exports'}
                </h2>
                <p className="text-xs text-blue-100/80">
                  Built for freelance merchandisers, buying offices, and apparel exporters.
                </p>
              </div>
              <button
                onClick={closeUpgradeModal}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close upgrade modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isPro ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 text-emerald-800">
                      <ShieldCheck size={20} />
                      <div>
                        <p className="text-sm font-bold">Pro Plan Active</p>
                        <p className="text-xs text-emerald-700">
                          Key: <span className="font-mono font-bold">{license.licenseKey}</span>
                          {license.activatedAt && (
                            <> · Activated {format(new Date(license.activatedAt), 'dd MMM yyyy')}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDeactivate}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:border-red-200 hover:text-red-600 rounded-lg transition-colors"
                    >
                      Deactivate Key
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/70 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>Unlimited Active Orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>Buyer Costing PDFs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>TNA Excel & CSV Exports</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Comparison Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Free Tier */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Free Plan</p>
                          <p className="text-2xl font-bold text-[#1A3C5C] mt-0.5 tabular-nums">
                            $0 <span className="text-xs font-normal text-gray-500">/ forever</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">For freelance exploration</p>
                        </div>
                        <ul className="space-y-2 text-xs text-gray-600">
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Quick Formulas (100% Free, unlimited)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Up to {FREE_ACTIVE_ORDER_LIMIT} active orders on Dashboard</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Full Order Pipeline & TNA tracking</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>JSON Backup & Restore + WhatsApp Alerts</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tier */}
                    <div className="p-4 rounded-xl border-2 border-[#E8622A] bg-orange-50/30 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#E8622A] uppercase tracking-wider">Pro Plan</p>
                            <p className="text-2xl font-bold text-[#1A3C5C] mt-0.5 tabular-nums">
                              $19 <span className="text-xs font-normal text-gray-500">/ month</span>
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">For exporters & merchandising teams</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-xs text-gray-700 font-medium">
                          <li className="flex items-start gap-2">
                            <Layers size={14} className="text-[#E8622A] mt-0.5 shrink-0" />
                            <span>Unlimited active orders & buyers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FileText size={14} className="text-[#E8622A] mt-0.5 shrink-0" />
                            <span>1-Click Buyer-Ready Costing PDF with Company Header</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FileSpreadsheet size={14} className="text-[#E8622A] mt-0.5 shrink-0" />
                            <span>TNA Excel (.xlsx) & CSV Calendar Export</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-[#E8622A] mt-0.5 shrink-0" />
                            <span>All Free features + future B2B updates</span>
                          </li>
                        </ul>
                      </div>
                      {gumroadUrl ? (
                        <a
                          href={gumroadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E8622A] hover:bg-[#d15624] text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          <span>Get Pro License Key</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <div className="text-[11px] text-gray-600 bg-white/80 border border-orange-200/70 rounded-lg px-3 py-2">
                          Ready for Gumroad Checkout · Enter a license key below to activate instantly.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Key Activation Form */}
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label
                        htmlFor="pro-license-key-input"
                        className="flex items-center gap-2 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider"
                      >
                        <KeyRound size={14} className="text-[#E8622A]" />
                        <span>Activate License Key</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleFillDemoKey}
                        className="text-xs font-semibold text-[#E8622A] hover:underline"
                      >
                        Try demo key: PRO-2026-DEMO
                      </button>
                    </div>

                    <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        id="pro-license-key-input"
                        type="text"
                        value={keyInput}
                        onChange={(e) => {
                          setKeyInput(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="Enter license key (e.g. PRO-2026-DEMO)"
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono uppercase tracking-wide text-[#1A3C5C] focus:ring-2 focus:ring-[#1A3C5C]/20 focus:border-[#1A3C5C] outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isVerifying || !keyInput.trim()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A3C5C] hover:bg-[#142d45] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Activate Pro</span>
                        )}
                      </button>
                    </form>

                    {errorMsg && (
                      <div className="flex items-center gap-2 text-xs font-medium text-red-600 pt-1">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeProModal;
