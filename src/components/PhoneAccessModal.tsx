import React, { useState } from 'react';
import { QrCode, Smartphone, X, Copy, Check, ExternalLink, Share2 } from 'lucide-react';
import { triggerHaptic } from '../utils/audioEngine';

interface PhoneAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneAccessModal: React.FC<PhoneAccessModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the current URL or public preview URL
  const appUrl = typeof window !== 'undefined' 
    ? window.location.href.split('?')[0] 
    : 'https://ais-pre-rxhab3f5evvqlvsk2ixpdy-808784752982.asia-east1.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    triggerHaptic([20, 20]);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col items-center gap-4 text-center max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-white tracking-tight">Open on iPhone</h3>
              <p className="text-[11px] text-slate-400">Scan or copy your private link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Graphic */}
        <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <img
            src={qrImageUrl}
            alt="Scan to open AquaDrop on your iPhone"
            className="w-52 h-52 object-contain rounded-lg"
          />
        </div>

        {/* Instructions */}
        <div className="w-full text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
              1
            </span>
            <p>Open the native <strong>Camera app</strong> on your iPhone.</p>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
              2
            </span>
            <p>Point the camera at this QR code and tap the <strong>Safari</strong> link.</p>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
              3
            </span>
            <p>In Safari, tap <strong>Share</strong> $\rightarrow$ <strong>Add to Home Screen</strong>.</p>
          </div>
        </div>

        {/* URL Box & Copy */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 text-left">
            <span className="text-[11px] font-mono text-cyan-300 truncate flex-1 select-all">
              {appUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white shrink-0 transition active:scale-95"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
};
