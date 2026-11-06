import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IOSInstallGuide } from './IOSInstallGuide';
import { Download, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 px-3 py-1 text-xs font-semibold text-cyan-300 transition shadow-sm active:scale-95"
        title="Install AquaDrop app"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow or generic fallback
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="flex items-center gap-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition shadow-sm active:scale-95"
        title="Install on iPhone"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>Install on iPhone</span>
      </button>

      <IOSInstallGuide isOpen={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
    </>
  );
};
