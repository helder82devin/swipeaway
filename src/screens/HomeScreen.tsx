import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SESSION_SIZE, FREE_SESSIONS_PER_DAY } from '../constants';
import { useFreemiumStore, useSettingsStore } from '../store';
import { requestPermissions, getPermissionStatus } from '../services/photoService';
import { useHaptics } from '../hooks/useHaptics';
import { RootStackParamList } from '../types/navigation';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { triggerMedium } = useHaptics();
  
  const {
    isLoaded: freemiumLoaded,
    loadState: loadFreemiumState,
    canStartSession,
    getRemainingFreeSessions,
    watchAd,
  } = useFreemiumStore();
  
  const { isLoaded: settingsLoaded, loadSettings } = useSettingsStore();

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      
      const permissionStatus = await getPermissionStatus();
      setHasPermission(permissionStatus);
      
      await Promise.all([loadFreemiumState(), loadSettings()]);
      
      setIsLoading(false);
    }
    
    initialize();
  }, [loadFreemiumState, loadSettings]);

  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    setHasPermission(granted);
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Swipe Away needs access to your photo library to help you clean up photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStartSession = () => {
    if (!canStartSession()) {
      return;
    }
    triggerMedium();
    navigation.navigate('Session');
  };

  const handleWatchAd = async () => {
    triggerMedium();
    Alert.alert(
      'Watch Ad',
      'This is a mock ad. In the full version, watching an ad would unlock an extra session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch Ad',
          onPress: async () => {
            await watchAd();
            Alert.alert('Success', 'You earned 1 extra session!');
          },
        },
      ]
    );
  };

  const handleOpenSettings = () => {
    triggerMedium();
    navigation.navigate('Settings');
  };

  if (isLoading || !freemiumLoaded || !settingsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Swipe Away</Text>
          <Text style={styles.subtitle}>
            We need access to your photo library to help you clean up photos.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.primaryButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const remainingSessions = getRemainingFreeSessions();
  const canStart = canStartSession();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Swipe Away</Text>
        <Text style={styles.subtitle}>
          Review {SESSION_SIZE} random photos and decide what to keep or delete.
        </Text>
        
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionInfoText}>
            {remainingSessions} session{remainingSessions !== 1 ? 's' : ''} remaining today
          </Text>
          <Text style={styles.sessionInfoSubtext}>
            {FREE_SESSIONS_PER_DAY} free sessions per day
          </Text>
        </View>

        {canStart ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartSession}
          >
            <Text style={styles.primaryButtonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.limitReachedContainer}>
            <Text style={styles.limitReachedText}>
              Daily limit reached
            </Text>
            <TouchableOpacity
              style={styles.adButton}
              onPress={handleWatchAd}
            >
              <Text style={styles.adButtonText}>Watch Ad for Extra Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sessionInfoText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
  sessionInfoSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  limitReachedContainer: {
    alignItems: 'center',
  },
  limitReachedText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  adButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  adButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
