import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionStore } from '../store';
import { deletePhotos } from '../services/photoService';
import { COLORS } from '../constants';
import { useHaptics } from '../hooks/useHaptics';
import { SessionPhoto } from '../types';
import { RootStackParamList } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = (SCREEN_WIDTH - 60) / 3;

type ReviewDeletionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReviewDeletion'>;
};

export function ReviewDeletionScreen({ navigation }: ReviewDeletionScreenProps) {
  const { session, getPhotosMarkedForDeletion, resetSession } = useSessionStore();
  const { triggerMedium, triggerSuccess, triggerWarning } = useHaptics();
  
  const [selectedPhoto, setSelectedPhoto] = useState<SessionPhoto | null>(null);
  
  const photosToDelete = getPhotosMarkedForDeletion();

  const handlePhotoPress = (photo: SessionPhoto) => {
    triggerMedium();
    setSelectedPhoto(photo);
  };

  const handleClosePreview = () => {
    setSelectedPhoto(null);
  };

  const handleConfirmDeletion = () => {
    triggerWarning();
    Alert.alert(
      'Confirm Deletion',
      `Delete ${photosToDelete.length} photo${photosToDelete.length !== 1 ? 's' : ''}?`,
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
                `${photosToDelete.length} photo${photosToDelete.length !== 1 ? 's' : ''} deleted successfully.`,
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

  const renderThumbnail = ({ item }: { item: SessionPhoto }) => (
    <TouchableOpacity
      style={styles.thumbnailContainer}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {photosToDelete.length} Photo{photosToDelete.length !== 1 ? 's' : ''} to Delete
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={photosToDelete}
        renderItem={renderThumbnail}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleConfirmDeletion}
        >
          <Text style={styles.deleteButtonText}>
            Delete All ({photosToDelete.length})
          </Text>
        </TouchableOpacity>
      </View>

      {selectedPhoto && (
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={handleClosePreview}
        >
          <Image
            source={{ uri: selectedPhoto.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <Text style={styles.previewHint}>Tap anywhere to close</Text>
        </TouchableOpacity>
      )}
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
  gridContainer: {
    padding: 20,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
});
