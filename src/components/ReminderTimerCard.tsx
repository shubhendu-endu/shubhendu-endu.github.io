import React from 'react';
import { Timer, Clock, Moon, Volume2, RotateCcw, Bell, Sliders } from 'lucide-react';
import { formatIntervalLabel, formatTime12Hour } from '../utils/timeUtils';
import { HydrationSettings } from '../types';

interface ReminderTimerCardProps {
  remainingSeconds: number;
  formattedCountdown: {
    display: string;
    isOverdue: boolean;
    hours: number;
    minutes: number;
    seconds: number;
  };
  progressRatio: number;
  settings: HydrationSettings;
  activeHoursStatus: {
    isActive: boolean;
    reason?: string;
    nextActiveTimeStr?: string;
  };
  lastDrinkTimestamp: number;
  onResetTimer: () => void;
  onSnooze: (mins: number) => void;
  onOpenSettings: () => void;
  onTestSound: () => void;
  onOpenLockScreenGuide?: () => void;
}

export const ReminderTimerCard: React.FC<ReminderTimerCardProps> = ({
  remainingSeconds,
  formattedCountdown,
  progressRatio,
  settings,
  activeHoursStatus,
  lastDrinkTimestamp,
  onResetTimer,
  onSnooze,
  onOpenSettings,
  onTestSound,
  onOpenLockScreenGuide,
}) => {
  const isOverdue = formattedCountdown.isOverdue;
  const lastDrinkDate = new Date(lastDrinkTimestamp);
  const formattedLastDrink = lastDrinkDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="w-full rounded-3xl ios-glass-card p-5 border border-slate-700/60 shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div 
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: !activeHoursStatus.isActive 
            ? '#818cf8' 
            : isOverdue 
              ? '#f59e0b' 
              : '#0ea5e9'
        }}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            !activeHoursStatus.isActive 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : isOverdue 
                ? 'bg-amber-500/20 text-amber-400 animate-pulse' 
                : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            {!activeHoursStatus.isActive ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Timer className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Next Reminder</span>
              {isOverdue && activeHoursStatus.isActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Due now!
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Auto-starts after each water log
            </p>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-1.5">
          {onOpenLockScreenGuide && (
            <button
              onClick={onOpenLockScreenGuide}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-semibold text-amber-300 transition active:scale-95"
              title="How lock-screen notifications work"
            >
              <span>🔒 Lock Screen</span>
            </button>
          )}

          {/* Interval Pill (Tap to change gap) */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition active:scale-95"
            title="Change reminder interval"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Gap: {formatIntervalLabel(settings.intervalMinutes)}</span>
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center py-2">
        {!activeHoursStatus.isActive ? (
          <div className="text-center py-2 px-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 w-full">
            <div className="flex items-center justify-center gap-1.5 text-indigo-300 font-semibold text-sm mb-1">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Quiet / Sleep Hours</span>
            </div>
            <p className="text-xs text-slate-300">
              Active window is {formatTime12Hour(settings.startTime)} – {formatTime12Hour(settings.endTime)}.
            </p>
            <p className="text-[11px] text-indigo-300/80 mt-1">
              Reminders will resume at {activeHoursStatus.nextActiveTimeStr || 'morning'}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Live Big Digital Timer */}
            <div className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums ${
              isOverdue ? 'text-amber-400 animate-pulse' : 'text-white'
            }`}>
              {isOverdue ? `+${formattedCountdown.display}` : formattedCountdown.display}
            </div>

            {/* Context message */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isOverdue
                  ? 'Time for a fresh drink!'
                  : `Counting down since last intake at ${formattedLastDrink}`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear"
                style={{
                  width: `${isOverdue ? 100 : Math.max(0, Math.min(100, (1 - progressRatio) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
        <button
          onClick={onResetTimer}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-300 transition active:scale-95"
          title="Reset timer to full gap"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Restart</span>
        </button>

        <button
          onClick={() => onSnooze(10)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-300 transition active:scale-95"
          title="Snooze for 10 minutes"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>+10m Snooze</span>
        </button>

        <button
          onClick={onTestSound}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-300 transition active:scale-95"
          title="Test current notification sound or voice note"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Test Sound</span>
        </button>
      </div>
    </div>
  );
};
