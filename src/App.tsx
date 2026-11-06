import React, { useState, useEffect } from 'react';
import { useHydrationStore } from './hooks/useHydrationStore';
import { useHydrationTimer } from './hooks/useHydrationTimer';
import { Header } from './components/Header';
import { TabBar, ActiveTab } from './components/TabBar';
import { WaterWaveCircle } from './components/WaterWaveCircle';
import { ReminderTimerCard } from './components/ReminderTimerCard';
import { QuickLogBar } from './components/QuickLogBar';
import { DailyStatsView } from './components/DailyStatsView';
import { FriendsView } from './components/FriendsView';
import { VoiceNotesManager } from './components/VoiceNotesManager';
import { SettingsModal } from './components/SettingsModal';
import { ReminderAlertModal } from './components/ReminderAlertModal';
import { IOSInstallGuide } from './components/IOSInstallGuide';
import { LockScreenInfoModal } from './components/LockScreenInfoModal';
import { PhoneAccessModal } from './components/PhoneAccessModal';
import { unlockAudio } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState(false);
  const [isLockScreenOpen, setIsLockScreenOpen] = useState(false);
  const [isPhoneAccessOpen, setIsPhoneAccessOpen] = useState(false);

  const {
    settings,
    updateSettings,
    logs,
    todayLogs,
    todayTotalMl,
    progressPercent,
    lastDrinkTimestamp,
    streakDays,
    voiceNotes,
    friends,
    logIntake,
    deleteLog,
    resetTimer,
    addVoiceNote,
    deleteVoiceNote,
    cheerFriend,
    addFriend,
  } = useHydrationStore();

  const {
    remainingSeconds,
    formattedCountdown,
    progressRatio,
    activeHoursStatus,
    isAlertModalOpen,
    snooze,
    dismissAlert,
    handleDrinkFromAlert,
    fireNotificationSound,
    requestNotificationPermission,
  } = useHydrationTimer({
    lastDrinkTimestamp,
    settings,
    voiceNotes,
    onQuickLog: (amountMl) => {
      logIntake(amountMl, 'water');
    },
  });

  // Global listener to unlock AudioContext on first user touch/click
  useEffect(() => {
    const handleFirstTouch = () => {
      unlockAudio();
    };
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('click', handleFirstTouch, { once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  // Determine active sound display name
  const activeSoundLabel = settings.soundType === 'custom_voice'
    ? voiceNotes.find(v => v.id === settings.selectedVoiceNoteId)?.name || 'Custom Voice Note'
    : settings.soundType.replace('_', ' ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        streakDays={streakDays}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPhoneAccess={() => setIsPhoneAccessOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-28">
        {/* Tab 1: Today Dashboard */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Interactive Liquid Water Ring */}
            <WaterWaveCircle
              currentMl={todayTotalMl}
              goalMl={settings.dailyGoalMl}
              progressPercent={progressPercent}
              onQuickAdd={() => logIntake(250, 'water')}
            />

            {/* Live Countdown & Interval Timer Card */}
            <ReminderTimerCard
              remainingSeconds={remainingSeconds}
              formattedCountdown={formattedCountdown}
              progressRatio={progressRatio}
              settings={settings}
              activeHoursStatus={activeHoursStatus}
              lastDrinkTimestamp={lastDrinkTimestamp}
              onResetTimer={resetTimer}
              onSnooze={snooze}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onTestSound={fireNotificationSound}
              onOpenLockScreenGuide={() => setIsLockScreenOpen(true)}
            />

            {/* Quick Intake Presets Bar */}
            <div className="pt-1">
              <QuickLogBar onLog={logIntake} />
            </div>

            {/* Today's Mini Summary Bar */}
            {todayLogs.length > 0 && (
              <div 
                onClick={() => setActiveTab('stats')}
                role="button"
                tabIndex={0}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-850 transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-semibold text-slate-300">
                    {todayLogs.length} drink{todayLogs.length > 1 ? 's' : ''} logged today
                  </span>
                </div>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  View Detailed Stats →
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Statistics & Trends */}
        {activeTab === 'stats' && (
          <div className="animate-in fade-in duration-200">
            <DailyStatsView
              logs={logs}
              todayLogs={todayLogs}
              todayTotalMl={todayTotalMl}
              settings={settings}
              progressPercent={progressPercent}
              streakDays={streakDays}
              onDeleteLog={deleteLog}
            />
          </div>
        )}

        {/* Tab 3: Friends Hydration Circle & Sharing */}
        {activeTab === 'friends' && (
          <div className="animate-in fade-in duration-200">
            <FriendsView
              friends={friends}
              settings={settings}
              todayTotalMl={todayTotalMl}
              progressPercent={progressPercent}
              streakDays={streakDays}
              onCheerFriend={cheerFriend}
              onAddFriend={addFriend}
            />
          </div>
        )}

        {/* Tab 4: Audio & WhatsApp Voice Notes */}
        {activeTab === 'audio' && (
          <div className="animate-in fade-in duration-200">
            <VoiceNotesManager
              settings={settings}
              voiceNotes={voiceNotes}
              onUpdateSettings={updateSettings}
              onAddVoiceNote={addVoiceNote}
              onDeleteVoiceNote={deleteVoiceNote}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom iOS Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={updateSettings}
        onRequestNotificationPermission={requestNotificationPermission}
        onShowIOSGuide={() => setIsIOSGuideOpen(true)}
        onOpenLockScreenInfo={() => setIsLockScreenOpen(true)}
      />

      {/* iOS Installation Guide Modal */}
      <IOSInstallGuide
        isOpen={isIOSGuideOpen}
        onClose={() => setIsIOSGuideOpen(false)}
      />

      {/* iPhone Lock Screen Info & Sync Modal */}
      <LockScreenInfoModal
        isOpen={isLockScreenOpen}
        onClose={() => setIsLockScreenOpen(false)}
        settings={settings}
        onShowIOSGuide={() => setIsIOSGuideOpen(true)}
      />

      {/* Phone QR Access Modal */}
      <PhoneAccessModal
        isOpen={isPhoneAccessOpen}
        onClose={() => setIsPhoneAccessOpen(false)}
      />

      {/* Active Hydration Reminder Alert Dialog */}
      <ReminderAlertModal
        isOpen={isAlertModalOpen}
        onDrink={handleDrinkFromAlert}
        onSnooze={snooze}
        onDismiss={dismissAlert}
        onReplayAudio={fireNotificationSound}
        activeSoundLabel={activeSoundLabel}
      />
    </div>
  );
}
