import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Tag, Pin, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { TransportNote, NoteCategory, NoteColor, AccessVisibility, UserAccessRight, UserAccount } from '../types';
import { AccessRightsSelector } from './AccessRightsSelector';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<TransportNote>) => void;
  initialData?: TransportNote | null;
  currentUser: UserAccount | null;
  users: UserAccount[];
}

interface NoteDraftData {
  title: string;
  category: NoteCategory;
  content: string;
  tagsInput: string;
  isPinned: boolean;
  colorTag: NoteColor;
  visibility: AccessVisibility;
  userAccessRights?: UserAccessRight[];
  savedAt: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  users,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Rate Agreement');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [colorTag, setColorTag] = useState<NoteColor>('purple');

  // Access rights state
  const [visibility, setVisibility] = useState<AccessVisibility>('all_users');
  const [userAccessRights, setUserAccessRights] = useState<UserAccessRight[]>([]);

  // Draft state tracking
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Storage key based on edit mode or new note
  const getDraftKey = () => {
    const userId = currentUser?.id || 'default';
    if (initialData?.id) {
      return `route_bhada_note_edit_draft_${initialData.id}_${userId}`;
    }
    return `route_bhada_note_new_draft_${userId}`;
  };

  // Helper to clear draft from storage
  const clearDraftStorage = () => {
    try {
      localStorage.removeItem(getDraftKey());
      setHasDraftRestored(false);
      setDraftSavedTime(null);
    } catch (err) {
      console.error('Failed to remove draft', err);
    }
  };

