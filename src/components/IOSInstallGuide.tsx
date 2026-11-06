import React from 'react';
import { Share, PlusSquare, Smartphone, X, CheckCircle, Bell } from 'lucide-react';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Install on iPhone</h3>
              <p className="text-xs text-slate-400">Get native alerts and full-screen experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap the <Share className="w-4 h-4 text-blue-400 inline" /> Share button
              </p>
              <p className="text-xs text-slate-300">
                In Safari, tap the Share icon at the bottom of the screen (or top on iPad).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                Select <PlusSquare className="w-4 h-4 text-cyan-400 inline" /> "Add to Home Screen"
              </p>
              <p className="text-xs text-slate-300">
                Scroll down the action sheet and tap <span className="text-white font-medium">Add to Home Screen</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white">Tap "Add" in top-right</p>
              <p className="text-xs text-slate-300">
                The <span className="text-white font-medium">AquaDrop</span> icon will now appear on your iPhone home screen!
              </p>
            </div>
          </div>

          {/* Bonus note on iOS push */}
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>iOS Tip:</strong> Once launched from your Home Screen, AquaDrop operates like a native iOS app with full-screen view and background hydration alerts.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Got it
        </button>
      </div>
    </div>
  );
};
