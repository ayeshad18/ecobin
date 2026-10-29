import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle, Sparkles } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sand-light border border-sand-border rounded-2xl max-w-md w-full shadow-elevated p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-dark text-white flex items-center justify-center shadow">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-base">Install EcoBin App</h3>
              <p className="text-xs text-charcoal">Run as a standalone app on your device</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-sand text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Already installed? */}
        {isStandalone ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-700 mx-auto" />
            <h4 className="font-bold text-navy text-sm">App Already Installed!</h4>
            <p className="text-xs text-charcoal">
              EcoBin is currently running in standalone app mode on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-sand-border space-y-2 text-charcoal">
              <p className="font-semibold text-navy">
                Installing EcoBin gives you:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                <li>Full-screen standalone view (no browser address bar)</li>
                <li>Quick 1-tap launch icon on your home screen or desktop</li>
                <li>Offline caching and faster load times on campus networks</li>
                <li>Immediate access for cleaning staff on daily shifts</li>
              </ul>
            </div>

            {/* Android / Desktop Chrome 1-Click Install */}
            {deferredPrompt ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App Now</span>
                </button>
                <p className="text-[10px] text-center text-charcoal-light">
                  Installs directly via Chrome / Android PWA engine.
                </p>
              </div>
            ) : isIOS ? (
              /* iOS Instructions */
              <div className="bg-sand/60 p-4 rounded-xl border border-sand-border space-y-3">
                <h4 className="font-bold text-navy text-xs flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-terracotta" />
                  <span>How to install on iPhone / iPad (Safari):</span>
                </h4>
                <ol className="space-y-2 list-decimal pl-4 text-[11px] text-charcoal">
                  <li>
                    Tap the <strong>Share</strong> button <span className="inline-block px-1 py-0.5 bg-white border rounded font-mono text-[10px]">⎋ / Share</span> at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top right corner.
                  </li>
                </ol>
                <div className="text-[10px] text-charcoal-light italic">
                  EcoBin will appear as a native app icon on your iOS home screen!
                </div>
              </div>
            ) : (
              /* Desktop / General Browser instructions */
              <div className="bg-sand/60 p-4 rounded-xl border border-sand-border space-y-2 text-charcoal text-[11px]">
                <p className="font-bold text-navy text-xs">How to install on Chrome / Edge / Desktop:</p>
                <p>
                  Look for the <strong>Install App icon (⊕ or ⬇)</strong> in your browser's address bar next to the URL, or click the browser menu (⋮) and select <strong>"Install EcoBin..."</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-sand-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy text-sand font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
