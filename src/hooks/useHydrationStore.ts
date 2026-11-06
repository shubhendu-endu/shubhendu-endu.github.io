import { useState, useEffect, useCallback } from 'react';
import { DrinkType, FriendData, HydrationSettings, VoiceNoteItem, WaterLog } from '../types';
import { getTodayDateStr } from '../utils/timeUtils';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/audioEngine';

const STORAGE_KEYS = {
  LOGS: 'aquadrop_logs_v1',
  SETTINGS: 'aquadrop_settings_v1',
  VOICE_NOTES: 'aquadrop_voice_notes_v1',
  FRIENDS: 'aquadrop_friends_v1',
  LAST_DRINK: 'aquadrop_last_drink_v1',
  LAST_DISMISSED: 'aquadrop_last_dismissed_v1',
};

const DEFAULT_SETTINGS: HydrationSettings = {
  intervalMinutes: 60, // Default 1 hour as requested
  dailyGoalMl: 2500,
  startTime: '08:00',
  endTime: '22:00',
  soundType: 'droplet',
  soundVolume: 0.85,
  notificationsEnabled: true,
  hapticsEnabled: true,
  speechReminder: false,
  speechPhrase: 'Time to drink a glass of water!',
  userName: 'You',
};

const INITIAL_FRIENDS: FriendData[] = [
  {
    id: 'friend_elena',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dailyGoalMl: 2500,
    currentMl: 1750,
    lastDrinkTimestamp: Date.now() - 28 * 60 * 1000,
    streakDays: 6,
    cheersCount: 14,
    statusMessage: 'Drinking infused mint water 🌿',
  },
  {
    id: 'friend_david',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dailyGoalMl: 3000,
    currentMl: 2400,
    lastDrinkTimestamp: Date.now() - 45 * 60 * 1000,
    streakDays: 14,
    cheersCount: 29,
    statusMessage: 'Post-gym hydration beast mode 💪',
  },
  {
    id: 'friend_priya',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    dailyGoalMl: 2200,
    currentMl: 1200,
    lastDrinkTimestamp: Date.now() - 75 * 60 * 1000,
    streakDays: 4,
    cheersCount: 8,
    statusMessage: 'Warm lemon water morning 🍋',
  },
];

// Initial starter sample WhatsApp voice note for testing
const SAMPLE_WHATSAPP_VOICE: VoiceNoteItem = {
  id: 'sample_whatsapp_1',
  name: 'Voice from Alex (WhatsApp): "Bro drink water!"',
  dataUrl: '', // uses fallback tone/speech
  durationSec: 4,
  createdAt: Date.now() - 86400000,
  source: 'whatsapp',
};

