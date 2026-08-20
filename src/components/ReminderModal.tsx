import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, IndianRupee, Truck, AlertCircle } from 'lucide-react';
import { Reminder, ReminderType, ReminderPriority, AccessVisibility, UserAccessRight, UserAccount } from '../types';
import { AccessRightsSelector } from './AccessRightsSelector';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<Reminder>) => void;
  initialData?: Reminder | null;
  suggestedBhadaTitle?: string;
  suggestedBhadaAmount?: number;
  suggestedPartyOrTruck?: string;
  suggestedBhadaId?: string;
  currentUser: UserAccount | null;
  users: UserAccount[];
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestedBhadaTitle,
  suggestedBhadaAmount,
  suggestedPartyOrTruck,
  suggestedBhadaId,
  currentUser,
  users,
}) => {
  const [title, setTitle] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('Payment Due');
  const [partyOrTruck, setPartyOrTruck] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('14:00');
  const [priority, setPriority] = useState<ReminderPriority>('High');
  const [notes, setNotes] = useState('');

  // Access rights state
  const [visibility, setVisibility] = useState<AccessVisibility>('all_users');
  const [userAccessRights, setUserAccessRights] = useState<UserAccessRight[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setReminderType(initialData.reminderType || 'Payment Due');
      setPartyOrTruck(initialData.partyOrTruck || '');
      setAmount(initialData.amount ?? '');
      setDueDate(initialData.dueDate || new Date().toISOString().slice(0, 10));
      setDueTime(initialData.dueTime || '14:00');
      setPriority(initialData.priority || 'High');
      setNotes(initialData.notes || '');
      setVisibility(initialData.visibility || (currentUser?.role === 'ADMIN' ? 'all_users' : 'all_users'));
      setUserAccessRights(initialData.userAccessRights || []);
    } else if (suggestedBhadaTitle) {
      setTitle(suggestedBhadaTitle);
      setReminderType('Payment Due');
      setPartyOrTruck(suggestedPartyOrTruck || '');
      setAmount(suggestedBhadaAmount ?? '');
      // default due date: 3 days from today
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().slice(0, 10));
      setDueTime('14:00');
      setPriority('High');
      setNotes('Follow up with consignor/party for balance settlement.');
      setVisibility(currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users');
      setUserAccessRights([]);
    } else {
      setTitle('');
      setReminderType('Payment Due');
      setPartyOrTruck('');
      setAmount('');
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setDueDate(d.toISOString().slice(0, 10));
      setDueTime('14:00');
      setPriority('High');
      setNotes('');
      setVisibility(currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users');
      setUserAccessRights([]);
    }
  }, [initialData, suggestedBhadaTitle, suggestedBhadaAmount, suggestedPartyOrTruck, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const allowedUserIds = visibility === 'specific_users' 
      ? userAccessRights.map(r => r.userId) 
      : undefined;

    const payload: Partial<Reminder> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      type: 'reminder',
      title: title.trim(),
      reminderType,
      partyOrTruck: partyOrTruck.trim(),
      amount: amount !== '' ? Number(amount) : undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status: initialData?.status || 'Pending',
      notes: notes.trim(),
      relatedBhadaId: initialData?.relatedBhadaId || suggestedBhadaId,
      // Access Control
      createdByUserId: initialData?.createdByUserId || currentUser?.id,
      createdByName: initialData?.createdByName || currentUser?.name,
      createdByRole: initialData?.createdByRole || currentUser?.role,
      visibility: currentUser?.role === 'ADMIN' ? visibility : 'all_users',
      allowedUserIds: currentUser?.role === 'ADMIN' ? allowedUserIds : undefined,
      userAccessRights: currentUser?.role === 'ADMIN' ? userAccessRights : undefined,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#d97706] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {initialData ? 'Edit Reminder' : 'Add Transport Reminder'}
              </h2>
              <p className="text-xs text-amber-100">
                Track pending balance payment, POD collection, and permit renewals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              Reminder Title / Task *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Collect Balance Freight for Dahej-Beed Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reminder Category
              </label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as ReminderType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Payment Due">Payment Due / Freight</option>
                <option value="POD Collection">POD / Receiving Bilty</option>
                <option value="Vehicle Fitness/Permit">Vehicle Fitness / Permit</option>
                <option value="Advance Settlement">Advance Settlement</option>
                <option value="Unloading Halting">Unloading / Halting Followup</option>
                <option value="General Followup">General Followup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Urgent">🚨 Urgent</option>
                <option value="High">⚠️ High</option>
                <option value="Normal">🟢 Normal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Party / Truck No. / Contact
              </label>
              <input
                type="text"
                placeholder="e.g. Om Petrochem / GJ-06BT-9219"
                value={partyOrTruck}
                onChange={(e) => setPartyOrTruck(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Amount (₹) (Optional)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="7780"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time (Optional)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Follow-up Notes
            </label>
            <textarea
              rows={2}
              placeholder="Party promised NEFT clearance once physical POD copy arrives."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{initialData ? 'Update Reminder' : 'Save Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
