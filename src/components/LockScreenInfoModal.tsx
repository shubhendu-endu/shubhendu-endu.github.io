import React, { useState } from 'react';
import { 
  Lock, 
  Smartphone, 
  Calendar, 
  Bell, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Volume2,
  ExternalLink,
  Download
} from 'lucide-react';
import { generateIOSWaterCalendar } from '../utils/calendarSync';
import { HydrationSettings } from '../types';

interface LockScreenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HydrationSettings;
  onShowIOSGuide: () => void;
}

export const LockScreenInfoModal: React.FC<LockScreenInfoModalProps> = ({
  isOpen,
  onClose,
  settings,
  onShowIOSGuide,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExportAlarms = () => {
    generateIOSWaterCalendar(
      settings.intervalMinutes,
      settings.startTime,
      settings.endTime,
      settings.dailyGoalMl
    );
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">iPhone Lock-Screen Alerts</h3>
              <p className="text-xs text-slate-400">How notifications behave when locked</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Reality on iOS */}
        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>How iOS handles background timers:</span>
            </h4>
            <p className="leading-relaxed">
              When your iPhone is locked, Apple's iOS suspends ordinary browser tabs to save battery. In standard Safari tabs, timers pause until you wake the phone.
            </p>
          </div>

          {/* Solution 1: Add to Home Screen (iOS 16.4+) */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Option 1: Install to Home Screen</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                iOS 16.4+
              </span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Starting in <strong>iOS 16.4</strong>, Web Apps installed on your Home Screen gain Apple <strong>Web Push</strong> support. They can wake your lock screen with banners and sound badges just like native App Store apps.
            </p>
            <button
              onClick={() => {
                onClose();
                onShowIOSGuide();
              }}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>Install to iPhone Home Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Solution 2: Sync to Apple Reminders / Calendar (100% Guaranteed Lock Screen Alarm) */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Option 2: 1-Tap iPhone Lock-Screen Alarms</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Guaranteed
              </span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Export your scheduled reminders into your iPhone's native <strong>Apple Reminders / Calendar</strong>. These alarms ring, vibrate, and light up your lock screen every {settings.intervalMinutes} minutes between {settings.startTime} and {settings.endTime} even when the phone is locked or in airplane mode!
            </p>

            <button
              onClick={handleExportAlarms}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition active:scale-95"
            >
              {downloaded ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Alarms Exported! Tap "Add All" on iPhone</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Sync {settings.intervalMinutes}m Alarms to iPhone Calendar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* iOS Settings tip */}
        <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-400 flex items-start gap-2">
          <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            Make sure notifications are enabled in <strong>iPhone Settings → Notifications → AquaDrop / Safari</strong> with "Lock Screen", "Banners", and "Sounds" toggled ON.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm border border-slate-700 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
