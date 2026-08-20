import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { BhadaRate, Reminder, TransportNote, UserAccount } from './types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore connection on initial boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system_metadata', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

// Error handling helper conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Firestore real-time subscriptions and persistence helpers
export const subscribeToBhadaRates = (
  callback: (rates: BhadaRate[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, 'bhada_rates');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: BhadaRate[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as BhadaRate);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bhada_rates');
      if (onError) onError(error);
    }
  );
};

export const subscribeToReminders = (
  callback: (reminders: Reminder[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, 'reminders');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Reminder);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reminders');
      if (onError) onError(error);
    }
  );
};

export const subscribeToNotes = (
  callback: (notes: TransportNote[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, 'notes');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: TransportNote[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as TransportNote);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
      if (onError) onError(error);
    }
  );
};

export const subscribeToUsers = (
  callback: (users: UserAccount[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as UserAccount);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      if (onError) onError(error);
    }
  );
};

export const subscribeToMetadata = (
  callback: (meta: { customMaterials?: string[]; customCities?: string[] }) => void,
  onError?: (err: unknown) => void
) => {
  const docRef = doc(db, 'system_metadata', 'app_config');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as { customMaterials?: string[]; customCities?: string[] });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system_metadata/app_config');
      if (onError) onError(error);
    }
  );
};

// Helper to sanitize payload and remove undefined fields before writing to Firestore
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Firestore CRUD write operations
export async function saveBhadaRateToFirestore(bhada: BhadaRate) {
  try {
    const docRef = doc(db, 'bhada_rates', bhada.id);
    await setDoc(docRef, sanitizeForFirestore(bhada));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bhada_rates/${bhada.id}`);
    throw error;
  }
}

export async function deleteBhadaRateFromFirestore(id: string) {
  try {
    const docRef = doc(db, 'bhada_rates', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bhada_rates/${id}`);
    throw error;
  }
}

export async function saveReminderToFirestore(reminder: Reminder) {
  try {
    const docRef = doc(db, 'reminders', reminder.id);
    await setDoc(docRef, sanitizeForFirestore(reminder));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reminders/${reminder.id}`);
    throw error;
  }
}

export async function deleteReminderFromFirestore(id: string) {
  try {
    const docRef = doc(db, 'reminders', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    throw error;
  }
}

export async function saveNoteToFirestore(note: TransportNote) {
  try {
    const docRef = doc(db, 'notes', note.id);
    await setDoc(docRef, sanitizeForFirestore(note));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notes/${note.id}`);
    throw error;
  }
}

export async function deleteNoteFromFirestore(id: string) {
  try {
    const docRef = doc(db, 'notes', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    throw error;
  }
}

export async function saveUserToFirestore(user: UserAccount) {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, sanitizeForFirestore(user));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    throw error;
  }
}

export async function deleteUserFromFirestore(id: string) {
  try {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    throw error;
  }
}

export async function saveMetadataToFirestore(meta: { customMaterials?: string[]; customCities?: string[] }) {
  try {
    const docRef = doc(db, 'system_metadata', 'app_config');
    await setDoc(docRef, sanitizeForFirestore({ ...meta, updatedAt: new Date().toISOString() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system_metadata/app_config');
    throw error;
  }
}
