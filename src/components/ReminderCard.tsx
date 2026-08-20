import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, Clock, Calendar, Edit3, Trash2, 
  IndianRupee, Truck, User, Share2, Check, AlertTriangle, Lock, Globe, Users, UserCheck 
} from 'lucide-react';
import { Reminder, UserAccount } from '../types';
import { formatINR, formatDate, buildWhatsAppReminderText } from '../utils/formatters';

interface ReminderCardProps {
  reminder: Reminder;
  onToggleStatus: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  currentUser: UserAccount | null;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleStatus,
  onEdit,
  onDelete,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const isCompleted = reminder.status === 'Completed';
  const isOverdue = !isCompleted && new Date(reminder.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = reminder.createdByUserId && reminder.createdByUserId === currentUser?.id;
  const userAccess = reminder.userAccessRights?.find(r => r.userId === currentUser?.id);
  const canEdit = isAdmin || isOwner || userAccess?.permission === 'edit';
  const canDelete = isAdmin || isOwner;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildWhatsAppReminderText(reminder);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildWhatsAppReminderText(reminder);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const priorityColors = {
    Urgent: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-amber-50 text-amber-800 border-amber-200',
    Normal: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
      isCompleted 
        ? 'border-emerald-200 bg-slate-50/40 opacity-90' 
        : isOverdue 
          ? 'border-red-300 ring-1 ring-red-100' 
          : 'border-slate-200/90 hover:border-amber-300'
    }`}>
      {/* 1. Header: Pill Badge & Actions */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70">
            <Bell className="w-3 h-3 stroke-[2.5]" />
            <span>{reminder.reminderType.toUpperCase()}</span>
          </div>

          {/* Access / Visibility Badge */}
          {isAdmin ? (
            reminder.visibility === 'only_me' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Visible only to creator (Specific Only Me)">
                <UserCheck className="w-2.5 h-2.5" />
                <span>Only Me</span>
              </span>
            ) : reminder.visibility === 'admin_only' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Lock className="w-2.5 h-2.5" />
                <span>Admin Only</span>
              </span>
            ) : reminder.visibility === 'saved_group' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Users className="w-2.5 h-2.5" />
                <span>Saved Group ({reminder.userAccessRights?.length || 0})</span>
              </span>
            ) : reminder.visibility === 'specific_users' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Allowed: ${reminder.userAccessRights?.map(r => r.userName).join(', ') || 'None'}`}>
                <Users className="w-2.5 h-2.5" />
                <span>{reminder.userAccessRights?.length || 0} Users</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <Globe className="w-2.5 h-2.5" />
                <span>All Users</span>
              </span>
            )
          ) : null}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy Reminder"}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(reminder)}
              title="Edit Reminder"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(reminder.id)}
              title="Delete Reminder"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Title */}
      <div className="px-4 py-1.5">
        <h3 className={`text-sm font-bold text-slate-900 leading-snug ${isCompleted ? 'line-through text-slate-500' : ''}`}>
          {reminder.title}
        </h3>
      </div>

      {/* 3. Amount & Status Row (if amount exists) */}
      {reminder.amount !== undefined && reminder.amount > 0 && (
        <div className="px-4 py-1.5">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                DUE / FOLLOW-UP AMOUNT:
              </div>
              <div className="text-base font-black text-amber-900">
                {formatINR(reminder.amount, true)}
              </div>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : isOverdue 
                  ? 'bg-red-100 text-red-800 border-red-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {isCompleted ? 'Cleared' : isOverdue ? 'Overdue' : 'Pending'}
            </div>
          </div>
        </div>
      )}

      {/* 4. Details */}
      <div className="px-4 py-2 space-y-2 text-xs text-slate-600 flex-1">
        {reminder.partyOrTruck && (
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{reminder.partyOrTruck}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
              Due: {formatDate(reminder.dueDate)} {reminder.dueTime && `@ ${reminder.dueTime}`}
            </span>
          </div>

          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${priorityColors[reminder.priority]}`}>
            {reminder.priority} Priority
          </div>
        </div>

        {reminder.notes && (
          <p className="text-slate-600 bg-slate-50 p-2 rounded text-[11px] leading-relaxed italic">
            "{reminder.notes}"
          </p>
        )}

        {/* Creator Info */}
        {reminder.createdByName && (
          <div className="text-[10px] text-slate-400 pt-0.5">
            By: <strong className="text-slate-600 font-semibold">{reminder.createdByName}</strong>
          </div>
        )}
      </div>

      {/* 5. Footer: Toggle Complete & WhatsApp */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => onToggleStatus(reminder.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Completed' : 'Mark as Done'}</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Share2 className="w-3 h-3" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
