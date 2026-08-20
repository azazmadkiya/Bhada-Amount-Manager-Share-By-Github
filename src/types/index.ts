export type RateUnit = 'Ton' | 'MT' | 'Quintal' | 'Trip' | 'Lumpsum' | 'Kg' | 'Bag';

export type AccessVisibility = 'admin_only' | 'all_users' | 'specific_users' | 'saved_group' | 'only_me';
export type UserPermissionLevel = 'view' | 'edit';

export interface UserAccessRight {
  userId: string;
  userName?: string;
  userRole?: string;
  permission: UserPermissionLevel; // 'view' or 'edit'
}

export interface BaseTransportItem {
  createdByUserId?: string;
  createdByName?: string;
  createdByRole?: UserRole;
  visibility?: AccessVisibility; // 'admin_only' | 'all_users' | 'specific_users'
  allowedUserIds?: string[]; // IDs of specific users permitted to see
  userAccessRights?: UserAccessRight[]; // Detailed permission per user
}

export interface BhadaRate extends BaseTransportItem {
  id: string;
  type: 'bhada';
  originCity: string;
  originState?: string;
  destinationCity: string;
  destinationState?: string;
  ratePerUnit: number;
  rateUnit: RateUnit;
  weightTons?: number;
  totalBhadaAmount: number;
  truckNumber: string;
  truckType?: string;
  partyName?: string;
  lrNumber?: string;
  loadingDate: string;
  materialType?: string;
  driverName?: string;
  driverPhone?: string;
  advanceAmount?: number;
  dieselAdvance?: number;
  tollTax?: number;
  kantaCharges?: number;
  commissionCharges?: number;
  detentionCharges?: number;
  balanceAmount?: number;
  remarks?: string;
  isStarred?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ReminderType = 
  | 'Payment Due' 
  | 'POD Collection' 
  | 'Vehicle Fitness/Permit' 
  | 'Advance Settlement' 
  | 'Unloading Halting' 
  | 'General Followup';

export type ReminderPriority = 'Urgent' | 'High' | 'Normal';
export type ReminderStatus = 'Pending' | 'Completed' | 'Overdue';

export interface Reminder extends BaseTransportItem {
  id: string;
  type: 'reminder';
  title: string;
  reminderType: ReminderType;
  partyOrTruck?: string;
  amount?: number;
  dueDate: string;
  dueTime?: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  notes?: string;
  relatedBhadaId?: string;
  createdAt: string;
  completedAt?: string;
}

export type NoteCategory = 
  | 'Rate Agreement' 
  | 'Loading Point Rules' 
  | 'Driver Contacts' 
  | 'Toll & Route Tips' 
  | 'Office & Account' 
  | 'General';

export type NoteColor = 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate';

export interface TransportNote extends BaseTransportItem {
  id: string;
  type: 'note';
  title: string;
  category: NoteCategory;
  content: string;
  tags: string[];
  isPinned: boolean;
  colorTag: NoteColor;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'ACCOUNTS' | 'OPERATOR';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  branchLocation?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type TransportItem = BhadaRate | Reminder | TransportNote;
