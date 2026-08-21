import React, { useState } from 'react';
import { Smartphone, Download, X, Zap, ChevronRight } from 'lucide-react';

interface InstallAppBannerProps {
  onOpenInstallModal: () => void;
  deferredPrompt: any;
  isStandalone: boolean;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({
  onOpenInstallModal,
  deferredPrompt,
  isStandalone
}) => {
  const [dismissed, setDismissed] = useState(false);

  // Do not show banner if app is already running in installed standalone mode or user dismissed it in current session
  if (isStandalone || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-3 sm:px-4 py-2 border-b border-blue-700/50 shadow-xs relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        <div 
          onClick={onOpenInstallModal}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="p-1.5 bg-amber-400 text-blue-950 rounded-lg shrink-0 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
                📱 Install Android App Shortcut
              </span>
              <span className="hidden md:inline-block bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                Fast 1-Tap Launch
              </span>
            </div>
            <p className="text-[11px] text-blue-200 truncate">
              {deferredPrompt 
                ? 'Direct 1-Click install ready! Add Remix Bhada icon to home screen.' 
                : 'Click to add Remix Bhada icon on your Android / Mobile screen.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenInstallModal}
            className="px-2.5 sm:px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-blue-950 font-black text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">CLICK TO INSTALL</span>
            <span className="xs:hidden">INSTALL</span>
          </button>
          
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-blue-300 hover:text-white rounded-md cursor-pointer transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
