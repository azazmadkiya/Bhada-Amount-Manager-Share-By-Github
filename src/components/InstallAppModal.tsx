import React, { useState, useEffect } from 'react';
import { 
  X, Download, Smartphone, CheckCircle2, Copy, Check, Share2, 
  ExternalLink, Sparkles, ArrowRight, ShieldCheck, Zap, WifiOff, Monitor, QrCode
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isStandalone: boolean;
  onInstallSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isStandalone,
  onInstallSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [installing, setInstalling] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setInstalling(false);
      }
    } else {
      // If native prompt not available, show step by step
      setActiveTab('android');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img src="/icon-192.svg" alt="App Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-blue-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Android App & PWA
                </span>
                {isStandalone && (
                  <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Installed
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
                Install Remix Bhada App
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                Install shortcut directly on your Android phone home screen
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Action Banner: 1-Click Install Button */}
          {deferredPrompt ? (
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-900 font-bold text-sm sm:text-base">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Instant 1-Click Install Available</span>
                </div>
                <p className="text-xs text-blue-700 mt-0.5">
                  Click below to add Remix Bhada icon to your phone app drawer.
                </p>
              </div>
              <button
                onClick={handleDirectInstall}
                disabled={installing}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>{installing ? 'Installing...' : 'CLICK TO INSTALL NOW'}</span>
              </button>
            </div>
          ) : isStandalone ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">App Is Already Installed!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  You are currently using Remix Bhada in standalone Android app mode. All rates and notes are synced.
                </p>
              </div>
            </div>
          ) : null}

          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <Zap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">1-Tap Fast Launch</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Direct from Home Screen</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <WifiOff className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Offline Access</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Works without network</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">0 MB Storage</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Super lightweight PWA</div>
            </div>
          </div>

          {/* Installation Instructions Tab Selector */}
          <div>
            <div className="flex border-b border-slate-200 mb-3.5">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'android' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android (Chrome / Samsung)</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>iPhone / iPad (Safari)</span>
              </button>
              <button
                onClick={() => setActiveTab('pc')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'pc' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4 text-slate-600" />
                <span>Desktop / PC</span>
              </button>
            </div>

            {/* Android Step-by-Step */}
            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/90 text-slate-800 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">A</span>
                  Android Mobile me App Shortcut lagane ka Tarika:
                </div>
                
                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Chrome Browser me Right Top par 3 Dots (⋮) dabayein</span>
                    <p className="text-slate-500 text-xs mt-0.5">Mobile browser ke bilkul upar daayein kone me 3 dots menu hota hai.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">"Install app" ya "Add to Home screen" (होम स्क्रीन पर जोड़ें) chunein</span>
                    <p className="text-slate-500 text-xs mt-0.5">Menu me <span className="font-semibold text-blue-700">"Install App"</span> ya <span className="font-semibold text-blue-700">"Add to Home screen"</span> option par click karein.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">"Install" dabayein</span>
                    <p className="text-slate-500 text-xs mt-0.5">Aapke phone ki screen par Remix Bhada app ka icon add ho jayega! Bina browser khole direct chalega.</p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Step-by-Step */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/90 text-slate-800 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">i</span>
                  iPhone / Safari me Install karne ka Tarika:
                </div>
                
                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <span className="font-bold text-slate-900">Safari Browser me niche Share Button (📤) dabayein</span>
                    <p className="text-slate-500 text-xs mt-0.5">Safari ke bottom toolbar me center me Share icon hota hai.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <span className="font-bold text-slate-900">Niche scroll karke "Add to Home Screen" par click karein</span>
                    <p className="text-slate-500 text-xs mt-0.5">Options list me <span className="font-semibold text-indigo-700">"Add to Home Screen" (+)</span> chunein.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                  <div>
                    <span className="font-bold text-slate-900">Upar right me "Add" dabayein</span>
                    <p className="text-slate-500 text-xs mt-0.5">iPhone home screen par App ban jayegi.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop / PC */}
            {activeTab === 'pc' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/90 text-slate-800 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs">P</span>
                  Desktop Chrome / Edge me Install karein:
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="font-bold text-slate-900">Chrome Address Bar me Install Icon</span>
                  <p className="text-slate-500 text-xs mt-1">
                    Browser ke URL bar ke right side me <span className="font-bold text-blue-600">"Install App (⤓)"</span> icon hota hai. Uspe click karke Desktop icon create kar sakte hain.
                  </p>
                </div>

                {/* Mobile QR Code Scanner */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Mobile Phone par kholna chahte hain?</div>
                    <div className="text-xs text-slate-500">Scan QR Code or copy direct link on WhatsApp</div>
                  </div>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {showQR && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 text-center flex flex-col items-center justify-center">
                    <div className="p-2 bg-white rounded-lg border-2 border-slate-800 shadow-inner">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`} 
                        alt="App QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Apne Android phone camera se QR scan karein</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Share / Copy App Link Section */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between gap-2 border border-slate-200/80">
            <div className="truncate text-xs text-slate-600 font-mono">
              {currentUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Remix Bhada v2.0 • Android PWA Ready
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Close
            </button>
            {deferredPrompt && (
              <button
                onClick={handleDirectInstall}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Click To Install</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
