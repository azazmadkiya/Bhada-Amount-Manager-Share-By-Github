import React, { useState } from 'react';
import { 
  FileText, Pin, Edit3, Trash2, Tag, Copy, Check, Share2, Lock, Globe, Users, UserCheck 
} from 'lucide-react';
import { TransportNote, UserAccount } from '../types';
import { formatDate } from '../utils/formatters';

interface NoteCardProps {
  note: TransportNote;
  onEdit: (note: TransportNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  currentUser: UserAccount | null;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = note.createdByUserId && note.createdByUserId === currentUser?.id;
  const userAccess = note.userAccessRights?.find(r => r.userId === currentUser?.id);
  const canEdit = isAdmin || isOwner || userAccess?.permission === 'edit';
  const canDelete = isAdmin || isOwner;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `📝 *${note.title}* (${note.category})\n\n${note.content}\n\n_Transport & Freight Management Notes_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `📝 *${note.title}* (${note.category})\n\n${note.content}\n\n_Transport & Freight Management Notes_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const colorStyles = {
    purple: 'border-purple-200/90 hover:border-purple-400 bg-white',
    blue: 'border-blue-200/90 hover:border-blue-400 bg-white',
    amber: 'border-amber-200/90 hover:border-amber-400 bg-white',
    emerald: 'border-emerald-200/90 hover:border-emerald-400 bg-white',
    rose: 'border-rose-200/90 hover:border-rose-400 bg-white',
    slate: 'border-slate-200/90 hover:border-slate-400 bg-white',
  };

  const badgeStyles = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${colorStyles[note.colorTag]}`}>
      {/* 1. Header with Category Pill & Access Badge & Actions */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${badgeStyles[note.colorTag]}`}>
            <FileText className="w-3 h-3 stroke-[2.5]" />
            <span>{note.category.toUpperCase()}</span>
          </div>

          {/* Access / Visibility Badge */}
          {isAdmin ? (
            note.visibility === 'only_me' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Visible only to creator (Specific Only Me)">
                <UserCheck className="w-2.5 h-2.5" />
                <span>Only Me</span>
              </span>
            ) : note.visibility === 'admin_only' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Lock className="w-2.5 h-2.5" />
                <span>Admin Only</span>
              </span>
            ) : note.visibility === 'saved_group' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Users className="w-2.5 h-2.5" />
                <span>Saved Group ({note.userAccessRights?.length || 0})</span>
              </span>
            ) : note.visibility === 'specific_users' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Allowed: ${note.userAccessRights?.map(r => r.userName).join(', ') || 'None'}`}>
                <Users className="w-2.5 h-2.5" />
                <span>{note.userAccessRights?.length || 0} Users</span>
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
            onClick={() => onTogglePin(note.id)}
            title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              note.isPinned 
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy Note"}
            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(note)}
              title="Edit Note"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(note.id)}
              title="Delete Note"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Title */}
      <div className="px-4 py-1.5">
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {note.title}
        </h3>
      </div>

      {/* 3. Content body */}
      <div className="px-4 py-2 flex-1">
        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans line-clamp-6">
          {note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
            {note.tags.map((tag, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600"
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Creator info */}
        {note.createdByName && (
          <div className="text-[10px] text-slate-400 pt-2">
            By: <strong className="text-slate-600 font-semibold">{note.createdByName}</strong>
          </div>
        )}
      </div>

      {/* 4. Footer */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">
          {formatDate(note.createdAt)}
        </span>

        <button
          onClick={handleShare}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
