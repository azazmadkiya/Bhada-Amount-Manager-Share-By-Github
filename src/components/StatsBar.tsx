import React from 'react';
import { Send, Bell, FileText, Search, X, Truck, MapPin } from 'lucide-react';

interface StatsBarProps {
  totalBhadaCount: number;
  pendingRemindersCount: number;
  totalNotesCount: number;
  activeTab: 'all' | 'bhada' | 'reminders' | 'notes';
  onSelectTab: (tab: 'all' | 'bhada' | 'reminders' | 'notes') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filteredCount?: number;
}

const QUICK_SEARCH_CHIPS = [
  'PADANA',
  'DAHEJ',
  'NIRMALA - MORBI',
  'NIRMALA - PIPALIYA',
  'SADBHAVNA - MORBI',
];

export const StatsBar: React.FC<StatsBarProps> = ({
  totalBhadaCount,
  pendingRemindersCount,
  totalNotesCount,
  activeTab,
  onSelectTab,
  searchQuery = '',
  onSearchChange,
  filteredCount,
}) => {
  return (
    <div className="my-4 space-y-3.5">
      {/* Real-time Quick Search Input Field at the Top of StatsBar */}
      {onSearchChange && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs transition-all hover:border-blue-300">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Quick Search Input with Icons */}
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-blue-600 pointer-events-none">
                <Search className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden md:inline-block text-slate-400">
                  Quick Search:
                </span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Truck No (e.g. GJ-07TU...), City (Origin / Dest), Party, LR..."
                className="w-full pl-9 md:pl-28 pr-9 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200/70 hover:bg-slate-300 rounded-full p-1 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick City/Hub Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-0.5 shrink-0">
                <MapPin className="w-3 h-3 text-blue-500" /> Hubs:
              </span>
              {QUICK_SEARCH_CHIPS.map((chip) => {
                const isSelected = searchQuery.toUpperCase().includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSearchChange('');
                      } else {
                        onSearchChange(chip);
                      }
                    }}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-100/90 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
              {searchQuery && filteredCount !== undefined && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0">
                  {filteredCount} found
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Route Bhada Rates Card */}
        <div
          onClick={() => onSelectTab('bhada')}
          className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex items-center justify-between shadow-xs hover:shadow-md ${
            activeTab === 'bhada'
              ? 'border-blue-500 ring-2 ring-blue-100'
              : 'border-slate-200/90 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
              <Send className="w-5 h-5 rotate-45 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                Route Bhada Rates
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Origin City ➔ Dest City Rates
              </p>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
            {totalBhadaCount} Saved
          </div>
        </div>

        {/* 2. Reminders & Follow-ups Card */}
        <div
          onClick={() => onSelectTab('reminders')}
          className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex items-center justify-between shadow-xs hover:shadow-md ${
            activeTab === 'reminders'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-slate-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 shrink-0">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                Reminders & Follow-ups
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Follow-ups & task reminders
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
            pendingRemindersCount > 0 
              ? 'bg-amber-50 text-amber-800 border-amber-300' 
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {pendingRemindersCount} Pending
          </div>
        </div>

        {/* 3. General Notes Card */}
        <div
          onClick={() => onSelectTab('notes')}
          className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex items-center justify-between shadow-xs hover:shadow-md ${
            activeTab === 'notes'
              ? 'border-purple-500 ring-2 ring-purple-100'
              : 'border-slate-200/90 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80 shrink-0">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                General Notes
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Office & Transport Scratchpad
              </p>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/70 shrink-0">
            {totalNotesCount} Notes
          </div>
        </div>
      </div>
    </div>
  );
};
