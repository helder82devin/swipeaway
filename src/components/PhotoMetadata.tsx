import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SessionPhoto } from '../types';
import { COLORS } from '../constants';
import { enrichPhotoLocation } from '../services/locationService';

interface PhotoMetadataProps {
  photo: SessionPhoto;
}

export function PhotoMetadata({ photo }: PhotoMetadataProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [locationText, setLocationText] = useState<string | null>(null);
  const opacity = useSharedValue(1);

  useEffect(() => {
    async function loadLocation() {
      if (photo.location) {
        try {
          const enriched = await enrichPhotoLocation(photo.location);
          if (enriched.city || enriched.country) {
            const parts = [enriched.city, enriched.country].filter(Boolean);
            setLocationText(parts.join(', '));
          }
        } catch (error) {
          console.error('Error loading location:', error);
        }
      } else {
        setLocationText(null);
      }
    }
    loadLocation();
  }, [photo.location]);

  const toggleVisibility = () => {
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    opacity.value = withTiming(newVisible ? 1 : 0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleVisibility}
      activeOpacity={1}
    >
      <Animated.View style={[styles.metadataContainer, animatedStyle]}>
        <View style={styles.overlay}>
          <Text style={styles.dateText}>{formatDate(photo.creationTime)}</Text>
          {locationText && (
            <Text style={styles.locationText}>{locationText}</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  metadataContainer: {
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});
