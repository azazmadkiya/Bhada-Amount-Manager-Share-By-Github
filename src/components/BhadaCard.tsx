import React, { useState } from 'react';
import { 
  Send, Copy, Edit3, Trash2, MapPin, Truck, Calendar, FileText, 
  User, Check, Share2, ChevronDown, ChevronUp, Lock, Globe, Users, Shield, UserCheck
} from 'lucide-react';
import { BhadaRate, UserAccount } from '../types';
import { formatINR, formatDate, buildWhatsAppBhadaText } from '../utils/formatters';

interface BhadaCardProps {
  bhada: BhadaRate;
  onEdit: (bhada: BhadaRate) => void;
  onDelete: (id: string) => void;
  onCreateReminderFromBhada?: (bhada: BhadaRate) => void;
  currentUser: UserAccount | null;
}

export const BhadaCard: React.FC<BhadaCardProps> = ({
  bhada,
  onEdit,
  onDelete,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = bhada.createdByUserId && bhada.createdByUserId === currentUser?.id;
  const userAccess = bhada.userAccessRights?.find(r => r.userId === currentUser?.id);
  const canEdit = isAdmin || isOwner || userAccess?.permission === 'edit';
  const canDelete = isAdmin || isOwner;

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildWhatsAppBhadaText(bhada);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildWhatsAppBhadaText(bhada);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* 1. Header: Pill badge + Access Indicator + Action Controls */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/70">
            <Send className="w-3 h-3 rotate-45 stroke-[2.5]" />
            <span>ROUTE RATE</span>
          </div>

          {/* Access / Visibility Badge */}
          {isAdmin ? (
            bhada.visibility === 'only_me' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Visible only to creator (Specific Only Me)">
                <UserCheck className="w-2.5 h-2.5" />
                <span>Only Me</span>
              </span>
            ) : bhada.visibility === 'admin_only' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Visible only to Admin">
                <Lock className="w-2.5 h-2.5" />
                <span>Admin Only</span>
              </span>
            ) : bhada.visibility === 'saved_group' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title={`Saved Group: ${bhada.userAccessRights?.map(r => `${r.userName} (${r.permission})`).join(', ') || 'None'}`}>
                <Users className="w-2.5 h-2.5" />
                <span>Saved Group ({bhada.userAccessRights?.length || 0})</span>
              </span>
            ) : bhada.visibility === 'specific_users' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Allowed: ${bhada.userAccessRights?.map(r => `${r.userName} (${r.permission})`).join(', ') || 'None'}`}>
                <Users className="w-2.5 h-2.5" />
                <span>{bhada.userAccessRights?.length || 0} Users Access</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200" title="Visible to all users">
                <Globe className="w-2.5 h-2.5" />
                <span>All Users</span>
              </span>
            )
          ) : userAccess?.permission === 'edit' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span>✏️ Edit Access</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Copy Button */}
          <button
            onClick={handleCopyQuote}
            title={copied ? "Copied!" : "Copy Rate Quote"}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Edit Button */}
          {canEdit && (
            <button
              onClick={() => onEdit(bhada)}
              title="Edit Bhada Rate"
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={() => onDelete(bhada.id)}
              title="Delete Bhada Rate"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Route Solid Dark Header Bar matching screenshot */}
      <div className="px-4 py-1">
        <div className="bg-[#0f172a] rounded-lg px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          {/* Origin */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-black text-xs sm:text-sm tracking-wide uppercase truncate text-white">
              {bhada.originCity}
            </span>
          </div>

          {/* Arrow */}
          <div className="px-2 text-slate-400 text-sm font-bold flex items-center justify-center">
            ➔
          </div>

          {/* Destination */}
          <div className="flex items-center gap-1.5 min-w-0 justify-end">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-black text-xs sm:text-sm tracking-wide uppercase truncate text-white">
              {bhada.destinationCity}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rate Per Ton & Bhada Amount Green Block matching screenshot */}
      <div className="px-4 py-2">
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
              RATE PER {bhada.rateUnit.toUpperCase()}:
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700">
              {formatINR(bhada.ratePerUnit, true)} <span className="text-xs font-semibold text-emerald-600">/ {bhada.rateUnit}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Bhada Amount
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {formatINR(bhada.totalBhadaAmount, true)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Core Details (Truck, LR, Party, Loading Date) */}
      <div className="px-4 py-1.5 space-y-1.5 text-xs text-slate-600 flex-1">
        {/* Truck No */}
        <div className="flex items-center gap-2 text-slate-800">
          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-500">Truck:</span>
          <span className="font-bold text-slate-900">{bhada.truckNumber || 'Open / Unassigned'}</span>
          {bhada.truckType && (
            <span className="text-[11px] text-slate-500 truncate hidden sm:inline">({bhada.truckType})</span>
          )}
        </div>

        {/* Material & Weight */}
        {(bhada.materialType || bhada.weightTons) && (
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-500">Goods:</span>
            <span className="font-medium text-slate-800 truncate">
              {bhada.materialType || 'General Cargo'}
            </span>
            {bhada.weightTons && (
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                {bhada.weightTons} MT
              </span>
            )}
          </div>
        )}

        {/* Party / LR / Loading Date */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-slate-500 text-[11px]">
          {bhada.lrNumber && (
            <div>
              <span className="font-semibold text-slate-700">LR:</span> {bhada.lrNumber}
            </div>
          )}
          {bhada.loadingDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatDate(bhada.loadingDate)}</span>
            </div>
          )}
          {bhada.partyName && (
            <div className="truncate max-w-[150px]">
              <span className="font-semibold text-slate-700">Party:</span> {bhada.partyName}
            </div>
          )}
        </div>

        {/* Author info for Admin */}
        {bhada.createdByName && (
          <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
            <span>Entry by: <strong className="text-slate-600 font-semibold">{bhada.createdByName}</strong> {bhada.createdByRole && `(${bhada.createdByRole})`}</span>
          </div>
        )}

        {/* Remarks / Driver if expanded */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 bg-slate-50 p-2.5 rounded-lg text-[11px]">
            {bhada.driverName && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-semibold">Driver:</span> {bhada.driverName} {bhada.driverPhone && `(${bhada.driverPhone})`}
              </div>
            )}
            {bhada.remarks && (
              <div className="text-slate-600 italic">
                "{bhada.remarks}"
              </div>
            )}
            {isAdmin && bhada.userAccessRights && bhada.userAccessRights.length > 0 && (
              <div className="pt-1 text-[10px] text-emerald-800 border-t border-emerald-100">
                <strong>Granted Users:</strong>{' '}
                {bhada.userAccessRights.map(r => `${r.userName} (${r.permission === 'edit' ? '✏️ Can Edit' : '👁️ View Only'})`).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Footer action buttons */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Less</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Details</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Copy details Button */}
          <button
            onClick={handleCopyQuote}
            title={copied ? "Trip details copied!" : "Copy trip details (Origin, Destination, Amount) to clipboard"}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border ${
              copied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy details</span>
              </>
            )}
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            title="Share Rate on WhatsApp"
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
