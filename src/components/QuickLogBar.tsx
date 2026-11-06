import React, { useState } from 'react';
import { DrinkType } from '../types';
import { Plus, Coffee, Sparkles, Check, X } from 'lucide-react';

interface QuickLogBarProps {
  onLog: (amountMl: number, drinkType?: DrinkType, note?: string) => void;
}

const PRESETS = [
  { amount: 150, label: 'Cup', sub: '150 ml', icon: '🍵' },
  { amount: 250, label: 'Glass', sub: '250 ml', icon: '🥛' },
  { amount: 350, label: 'Mug', sub: '350 ml', icon: '☕' },
  { amount: 500, label: 'Bottle', sub: '500 ml', icon: '💧' },
  { amount: 750, label: 'Flask', sub: '750 ml', icon: '🧊' },
];

const DRINK_TYPES: { id: DrinkType; label: string; icon: string }[] = [
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'lemon', label: 'Lemon Water', icon: '🍋' },
  { id: 'tea', label: 'Tea', icon: '🍵' },
  { id: 'electrolyte', label: 'Electrolyte', icon: '⚡' },
  { id: 'mineral', label: 'Mineral', icon: '✨' },
  { id: 'coffee', label: 'Coffee', icon: '☕' },
];

export const QuickLogBar: React.FC<QuickLogBarProps> = ({ onLog }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(300);
  const [selectedType, setSelectedType] = useState<DrinkType>('water');
  const [customNote, setCustomNote] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount > 0) {
      onLog(customAmount, selectedType, customNote.trim() || undefined);
      setIsCustomOpen(false);
      setCustomNote('');
    }
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Quick Intake Presets</span>
        </h3>
        <button
          onClick={() => setIsCustomOpen(true)}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Amount</span>
        </button>
      </div>

      {/* Preset Pill Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.amount}
            onClick={() => onLog(preset.amount, 'water')}
            className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 hover:border-cyan-500/50 shadow-md transition-all active:scale-95 group"
          >
            <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">
              {preset.icon}
            </span>
            <span className="text-xs font-bold text-white group-hover:text-cyan-300">
              +{preset.amount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Log Modal */}
      {isCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Log Custom Intake</span>
              </h3>
              <button
                onClick={() => setIsCustomOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Amount Stepper */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-xs text-slate-400 font-medium mb-1">Drink Volume</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCustomAmount(prev => Math.max(50, prev - 50))}
                    className="w-10 h-10 rounded-2xl bg-slate-700 text-white font-bold text-lg hover:bg-slate-600 flex items-center justify-center active:scale-90 transition"
                  >
                    -
                  </button>
                  <div className="text-3xl font-extrabold text-cyan-400 tracking-tight min-w-[110px] text-center">
                    {customAmount} <span className="text-sm font-semibold text-slate-400">ml</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomAmount(prev => Math.min(2000, prev + 50))}
                    className="w-10 h-10 rounded-2xl bg-slate-700 text-white font-bold text-lg hover:bg-slate-600 flex items-center justify-center active:scale-90 transition"
                  >
                    +
                  </button>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseInt(e.target.value, 10))}
                  className="w-full mt-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Drink Type Selector */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-2">Drink Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {DRINK_TYPES.map(type => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition border ${
                        selectedType === type.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Post workout, iced, infused..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Check className="w-4 h-4" />
                <span>Log {customAmount} ml & Start Timer</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
