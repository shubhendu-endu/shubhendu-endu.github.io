import React, { useState, useRef } from 'react';
import { VoiceNoteItem, SoundType, HydrationSettings } from '../types';
import { 
  Mic, 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  Check, 
  Volume2, 
  Music, 
  Sparkles,
  MessageCircle,
  FileAudio
} from 'lucide-react';
import { playSyntheticTone, playVoiceNote, speakReminderText, unlockAudio } from '../utils/audioEngine';

interface VoiceNotesManagerProps {
  settings: HydrationSettings;
  voiceNotes: VoiceNoteItem[];
  onUpdateSettings: (newSettings: Partial<HydrationSettings>) => void;
  onAddVoiceNote: (note: Omit<VoiceNoteItem, 'id' | 'createdAt'>) => void;
  onDeleteVoiceNote: (id: string) => void;
}

const BUILT_IN_SOUNDS: { id: SoundType; label: string; desc: string; icon: string }[] = [
  { id: 'droplet', label: 'Crystal Droplet', desc: 'Crisp natural iOS water ploop', icon: '💧' },
  { id: 'zen_chime', label: 'Zen Chime', desc: 'Pentatonic crystal bell chord', icon: '🔔' },
  { id: 'cascade', label: 'Spring Cascade', desc: 'Arpeggiated gentle stream', icon: '🌊' },
  { id: 'bubble', label: 'Bubble Pop', desc: 'Playful underwater aeration', icon: '🫧' },
  { id: 'tibetan_bell', label: 'Singing Bowl', desc: 'Deep 432Hz meditative resonance', icon: '🧘' },
];

export const VoiceNotesManager: React.FC<VoiceNotesManagerProps> = ({
  settings,
  voiceNotes,
  onUpdateSettings,
  onAddVoiceNote,
  onDeleteVoiceNote,
}) => {
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [whatsappNoteName, setWhatsappNoteName] = useState('Voice from WhatsApp');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play synthetic tone preview
  const handlePlayBuiltin = (type: SoundType) => {
    unlockAudio();
    setIsPlayingId(type);
    playSyntheticTone(type, settings.soundVolume);
    setTimeout(() => {
      setIsPlayingId(null);
    }, 1200);
  };

  // Play voice note preview
  const handlePlayVoiceNote = async (item: VoiceNoteItem) => {
    unlockAudio();
    if (isPlayingId === item.id) {
      setIsPlayingId(null);
      return;
    }
    setIsPlayingId(item.id);

    if (item.dataUrl) {
      try {
        await playVoiceNote(item.dataUrl, settings.soundVolume);
      } catch (e) {
        console.warn('Playback error', e);
      } finally {
        setIsPlayingId(null);
      }
    } else {
      // Preset simulation with speech and droplet
      speakReminderText(item.name.replace(/.*: "(.*)"/, '$1') || 'Time to drink water!', settings.soundVolume);
      setTimeout(() => setIsPlayingId(null), 2500);
    }
  };

  // Handle uploading WhatsApp voice notes (.opus, .ogg, .m4a, .mp3, .wav)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      const isFromWhatsApp = file.name.toLowerCase().includes('ptt') || 
                             file.name.toLowerCase().includes('audio') || 
                             file.name.toLowerCase().includes('whatsapp') || 
                             file.name.endsWith('.opus');

      onAddVoiceNote({
        name: isFromWhatsApp ? `WhatsApp Note: ${cleanFileName}` : cleanFileName,
        dataUrl,
        durationSec: 5,
        source: isFromWhatsApp ? 'whatsapp' : 'upload',
      });
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  // Start in-app microphone recording (can record simulated WhatsApp voice note)
  const startRecording = async () => {
    unlockAudio();
    setRecordError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
          ? 'audio/mp4' 
          : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          onAddVoiceNote({
            name: whatsappNoteName.trim() || 'WhatsApp Voice Note',
            dataUrl,
            durationSec: recordingSeconds || 4,
            source: 'whatsapp',
          });
          setRecordingSeconds(0);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Mic access error', err);
      const errMsg = err instanceof Error ? err.message : 'Microphone access denied';
      setRecordError(`Could not access microphone: ${errMsg}. You can also upload any WhatsApp audio file!`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Info */}
      <div className="rounded-3xl ios-glass-card p-5 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">WhatsApp Voice Notes & Tones</h3>
            <p className="text-xs text-slate-400">
              Set custom voice notes sent by friends or high-clarity iOS chimes
            </p>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Alert Volume</span>
              <span>{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5"
            />
          </div>
        </div>

        {/* WhatsApp Voice Note Recording & Upload Area */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800/80 to-slate-900/90 border border-emerald-700/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Import WhatsApp Voice Note</span>
            </span>
            <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              .opus / .m4a / .mp3 / mic
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Got an encouraging voice note from a friend on WhatsApp? Forward or upload the audio file, or record one now!
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Record Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 transition active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Record Voice Note</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-md transition active:scale-95"
              >
                <Square className="w-4 h-4" />
                <span>Stop ({recordingSeconds}s)</span>
              </button>
            )}

            {/* Upload File Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*,.opus,.m4a,.ogg,.mp3,.wav"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Audio File</span>
            </button>
          </div>

          {recordError && (
            <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              {recordError}
            </p>
          )}
        </div>
      </div>

      {/* Voice Notes List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Your Voice Notes ({voiceNotes.length})</span>
        </h4>

        {voiceNotes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center text-xs text-slate-400">
            No voice notes yet. Record one or upload a WhatsApp voice audio file!
          </div>
        ) : (
          <div className="space-y-2">
            {voiceNotes.map(item => {
              const isSelected = settings.soundType === 'custom_voice' && 
                (settings.selectedVoiceNoteId === item.id || (!settings.selectedVoiceNoteId && voiceNotes[0]?.id === item.id));

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-800/70 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => handlePlayVoiceNote(item)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                        isPlayingId === item.id
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : 'bg-slate-700 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      }`}
                      title="Play voice note preview"
                    >
                      {isPlayingId === item.id ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.source === 'whatsapp' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            WhatsApp
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.durationSec}s voice clip
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onUpdateSettings({
                          soundType: 'custom_voice',
                          selectedVoiceNoteId: item.id,
                        });
                        unlockAudio();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteVoiceNote(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete voice note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Built-in iOS Chimes */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-400" />
          <span>Built-In iOS Chimes</span>
        </h4>

        <div className="space-y-2">
          {BUILT_IN_SOUNDS.map(sound => {
            const isSelected = settings.soundType === sound.id;

            return (
              <div
                key={sound.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/70 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-800/70 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayBuiltin(sound.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                      isPlayingId === sound.id
                        ? 'bg-cyan-500 text-white animate-pulse'
                        : 'bg-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                    }`}
                    title="Play chime preview"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </button>

                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{sound.icon}</span>
                      <span>{sound.label}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {sound.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onUpdateSettings({ soundType: sound.id });
                    handlePlayBuiltin(sound.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    isSelected
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Select</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
