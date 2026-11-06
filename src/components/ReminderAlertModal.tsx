import React from 'react';
import { Droplet, Bell, Volume2, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ReminderAlertModalProps {
  isOpen: boolean;
  onDrink: (amountMl: number) => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
  onReplayAudio: () => void;
  activeSoundLabel: string;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  isOpen,
  onDrink,
  onSnooze,
  onDismiss,
  onReplayAudio,
  activeSoundLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-cyan-500/80 p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center gap-4 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-cyan-500/30 blur-3xl pointer-events-none animate-pulse" />
        
        {/* Animated Icon */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center animate-bounce">
            <Droplet className="w-10 h-10 text-cyan-400 fill-cyan-400/40" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            💧
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Time to Hydrate!</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Your reminder interval has elapsed. Take a glass of fresh water to keep your body energized and your streak alive.
          </p>
        </div>

        {/* Active Sound Indicator / Replay Button */}
        <button
          onClick={onReplayAudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-cyan-300 transition active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Replay Sound: {activeSoundLabel}</span>
        </button>

        {/* Primary Action: Drink & Restart Timer */}
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={() => onDrink(250)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Drink 250 ml & Restart Timer</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSnooze(10)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Snooze 10m</span>
            </button>

            <button
              onClick={onDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
