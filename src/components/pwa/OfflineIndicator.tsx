import React, { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const wasOfflineRef = useRef(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowReconnected(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          role="status"
          aria-live="polite"
          className="bg-slate-800 text-slate-100 border-b border-slate-700"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs font-medium">
            <WifiOff size={14} className="text-amber-400 shrink-0" />
            <span>Offline Mode — All calculations &amp; orders are saved locally.</span>
          </div>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          key="reconnected-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          role="status"
          aria-live="polite"
          className="bg-emerald-700 text-white border-b border-emerald-600"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs font-medium">
            <Wifi size={14} className="shrink-0" />
            <span>Back online — Your local workspace is synced in this browser.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
