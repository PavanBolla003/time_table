import { AppState } from './types';
import { DEFAULT_SUBJECTS } from './constants';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const STORAGE_KEY = 'studiflow_app_state';

const initialState: AppState = {
  user: {
    id: 'user_1',
    name: 'Student Pro',
    email: 'hello@studiflow.com',
    dailyGoalHours: 6,
  },
  subjects: DEFAULT_SUBJECTS,
  schedules: [],
  logs: [],
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialState;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialState;
  }
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveRemoteState = async (userId: string, state: AppState) => {
  try {
    await setDoc(doc(db, "users", userId), state);
  } catch (e) {
    console.error("Error saving to Firestore", e);
  }
};

export const loadRemoteState = async (userId: string): Promise<AppState | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppState;
    }
  } catch (e) {
    console.error("Error loading from Firestore", e);
  }
  return null;
};

export const subscribeToRemoteState = (userId: string, callback: (state: AppState) => void): Unsubscribe => {
  const docRef = doc(db, "users", userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppState);
    }
  }, (error) => {
    console.error("Error subscribing to Firestore", error);
  });
};
