import React, { useState } from 'react';
import { 
  X, Shield, Key, Plus, User, Edit3, Trash2, Check, Lock, 
  Users, Mail, Phone, MapPin, AlertCircle, Eye, Globe, UserCheck, AlertTriangle
} from 'lucide-react';
import { UserAccount, UserRole, BhadaRate, Reminder, TransportNote } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onOpenAddUser: () => void;
  onOpenEditUser: (user: UserAccount) => void;
  onOpenChangePassword: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  bhadaRates?: BhadaRate[];
  reminders?: Reminder[];
  notes?: TransportNote[];
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onOpenAddUser,
  onOpenEditUser,
  onOpenChangePassword,
  onDeleteUser,
  bhadaRates = [],
  reminders = [],
  notes = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rights_matrix'>('users');
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    onDeleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DISPATCHER':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ACCOUNTS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OPERATOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const activeUser = currentUser || users[0];

  // Helper to compute accessible items per user
  const getUserAccessStats = (user: UserAccount) => {
    if (user.role === 'ADMIN') {
      return {
        bhadaCount: bhadaRates.length,
        notesCount: notes.length,
        isFullAdmin: true,
      };
    }

    const accessibleBhada = bhadaRates.filter(b => {
      if (b.visibility === 'only_me') return b.createdByUserId === user.id;
      if (b.createdByRole !== 'ADMIN' || !b.createdByRole) return true;
      if (b.visibility === 'all_users') return true;
      if ((b.visibility === 'specific_users' || b.visibility === 'saved_group') && b.userAccessRights?.some(r => r.userId === user.id)) return true;
      return false;
    });

    const editableBhada = bhadaRates.filter(b => {
      if (b.visibility === 'only_me') return b.createdByUserId === user.id;
      if (b.createdByUserId === user.id) return true;
      if (b.userAccessRights?.some(r => r.userId === user.id && r.permission === 'edit')) return true;
      return false;
    });

    const accessibleNotes = notes.filter(n => {
      if (n.visibility === 'only_me') return n.createdByUserId === user.id;
      if (n.createdByRole !== 'ADMIN' || !n.createdByRole) return true;
      if (n.visibility === 'all_users') return true;
      if ((n.visibility === 'specific_users' || n.visibility === 'saved_group') && n.userAccessRights?.some(r => r.userId === user.id)) return true;
      return false;
    });

    return {
      bhadaCount: accessibleBhada.length,
      editableBhadaCount: editableBhada.length,
      notesCount: accessibleNotes.length,
      isFullAdmin: false,
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* 1. Modal Top Bar */}
        <div className="bg-white px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="text-blue-600 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                USER ACCOUNTS & ACCESS PERMISSIONS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage logins, password security, and viewing rights (ક્યા-ક્યા rights joi sake)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChangePassword(activeUser)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change My Password</span>
            </button>

            <button
              onClick={onOpenAddUser}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add User</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar: All Users vs Rights Matrix */}
        <div className="px-5 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'users'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              System Users ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('rights_matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'rights_matrix'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>User Rights Matrix (ક્યા-ક્યા rights joi sake)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Role: <strong className="font-mono text-slate-700">{activeUser?.role}</strong>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'users' ? (
            <>
              {/* Active User Profile Card */}
              {activeUser && (
                <div className="bg-white rounded-xl border border-blue-200/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {activeUser.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                          @{activeUser.username}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-700">Role: {activeUser.role}</span>
                        <span>•</span>
                        <span>{activeUser.email}</span>
                        {activeUser.branchLocation && (
                          <>
                            <span>•</span>
                            <span>{activeUser.branchLocation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => onOpenChangePassword(activeUser)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-400 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>
              )}

              {/* All System Users Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
                      ALL REGISTERED USERS ({users.length})
                    </h3>
                  </div>

                  <button
                    onClick={onOpenAddUser}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add User Account</span>
                  </button>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">USER / NAME</th>
                          <th className="px-4 py-3">USER ID / LOGIN</th>
                          <th className="px-4 py-3">ROLE & ASSIGNMENT</th>
                          <th className="px-4 py-3">PHONE / EMAIL</th>
                          <th className="px-4 py-3 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Name */}
                            <td className="px-4 py-3.5 font-bold text-slate-900 text-sm whitespace-nowrap">
                              {user.name}
                            </td>

                            {/* Username */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="font-mono font-semibold text-blue-600">
                                @{user.username}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase border ${getRoleBadgeStyle(user.role)}`}>
                                {user.role}
                              </span>
                            </td>

                            {/* Phone / Email */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 space-y-0.5">
                              <div className="font-medium text-slate-800">{user.phone}</div>
                              <div className="text-[11px] text-slate-400">{user.email}</div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Change Password */}
                                <button
                                  onClick={() => onOpenChangePassword(user)}
                                  title="Change Password"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200/80 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit User */}
                                <button
                                  onClick={() => onOpenEditUser(user)}
                                  title="Edit User Details"
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete User Button */}
                                {users.length > 1 ? (
                                  <button
                                    onClick={() => setUserToDelete(user)}
                                    title="Delete User Account"
                                    className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    title="Cannot delete the only remaining user account"
                                    className="p-1.5 text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed opacity-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* User Rights Matrix Panel */
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider">
                    Role-Based Access Control Rules (દૃશ્યતા અને અધિકાર નિયમો)
                  </h4>
                  <ul className="text-xs text-slate-600 mt-1.5 space-y-1 list-disc pl-4">
                    <li>
                      <strong>Admin Added Entries:</strong> Admin can select 🔒 <em>Admin Only</em> (hidden from all users), 🌐 <em>All Users</em> (visible to all staff), or 👥 <em>Specific Users</em> (custom View / Edit rights).
                    </li>
                    <li>
                      <strong>Staff / User Added Entries:</strong> Automatically visible to all users and Admin.
                    </li>
                    <li>
                      <strong>Admin Master Rights:</strong> Admin can view, edit, change access, and delete all transport records at any time.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Rights Matrix Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {users.map(user => {
                  const stats = getUserAccessStats(user);
                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">@{user.username}</div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleBadgeStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Access Scope:</span>
                            <span className="font-bold text-slate-800">
                              {stats.isFullAdmin ? '👑 Full Master Access' : '👥 Staff User Access'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Can View Bhada Rates:</span>
                            <span className="font-bold text-emerald-700">
                              {stats.bhadaCount} of {bhadaRates.length} Routes
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Can View Notes:</span>
                            <span className="font-bold text-purple-700">
                              {stats.notesCount} of {notes.length} Notes
                            </span>
                          </div>

                          {!stats.isFullAdmin && (
                            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                              <span>Admin-only hidden items:</span>
                              <span className="font-bold text-slate-700">
                                {bhadaRates.filter(b => b.visibility === 'admin_only').length} Routes Hidden
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Controls including Delete User */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenChangePassword(user)}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                          title="Change Password"
                        >
                          <Key className="w-3 h-3" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => onOpenEditUser(user)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit User"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {users.length > 1 && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded transition-all cursor-pointer flex items-center gap-1"
                            title="Delete User"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure User Management & Role-Based Permissions</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* DEDICATED USER DELETION CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className={`text-white px-5 py-4 flex items-center justify-between ${
              userToDelete.role === 'ADMIN' ? 'bg-rose-700' : 'bg-rose-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-lg">
                  {userToDelete.role === 'ADMIN' ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {userToDelete.role === 'ADMIN' ? 'Confirm Admin Account Deletion' : 'Confirm User Deletion'}
                  </h3>
                  <p className="text-xs text-rose-100">
                    {userToDelete.role === 'ADMIN' ? 'Permanent Admin Removal & Revocation' : 'Permanent Account Removal'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {userToDelete.role === 'ADMIN' ? (
                  <span>
                    Are you sure you want to delete the master <strong>ADMIN</strong> user account{' '}
                    <span className="font-bold text-slate-900">@{userToDelete.username}</span>?
                  </span>
                ) : (
                  <span>
                    Are you sure you want to delete user account{' '}
                    <span className="font-bold text-slate-900">@{userToDelete.username}</span> from the system?
                  </span>
                )}
              </p>

              {/* Target User Info Card */}
              <div className={`border rounded-xl p-3.5 flex items-center gap-3 ${
                userToDelete.role === 'ADMIN'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`w-10 h-10 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  userToDelete.role === 'ADMIN' ? 'bg-purple-900' : 'bg-slate-900'
                }`}>
                  {userToDelete.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {userToDelete.name}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${getRoleBadgeStyle(userToDelete.role)}`}>
                      {userToDelete.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    @{userToDelete.username} &bull; {userToDelete.role === 'ADMIN' ? 'Master Admin Role' : 'Staff Role'}
                  </div>
                </div>
              </div>

              {/* Warning note */}
              <div className={`border rounded-lg p-3 text-xs flex items-start gap-2 ${
                userToDelete.role === 'ADMIN' 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  userToDelete.role === 'ADMIN' ? 'text-red-600' : 'text-amber-600'
                }`} />
                <span>
                  {userToDelete.role === 'ADMIN' ? (
                    <>
                      <strong>Admin Warning:</strong> All administrative permissions, full rate visibility, and system management rights will be permanently deleted for this user. Previously recorded freight rates and notes will remain intact in the system.
                    </>
                  ) : (
                    <>
                      <strong>Warning:</strong> The user's login access will be revoked immediately. Any freight rates or notes created by them will be preserved in the register.
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {userToDelete.role === 'ADMIN' ? 'Yes, Delete Admin Account' : 'Yes, Delete User Account'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
