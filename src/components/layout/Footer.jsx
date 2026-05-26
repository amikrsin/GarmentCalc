import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const Footer = () => {
  const { showSaveIndicator } = useApp();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-sm text-gray-500">
              © 2026 GarmentCalc. All calculations run locally in your browser. No data is stored or transmitted.
            </div>
            
            <div className="h-4 mt-1">
              <AnimatePresence>
                {showSaveIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    All changes saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="text-sm font-medium text-[#1A3C5C]">
            Built for <span className="text-[#E8622A]">Garment Professionals</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
