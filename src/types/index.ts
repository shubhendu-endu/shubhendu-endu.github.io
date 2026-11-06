export type DrinkType = 'water' | 'mineral' | 'tea' | 'electrolyte' | 'lemon' | 'coffee';

export interface WaterLog {
  id: string;
  timestamp: number; // ms
  amountMl: number;
  drinkType: DrinkType;
  note?: string;
}

export interface VoiceNoteItem {
  id: string;
  name: string;
  dataUrl: string; // base64 data url (audio/webm, audio/mp3, audio/ogg, audio/mp4/m4a, etc.)
  durationSec: number;
  createdAt: number;
  source: 'whatsapp' | 'recorded' | 'upload' | 'preset';
}

export type SoundType = 
  | 'droplet' 
  | 'zen_chime' 
  | 'cascade' 
  | 'bubble' 
  | 'tibetan_bell'
  | 'custom_voice';

export interface HydrationSettings {
  intervalMinutes: number; // default 60 minutes
  dailyGoalMl: number;     // default 2500 ml
  startTime: string;       // default '08:00'
  endTime: string;         // default '22:00'
  soundType: SoundType;
  selectedVoiceNoteId?: string;
  soundVolume: number;     // 0.0 to 1.0
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  speechReminder: boolean;
  speechPhrase: string;
  userName: string;
}

export interface FriendData {
  id: string;
  name: string;
  avatar: string;
  dailyGoalMl: number;
  currentMl: number;
  lastDrinkTimestamp: number;
  streakDays: number;
  cheersCount: number;
  statusMessage?: string;
  isCustom?: boolean;
}

export interface DayStats {
  dateStr: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  percentage: number;
  logCount: number;
}
