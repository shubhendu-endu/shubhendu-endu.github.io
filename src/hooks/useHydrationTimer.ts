import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceNoteItem, HydrationSettings } from '../types';
import { isWithinActiveHours, formatCountdown, formatIntervalLabel } from '../utils/timeUtils';
import { playSyntheticTone, playVoiceNote, speakReminderText, triggerHaptic } from '../utils/audioEngine';

interface UseHydrationTimerProps {
  lastDrinkTimestamp: number;
  settings: HydrationSettings;
  voiceNotes: VoiceNoteItem[];
  onQuickLog?: (amountMl: number) => void;
}

export function useHydrationTimer({
  lastDrinkTimestamp,
  settings,
  voiceNotes,
  onQuickLog,
}: UseHydrationTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const target = lastDrinkTimestamp + settings.intervalMinutes * 60 * 1000;
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  });

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [activeHoursStatus, setActiveHoursStatus] = useState(() => 
    isWithinActiveHours(new Date(), settings.startTime, settings.endTime)
  );

  const hasFiredAlertRef = useRef<number | null>(null);

  // Trigger audio notification
  const fireNotificationSound = useCallback(() => {
    // 1. Check sound type
    if (settings.soundType === 'custom_voice') {
      const activeVoiceNote = voiceNotes.find(v => v.id === settings.selectedVoiceNoteId) || voiceNotes[0];
      if (activeVoiceNote && activeVoiceNote.dataUrl) {
        playVoiceNote(activeVoiceNote.dataUrl, settings.soundVolume).catch(() => {
          // Fallback to synthetic tone
          playSyntheticTone('droplet', settings.soundVolume);
        });
      } else {
        // Fallback to spoken reminder or synthetic tone
        playSyntheticTone('zen_chime', settings.soundVolume);
        if (settings.speechReminder || activeVoiceNote?.source === 'whatsapp') {
          setTimeout(() => {
            speakReminderText(settings.speechPhrase || 'Time to drink a fresh glass of water!', settings.soundVolume);
          }, 350);
        }
      }
    } else {
      playSyntheticTone(settings.soundType, settings.soundVolume);
      if (settings.speechReminder) {
        setTimeout(() => {
          speakReminderText(settings.speechPhrase || 'Time to hydrate!', settings.soundVolume);
        }, 500);
      }
    }

    // 2. Trigger haptic
    if (settings.hapticsEnabled) {
      triggerHaptic([100, 80, 100, 80, 200]);
    }

    // 3. Web Notification API (works on iOS 16.4+ standalone PWA and modern browsers)
    if (settings.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('AquaDrop Reminder 💧', {
            body: `It's time to take a sip! Maintain your streak and stay refreshed.`,
            icon: '/pwa-192x192.png',
            badge: '/icon.svg',
            tag: 'aquadrop-reminder',
            requireInteraction: true,
          });
        } catch {
          // ignore notification error in restricted iframes
        }
      }
    }
  }, [settings, voiceNotes]);

  // Main timer tick
  useEffect(() => {
    const checkTimer = () => {
      const now = new Date();
      const hoursStatus = isWithinActiveHours(now, settings.startTime, settings.endTime);
      setActiveHoursStatus(hoursStatus);

      // Determine effective target timestamp
      let effectiveTargetTime: number;
      if (snoozeUntil && snoozeUntil > Date.now()) {
        effectiveTargetTime = snoozeUntil;
      } else {
        effectiveTargetTime = lastDrinkTimestamp + settings.intervalMinutes * 60 * 1000;
      }

      const diffSec = Math.floor((effectiveTargetTime - Date.now()) / 1000);
      setRemainingSeconds(diffSec);

      // Check if alert should trigger
      if (diffSec <= 0 && hoursStatus.isActive) {
        // Only trigger once per target cycle
        if (hasFiredAlertRef.current !== effectiveTargetTime) {
          hasFiredAlertRef.current = effectiveTargetTime;
          setIsAlertModalOpen(true);
          fireNotificationSound();
        }
      }
    };

    // Run check immediately
    checkTimer();
    const intervalId = setInterval(checkTimer, 1000);
    return () => clearInterval(intervalId);
  }, [lastDrinkTimestamp, settings, snoozeUntil, fireNotificationSound]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  // Snooze reminder (e.g., 10 minutes)
  const snooze = useCallback((minutes: number = 10) => {
    const newTarget = Date.now() + minutes * 60 * 1000;
    setSnoozeUntil(newTarget);
    setIsAlertModalOpen(false);
    if (settings.hapticsEnabled) {
      triggerHaptic([30, 20]);
    }
  }, [settings.hapticsEnabled]);

  // Dismiss alert
  const dismissAlert = useCallback(() => {
    setIsAlertModalOpen(false);
  }, []);

  // Handle quick drink from alert
  const handleDrinkFromAlert = useCallback((amountMl: number = 250) => {
    setIsAlertModalOpen(false);
    setSnoozeUntil(null);
    if (onQuickLog) {
      onQuickLog(amountMl);
    }
  }, [onQuickLog]);

  const totalIntervalSeconds = settings.intervalMinutes * 60;
  const progressRatio = Math.max(0, Math.min(1, remainingSeconds / totalIntervalSeconds));

  return {
    remainingSeconds,
    formattedCountdown: formatCountdown(remainingSeconds),
    progressRatio,
    intervalLabel: formatIntervalLabel(settings.intervalMinutes),
    activeHoursStatus,
    isAlertModalOpen,
    snooze,
    dismissAlert,
    handleDrinkFromAlert,
    fireNotificationSound,
    requestNotificationPermission,
  };
}
