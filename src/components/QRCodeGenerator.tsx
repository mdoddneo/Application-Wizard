import React, { useState } from "react";
import { QrCode, Copy, Check, ExternalLink, Link2, Download, Smartphone, Sparkles, HelpCircle, Laptop } from "lucide-react";

interface QRCodeGeneratorProps {
  appId: string;
  appTitle: string;
  onClose?: () => void;
}

export default function QRCodeGenerator({ appId, appTitle, onClose }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Generate the absolute shareable URL referencing this previewId and launching in fullscreen
  const rawUrl = `${window.location.origin}/?previewId=${appId}&fullscreen=true`;
  
  // Format the visual link for UI presentation
  const dispUrl = rawUrl.length > 32 ? `${rawUrl.substring(0, 29)}...` : rawUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0d1b3e&data=${encodeURIComponent(rawUrl)}`;
    // Programmatic trigger download
    const link = document.createElement("a");
    link.href = qrUrl;
    link.target = "_blank";
    link.download = `ApplicationWizard_${appTitle.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=0a0f2d&data=${encodeURIComponent(rawUrl)}`;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col gap-4 animate-fadeIn">
      {/* Header section with QR Icon and badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-indigo-400">Physical Mobile Sync</h4>
            <h3 className="font-bold text-sm text-slate-100 truncate max-w-[155px]" title={appTitle}>
              Real Device Test
            </h3>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-705 p-1 px-2.5 rounded-lg transition"
          >
            Hide
          </button>
        )}
      </div>

      {/* QR Code Frame Stage */}
      <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl relative overflow-hidden group shadow-inner">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        
        {/* Scanning beam animation wrapper */}
        <div className="relative w-[190px] h-[190px] bg-white flex items-center justify-center rounded-xl p-2 border border-slate-100 shadow-sm z-10">
          <img
            src={qrImageUrl}
            alt="Physical Test QR Code"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
          {/* Laser scanning beam line effect */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[bounce_3s_infinite] pointer-events-none" />
        </div>

        {/* Action triggers for the QR image itself */}
        <div className="mt-3 flex items-center gap-2 z-10 w-full justify-between px-1">
          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Scan using Camera
          </span>
          <button
            onClick={handleDownloadQR}
            className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] flex items-center gap-0.5 hover:underline"
            title="Download QR code image file"
          >
            <Download className="w-3 h-3" />
            Download QR
          </button>
        </div>
      </div>

      {/* Dynamic Link copy container */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col gap-1.5 text-left text-xs">
        <label className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
          Direct Shareable Link
        </label>
        <div className="flex items-center justify-between gap-1 bg-slate-900 pl-2.5 py-1.5 pr-1.5 rounded-lg border border-slate-800/80">
          <span className="font-mono text-[11px] text-slate-300 select-all truncate flex-1" title={rawUrl}>
            {dispUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition font-bold flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Accordion Steps list */}
      <div className="flex flex-col gap-2.5 text-left text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5 border border-indigo-500/10">1</div>
          <div>
            <p className="font-semibold text-slate-200">Point Camera Lens</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              Open the custom camera app on your iOS iOS/iPadOS or Android physical devices.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5 border border-indigo-500/10">2</div>
          <div>
            <p className="font-semibold text-slate-200">Load Standing Frame</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              Tap the detected link to boot the compiled HTML bundle instantly in Full-Screen mobile sandbox view.
            </p>
          </div>
        </div>
      </div>

      {/* Sandbox confirmation label */}
      <div className="bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-left">
        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-normal">
          No sign-in is required on your mobile phone to view this app! It fetches code securely from your active cloud sandbox instance.
        </p>
      </div>
    </div>
  );
}
