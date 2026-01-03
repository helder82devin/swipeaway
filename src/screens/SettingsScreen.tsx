import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettingsStore } from '../store';
import { COLORS } from '../constants';
import { useHaptics } from '../hooks/useHaptics';
import { RootStackParamList } from '../types/navigation';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const {
    hapticFeedbackEnabled,
    excludeRecentPhotos,
    setHapticFeedback,
    setExcludeRecentPhotos,
  } = useSettingsStore();
  
  const { triggerLight } = useHaptics();

  const handleHapticToggle = async (value: boolean) => {
    if (hapticFeedbackEnabled) {
      triggerLight();
    }
    await setHapticFeedback(value);
  };

  const handleExcludeRecentToggle = async (value: boolean) => {
    triggerLight();
    await setExcludeRecentPhotos(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibrate on swipe actions
              </Text>
            </View>
            <Switch
              value={hapticFeedbackEnabled}
              onValueChange={handleHapticToggle}
              trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Selection</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Exclude Recent Photos</Text>
              <Text style={styles.settingDescription}>
                Skip photos from the last 7 days
              </Text>
            </View>
            <Switch
              value={excludeRecentPhotos}
              onValueChange={handleExcludeRecentToggle}
              trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Swipe Away</Text>
          <Text style={styles.infoText}>
            Swipe Away helps you quickly clean up your photo library by reviewing
            photos in short sessions. Swipe right to keep, left to delete.
          </Text>
          <Text style={styles.infoText}>
            Favorites are always protected and never shown in sessions.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});
