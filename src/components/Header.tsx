import React from 'react';
import { Flame, Settings, Droplet, QrCode } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { unlockAudio } from '../utils/audioEngine';

interface HeaderProps {
  streakDays: number;
  onOpenSettings: () => void;
  onOpenPhoneAccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ streakDays, onOpenSettings, onOpenPhoneAccess }) => {
  return (
    <header className="sticky top-0 z-40 w-full pt-safe px-4 pb-3 ios-glass border-b border-slate-800/80">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={unlockAudio} 
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Droplet className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              <span>AquaDrop</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* QR code / Open on Phone Button */}
          {onOpenPhoneAccess && (
            <button
              onClick={onOpenPhoneAccess}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
              title="Open on iPhone (Scan QR Code)"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streakDays}d</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
            title="Settings & Active Hours"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
