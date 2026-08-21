import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  StatsBar 
} from './components/StatsBar';
import { 
  FilterBar, FilterTab, SortOption, VisibilityFilter 
} from './components/FilterBar';
import { 
  BhadaCard 
} from './components/BhadaCard';
import { 
  ReminderCard 
} from './components/ReminderCard';
import { 
  NoteCard 
} from './components/NoteCard';
import { 
  BhadaModal 
} from './components/BhadaModal';
import { 
  ReminderModal 
} from './components/ReminderModal';
import { 
  NoteModal 
} from './components/NoteModal';
import { 
  RateCalculatorModal 
} from './components/RateCalculatorModal';
import { 
  RouteHistoryModal 
} from './components/RouteHistoryModal';
import { 
  ExportSummaryModal 
} from './components/ExportSummaryModal';
import { 
  UserManagementModal 
} from './components/UserManagementModal';
import { 
  LoginModal 
} from './components/LoginModal';
import { 
  LoginScreen 
} from './components/LoginScreen';
import { 
  AddEditUserModal 
} from './components/AddEditUserModal';
import { 
  ChangePasswordModal 
} from './components/ChangePasswordModal';
import { 
  PrintReportModal 
} from './components/PrintReportModal';
import { 
  InstallAppModal 
} from './components/InstallAppModal';
import { 
  InstallAppBanner 
} from './components/InstallAppBanner';

import { 
  BhadaRate, Reminder, TransportNote, TransportItem, UserAccount 
} from './types';
import { 
  INITIAL_BHADA_RATES, INITIAL_REMINDERS, INITIAL_NOTES, INITIAL_USERS 
} from './data/initialData';
import { 
  Send, Bell, FileText, Plus, Sparkles, Filter, CheckCircle2, Shield, Key, Wifi, Smartphone 
} from 'lucide-react';
import { 
  testConnection,
  subscribeToBhadaRates,
  subscribeToReminders,
  subscribeToNotes,
  subscribeToUsers,
  saveBhadaRateToFirestore,
  deleteBhadaRateFromFirestore,
  saveReminderToFirestore,
  deleteReminderFromFirestore,
  saveNoteToFirestore,
  deleteNoteFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore
} from './firebase';

