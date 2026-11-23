import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Safely register the offline-first Service Worker with automatic update checks
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Periodically check for deployed updates every hour when online
      setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
        }
      }, 60 * 60 * 1000);
    },
    onNeedRefresh() {
      // Activate updated service worker cleanly on next reload / immediately if desired
      updateSW(true);
    },
    onOfflineReady() {
      // App shell cached and ready for 100% offline factory-floor use
    },
    onRegisterError(error) {
      console.warn('Service worker registration skipped:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