export function useHydrationStore() {
  // Settings
  const [settings, setSettings] = useState<HydrationSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Intake Logs
  const [logs, setLogs] = useState<WaterLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) return JSON.parse(stored);
      // Default initial starter logs for today so the user sees a rich live screen right away
      const now = Date.now();
      return [
        {
          id: 'starter_1',
          timestamp: now - 3.5 * 3600 * 1000,
          amountMl: 350,
          drinkType: 'water',
          note: 'Morning wake-up glass',
        },
        {
          id: 'starter_2',
          timestamp: now - 1.8 * 3600 * 1000,
          amountMl: 250,
          drinkType: 'lemon',
          note: 'Lemon water refresh',
        },
      ];
    } catch {
      return [];
    }
  });

  // Last drink timestamp (starts the reminder timer from this point!)
  const [lastDrinkTimestamp, setLastDrinkTimestamp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_DRINK);
      if (stored) return parseInt(stored, 10);
      // Default to 25 minutes ago so user sees the active timer ticking down
      return Date.now() - 25 * 60 * 1000;
    } catch {
      return Date.now();
    }
  });

  // Custom Voice Notes (WhatsApp uploads, recorded clips, etc.)
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_NOTES);
      return stored ? JSON.parse(stored) : [SAMPLE_WHATSAPP_VOICE];
    } catch {
      return [SAMPLE_WHATSAPP_VOICE];
    }
  });

  // Friends data
  const [friends, setFriends] = useState<FriendData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      return stored ? JSON.parse(stored) : INITIAL_FRIENDS;
    } catch {
      return INITIAL_FRIENDS;
    }
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [settings]);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [logs]);

  // Persist last drink timestamp
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_DRINK, lastDrinkTimestamp.toString());
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [lastDrinkTimestamp]);

  // Persist voice notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE_NOTES, JSON.stringify(voiceNotes));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [voiceNotes]);

  // Persist friends
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [friends]);

  // Core feature: Log intake and immediately start the timer for next reminder!
  const logIntake = useCallback((amountMl: number, drinkType: DrinkType = 'water', note?: string) => {
    const timestamp = Date.now();
    const newLog: WaterLog = {
      id: `log_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      amountMl,
      drinkType,
      note,
    };

    setLogs(prev => [newLog, ...prev]);
    // Requirement 4: Start the timer since then for next reminder!
    setLastDrinkTimestamp(timestamp);

    // Haptic feedback
    if (settings.hapticsEnabled) {
      triggerHaptic([40, 60, 50]);
    }

    // Check if goal reached for confetti celebration
    const todayLogs = logs.filter(l => {
      const d = new Date(l.timestamp);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });
    const currentTotal = todayLogs.reduce((acc, l) => acc + l.amountMl, 0);
    const newTotal = currentTotal + amountMl;

    if (newTotal >= settings.dailyGoalMl && currentTotal < settings.dailyGoalMl) {
      // Goal milestone reached!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }

    return newLog;
  }, [logs, settings.dailyGoalMl, settings.hapticsEnabled]);

  // Delete intake log
  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<HydrationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Add custom voice note (from WhatsApp file upload or mic recording)
  const addVoiceNote = useCallback((voiceNote: Omit<VoiceNoteItem, 'id' | 'createdAt'>) => {
    const id = `vn_${Date.now()}`;
    const newItem: VoiceNoteItem = {
      ...voiceNote,
      id,
      createdAt: Date.now(),
    };
    setVoiceNotes(prev => [newItem, ...prev]);
    // Automatically select it
    setSettings(prev => ({
      ...prev,
      soundType: 'custom_voice',
      selectedVoiceNoteId: id,
    }));
    return newItem;
  }, []);

  // Delete voice note
  const deleteVoiceNote = useCallback((id: string) => {
    setVoiceNotes(prev => prev.filter(v => v.id !== id));
    setSettings(prev => {
      if (prev.selectedVoiceNoteId === id) {
        return { ...prev, soundType: 'droplet', selectedVoiceNoteId: undefined };
      }
      return prev;
    });
  }, []);

  // Reset timer manually (e.g., user just drank without logging or wants a fresh gap)
  const resetTimer = useCallback(() => {
    setLastDrinkTimestamp(Date.now());
    if (settings.hapticsEnabled) {
      triggerHaptic([30, 30]);
    }
  }, [settings.hapticsEnabled]);

  // Friends: Cheer a friend
  const cheerFriend = useCallback((friendId: string) => {
    setFriends(prev => prev.map(f => {
      if (f.id === friendId) {
        return { ...f, cheersCount: f.cheersCount + 1 };
      }
      return f;
    }));
    if (settings.hapticsEnabled) {
      triggerHaptic([20, 30]);
    }
  }, [settings.hapticsEnabled]);

  // Friends: Add friend
  const addFriend = useCallback((friend: Omit<FriendData, 'id' | 'cheersCount'>) => {
    const newFriend: FriendData = {
      ...friend,
      id: `friend_${Date.now()}`,
      cheersCount: 0,
      isCustom: true,
    };
    setFriends(prev => [newFriend, ...prev]);
    return newFriend;
  }, []);

  // Today's statistics computation
  const todayStr = getTodayDateStr();
  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}` === todayStr;
  });

  const todayTotalMl = todayLogs.reduce((acc, l) => acc + l.amountMl, 0);
  const progressPercent = Math.min(100, Math.round((todayTotalMl / (settings.dailyGoalMl || 2500)) * 100));

  // Calculate streak
  const calculateStreak = useCallback(() => {
    const datesWithLogs = new Set(
      logs.map(l => {
        const d = new Date(l.timestamp);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      })
    );

    let streak = 0;
    const testDate = new Date();
    // If logged today, start counting
    const todayStrKey = `${testDate.getFullYear()}-${(testDate.getMonth() + 1).toString().padStart(2, '0')}-${testDate.getDate().toString().padStart(2, '0')}`;
    if (!datesWithLogs.has(todayStrKey)) {
      // Check if logged yesterday
      testDate.setDate(testDate.getDate() - 1);
    }

    while (true) {
      const key = `${testDate.getFullYear()}-${(testDate.getMonth() + 1).toString().padStart(2, '0')}-${testDate.getDate().toString().padStart(2, '0')}`;
      if (datesWithLogs.has(key)) {
        streak++;
        testDate.setDate(testDate.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [logs]);

  return {
    settings,
    updateSettings,
    logs,
    todayLogs,
    todayTotalMl,
    progressPercent,
    lastDrinkTimestamp,
    streakDays: calculateStreak(),
    voiceNotes,
    friends,
    logIntake,
    deleteLog,
    resetTimer,
    addVoiceNote,
    deleteVoiceNote,
    cheerFriend,
    addFriend,
  };
}
