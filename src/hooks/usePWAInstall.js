import { useState, useEffect } from 'react';

/**
 * Hook to capture and trigger the browser's PWA install prompt.
 * Returns:
 *  - isInstallable: true when the browser has a pending install prompt
 *  - isInstalled:   true when the app is running in standalone (already installed)
 *  - promptInstall: call this to show the native install dialog
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Clean up after successful install
    const installedHandler = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return { outcome: 'not-available' };
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
    return { outcome };
  };

  return { isInstallable, isInstalled, promptInstall };
}
