import React from 'react';
import { Droplets, Sparkles } from 'lucide-react';

interface WaterWaveCircleProps {
  currentMl: number;
  goalMl: number;
  progressPercent: number;
  onQuickAdd: () => void;
}

export const WaterWaveCircle: React.FC<WaterWaveCircleProps> = ({
  currentMl,
  goalMl,
  progressPercent,
  onQuickAdd,
}) => {
  // Clamp fill percentage between 4% and 100% for aesthetic reasons
  const fillHeight = Math.min(100, Math.max(8, progressPercent));
  const isGoalAchieved = currentMl >= goalMl;

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      {/* Outer ambient glow */}
      <div 
        className="absolute -inset-4 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: isGoalAchieved 
            ? 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(14,165,233,0) 70%)' 
            : 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(56,189,248,0) 70%)'
        }}
      />

      {/* Main circular water vessel */}
      <div 
        onClick={onQuickAdd}
        role="button"
        tabIndex={0}
        aria-label="Tap to log water intake"
        className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 shadow-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform select-none group"
      >
        {/* Subtle glass reflection ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10 pointer-events-none z-30" />
        <div className="absolute top-2 left-6 right-6 h-12 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none z-30 opacity-60" />

        {/* Liquid Container with rounded clip */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950/60 flex items-center justify-center">
          
          {/* Animated Water Body */}
          <div 
            className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
            style={{ height: `${fillHeight}%` }}
          >
            {/* Wave 1: Fast back wave */}
            <div className="absolute -top-7 left-0 right-0 w-[200%] h-8 opacity-45 pointer-events-none animate-wave-fast">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-sky-400">
                <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,-20 1200,30 L1200,120 L0,120 Z"></path>
              </svg>
            </div>

            {/* Wave 2: Foreground wave */}
            <div className="absolute -top-6 left-0 right-0 w-[200%] h-8 opacity-90 pointer-events-none animate-wave-slow">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-cyan-500">
                <path d="M0,20 C180,-30 320,60 500,10 C680,-40 850,50 1200,15 L1200,120 L0,120 Z"></path>
              </svg>
            </div>

            {/* Deep Water Gradient */}
            <div className="w-full h-full bg-gradient-to-b from-cyan-500 via-sky-600 to-blue-700 opacity-95" />

            {/* Micro bubbles */}
            <div className="absolute bottom-2 left-1/4 w-2 h-2 rounded-full bg-white/40 animate-ping" />
            <div className="absolute bottom-6 right-1/3 w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" />
          </div>

          {/* Centered Content Overlay (Readable on both water and dark background) */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none drop-shadow-md">
            
            {/* Top Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-cyan-300 mb-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Today's Hydration</span>
            </div>

            {/* Progress Percentage */}
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline justify-center">
              <span>{progressPercent}</span>
              <span className="text-2xl font-bold text-cyan-300 ml-0.5">%</span>
            </div>

            {/* Current ml / Goal ml */}
            <div className="text-sm font-semibold text-slate-100 mt-1 flex items-center gap-1">
              <span className="text-white font-bold">{currentMl.toLocaleString()}</span>
              <span className="text-slate-300 font-normal">/ {goalMl.toLocaleString()} ml</span>
            </div>

            {/* Subtle tap callout */}
            <div className="mt-2 text-[11px] font-medium text-white/80 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-sm border border-white/10 flex items-center gap-1 group-hover:bg-black/40 transition">
              {isGoalAchieved ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span className="text-amber-200 font-bold">Goal Achieved!</span>
                </>
              ) : (
                <span>Tap to Log +250ml</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
