import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'mobile' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, canShowInstall, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Never show when already running as a standalone installed PWA or when unsupported
  if (isInstalled || !canShowInstall) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const buttonElement =
    variant === 'settings' ? (
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
      >
        <span className="flex items-center gap-2">
          <Smartphone size={16} className="text-[#E8622A]" />
          <span>Install GarmentCalc App (Offline Ready)</span>
        </span>
        <Download size={15} />
      </button>
    ) : variant === 'mobile' ? (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
        title="Install GarmentCalc App"
      >
        <Download size={13} />
        <span>Install</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
        title="Install GarmentCalc for 1-tap offline access"
      >
        <Download size={14} />
        <span>Install App</span>
      </button>
    );

  return (
    <>
      {buttonElement}

      {/* Compact 2-Step iOS Safari Installation Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSGuide(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-sm bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#1A3C5C] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#E8622A] rounded-lg flex items-center justify-center font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">Install GarmentCalc</h3>
                    <p className="text-[11px] text-blue-100/80">Add to your iPhone or iPad</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close install guide"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1A3C5C] flex items-center justify-center shrink-0 mt-0.5">
                      <Share size={15} />
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-[#1A3C5C]">Step 1:</span> Tap the{' '}
                      <strong className="text-[#1A3C5C]">Share</strong> icon in Safari&apos;s toolbar.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#E8622A] flex items-center justify-center shrink-0 mt-0.5">
                      <PlusSquare size={15} />
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-[#1A3C5C]">Step 2:</span> Scroll down and select{' '}
                      <strong className="text-[#1A3C5C]">&ldquo;Add to Home Screen&rdquo;</strong>.
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 text-center">
                  Once added, GarmentCalc launches full-screen and works 100% offline.
                </p>

                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallButton;
