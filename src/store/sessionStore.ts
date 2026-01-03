import { create } from 'zustand';
import { Session, SessionPhoto, Photo, SwipeDirection } from '../types';
import { SESSION_SIZE } from '../constants';

interface UndoState {
  previousIndex: number;
  previousDecision: 'keep' | 'delete' | undefined;
}

interface SessionState {
  session: Session | null;
  undoState: UndoState | null;
  canUndo: boolean;
  
  startSession: (photos: Photo[]) => void;
  makeDecision: (direction: SwipeDirection) => void;
  undo: () => void;
  endSession: () => void;
  resetSession: () => void;
  
  getCurrentPhoto: () => SessionPhoto | null;
  getPhotosMarkedForDeletion: () => SessionPhoto[];
  isSessionComplete: () => boolean;
  getProgress: () => { current: number; total: number };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  undoState: null,
  canUndo: false,

  startSession: (photos: Photo[]) => {
    const sessionPhotos: SessionPhoto[] = photos.slice(0, SESSION_SIZE).map((photo) => ({
      ...photo,
      decision: undefined,
    }));

    const session: Session = {
      id: Date.now().toString(),
      photos: sessionPhotos,
      currentIndex: 0,
      startedAt: Date.now(),
    };

    set({ session, undoState: null, canUndo: false });
  },

  makeDecision: (direction: SwipeDirection) => {
    const { session } = get();
    if (!session) return;

    const decision: 'keep' | 'delete' = direction === 'right' ? 'keep' : 'delete';
    const currentIndex = session.currentIndex;
    const currentPhoto = session.photos[currentIndex];

    const undoState: UndoState = {
      previousIndex: currentIndex,
      previousDecision: currentPhoto.decision,
    };

    const updatedPhotos = [...session.photos];
    updatedPhotos[currentIndex] = {
      ...updatedPhotos[currentIndex],
      decision,
    };

    const newIndex = currentIndex + 1;
    const isComplete = newIndex >= session.photos.length;

    set({
      session: {
        ...session,
        photos: updatedPhotos,
        currentIndex: newIndex,
        completedAt: isComplete ? Date.now() : undefined,
      },
      undoState,
      canUndo: true,
    });
  },

  undo: () => {
    const { session, undoState, canUndo } = get();
    if (!session || !undoState || !canUndo) return;

    const updatedPhotos = [...session.photos];
    updatedPhotos[undoState.previousIndex] = {
      ...updatedPhotos[undoState.previousIndex],
      decision: undoState.previousDecision,
    };

    set({
      session: {
        ...session,
        photos: updatedPhotos,
        currentIndex: undoState.previousIndex,
        completedAt: undefined,
      },
      undoState: null,
      canUndo: false,
    });
  },

  endSession: () => {
    const { session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        completedAt: Date.now(),
      },
    });
  },

  resetSession: () => {
    set({ session: null, undoState: null, canUndo: false });
  },

  getCurrentPhoto: () => {
    const { session } = get();
    if (!session || session.currentIndex >= session.photos.length) {
      return null;
    }
    return session.photos[session.currentIndex];
  },

  getPhotosMarkedForDeletion: () => {
    const { session } = get();
    if (!session) return [];
    return session.photos.filter((photo) => photo.decision === 'delete');
  },

  isSessionComplete: () => {
    const { session } = get();
    if (!session) return false;
    return session.currentIndex >= session.photos.length;
  },

  getProgress: () => {
    const { session } = get();
    if (!session) return { current: 0, total: 0 };
    return {
      current: Math.min(session.currentIndex + 1, session.photos.length),
      total: session.photos.length,
    };
  },
}));
