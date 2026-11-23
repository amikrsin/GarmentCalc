import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Capture beforeinstallprompt early at module evaluation so it is never missed before mount
let cachedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    cachedDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((cb) => cb(cachedDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    cachedDeferredPrompt = null;
    promptListeners.forEach((cb) => cb(null));
  });
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOSDevice =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Exclude Chrome/Firefox/Edge wrappers on iOS if desired, though Safari is standard for A2HS
  return isIOSDevice;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => cachedDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => detectStandalone());
  const [isIOS, setIsIOS] = useState<boolean>(() => detectIOSSafari());

  useEffect(() => {
    setIsInstalled(detectStandalone());
    setIsIOS(detectIOSSafari());

    const handlePromptChange = (ev: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(ev);
    };
    promptListeners.add(handlePromptChange);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    standaloneMedia.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      promptListeners.delete(handlePromptChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMedia.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    const promptEvent = deferredPrompt || cachedDeferredPrompt;
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      cachedDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const isInstallable = Boolean(deferredPrompt);
  const canShowInstall = !isInstalled && (isInstallable || isIOS);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    canShowInstall,
    install,
  };
}
