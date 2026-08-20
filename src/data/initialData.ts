import { BhadaRate, Reminder, TransportNote, UserAccount } from '../types';

export const INITIAL_BHADA_RATES: BhadaRate[] = [];

export const INITIAL_REMINDERS: Reminder[] = [];

export const INITIAL_NOTES: TransportNote[] = [];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Azazmadkiya',
    username: 'azazmadkiya',
    email: 'azazmadkiya@gmail.com',
    phone: '+91 96877 09315',
    role: 'ADMIN',
    passwordHash: '9687709315',
    branchLocation: 'Head Office (Gujarat)',
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    lastLoginAt: '2026-08-18T01:25:00Z',
  }
];

