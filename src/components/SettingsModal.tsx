import React, { useState } from 'react';
import { HydrationSettings } from '../types';
import { 
  X, 
  Clock, 
  Sliders, 
  Moon, 
  Target, 
  Bell, 
  Volume2, 
  User, 
  Vibrate, 
  Check, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { formatIntervalLabel, formatTime12Hour } from '../utils/timeUtils';

interface SettingsModalProps {
  isOpen: boolean;
  settings: HydrationSettings;
  onClose: () => void;
  onSave: (newSettings: Partial<HydrationSettings>) => void;
  onRequestNotificationPermission: () => Promise<boolean>;
  onShowIOSGuide: () => void;
  onOpenLockScreenInfo?: () => void;
}

const INTERVAL_PRESETS = [
  { mins: 15, label: '15m' },
  { mins: 30, label: '30m' },
  { mins: 45, label: '45m' },
  { mins: 60, label: '1 Hour (Default)' },
  { mins: 90, label: '1.5 Hours' },
  { mins: 120, label: '2 Hours' },
  { mins: 180, label: '3 Hours' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
  onRequestNotificationPermission,
  onShowIOSGuide,
  onOpenLockScreenInfo,
}) => {
  if (!isOpen) return null;

  const [intervalMinutes, setIntervalMinutes] = useState(settings.intervalMinutes);
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);
  const [dailyGoalMl, setDailyGoalMl] = useState(settings.dailyGoalMl);
  const [userName, setUserName] = useState(settings.userName);
  const [hapticsEnabled, setHapticsEnabled] = useState(settings.hapticsEnabled);
  const [speechReminder, setSpeechReminder] = useState(settings.speechReminder);
  const [speechPhrase, setSpeechPhrase] = useState(settings.speechPhrase);
  const [notifPermissionState, setNotifPermissionState] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const handleSave = () => {
    onSave({
      intervalMinutes: Math.max(5, Math.min(480, intervalMinutes)),
      startTime,
      endTime,
      dailyGoalMl: Math.max(500, Math.min(10000, dailyGoalMl)),
      userName: userName.trim() || 'You',
      hapticsEnabled,
      speechReminder,
      speechPhrase: speechPhrase.trim(),
    });
    onClose();
  };

  const handleRequestNotif = async () => {
    const granted = await onRequestNotificationPermission();
    setNotifPermissionState(granted ? 'granted' : 'denied');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reminder Settings</h3>
              <p className="text-[11px] text-slate-400">Interval, active hours, and goal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Reminder Gap / Interval */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reminder Gap</span>
            </span>
            <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {formatIntervalLabel(intervalMinutes)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Once you log a drink, this timer immediately starts counting down until your next reminder.
          </p>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            {INTERVAL_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.mins}
                onClick={() => setIntervalMinutes(preset.mins)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border ${
                  intervalMinutes === preset.mins
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25 font-bold'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-slate-400 font-medium">Custom minutes:</span>
            <input
              type="number"
              min="5"
              max="360"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10) || 60)}
              className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-cyan-400 text-center focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-slate-400">mins</span>
          </div>
        </div>

        {/* Section 2: Active Hours Schedule */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Reminder Hours</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Quiet at night
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Reminders run only between these hours so you can sleep peacefully.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Start Time */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] text-cyan-400 font-semibold block">
                {formatTime12Hour(startTime)}
              </span>
            </div>

            {/* End Time */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] text-cyan-400 font-semibold block">
                {formatTime12Hour(endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Daily Target & Profile */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Goal & Name</span>
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {dailyGoalMl} ml
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Daily Water Goal</span>
                <span>{dailyGoalMl} ml</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={dailyGoalMl}
                onChange={(e) => setDailyGoalMl(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1000 ml</span>
                <span>2500 ml</span>
                <span>5000 ml</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Your Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                placeholder="e.g. Shubhendu"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Notifications & Haptics */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Alerts & Feedback</span>
          </span>

          <div className="space-y-2.5">
            {/* Notification Permission */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-semibold text-white">Browser Notifications</p>
                <p className="text-[11px] text-slate-400">
                  Status: <span className="text-cyan-400 font-medium">{notifPermissionState}</span>
                </p>
              </div>
              {notifPermissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestNotif}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition active:scale-95"
                >
                  Enable
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Enabled
                </span>
              )}
            </div>

            {/* Haptic Toggle */}
            <div className="flex items-center justify-between py-1 border-t border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-white">iPhone Taptic Haptics</p>
                <p className="text-[11px] text-slate-400">Vibrate on logging and alerts</p>
              </div>
              <input
                type="checkbox"
                checked={hapticsEnabled}
                onChange={(e) => setHapticsEnabled(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Spoken Voice Reminder */}
            <div className="flex items-center justify-between py-1 border-t border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-white">Spoken Reminder Voice</p>
                <p className="text-[11px] text-slate-400">Reads motivational voice note</p>
              </div>
              <input
                type="checkbox"
                checked={speechReminder}
                onChange={(e) => setSpeechReminder(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Lock Screen Info & Sync button */}
            <div className="pt-2 border-t border-slate-700/50 space-y-2">
              {onOpenLockScreenInfo && (
                <button
                  type="button"
                  onClick={onOpenLockScreenInfo}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>🔒 iPhone Lock-Screen Alerts & Sync</span>
                </button>
              )}

              <button
                type="button"
                onClick={onShowIOSGuide}
                className="w-full py-2 px-3 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>View iPhone Installation Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};
