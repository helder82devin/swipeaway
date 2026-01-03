import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SwipeCard, PhotoMetadata, ProgressIndicator, UndoButton } from '../components';
import { useSessionStore, useFreemiumStore, useSettingsStore } from '../store';
import { fetchEligiblePhotos, selectRandomPhotos } from '../services/photoService';
import { COLORS } from '../constants';
import { SwipeDirection } from '../types';
import { RootStackParamList } from '../types/navigation';

type SessionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Session'>;
};

export function SessionScreen({ navigation }: SessionScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    session,
    startSession,
    makeDecision,
    undo,
    canUndo,
    getCurrentPhoto,
    isSessionComplete,
    getProgress,
  } = useSessionStore();
  
  const { useSession } = useFreemiumStore();
  const { excludeRecentPhotos, recentPhotosDays } = useSettingsStore();

  useEffect(() => {
    async function initializeSession() {
      setIsLoading(true);
      setError(null);
      
      try {
        const canUse = await useSession();
        if (!canUse) {
          setError('No sessions remaining today');
          return;
        }

        const eligiblePhotos = await fetchEligiblePhotos(
          excludeRecentPhotos,
          recentPhotosDays
        );
        
        if (eligiblePhotos.length === 0) {
          setError('No eligible photos found. Try adjusting your settings.');
          return;
        }

        const sessionPhotos = selectRandomPhotos(eligiblePhotos);
        startSession(sessionPhotos);
      } catch (err) {
        console.error('Error initializing session:', err);
        setError('Failed to load photos. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, [excludeRecentPhotos, recentPhotosDays, startSession, useSession]);

  useEffect(() => {
    if (isSessionComplete() && session) {
      navigation.replace('Completion');
    }
  }, [isSessionComplete, session, navigation]);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      makeDecision(direction);
    },
    [makeDecision]
  );

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleGoBack = () => {
    Alert.alert(
      'End Session?',
      'Your progress will be lost if you leave now.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            useSessionStore.getState().resetSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPhoto = getCurrentPhoto();
  const progress = getProgress();

  if (!currentPhoto) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.cardContainer}>
        <SwipeCard
          key={currentPhoto.id}
          photo={currentPhoto}
          onSwipe={handleSwipe}
        />
        <PhotoMetadata photo={currentPhoto} />
      </View>
      
      <ProgressIndicator current={progress.current} total={progress.total} />
      
      <UndoButton onPress={handleUndo} disabled={!canUndo} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
  },
});
