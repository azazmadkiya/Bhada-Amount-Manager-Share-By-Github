import React from 'react';
import { Search, Send, Bell, FileText, X, ArrowUpDown, Lock, Globe, Users, Shield, Printer, UserCheck } from 'lucide-react';
import { UserAccount } from '../types';

export type FilterTab = 'all' | 'bhada' | 'reminders' | 'notes';
export type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'route_az';
export type VisibilityFilter = 'all' | 'admin_only' | 'all_users' | 'specific_users' | 'only_me' | 'user_created';

interface FilterBarProps {
  activeTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allCount: number;
  bhadaCount: number;
  remindersCount: number;
  notesCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  currentUser?: UserAccount | null;
  visibilityFilter?: VisibilityFilter;
  onVisibilityFilterChange?: (vis: VisibilityFilter) => void;
  onOpenPrintReport?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  allCount,
  bhadaCount,
  remindersCount,
  notesCount,
  sortBy,
  onSortChange,
  currentUser,
  visibilityFilter = 'all',
  onVisibilityFilterChange,
  onOpenPrintReport,
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Items */}
          <button
            onClick={() => onSelectTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All Items ({allCount})
          </button>

          {/* Bhada Rates */}
          <button
            onClick={() => onSelectTab('bhada')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bhada'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 border border-blue-200/60'
            }`}
          >
            <Send className="w-3.5 h-3.5 rotate-45" />
            <span>Bhada Rates ({bhadaCount})</span>
          </button>

          {/* Reminders */}
          <button
            onClick={() => onSelectTab('reminders')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reminders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50/80 text-amber-800 hover:bg-amber-100/80 border border-amber-200/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminders ({remindersCount})</span>
          </button>

          {/* General Notes */}
          <button
            onClick={() => onSelectTab('notes')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50/80 text-purple-800 hover:bg-purple-100/80 border border-purple-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>General ({notesCount})</span>
          </button>
        </div>

        {/* Right: Search Box + Sort Selector */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search city, bhada, party, user..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-2 pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Bhada: High to Low</option>
              <option value="amount_low">Bhada: Low to High</option>
              <option value="route_az">Origin City (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Print / PDF Report Button */}
          {onOpenPrintReport && (
            <button
              onClick={onOpenPrintReport}
              title="Print current filtered routes or Save as PDF Report"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Visibility Quick Filter Bar */}
      {isAdmin && onVisibilityFilterChange && (
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-100/80 p-1.5 rounded-lg text-xs">
          <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-600" />
            <span>Admin Filter:</span>
          </span>

          <button
            onClick={() => onVisibilityFilterChange('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              visibilityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Visibility
          </button>

          <button
            onClick={() => onVisibilityFilterChange('admin_only')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              visibilityFilter === 'admin_only'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Admin Only (Private)</span>
          </button>

          <button
            onClick={() => onVisibilityFilterChange('all_users')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              visibilityFilter === 'all_users'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Visible to All Users</span>
          </button>

          <button
            onClick={() => onVisibilityFilterChange('specific_users')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              visibilityFilter === 'specific_users'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Specific Users</span>
          </button>

          <button
            onClick={() => onVisibilityFilterChange('only_me')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              visibilityFilter === 'only_me'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Only Me (Private)</span>
          </button>

          <button
            onClick={() => onVisibilityFilterChange('user_created')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              visibilityFilter === 'user_created'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Staff User Added
          </button>
        </div>
      )}
    </div>
  );
};