  // Initialize or restore draft when modal opens
  useEffect(() => {
    if (!isOpen) {
      isInitialMount.current = true;
      return;
    }

    const draftKey = getDraftKey();
    let savedDraft: NoteDraftData | null = null;
    try {
      const draftStr = localStorage.getItem(draftKey);
      if (draftStr) {
        savedDraft = JSON.parse(draftStr);
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }

    if (initialData) {
      // Editing existing note
      if (savedDraft && (savedDraft.content !== initialData.content || savedDraft.title !== initialData.title)) {
        // Restore uncommitted edit draft
        setTitle(savedDraft.title || '');
        setCategory(savedDraft.category || 'Rate Agreement');
        setContent(savedDraft.content || '');
        setTagsInput(savedDraft.tagsInput || '');
        setIsPinned(!!savedDraft.isPinned);
        setColorTag(savedDraft.colorTag || 'purple');
        setVisibility(savedDraft.visibility || 'all_users');
        setUserAccessRights(savedDraft.userAccessRights || []);
        setHasDraftRestored(true);
        setDraftSavedTime(savedDraft.savedAt || 'Recently');
      } else {
        setTitle(initialData.title || '');
        setCategory(initialData.category || 'Rate Agreement');
        setContent(initialData.content || '');
        setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
        setIsPinned(!!initialData.isPinned);
        setColorTag(initialData.colorTag || 'purple');
        setVisibility(initialData.visibility || 'all_users');
        setUserAccessRights(initialData.userAccessRights || []);
        setHasDraftRestored(false);
        setDraftSavedTime(null);
      }
    } else {
      // Creating new note
      if (savedDraft && (savedDraft.title?.trim() || savedDraft.content?.trim())) {
        setTitle(savedDraft.title || '');
        setCategory(savedDraft.category || 'Rate Agreement');
        setContent(savedDraft.content || '');
        setTagsInput(savedDraft.tagsInput || '');
        setIsPinned(!!savedDraft.isPinned);
        setColorTag(savedDraft.colorTag || 'purple');
        setVisibility(savedDraft.visibility || (currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users'));
        setUserAccessRights(savedDraft.userAccessRights || []);
        setHasDraftRestored(true);
        setDraftSavedTime(savedDraft.savedAt || 'Recently');
      } else {
        setTitle('');
        setCategory('Rate Agreement');
        setContent('');
        setTagsInput('');
        setIsPinned(false);
        setColorTag('purple');
        setVisibility(currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users');
        setUserAccessRights([]);
        setHasDraftRestored(false);
        setDraftSavedTime(null);
      }
    }

    isInitialMount.current = false;
  }, [isOpen, initialData, currentUser]);

  // Auto-save draft on every typing change
  useEffect(() => {
    if (!isOpen || isInitialMount.current) return;

    // Only save if there is some meaningful content typed
    const hasData = title.trim().length > 0 || content.trim().length > 0 || tagsInput.trim().length > 0;
    const draftKey = getDraftKey();

    if (!hasData) {
      localStorage.removeItem(draftKey);
      setDraftSavedTime(null);
      return;
    }

    const timer = setTimeout(() => {
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const draftPayload: NoteDraftData = {
        title,
        category,
        content,
        tagsInput,
        isPinned,
        colorTag,
        visibility,
        userAccessRights,
        savedAt: nowFormatted,
      };

      try {
        localStorage.setItem(draftKey, JSON.stringify(draftPayload));
        setDraftSavedTime(nowFormatted);
      } catch (err) {
        console.error('Failed to auto-save note draft', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [title, category, content, tagsInput, isPinned, colorTag, visibility, userAccessRights, isOpen]);

  // Reset form to clean state and clear draft
  const handleDiscardDraft = () => {
    clearDraftStorage();
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Rate Agreement');
      setContent(initialData.content || '');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      setIsPinned(!!initialData.isPinned);
      setColorTag(initialData.colorTag || 'purple');
      setVisibility(initialData.visibility || 'all_users');
      setUserAccessRights(initialData.userAccessRights || []);
    } else {
      setTitle('');
      setCategory('Rate Agreement');
      setContent('');
      setTagsInput('');
      setIsPinned(false);
      setColorTag('purple');
      setVisibility(currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users');
      setUserAccessRights([]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const allowedUserIds = visibility === 'specific_users' 
      ? userAccessRights.map(r => r.userId) 
      : undefined;

    const payload: Partial<TransportNote> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      type: 'note',
      title: title.trim(),
      category,
      content: content.trim(),
      tags,
      isPinned,
      colorTag,
      // Access Control
      createdByUserId: initialData?.createdByUserId || currentUser?.id,
      createdByName: initialData?.createdByName || currentUser?.name,
      createdByRole: initialData?.createdByRole || currentUser?.role,
      visibility: currentUser?.role === 'ADMIN' ? visibility : 'all_users',
      allowedUserIds: currentUser?.role === 'ADMIN' ? allowedUserIds : undefined,
      userAccessRights: currentUser?.role === 'ADMIN' ? userAccessRights : undefined,
    };

    // Remove draft on successful save
    clearDraftStorage();
    onSave(payload);
    onClose();
  };

  const colors: { id: NoteColor; label: string; bg: string }[] = [
    { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
    { id: 'emerald', label: 'Green', bg: 'bg-emerald-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
    { id: 'slate', label: 'Slate', bg: 'bg-slate-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {initialData ? 'Edit Transport Note' : 'New Transport Note'}
              </h2>
              <p className="text-xs text-slate-300">
                Log agreements, loading rules, driver contacts & route tips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft Notification Banner */}
        {hasDraftRestored && (
          <div className="bg-purple-50 border-b border-purple-200 px-5 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-900 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Restored unsaved draft ({draftSavedTime || 'earlier session'})</span>
            </div>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Discard Draft</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* User Access & Rights Selector */}
          <AccessRightsSelector
            currentUser={currentUser}
            users={users}
            visibility={visibility}
            onChangeVisibility={setVisibility}
            userAccessRights={userAccessRights}
            onChangeUserAccessRights={setUserAccessRights}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Note Title / Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dahej to Saurashtra Transporter Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Rate Agreement">Rate Agreement / Contract</option>
                <option value="Loading Point Rules">Loading Point Rules</option>
                <option value="Driver Contacts">Driver & Broker Contacts</option>
                <option value="Toll & Route Tips">Toll & Route Tips</option>
                <option value="Office & Account">Office & Account</option>
                <option value="General">General Scratchpad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setColorTag(c.id)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-transform cursor-pointer ${
                      colorTag === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Note Details & Content *
              </label>
              {draftSavedTime && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Draft saved at {draftSavedTime}</span>
                </span>
              )}
            </div>
            <textarea
              rows={4}
              required
              placeholder="Enter rate terms, contact numbers, loading instructions, diesel escalation rules..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rates, Dahej, Urgent"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pin note to the top of list</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {(title.trim() || content.trim()) && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="text-xs text-slate-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Clear Draft
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#1e293b] hover:bg-[#0f172a] rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{initialData ? 'Update Note' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