export default function App() {
  // Persistence with LocalStorage for Bhada, Reminders, Notes, Users
  const [bhadaRates, setBhadaRates] = useState<BhadaRate[]>(() => {
    try {
      const saved = localStorage.getItem('route_bhada_rates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BHADA_RATES;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('route_bhada_reminders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REMINDERS;
  });

  const [notes, setNotes] = useState<TransportNote[]>(() => {
    try {
      const saved = localStorage.getItem('route_bhada_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTES;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('route_bhada_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedId = localStorage.getItem('route_bhada_active_user_id');
      if (savedId) {
        const savedUsersRaw = localStorage.getItem('route_bhada_users');
        const userList: UserAccount[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : INITIAL_USERS;
        const found = userList.find(u => u.id === savedId && u.isActive);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return null; // Mandatory Login - unauthenticated by default
  });

  // Real-time Firestore Sync across devices & users
  useEffect(() => {
    testConnection();

    // 1. Listen to Bhada Rates in real-time
    const unsubBhada = subscribeToBhadaRates((cloudRates) => {
      if (cloudRates && cloudRates.length > 0) {
        setBhadaRates(cloudRates);
      } else {
        // If cloud database is empty, seed initial data
        INITIAL_BHADA_RATES.forEach(rate => {
          saveBhadaRateToFirestore(rate).catch(console.error);
        });
      }
    });

    // 2. Listen to Reminders in real-time
    const unsubReminders = subscribeToReminders((cloudReminders) => {
      if (cloudReminders && cloudReminders.length > 0) {
        setReminders(cloudReminders);
      } else {
        INITIAL_REMINDERS.forEach(rem => {
          saveReminderToFirestore(rem).catch(console.error);
        });
      }
    });

    // 3. Listen to Notes in real-time
    const unsubNotes = subscribeToNotes((cloudNotes) => {
      if (cloudNotes && cloudNotes.length > 0) {
        setNotes(cloudNotes);
      } else {
        INITIAL_NOTES.forEach(note => {
          saveNoteToFirestore(note).catch(console.error);
        });
      }
    });

    // 4. Listen to Users in real-time
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        setCurrentUser(prev => {
          if (!prev) return null;
          const matched = cloudUsers.find(u => u.id === prev.id);
          if (!matched || !matched.isActive) return null;
          return matched;
        });
      } else {
        INITIAL_USERS.forEach(user => {
          saveUserToFirestore(user).catch(console.error);
        });
      }
    });

    return () => {
      unsubBhada();
      unsubReminders();
      unsubNotes();
      unsubUsers();
    };
  }, []);

  // Save changes to localStorage as fallback
  useEffect(() => {
    localStorage.setItem('route_bhada_rates', JSON.stringify(bhadaRates));
  }, [bhadaRates]);

  useEffect(() => {
    localStorage.setItem('route_bhada_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('route_bhada_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('route_bhada_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('route_bhada_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('route_bhada_active_user_id');
    }
  }, [currentUser]);

  // UI state
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  // Modals state
  const [isBhadaModalOpen, setIsBhadaModalOpen] = useState(false);
  const [editingBhada, setEditingBhada] = useState<BhadaRate | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [suggestedReminderBhada, setSuggestedReminderBhada] = useState<{
    title?: string;
    amount?: number;
    partyOrTruck?: string;
    bhadaId?: string;
  } | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TransportNote | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRouteHistoryOpen, setIsRouteHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Android / PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true
      );
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      showToast('🎉 Remix Bhada App successfully installed on your device!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // User Security Modals state
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddEditUserModalOpen, setIsAddEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserAccount | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to check whether an item is visible to the logged-in user
  const isItemVisible = (item: TransportItem): boolean => {
    if (!currentUser) return false;

    // 0. Specific Only Me (Strictly private to the individual creator only)
    if (item.visibility === 'only_me') {
      const isCreator = item.createdByUserId === currentUser.id || (!item.createdByUserId && currentUser.role === 'ADMIN');
      if (!isCreator) return false;
      if (currentUser.role === 'ADMIN' && visibilityFilter !== 'all') {
        return visibilityFilter === 'only_me';
      }
      return true;
    }
    
    // Admin has master access - sees everything except private entries of other users
    if (currentUser.role === 'ADMIN') {
      if (visibilityFilter === 'admin_only') return item.visibility === 'admin_only';
      if (visibilityFilter === 'all_users') return item.visibility === 'all_users';
      if (visibilityFilter === 'specific_users') return item.visibility === 'specific_users' || item.visibility === 'saved_group';
      if (visibilityFilter === 'only_me') return false;
      if (visibilityFilter === 'user_created') return item.createdByRole !== 'ADMIN';
      return true;
    }

    // Regular users:
    // 1. Data created by staff / regular users: visible to all users
    if (item.createdByRole !== 'ADMIN' || !item.createdByRole) {
      return true;
    }

    // 2. Data created by Admin:
    // If admin_only -> HIDDEN from staff
    if (item.visibility === 'admin_only') {
      return false;
    }
    // If all_users -> VISIBLE to staff
    if (item.visibility === 'all_users') {
      return true;
    }
    // If specific_users or saved_group -> VISIBLE ONLY IF current user has access
    if (item.visibility === 'specific_users' || item.visibility === 'saved_group') {
      const hasIdAccess = item.allowedUserIds?.includes(currentUser.id);
      const hasRightAccess = item.userAccessRights?.some(r => r.userId === currentUser.id);
      return Boolean(hasIdAccess || hasRightAccess);
    }

    return true;
  };

  // Filtered lists by permission
  const userVisibleBhadaRates = useMemo(
    () => bhadaRates.filter(isItemVisible),
    [bhadaRates, currentUser, visibilityFilter]
  );

  const userVisibleReminders = useMemo(
    () => reminders.filter(isItemVisible),
    [reminders, currentUser, visibilityFilter]
  );

  const userVisibleNotes = useMemo(
    () => notes.filter(isItemVisible),
    [notes, currentUser, visibilityFilter]
  );

  // Bhada CRUD
  const handleSaveBhada = async (bhadaData: Partial<BhadaRate>) => {
    if (editingBhada) {
      const updatedBhada = {
        ...editingBhada,
        ...bhadaData,
        updatedAt: new Date().toISOString()
      } as BhadaRate;

      setBhadaRates(prev =>
        prev.map(item => (item.id === editingBhada.id ? updatedBhada : item))
      );
      saveBhadaRateToFirestore(updatedBhada).catch(console.error);
      showToast(`Updated rate for ${bhadaData.originCity} ➔ ${bhadaData.destinationCity}`);
    } else {
      const newBhada: BhadaRate = {
        id: `bhada-${Date.now()}`,
        type: 'bhada',
        originCity: bhadaData.originCity || 'ORIGIN',
        destinationCity: bhadaData.destinationCity || 'DESTINATION',
        ratePerUnit: bhadaData.ratePerUnit || 0,
        rateUnit: bhadaData.rateUnit || 'Ton',
        weightTons: bhadaData.weightTons,
        totalBhadaAmount: bhadaData.totalBhadaAmount || 0,
        truckNumber: bhadaData.truckNumber || '',
        truckType: bhadaData.truckType,
        partyName: bhadaData.partyName,
        lrNumber: bhadaData.lrNumber,
        loadingDate: bhadaData.loadingDate || new Date().toISOString().slice(0, 10),
        materialType: bhadaData.materialType,
        driverName: bhadaData.driverName,
        driverPhone: bhadaData.driverPhone,
        remarks: bhadaData.remarks,
        createdAt: new Date().toISOString(),
        createdByUserId: currentUser?.id,
        createdByName: currentUser?.name,
        createdByRole: currentUser?.role,
        visibility: bhadaData.visibility || (currentUser?.role === 'ADMIN' ? 'all_users' : 'all_users'),
        allowedUserIds: bhadaData.allowedUserIds,
        userAccessRights: bhadaData.userAccessRights,
      };
      setBhadaRates(prev => [newBhada, ...prev]);
      saveBhadaRateToFirestore(newBhada).catch(console.error);
      showToast(`Saved Bhada Rate: ${newBhada.originCity} ➔ ${newBhada.destinationCity}`);
    }
    setEditingBhada(null);
  };

  const handleDeleteBhada = (id: string) => {
    setBhadaRates(prev => prev.filter(b => b.id !== id));
    deleteBhadaRateFromFirestore(id).catch(console.error);
    showToast('Bhada Rate removed.');
  };

  const handleCreateReminderFromBhada = (bhada: BhadaRate) => {
    setEditingReminder(null);
    setSuggestedReminderBhada({
      title: `Collect Balance for ${bhada.originCity} ➔ ${bhada.destinationCity} (${bhada.truckNumber || 'Trip'})`,
      amount: bhada.balanceAmount || 0,
      partyOrTruck: `${bhada.partyName || 'Party'} / ${bhada.truckNumber || ''}`,
      bhadaId: bhada.id,
    });
    setIsReminderModalOpen(true);
  };

  // Reminder CRUD
  const handleSaveReminder = async (reminderData: Partial<Reminder>) => {
    if (editingReminder) {
      const updatedReminder = {
        ...editingReminder,
        ...reminderData,
      } as Reminder;

      setReminders(prev =>
        prev.map(r => (r.id === editingReminder.id ? updatedReminder : r))
      );
      saveReminderToFirestore(updatedReminder).catch(console.error);
      showToast('Reminder updated.');
    } else {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}`,
        type: 'reminder',
        title: reminderData.title || 'New Reminder',
        reminderType: reminderData.reminderType || 'Payment Due',
        partyOrTruck: reminderData.partyOrTruck,
        amount: reminderData.amount,
        dueDate: reminderData.dueDate || new Date().toISOString().slice(0, 10),
        dueTime: reminderData.dueTime,
        priority: reminderData.priority || 'High',
        status: reminderData.status || 'Pending',
        notes: reminderData.notes,
        relatedBhadaId: reminderData.relatedBhadaId,
        createdAt: new Date().toISOString(),
        createdByUserId: currentUser?.id,
        createdByName: currentUser?.name,
        createdByRole: currentUser?.role,
        visibility: reminderData.visibility || (currentUser?.role === 'ADMIN' ? 'all_users' : 'all_users'),
        allowedUserIds: reminderData.allowedUserIds,
        userAccessRights: reminderData.userAccessRights,
      };
      setReminders(prev => [newReminder, ...prev]);
      saveReminderToFirestore(newReminder).catch(console.error);
      showToast('Reminder created.');
    }
    setEditingReminder(null);
    setSuggestedReminderBhada(null);
  };

  const handleToggleReminderStatus = (id: string) => {
    setReminders(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nextStatus = r.status === 'Completed' ? 'Pending' : 'Completed';
          const updated: Reminder = {
            ...r,
            status: nextStatus,
            completedAt: nextStatus === 'Completed' ? new Date().toISOString() : undefined,
          };
          saveReminderToFirestore(updated).catch(console.error);
          return updated;
        }
        return r;
      })
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    deleteReminderFromFirestore(id).catch(console.error);
    showToast('Reminder deleted.');
  };

  // Note CRUD
  const handleSaveNote = async (noteData: Partial<TransportNote>) => {
    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        ...noteData,
        updatedAt: new Date().toISOString()
      } as TransportNote;

      setNotes(prev =>
        prev.map(n => (n.id === editingNote.id ? updatedNote : n))
      );
      saveNoteToFirestore(updatedNote).catch(console.error);
      showToast('Note updated.');
    } else {
      const newNote: TransportNote = {
        id: `note-${Date.now()}`,
        type: 'note',
        title: noteData.title || 'Untitled Note',
        category: noteData.category || 'Rate Agreement',
        content: noteData.content || '',
        tags: noteData.tags || [],
        isPinned: !!noteData.isPinned,
        colorTag: noteData.colorTag || 'purple',
        createdAt: new Date().toISOString(),
        createdByUserId: currentUser?.id,
        createdByName: currentUser?.name,
        createdByRole: currentUser?.role,
        visibility: noteData.visibility || (currentUser?.role === 'ADMIN' ? 'all_users' : 'all_users'),
        allowedUserIds: noteData.allowedUserIds,
        userAccessRights: noteData.userAccessRights,
      };
      setNotes(prev => [newNote, ...prev]);
      saveNoteToFirestore(newNote).catch(console.error);
      showToast('Note saved.');
    }
    setEditingNote(null);
  };

  const handleToggleNotePin = (id: string) => {
    setNotes(prev =>
      prev.map(n => {
        if (n.id === id) {
          const updated = { ...n, isPinned: !n.isPinned };
          saveNoteToFirestore(updated).catch(console.error);
          return updated;
        }
        return n;
      })
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    deleteNoteFromFirestore(id).catch(console.error);
    showToast('Note removed.');
  };

  // User Accounts & Password Authentication Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Logged in successfully as ${user.name} (${user.role})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out of system.');
  };

  const handleSaveUser = async (userData: Partial<UserAccount>) => {
    if (editingUser) {
      const updated = { ...editingUser, ...userData } as UserAccount;
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? updated : u)));
      saveUserToFirestore(updated).catch(console.error);
      if (currentUser?.id === editingUser.id) {
        setCurrentUser(updated);
      }
      showToast(`Updated user account @${userData.username}`);
    } else {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: userData.name || 'New User',
        username: userData.username || `user_${Date.now()}`,
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'OPERATOR',
        passwordHash: userData.passwordHash || '123456',
        branchLocation: userData.branchLocation || 'Head Office',
        isActive: userData.isActive ?? true,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      saveUserToFirestore(newUser).catch(console.error);
      showToast(`Created user account @${newUser.username}`);
    }
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteUserFromFirestore(userId).catch(console.error);
    showToast(`User account @${targetUser?.username || ''} deleted successfully.`);
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem('route_bhada_active_user_id');
    }
  };

  const handleUpdatePassword = (userId: string, newPass: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updated = { ...targetUser, passwordHash: newPass };
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
      saveUserToFirestore(updated).catch(console.error);
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
      }
    }
    showToast('Password updated successfully!');
  };

  // Apply calculator results directly to Bhada Modal
  const handleApplyCalculatorResult = (calcResult: {
    ratePerUnit: number;
    weightTons: number;
    totalBhadaAmount: number;
    advanceAmount: number;
    tollTax: number;
    kantaCharges: number;
  }) => {
    setEditingBhada({
      id: '',
      type: 'bhada',
      originCity: 'PADANA',
      destinationCity: 'BHACHAU',
      ratePerUnit: calcResult.ratePerUnit,
      rateUnit: 'Ton',
      weightTons: calcResult.weightTons,
      totalBhadaAmount: calcResult.totalBhadaAmount,
      truckNumber: '',
      loadingDate: new Date().toISOString().slice(0, 10),
      advanceAmount: calcResult.advanceAmount,
      tollTax: calcResult.tollTax,
      kantaCharges: calcResult.kantaCharges,
      balanceAmount: calcResult.totalBhadaAmount - calcResult.advanceAmount,
      createdAt: new Date().toISOString(),
    });
    setIsBhadaModalOpen(true);
  };

  // Pending count from visible reminders
  const pendingRemindersCount = useMemo(
    () => userVisibleReminders.filter(r => r.status === 'Pending').length,
    [userVisibleReminders]
  );

  const filteredItems = useMemo(() => {
    let items: TransportItem[] = [];

    if (activeTab === 'all') {
      items = [...userVisibleBhadaRates, ...userVisibleReminders, ...userVisibleNotes];
    } else if (activeTab === 'bhada') {
      items = [...userVisibleBhadaRates];
    } else if (activeTab === 'reminders') {
      items = [...userVisibleReminders];
    } else if (activeTab === 'notes') {
      items = [...userVisibleNotes];
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        if (item.type === 'bhada') {
          return (
            item.originCity.toLowerCase().includes(q) ||
            item.destinationCity.toLowerCase().includes(q) ||
            item.truckNumber.toLowerCase().includes(q) ||
            (item.partyName && item.partyName.toLowerCase().includes(q)) ||
            (item.lrNumber && item.lrNumber.toLowerCase().includes(q)) ||
            (item.materialType && item.materialType.toLowerCase().includes(q)) ||
            (item.remarks && item.remarks.toLowerCase().includes(q)) ||
            (item.createdByName && item.createdByName.toLowerCase().includes(q)) ||
            item.totalBhadaAmount.toString().includes(q) ||
            item.ratePerUnit.toString().includes(q)
          );
        } else if (item.type === 'reminder') {
          return (
            item.title.toLowerCase().includes(q) ||
            item.reminderType.toLowerCase().includes(q) ||
            (item.partyOrTruck && item.partyOrTruck.toLowerCase().includes(q)) ||
            (item.notes && item.notes.toLowerCase().includes(q)) ||
            (item.createdByName && item.createdByName.toLowerCase().includes(q))
          );
        } else if (item.type === 'note') {
          return (
            item.title.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.content.toLowerCase().includes(q) ||
            (item.createdByName && item.createdByName.toLowerCase().includes(q)) ||
            item.tags.some(t => t.toLowerCase().includes(q))
          );
        }
        return false;
      });
    }

    // Sort items
    items.sort((a, b) => {
      // Pinned notes always rise to top if notes tab
      if (a.type === 'note' && b.type === 'note') {
        if ((a as TransportNote).isPinned && !(b as TransportNote).isPinned) return -1;
        if (!(a as TransportNote).isPinned && (b as TransportNote).isPinned) return 1;
      }

      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'amount_high') {
        const amtA = a.type === 'bhada' ? a.totalBhadaAmount : (a.type === 'reminder' ? a.amount || 0 : 0);
        const amtB = b.type === 'bhada' ? b.totalBhadaAmount : (b.type === 'reminder' ? b.amount || 0 : 0);
        return amtB - amtA;
      }
      if (sortBy === 'amount_low') {
        const amtA = a.type === 'bhada' ? a.totalBhadaAmount : (a.type === 'reminder' ? a.amount || 0 : 0);
        const amtB = b.type === 'bhada' ? b.totalBhadaAmount : (b.type === 'reminder' ? b.amount || 0 : 0);
        return amtA - amtB;
      }
      if (sortBy === 'route_az') {
        const nameA = a.type === 'bhada' ? a.originCity : a.title;
        const nameB = b.type === 'bhada' ? b.originCity : b.title;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return items;
  }, [activeTab, userVisibleBhadaRates, userVisibleReminders, userVisibleNotes, searchQuery, sortBy]);

  // Derived Bhada rates for printing/PDF reports based on current filter or fallback to all visible
  const printableBhadaRates = useMemo(() => {
    const bhadaOnly = filteredItems.filter((i): i is BhadaRate => i.type === 'bhada');
    return bhadaOnly.length > 0 ? bhadaOnly : userVisibleBhadaRates;
  }, [filteredItems, userVisibleBhadaRates]);

  // Mandatory Login Gate - absolutely no transport data is shown without logging in
  if (!currentUser) {
    return (
      <>
        {!isStandalone && (
          <InstallAppBanner 
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            deferredPrompt={deferredPrompt}
            isStandalone={isStandalone}
          />
        )}
        <LoginScreen
          users={users}
          onLoginSuccess={handleLoginSuccess}
        />
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          isStandalone={isStandalone}
          onInstallSuccess={() => showToast('Remix Bhada App installed successfully!')}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* Top Android Install Banner */}
      {!isStandalone && (
        <InstallAppBanner 
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          deferredPrompt={deferredPrompt}
          isStandalone={isStandalone}
        />
      )}

      {/* Top Header */}
      <Header
        onOpenBhadaModal={() => {
          setEditingBhada(null);
          setIsBhadaModalOpen(true);
        }}
        onOpenReminderModal={() => {
          setEditingReminder(null);
          setSuggestedReminderBhada(null);
          setIsReminderModalOpen(true);
        }}
        onOpenNoteModal={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenRouteHistory={() => setIsRouteHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        {/* Top 3 Summary Stats Cards with Quick Search at top */}
        <StatsBar
          totalBhadaCount={userVisibleBhadaRates.length}
          pendingRemindersCount={pendingRemindersCount}
          totalNotesCount={userVisibleNotes.length}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredCount={filteredItems.length}
        />

        {/* Filter Pills, Search Bar and Admin Visibility Filter */}
        <FilterBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allCount={userVisibleBhadaRates.length + userVisibleReminders.length + userVisibleNotes.length}
          bhadaCount={userVisibleBhadaRates.length}
          remindersCount={userVisibleReminders.length}
          notesCount={userVisibleNotes.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          currentUser={currentUser}
          visibilityFilter={visibilityFilter}
          onVisibilityFilterChange={setVisibilityFilter}
          onOpenPrintReport={() => setIsPrintReportOpen(true)}
        />

        {/* Items Grid Layout */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-xs">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No items found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              {searchQuery
                ? `No matching routes, reminders or notes for "${searchQuery}". Try clearing search filter.`
                : 'No items visible in this category. Click a button above to add a new rate, reminder or note.'}
            </p>
            <div className="flex justify-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => {
                  setEditingBhada(null);
                  setIsBhadaModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors"
              >
                + Save Bhada Rate
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map(item => {
              if (item.type === 'bhada') {
                return (
                  <BhadaCard
                    key={item.id}
                    bhada={item}
                    currentUser={currentUser}
                    onEdit={bhada => {
                      setEditingBhada(bhada);
                      setIsBhadaModalOpen(true);
                    }}
                    onDelete={handleDeleteBhada}
                    onCreateReminderFromBhada={handleCreateReminderFromBhada}
                  />
                );
              } else if (item.type === 'reminder') {
                return (
                  <ReminderCard
                    key={item.id}
                    reminder={item}
                    currentUser={currentUser}
                    onToggleStatus={handleToggleReminderStatus}
                    onEdit={reminder => {
                      setEditingReminder(reminder);
                      setIsReminderModalOpen(true);
                    }}
                    onDelete={handleDeleteReminder}
                  />
                );
              } else if (item.type === 'note') {
                return (
                  <NoteCard
                    key={item.id}
                    note={item}
                    currentUser={currentUser}
                    onEdit={note => {
                      setEditingNote(note);
                      setIsNoteModalOpen(true);
                    }}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleToggleNotePin}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </main>

      {/* App Footer with Credits */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white/60 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 font-medium">
            Transport & Freight Management
          </p>
          <p className="text-slate-700 font-bold tracking-wide">
            Design By Azazmadkiya
          </p>
        </div>
      </footer>

      {/* Standalone Printable Document (Active when printed directly via Ctrl+P) */}
      <div className="print-only p-4 bg-white text-slate-900">
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">TRANSPORT & FREIGHT MANAGEMENT</h1>
            <p className="text-xs font-semibold text-slate-700">City-to-City Freight Rates & Trip Statement</p>
            <p className="text-[10px] text-slate-600">
              Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • User: {currentUser.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold border border-slate-900 px-2.5 py-1 rounded">OFFICIAL FREIGHT STATEMENT</span>
            {searchQuery && <p className="text-[10px] text-slate-600 mt-1">Filter: "{searchQuery}"</p>}
          </div>
        </div>

        <table className="w-full text-[10px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-300 p-1 text-center">#</th>
              <th className="border border-slate-300 p-1">Date</th>
              <th className="border border-slate-300 p-1">Route</th>
              <th className="border border-slate-300 p-1">Truck No</th>
              <th className="border border-slate-300 p-1">Party Name</th>
              <th className="border border-slate-300 p-1">Material</th>
              <th className="border border-slate-300 p-1 text-right">Weight</th>
              <th className="border border-slate-300 p-1 text-right">Rate</th>
              <th className="border border-slate-300 p-1 text-right">Total Bhada</th>
              <th className="border border-slate-300 p-1 text-right">Advance</th>
              <th className="border border-slate-300 p-1 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {printableBhadaRates.map((b, i) => (
              <tr key={b.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 p-1 text-center font-bold">{i + 1}</td>
                <td className="border border-slate-300 p-1">{b.loadingDate || '—'}</td>
                <td className="border border-slate-300 p-1 font-bold">{b.originCity} ➔ {b.destinationCity}</td>
                <td className="border border-slate-300 p-1">{b.truckNumber || '—'}</td>
                <td className="border border-slate-300 p-1">{b.partyName || '—'}</td>
                <td className="border border-slate-300 p-1">{b.materialType || '—'}</td>
                <td className="border border-slate-300 p-1 text-right">{b.weightTons ? `${b.weightTons} MT` : '—'}</td>
                <td className="border border-slate-300 p-1 text-right">₹{b.ratePerUnit}/{b.rateUnit}</td>
                <td className="border border-slate-300 p-1 text-right font-bold">₹{b.totalBhadaAmount.toLocaleString('en-IN')}</td>
                <td className="border border-slate-300 p-1 text-right">₹{(b.advanceAmount || 0).toLocaleString('en-IN')}</td>
                <td className="border border-slate-300 p-1 text-right font-bold text-rose-700">₹{(b.balanceAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
              <td colSpan={6} className="border border-slate-300 p-1 text-right uppercase">Total ({printableBhadaRates.length} Trips):</td>
              <td className="border border-slate-300 p-1 text-right">{printableBhadaRates.reduce((s, r) => s + (r.weightTons || 0), 0).toFixed(2)} MT</td>
              <td className="border border-slate-300 p-1 text-right">—</td>
              <td className="border border-slate-300 p-1 text-right font-bold">₹{printableBhadaRates.reduce((s, r) => s + (r.totalBhadaAmount || 0), 0).toLocaleString('en-IN')}</td>
              <td className="border border-slate-300 p-1 text-right">₹{printableBhadaRates.reduce((s, r) => s + (r.advanceAmount || 0), 0).toLocaleString('en-IN')}</td>
              <td className="border border-slate-300 p-1 text-right text-rose-700">₹{printableBhadaRates.reduce((s, r) => s + (r.balanceAmount || 0), 0).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between text-[9px] text-slate-600">
          <span>Transport & Freight Management</span>
          <span className="font-bold text-slate-800">Design By Azazmadkiya</span>
        </div>
      </div>

      {/* Floating Bottom Quick Utilities Bar on Mobile */}
      <div className="lg:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-4 py-2 flex items-center justify-around text-xs font-semibold shadow-lg">
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 p-1 cursor-pointer"
        >
          <span className="text-sm">⚡</span>
          <span className="text-[10px]">Freight Calc</span>
        </button>
        <button
          onClick={() => setIsRouteHistoryOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-amber-600 p-1 cursor-pointer"
        >
          <span className="text-sm">📊</span>
          <span className="text-[10px]">Route Trends</span>
        </button>
        <button
          onClick={() => setIsExportOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-emerald-600 p-1 cursor-pointer"
        >
          <span className="text-sm">📥</span>
          <span className="text-[10px]">Export</span>
        </button>
        <button
          onClick={() => setIsUserManagementOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-purple-600 p-1 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-purple-600" />
          <span className="text-[10px]">Users</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <BhadaModal
        isOpen={isBhadaModalOpen}
        onClose={() => {
          setIsBhadaModalOpen(false);
          setEditingBhada(null);
        }}
        onSave={handleSaveBhada}
        initialData={editingBhada}
        currentUser={currentUser}
        users={users}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
          setSuggestedReminderBhada(null);
        }}
        onSave={handleSaveReminder}
        initialData={editingReminder}
        suggestedBhadaTitle={suggestedReminderBhada?.title}
        suggestedBhadaAmount={suggestedReminderBhada?.amount}
        suggestedPartyOrTruck={suggestedReminderBhada?.partyOrTruck}
        suggestedBhadaId={suggestedReminderBhada?.bhadaId}
        currentUser={currentUser}
        users={users}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialData={editingNote}
        currentUser={currentUser}
        users={users}
      />

      <RateCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyToNewBhada={handleApplyCalculatorResult}
      />

      <RouteHistoryModal
        isOpen={isRouteHistoryOpen}
        onClose={() => setIsRouteHistoryOpen(false)}
        bhadaRates={userVisibleBhadaRates}
        onSelectRouteForQuote={(orig, dest, rate) => {
          setIsRouteHistoryOpen(false);
          setEditingBhada({
            id: '',
            type: 'bhada',
            originCity: orig,
            destinationCity: dest,
            ratePerUnit: rate,
            rateUnit: 'Ton',
            weightTons: 30,
            totalBhadaAmount: rate * 30,
            truckNumber: '',
            loadingDate: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
          });
          setIsBhadaModalOpen(true);
        }}
      />

      <ExportSummaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bhadaRates={userVisibleBhadaRates}
      />

      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        bhadaRates={printableBhadaRates}
        currentUser={currentUser}
        initialSearchQuery={searchQuery}
      />

      {/* User Management & Security Modals */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        currentUser={currentUser}
        onOpenAddUser={() => {
          setEditingUser(null);
          setIsAddEditUserModalOpen(true);
        }}
        onOpenEditUser={(user) => {
          setEditingUser(user);
          setIsAddEditUserModalOpen(true);
        }}
        onOpenChangePassword={(user) => {
          setPasswordTargetUser(user);
          setIsChangePasswordModalOpen(true);
        }}
        onDeleteUser={handleDeleteUser}
        bhadaRates={bhadaRates}
        reminders={reminders}
        notes={notes}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />

      <AddEditUserModal
        isOpen={isAddEditUserModalOpen}
        onClose={() => {
          setIsAddEditUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        initialData={editingUser}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => {
          setIsChangePasswordModalOpen(false);
          setPasswordTargetUser(null);
        }}
        targetUser={passwordTargetUser || currentUser}
        currentUser={currentUser}
        onUpdatePassword={handleUpdatePassword}
      />

      {/* Floating Android Shortcut / Install App Badge */}
      {!isStandalone && (
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="fixed bottom-4 left-4 z-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs py-2.5 px-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer no-print group"
          title="Click to Install Remix Bhada on your Android device"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Android Shortcut</span>
            <span className="block font-black text-amber-300 group-hover:text-amber-200">Click To Install App</span>
          </div>
        </button>
      )}

      {/* Install Android & PWA App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
        onInstallSuccess={() => showToast('Remix Bhada App installed successfully!')}
      />
    </div>
  );
}
