import { SoundType, VoiceNoteItem } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Ensure audio context is ready on any user click
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (err) {
    console.warn('Audio unlock warning:', err);
  }
}

// Synthesize crystal-clear water droplet and chime sounds using Web Audio API
export function playSyntheticTone(type: SoundType, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (type === 'droplet') {
      // Realistic "ploop" droplet sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Fast pitch drop then tiny bounce
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.36);

      // Second smaller splash echo
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const t2 = ctx.currentTime;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1200, t2);
          osc2.frequency.exponentialRampToValueAtTime(900, t2 + 0.15);
          gain2.gain.setValueAtTime(0.4 * volume, t2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.19);
        } catch {
          // ignore
        }
      }, 70);

    } else if (type === 'zen_chime') {
      // Pentatonic bell chord
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.4 / (idx + 1), now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 1.7);
      });

    } else if (type === 'cascade') {
      // Arpeggiated cascading water fountain
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startT = now + i * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startT + 0.2);

        gain.gain.setValueAtTime(0, startT);
        gain.gain.linearRampToValueAtTime(0.3, startT + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startT);
        osc.stop(startT + 0.65);
      });

    } else if (type === 'bubble') {
      // Playful underwater bubbling
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startT = now + i * 0.06;
        const baseFreq = 400 + Math.random() * 400;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, startT);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, startT + 0.12);

        gain.gain.setValueAtTime(0.5, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.14);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startT);
        osc.stop(startT + 0.15);
      }

    } else if (type === 'tibetan_bell') {
      // Deep resonant singing bowl tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now); // 432 Hz healing vibration
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(434.5, now); // Gentle binaural beat

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    }
  } catch (err) {
    console.error('Failed to play synthetic tone:', err);
  }
}

// Play custom voice note (WhatsApp voice note or recorded note)
export function playVoiceNote(dataUrl: string, volume: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      unlockAudio();
      const audio = new Audio(dataUrl);
      audio.volume = Math.max(0.1, Math.min(1, volume));
      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error('Audio playback error', e);
        reject(e);
      };
      audio.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

// Spoken voice reminder using SpeechSynthesis
export function speakReminderText(text: string, volume: number = 1.0) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google') || v.name.includes('Natural')));
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

// Trigger haptic feedback on supported mobile devices
export function triggerHaptic(pattern: number[] = [30, 40, 40]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

// Default pre-packaged WhatsApp style voice reminders
export const PRESET_VOICE_NOTES: VoiceNoteItem[] = [
  {
    id: 'preset_buddy_whatsapp',
    name: 'WhatsApp Voice: "Time to hydrate bro!"',
    dataUrl: '', // Will be dynamically generated via Web Speech or synthetic tone preview
    durationSec: 3,
    createdAt: 1700000000000,
    source: 'whatsapp',
  },
  {
    id: 'preset_gentle_mom',
    name: 'Voice Note: "Don\'t forget your water!"',
    dataUrl: '',
    durationSec: 4,
    createdAt: 1700000001000,
    source: 'preset',
  },
];
