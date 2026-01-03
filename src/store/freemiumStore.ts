import { create } from 'zustand';
import { FreemiumState } from '../types';
import { loadFreemiumState, saveFreemiumState } from '../services/storageService';
import { FREE_SESSIONS_PER_DAY } from '../constants';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

interface FreemiumStore extends FreemiumState {
  isLoaded: boolean;
  loadState: () => Promise<void>;
  useSession: () => Promise<boolean>;
  watchAd: () => Promise<void>;
  canStartSession: () => boolean;
  getRemainingFreeSessions: () => number;
}

export const useFreemiumStore = create<FreemiumStore>((set, get) => ({
  sessionsUsedToday: 0,
  lastSessionDate: '',
  extraSessionsFromAds: 0,
  isLoaded: false,

  loadState: async () => {
    const state = await loadFreemiumState();
    const today = getTodayString();
    
    if (state.lastSessionDate !== today) {
      const resetState: FreemiumState = {
        sessionsUsedToday: 0,
        lastSessionDate: today,
        extraSessionsFromAds: 0,
      };
      await saveFreemiumState(resetState);
      set({ ...resetState, isLoaded: true });
    } else {
      set({ ...state, isLoaded: true });
    }
  },

  useSession: async () => {
    const { canStartSession, sessionsUsedToday, extraSessionsFromAds } = get();
    
    if (!canStartSession()) {
      return false;
    }

    const today = getTodayString();
    const totalAvailable = FREE_SESSIONS_PER_DAY + extraSessionsFromAds;
    
    let newSessionsUsed = sessionsUsedToday + 1;
    let newExtraSessions = extraSessionsFromAds;
    
    if (newSessionsUsed > FREE_SESSIONS_PER_DAY) {
      newExtraSessions = Math.max(0, extraSessionsFromAds - 1);
    }

    const newState: FreemiumState = {
      sessionsUsedToday: newSessionsUsed,
      lastSessionDate: today,
      extraSessionsFromAds: newExtraSessions,
    };

    await saveFreemiumState(newState);
    set(newState);
    return true;
  },

  watchAd: async () => {
    const { extraSessionsFromAds, lastSessionDate } = get();
    const today = getTodayString();
    
    const newState: FreemiumState = {
      sessionsUsedToday: get().sessionsUsedToday,
      lastSessionDate: today,
      extraSessionsFromAds: extraSessionsFromAds + 1,
    };

    await saveFreemiumState(newState);
    set(newState);
  },

  canStartSession: () => {
    const { sessionsUsedToday, extraSessionsFromAds } = get();
    const totalAvailable = FREE_SESSIONS_PER_DAY + extraSessionsFromAds;
    return sessionsUsedToday < totalAvailable;
  },

  getRemainingFreeSessions: () => {
    const { sessionsUsedToday, extraSessionsFromAds } = get();
    const totalAvailable = FREE_SESSIONS_PER_DAY + extraSessionsFromAds;
    return Math.max(0, totalAvailable - sessionsUsedToday);
  },
}));
