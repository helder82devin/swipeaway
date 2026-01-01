import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, FreemiumState } from '../types';
import { RECENT_PHOTOS_DAYS } from '../constants';

const SETTINGS_KEY = '@swipeaway_settings';
const FREEMIUM_KEY = '@swipeaway_freemium';

const DEFAULT_SETTINGS: Settings = {
  hapticFeedbackEnabled: true,
  excludeRecentPhotos: true,
  recentPhotosDays: RECENT_PHOTOS_DAYS,
};

const DEFAULT_FREEMIUM: FreemiumState = {
  sessionsUsedToday: 0,
  lastSessionDate: '',
  extraSessionsFromAds: 0,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function loadFreemiumState(): Promise<FreemiumState> {
  try {
    const json = await AsyncStorage.getItem(FREEMIUM_KEY);
    if (json) {
      const state = { ...DEFAULT_FREEMIUM, ...JSON.parse(json) };
      const today = getTodayString();
      if (state.lastSessionDate !== today) {
        return {
          sessionsUsedToday: 0,
          lastSessionDate: today,
          extraSessionsFromAds: 0,
        };
      }
      return state;
    }
  } catch (error) {
    console.error('Error loading freemium state:', error);
  }
  return DEFAULT_FREEMIUM;
}

export async function saveFreemiumState(state: FreemiumState): Promise<void> {
  try {
    await AsyncStorage.setItem(FREEMIUM_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving freemium state:', error);
  }
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
