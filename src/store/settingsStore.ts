import { create } from 'zustand';
import { Settings } from '../types';
import { loadSettings, saveSettings } from '../services/storageService';
import { RECENT_PHOTOS_DAYS } from '../constants';

interface SettingsState extends Settings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setHapticFeedback: (enabled: boolean) => Promise<void>;
  setExcludeRecentPhotos: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hapticFeedbackEnabled: true,
  excludeRecentPhotos: true,
  recentPhotosDays: RECENT_PHOTOS_DAYS,
  isLoaded: false,

  loadSettings: async () => {
    const settings = await loadSettings();
    set({ ...settings, isLoaded: true });
  },

  setHapticFeedback: async (enabled: boolean) => {
    set({ hapticFeedbackEnabled: enabled });
    const { hapticFeedbackEnabled, excludeRecentPhotos, recentPhotosDays } = get();
    await saveSettings({ hapticFeedbackEnabled: enabled, excludeRecentPhotos, recentPhotosDays });
  },

  setExcludeRecentPhotos: async (enabled: boolean) => {
    set({ excludeRecentPhotos: enabled });
    const { hapticFeedbackEnabled, excludeRecentPhotos, recentPhotosDays } = get();
    await saveSettings({ hapticFeedbackEnabled, excludeRecentPhotos: enabled, recentPhotosDays });
  },
}));
