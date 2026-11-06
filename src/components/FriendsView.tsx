import React, { useState } from 'react';
import { FriendData, HydrationSettings, WaterLog } from '../types';
import { 
  Users, 
  Share2, 
  Sparkles, 
  Plus, 
  MessageCircle, 
  Copy, 
  Check, 
  Flame, 
  Droplet, 
  Heart,
  QrCode,
  X,
  ExternalLink
} from 'lucide-react';
import { triggerHaptic, playSyntheticTone } from '../utils/audioEngine';

interface FriendsViewProps {
  friends: FriendData[];
  settings: HydrationSettings;
  todayTotalMl: number;
  progressPercent: number;
  streakDays: number;
  onCheerFriend: (friendId: string) => void;
  onAddFriend: (friend: Omit<FriendData, 'id' | 'cheersCount'>) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  friends,
  settings,
  todayTotalMl,
  progressPercent,
  streakDays,
  onCheerFriend,
  onAddFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendGoal, setNewFriendGoal] = useState(2500);
  const [newFriendInitial, setNewFriendInitial] = useState(750);
  const [newFriendStatus, setNewFriendStatus] = useState('');

  // Formatted share message
  const shareText = `💧 *AquaDrop Hydration Check-in* 💧\n` +
    `👤 ${settings.userName || 'I'} reached *${todayTotalMl.toLocaleString()} ml* (${progressPercent}% of ${settings.dailyGoalMl.toLocaleString()} ml goal) today!\n` +
    `🔥 Hydration Streak: *${streakDays} Days*\n` +
    `⏰ Reminder Gap: *${settings.intervalMinutes} mins*\n` +
    `Let's stay healthy together! Track with me on AquaDrop.`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://aquadrop.app';

  // Share via WhatsApp
  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(`${shareText}\n\nJoin our hydration circle: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Native iOS Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AquaDrop - My Hydration Progress',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyShareText();
    }
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    triggerHaptic([30, 20]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    onAddFriend({
      name: newFriendName.trim(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?w=150&auto=format&fit=crop&q=80`,
      dailyGoalMl: newFriendGoal,
      currentMl: newFriendInitial,
      lastDrinkTimestamp: Date.now() - 30 * 60 * 1000,
      streakDays: Math.floor(Math.random() * 5) + 1,
      statusMessage: newFriendStatus.trim() || 'Staying hydrated! 💧',
    });

    setIsAddModalOpen(false);
    setNewFriendName('');
    setNewFriendStatus('');
  };

  const handleCheer = (friendId: string) => {
    playSyntheticTone('droplet', 0.6);
    triggerHaptic([20, 40]);
    onCheerFriend(friendId);
  };

  return (
    <div className="w-full space-y-5">
      {/* Share Progress Hero Card */}
      <div className="rounded-3xl ios-glass-card p-5 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
              <Share2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Share Your Hydration</h3>
              <p className="text-xs text-slate-400">Motivate friends and keep each other accountable</p>
            </div>
          </div>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-800/80 to-blue-950/60 border border-cyan-700/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Today's Hydration Snapshot</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/10">
              {new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-2xl font-extrabold text-white">
                {todayTotalMl.toLocaleString()} <span className="text-sm font-semibold text-cyan-300">/ {settings.dailyGoalMl.toLocaleString()} ml</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                <span className="text-cyan-400 font-bold">{progressPercent}% Achieved</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 inline fill-amber-400" /> {streakDays} day streak
                </span>
              </div>
            </div>

            {/* Circular mini progress */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-slate-700" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-cyan-400 transition-all duration-500"
                  fill="transparent"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * Math.min(100, progressPercent)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <Droplet className="w-4 h-4 text-cyan-300 absolute" />
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={shareToWhatsApp}
            className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share to WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 active:scale-95 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Card / Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Friends Circle Leaderboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hydration Circle ({friends.length + 1})</span>
          </h4>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* User's own entry */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-800/80 border border-cyan-500/50 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {settings.userName.charAt(0) || 'Y'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-950 text-[10px] font-extrabold px-1 rounded-full">
                You
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{settings.userName || 'You'}</span>
                <span className="text-[11px] font-semibold text-cyan-400">({progressPercent}%)</span>
              </p>
              <p className="text-xs text-slate-300">
                {todayTotalMl.toLocaleString()} / {settings.dailyGoalMl.toLocaleString()} ml
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streakDays}d</span>
            </span>
          </div>
        </div>

        {/* Friends entries */}
        <div className="space-y-2.5">
          {friends.map(friend => {
            const friendPercent = Math.min(100, Math.round((friend.currentMl / friend.dailyGoalMl) * 100));

            return (
              <div
                key={friend.id}
                className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
                    onError={(e) => {
                      // Fallback to initials avatar if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{friend.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">({friendPercent}%)</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {friend.currentMl.toLocaleString()} / {friend.dailyGoalMl.toLocaleString()} ml
                    </p>
                    {friend.statusMessage && (
                      <p className="text-[10px] text-cyan-300/80 italic truncate">
                        "{friend.statusMessage}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Cheer button */}
                  <button
                    onClick={() => handleCheer(friend.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-700/70 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 border border-slate-600 hover:border-pink-500/40 text-xs font-bold transition active:scale-90"
                    title="Send cheers & encouragement"
                  >
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                    <span>{friend.cheersCount}</span>
                  </button>

                  {/* Nudge via WhatsApp */}
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Hey ${friend.name}! Hydration check! 💧 Have you had a glass of water recently? Let's reach our daily goal together on AquaDrop!`);
                      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                    }}
                    className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition active:scale-90"
                    title="Send WhatsApp Nudge"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Add Hydration Buddy</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFriend} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Friend's Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Jenkins"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Daily Goal (ml)</label>
                <input
                  type="number"
                  step="100"
                  value={newFriendGoal}
                  onChange={(e) => setNewFriendGoal(parseInt(e.target.value, 10) || 2500)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Status or Note</label>
                <input
                  type="text"
                  placeholder="e.g., Hydrating for marathon training"
                  value={newFriendStatus}
                  onChange={(e) => setNewFriendStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition mt-2"
              >
                Add to Circle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 flex flex-col items-center gap-4 text-center">
            <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Scan Hydration QR</span>
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated QR Code Graphic */}
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                alt="AquaDrop QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <p className="text-xs text-slate-300">
              Ask your friend to point their iPhone camera at this QR code to view your daily hydration stats!
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
