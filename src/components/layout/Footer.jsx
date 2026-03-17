import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const Footer = () => {
  const { lastSaved } = useApp();
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastSaved) return;
    
    const update = () => {
      setTimeAgo(formatDistanceToNow(new Date(lastSaved), { addSuffix: true }));
    };
    
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-sm text-gray-500">
              © 2026 GarmentCalc. All calculations run locally in your browser. No data is stored or transmitted.
            </div>
            {lastSaved && (
              <div className="text-[10px] text-gray-400 mt-1">
                Last saved: {timeAgo}
              </div>
            )}
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
