import React from 'react';
import { 
  FileText, Send, Bell, Plus, Calculator, History, Download, 
  User, Shield, Key, LogOut, LogIn, ChevronDown 
} from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  onOpenBhadaModal: () => void;
  onOpenReminderModal: () => void;
  onOpenNoteModal: () => void;
  onOpenCalculator: () => void;
  onOpenRouteHistory: () => void;
  onOpenExport: () => void;
  currentUser: UserAccount | null;
  onOpenUserManagement: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBhadaModal,
  onOpenReminderModal,
  onOpenNoteModal,
  onOpenCalculator,
  onOpenRouteHistory,
  onOpenExport,
  currentUser,
  onOpenUserManagement,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        {/* Title and Subtitle */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0 mt-0.5">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Transport & Freight Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl font-normal leading-relaxed">
              Save City-to-City freight charges, reminders & transport notes.
            </p>
          </div>
        </div>

        {/* Action Buttons & User Profile Area */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* User Auth & Management Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg p-1 pr-2">
              <button
                onClick={onOpenUserManagement}
                title="Manage User Accounts & Passwords"
                className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-blue-50 text-slate-800 rounded-md border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="truncate max-w-[90px]">{currentUser.name}</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] px-1 py-0.2 rounded font-mono">
                  {currentUser.role}
                </span>
              </button>

              <button
                onClick={onOpenUserManagement}
                title="User Accounts & Security"
                className="p-1 text-slate-600 hover:text-blue-600 rounded cursor-pointer"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Login</span>
            </button>
          )}

          {/* Quick Utility Tools */}
          <div className="hidden lg:flex items-center gap-1.5 mr-1 pr-2 border-r border-slate-200">
            <button
              onClick={onOpenCalculator}
              title="Quick Bhada & Diesel Hike Calculator"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Calc</span>
            </button>
            <button
              onClick={onOpenRouteHistory}
              title="City-to-City Rate Comparison"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>History</span>
            </button>
            <button
              onClick={onOpenExport}
              title="Export Bhada Summary & CSV"
              className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          </div>

          {/* Primary Action 1: Save Bhada Rate */}
          <button
            onClick={onOpenBhadaModal}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4 rotate-45" />
            <span>+ SAVE BHADA RATE (ORIGIN ➔ DEST)</span>
          </button>

          {/* Primary Action 2: Add Reminder */}
          <button
            onClick={onOpenReminderModal}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <Bell className="w-4 h-4" />
            <span>+ ADD REMINDER</span>
          </button>

          {/* Primary Action 3: + Note */}
          <button
            onClick={onOpenNoteModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold text-white bg-[#1e293b] hover:bg-[#0f172a] active:bg-black rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ NOTE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
