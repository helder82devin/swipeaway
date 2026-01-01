export interface Photo {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  modificationTime: number;
  width: number;
  height: number;
  location?: PhotoLocation;
  isFavorite: boolean;
}

export interface PhotoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface SessionPhoto extends Photo {
  decision?: 'keep' | 'delete';
}

export interface Session {
  id: string;
  photos: SessionPhoto[];
  currentIndex: number;
  startedAt: number;
  completedAt?: number;
}

export type SwipeDirection = 'left' | 'right';

export interface Settings {
  hapticFeedbackEnabled: boolean;
  excludeRecentPhotos: boolean;
  recentPhotosDays: number;
}

export interface FreemiumState {
  sessionsUsedToday: number;
  lastSessionDate: string;
  extraSessionsFromAds: number;
}
