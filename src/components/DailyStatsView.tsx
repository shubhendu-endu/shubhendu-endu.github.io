import React from 'react';
import { WaterLog, HydrationSettings, DrinkType } from '../types';
import { 
  BarChart3, 
  Flame, 
  Droplet, 
  Clock, 
  Calendar, 
  Trash2, 
  Sparkles, 
  TrendingUp,
  Award
} from 'lucide-react';

interface DailyStatsViewProps {
  logs: WaterLog[];
  todayLogs: WaterLog[];
  todayTotalMl: number;
  settings: HydrationSettings;
  progressPercent: number;
  streakDays: number;
  onDeleteLog: (id: string) => void;
}

const DRINK_ICONS: Record<DrinkType, string> = {
  water: '💧',
  mineral: '✨',
  tea: '🍵',
  electrolyte: '⚡',
  lemon: '🍋',
  coffee: '☕',
};

export const DailyStatsView: React.FC<DailyStatsViewProps> = ({
  logs,
  todayLogs,
  todayTotalMl,
  settings,
  progressPercent,
  streakDays,
  onDeleteLog,
}) => {
  const remainingMl = Math.max(0, settings.dailyGoalMl - todayTotalMl);
  const glassesCount = Math.round(todayTotalMl / 250);

  // Hourly buckets (0-5, 6-11, 12-16, 17-21, 22-23)
  const hourlyBuckets = [
    { label: 'Morning', hours: '6 AM - 12 PM', total: 0, icon: '🌅' },
    { label: 'Afternoon', hours: '12 PM - 5 PM', total: 0, icon: '☀️' },
    { label: 'Evening', hours: '5 PM - 10 PM', total: 0, icon: '🌆' },
    { label: 'Night', hours: '10 PM - 6 AM', total: 0, icon: '🌙' },
  ];

  todayLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    if (hour >= 6 && hour < 12) hourlyBuckets[0].total += log.amountMl;
    else if (hour >= 12 && hour < 17) hourlyBuckets[1].total += log.amountMl;
    else if (hour >= 17 && hour < 22) hourlyBuckets[2].total += log.amountMl;
    else hourlyBuckets[3].total += log.amountMl;
  });

  // Calculate past 7 days hydration
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString([], { weekday: 'narrow' });
    const dateStr = d.toDateString();

    const dayTotal = logs
      .filter(l => new Date(l.timestamp).toDateString() === dateStr)
      .reduce((acc, l) => acc + l.amountMl, 0);

    const percent = Math.min(100, Math.round((dayTotal / settings.dailyGoalMl) * 100));
    const isToday = i === 6;

    return { dayName, dayTotal, percent, isToday };
  });

  return (
    <div className="w-full space-y-5">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today's Total</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-white">{todayTotalMl.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">ml</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-medium mt-1">
            {progressPercent}% of {settings.dailyGoalMl} ml
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-white">{streakDays}</span>
            <span className="text-xs text-slate-400 ml-1">Days</span>
          </div>
          <span className="text-[10px] text-amber-300 font-medium mt-1">
            Keep it burning! 🔥
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Glasses (250ml)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-white">{glassesCount}</span>
            <span className="text-xs text-slate-400 ml-1">glasses</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-medium mt-1">
            {remainingMl > 0 ? `${Math.ceil(remainingMl / 250)} left` : 'Target reached!'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Interval</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-white">{settings.intervalMinutes}</span>
            <span className="text-xs text-slate-400 ml-1">mins</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-medium mt-1">
            Auto-reset on drink
          </span>
        </div>
      </div>

      {/* 7-Day Hydration Trend Chart */}
      <div className="p-4 rounded-3xl ios-glass-card border border-slate-700/60 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Weekly Progress (7 Days)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Goal: {settings.dailyGoalMl} ml
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2 items-end h-32">
          {past7Days.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center h-full justify-end gap-1.5">
              <span className="text-[10px] font-bold text-slate-400">{d.percent}%</span>
              <div className="w-full bg-slate-800/80 rounded-xl h-20 relative overflow-hidden p-0.5 flex items-end border border-slate-700/50">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-cyan-500 to-sky-400'
                      : d.percent >= 100
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                  }`}
                  style={{ height: `${Math.max(8, d.percent)}%` }}
                />
              </div>
              <span className={`text-[11px] font-bold ${d.isToday ? 'text-cyan-400' : 'text-slate-400'}`}>
                {d.dayName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daytime Breakdown */}
      <div className="p-4 rounded-3xl ios-glass-card border border-slate-700/60 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Daytime Hydration Split</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {hourlyBuckets.map((bucket, i) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{bucket.icon} {bucket.label}</span>
              </div>
              <p className="text-[10px] text-slate-400">{bucket.hours}</p>
              <p className="text-sm font-extrabold text-cyan-400 pt-0.5">{bucket.total} ml</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Intake Log History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>Today's Drink History ({todayLogs.length})</span>
          <span className="text-[11px] font-normal text-slate-400">Latest first</span>
        </h3>

        {todayLogs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center text-xs text-slate-400">
            No drinks logged today yet. Tap the water circle or quick presets above!
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-base">
                      {DRINK_ICONS[log.drinkType] || '💧'}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>+{log.amountMl} ml</span>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">({log.drinkType})</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{timeStr}</span>
                        {log.note && <span className="text-slate-300 italic">• "{log.note}"</span>}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
