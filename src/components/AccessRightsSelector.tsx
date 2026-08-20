import React, { useState } from 'react';
import { Shield, Lock, Globe, Users, Check, Eye, Edit3, UserCheck, AlertCircle, Bookmark, Star, Sparkles } from 'lucide-react';
import { AccessVisibility, UserAccessRight, UserAccount } from '../types';

interface AccessRightsSelectorProps {
  currentUser: UserAccount | null;
  users: UserAccount[];
  visibility: AccessVisibility;
  onChangeVisibility: (vis: AccessVisibility) => void;
  userAccessRights: UserAccessRight[];
  onChangeUserAccessRights: (rights: UserAccessRight[]) => void;
}

export const AccessRightsSelector: React.FC<AccessRightsSelectorProps> = ({
  currentUser,
  users,
  visibility,
  onChangeVisibility,
  userAccessRights,
  onChangeUserAccessRights,
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [savedPresetName, setSavedPresetName] = useState('My Saved Dispatch Team');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available non-admin users list
  const nonAdminUsers = users.filter(u => u.role !== 'ADMIN' && u.isActive);

  // If user is not Admin, regular users create entries that are visible to all users
  if (!isAdmin) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Visibility:</strong> Visible to all staff and admin users.
          </span>
        </div>
        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
          All Users
        </span>
      </div>
    );
  }

  // Admin visibility controls
  const handleToggleUser = (user: UserAccount) => {
    const exists = userAccessRights.find(r => r.userId === user.id);
    if (exists) {
      onChangeUserAccessRights(userAccessRights.filter(r => r.userId !== user.id));
    } else {
      onChangeUserAccessRights([
        ...userAccessRights,
        {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          permission: 'view', // default to view
        },
      ]);
    }
  };

  const handleChangePermission = (userId: string, permission: 'view' | 'edit') => {
    onChangeUserAccessRights(
      userAccessRights.map(r => (r.userId === userId ? { ...r, permission } : r))
    );
  };

  const handleSelectAll = (perm: 'view' | 'edit') => {
    const allRights: UserAccessRight[] = nonAdminUsers.map(u => ({
      userId: u.id,
      userName: u.name,
      userRole: u.role,
      permission: perm,
    }));
    onChangeUserAccessRights(allRights);
  };

  const handleClearAll = () => {
    onChangeUserAccessRights([]);
  };

  const applyRolePreset = (role: string) => {
    const filteredUsers = nonAdminUsers.filter(u => u.role === role);
    const rights: UserAccessRight[] = filteredUsers.map(u => ({
      userId: u.id,
      userName: u.name,
      userRole: u.role,
      permission: 'view',
    }));
    onChangeUserAccessRights(rights);
  };

  const handleSaveCurrentAsPreset = () => {
    if (userAccessRights.length === 0) return;
    try {
      localStorage.setItem('routebhada_saved_user_preset', JSON.stringify(userAccessRights));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSavedPreset = () => {
    try {
      const stored = localStorage.getItem('routebhada_saved_user_preset');
      if (stored) {
        const parsed = JSON.parse(stored) as UserAccessRight[];
        // Filter only active existing users
        const valid = parsed.filter(p => nonAdminUsers.some(u => u.id === p.userId));
        onChangeUserAccessRights(valid);
      } else {
        // Default to all active non-admin users
        handleSelectAll('view');
      }
    } catch (e) {
      handleSelectAll('view');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/90 rounded-xl p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              User Access & Viewing Rights (દૃશ્યતા અને અધિકારો)
            </h4>
            <p className="text-[11px] text-slate-500">
              Control who can see and edit this entry
            </p>
          </div>
        </div>
        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          Admin Control
        </span>
      </div>

      {/* 5 Visibility Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Admin Only */}
        <div
          onClick={() => onChangeVisibility('admin_only')}
          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            visibility === 'admin_only'
              ? 'bg-purple-50/90 border-purple-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Lock className="w-4 h-4" />
            </div>
            {visibility === 'admin_only' && (
              <span className="w-2 h-2 rounded-full bg-purple-600 ring-4 ring-purple-100" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">1. Admin Only</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Only Admin can see. Hidden from staff.
            </div>
          </div>
        </div>

        {/* 2. All Users */}
        <div
          onClick={() => onChangeVisibility('all_users')}
          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            visibility === 'all_users'
              ? 'bg-blue-50/90 border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Globe className="w-4 h-4" />
            </div>
            {visibility === 'all_users' && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">2. All Users</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Visible to all branch dispatchers & staff.
            </div>
          </div>
        </div>

        {/* 3. Specific Users */}
        <div
          onClick={() => onChangeVisibility('specific_users')}
          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            visibility === 'specific_users'
              ? 'bg-emerald-50/90 border-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
            {visibility === 'specific_users' && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">3. Specific Users</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Custom individual users with View/Edit.
            </div>
          </div>
        </div>

        {/* 4. Saved Users / Presets */}
        <div
          onClick={() => {
            onChangeVisibility('saved_group');
            if (userAccessRights.length === 0) {
              handleLoadSavedPreset();
            }
          }}
          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            visibility === 'saved_group'
              ? 'bg-amber-50/90 border-amber-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Bookmark className="w-4 h-4" />
            </div>
            {visibility === 'saved_group' && (
              <span className="w-2 h-2 rounded-full bg-amber-600 ring-4 ring-amber-100" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">4. Saved Users (No. 4)</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Saved preset team & role groups.
            </div>
          </div>
        </div>

        {/* 5. Specific Only Me */}
        <div
          onClick={() => onChangeVisibility('only_me')}
          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            visibility === 'only_me'
              ? 'bg-indigo-50/90 border-indigo-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <UserCheck className="w-4 h-4" />
            </div>
            {visibility === 'only_me' && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">5. Specific Only Me</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Private to you only (પોતે જ જોઈ શકે).
            </div>
          </div>
        </div>
      </div>

      {/* Option 5: Specific Only Me Information Box */}
      {visibility === 'only_me' && (
        <div className="bg-white border border-indigo-300 rounded-xl p-3.5 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Option 5: Specific Only Me (ફક્ત હું પોતે જ જોઈ શકું)</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
              Private to @{currentUser?.username || 'me'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-8">
            This entry is set to <strong>100% Private (Specific Only Me)</strong>. It will only be visible to your active logged-in account (<strong>{currentUser?.name}</strong>). Other staff, operators, and users will NOT be able to view, edit, or search this entry.
          </p>
        </div>
      )}

      {/* Option 4: Saved Users Group Panel */}
      {visibility === 'saved_group' && (
        <div className="bg-white border border-amber-300 rounded-xl p-3.5 space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Option 4: Saved Specific Users & Role Presets</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {userAccessRights.length} Users in Active Preset
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleLoadSavedPreset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg cursor-pointer transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Load Saved Preset</span>
            </button>

            <button
              type="button"
              onClick={() => applyRolePreset('DISPATCHER')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              🚛 Dispatchers Only
            </button>

            <button
              type="button"
              onClick={() => applyRolePreset('ACCOUNTS')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              💰 Accounts Only
            </button>

            <button
              type="button"
              onClick={() => applyRolePreset('MANAGER')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              👔 Managers Only
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentAsPreset}
              disabled={userAccessRights.length === 0}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccess ? 'Preset Saved!' : 'Save Current Selection as Preset'}</span>
            </button>
          </div>

          {/* Users List in Preset */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pt-1">
            {nonAdminUsers.map(user => {
              const userRight = userAccessRights.find(r => r.userId === user.id);
              const isSelected = !!userRight;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleUser(user)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user.name} <span className="text-[10px] text-slate-500 font-normal">(@{user.username})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[9px]">
                          {user.role}
                        </span>
                        {user.branchLocation && <span className="truncate">{user.branchLocation}</span>}
                      </div>
                    </div>
                  </label>

                  {isSelected && (
                    <select
                      value={userRight?.permission || 'view'}
                      onChange={(e) =>
                        handleChangePermission(user.id, e.target.value as 'view' | 'edit')
                      }
                      className="text-[11px] font-bold py-1 px-2 rounded-md border border-amber-300 bg-amber-100 text-amber-900 focus:outline-none"
                    >
                      <option value="view">👁️ View Only</option>
                      <option value="edit">✏️ Can Edit</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Option 3: Specific Users Access & Rights Configuration Panel */}
      {visibility === 'specific_users' && (
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Users & Define Access Rights ({userAccessRights.length} Selected):</span>
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectAll('view')}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                All (View)
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll('edit')}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                All (Edit)
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                Clear
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                disabled={userAccessRights.length === 0}
                className="text-amber-800 hover:underline font-bold cursor-pointer"
              >
                {saveSuccess ? 'Saved!' : 'Save as Preset'}
              </button>
            </div>
          </div>

          {nonAdminUsers.length === 0 ? (
            <div className="text-xs text-slate-500 py-3 text-center">
              No non-admin users created yet. You can add users in User Management.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {nonAdminUsers.map(user => {
                const userRight = userAccessRights.find(r => r.userId === user.id);
                const isSelected = !!userRight;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Checkbox and user info */}
                    <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(user)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {user.name} <span className="text-[10px] text-slate-500 font-normal">(@{user.username})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[9px]">
                            {user.role}
                          </span>
                          {user.branchLocation && (
                            <span className="truncate">{user.branchLocation}</span>
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Permission Rights Dropdown / Badge */}
                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <select
                          value={userRight?.permission || 'view'}
                          onChange={(e) =>
                            handleChangePermission(user.id, e.target.value as 'view' | 'edit')
                          }
                          className={`text-[11px] font-bold py-1 px-2 rounded-md border focus:outline-none focus:ring-1 ${
                            userRight?.permission === 'edit'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          <option value="view">👁️ View Only (માત્ર જોઈ શકે)</option>
                          <option value="edit">✏️ Can Edit (સુધારી શકે)</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {userAccessRights.length === 0 && (
            <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>No user selected yet. Only Admin can see until users are selected.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
