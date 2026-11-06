import React from 'react';
import { Droplets, BarChart2, Users, Volume2 } from 'lucide-react';
import { triggerHaptic, unlockAudio } from '../utils/audioEngine';

export type ActiveTab = 'today' | 'stats' | 'friends' | 'audio';

interface TabBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'today' as ActiveTab, label: 'Today', icon: Droplets },
    { id: 'stats' as ActiveTab, label: 'Statistics', icon: BarChart2 },
    { id: 'friends' as ActiveTab, label: 'Friends', icon: Users },
    { id: 'audio' as ActiveTab, label: 'Voice & Sounds', icon: Volume2 },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    unlockAudio();
    triggerHaptic([15]);
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 ios-glass border-t border-slate-800/80 pb-safe pt-2">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
