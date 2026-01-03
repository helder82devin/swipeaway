import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionStore } from '../store';
import { deletePhotos } from '../services/photoService';
import { COLORS } from '../constants';
import { useHaptics } from '../hooks/useHaptics';
import { RootStackParamList } from '../types/navigation';

type CompletionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Completion'>;
};

export function CompletionScreen({ navigation }: CompletionScreenProps) {
  const { session, getPhotosMarkedForDeletion, resetSession } = useSessionStore();
  const { triggerSuccess, triggerWarning, triggerMedium } = useHaptics();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    triggerSuccess();
  }, [scaleAnim, fadeAnim, checkmarkScale, triggerSuccess]);

  const photosToDelete = getPhotosMarkedForDeletion();
  const totalReviewed = session?.photos.length ?? 0;
  const deleteCount = photosToDelete.length;

  const handleConfirmDeletion = () => {
    triggerWarning();
    Alert.alert(
      'Confirm Deletion',
      `You chose to delete ${deleteCount} of ${totalReviewed} photos. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const photoIds = photosToDelete.map((p) => p.id);
            const success = await deletePhotos(photoIds);
            
            if (success) {
              triggerSuccess();
              Alert.alert(
                'Done',
                `${deleteCount} photo${deleteCount !== 1 ? 's' : ''} deleted successfully.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      resetSession();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Error', 'Failed to delete some photos. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReviewPhotos = () => {
    triggerMedium();
    navigation.navigate('ReviewDeletion');
  };

  const handleCancel = () => {
    triggerMedium();
    Alert.alert(
      'Cancel Session?',
      'No photos will be deleted. Return to home?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Go Home',
          onPress: () => {
            resetSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            { transform: [{ scale: checkmarkScale }] },
          ]}
        >
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.title}>Session Complete!</Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalReviewed}</Text>
            <Text style={styles.statLabel}>Photos Reviewed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.deleteNumber]}>
              {deleteCount}
            </Text>
            <Text style={styles.statLabel}>Marked for Deletion</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          {deleteCount > 0 ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleConfirmDeletion}
              >
                <Text style={styles.primaryButtonText}>
                  Delete {deleteCount} Photo{deleteCount !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReviewPhotos}
              >
                <Text style={styles.secondaryButtonText}>
                  Review Photos to Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noDeleteContainer}>
              <Text style={styles.noDeleteText}>
                No photos marked for deletion
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>
              {deleteCount > 0 ? 'Cancel & Keep All' : 'Done'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deleteNumber: {
    color: COLORS.danger,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.surface,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  noDeleteContainer: {
    marginBottom: 24,
  },
  noDeleteText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
