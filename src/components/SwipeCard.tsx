import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SessionPhoto, SwipeDirection } from '../types';
import { COLORS, SWIPE_THRESHOLD, SWIPE_VELOCITY_THRESHOLD, ANIMATION } from '../constants';
import { useHaptics } from '../hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT;

interface SwipeCardProps {
  photo: SessionPhoto;
  onSwipe: (direction: SwipeDirection) => void;
}

export function SwipeCard({ photo, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const { triggerMedium, triggerLight } = useHaptics();

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      triggerMedium();
      onSwipe(direction);
    },
    [onSwipe, triggerMedium]
  );

  const resetPosition = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, ANIMATION.spring);
    translateY.value = withSpring(0, ANIMATION.spring);
    rotation.value = withSpring(0, ANIMATION.spring);
    scale.value = withSpring(1, ANIMATION.spring);
  }, [translateX, translateY, rotation, scale]);

  const animateOut = useCallback(
    (direction: SwipeDirection) => {
      'worklet';
      const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      const targetRotation = direction === 'right' ? 30 : -30;

      translateX.value = withTiming(targetX, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(handleSwipeComplete)(direction);
        }
      });
      rotation.value = withTiming(targetRotation, { duration: 300 });
    },
    [translateX, rotation, handleSwipeComplete]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.02, ANIMATION.spring);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldSwipeRight =
        event.translationX > SWIPE_THRESHOLD ||
        event.velocityX > SWIPE_VELOCITY_THRESHOLD;
      const shouldSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD ||
        event.velocityX < -SWIPE_VELOCITY_THRESHOLD;

      if (shouldSwipeRight) {
        animateOut('right');
      } else if (shouldSwipeLeft) {
        animateOut('left');
      } else {
        resetPosition();
        runOnJS(triggerLight)();
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const keepIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const deleteIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <Animated.View style={[styles.indicator, styles.keepIndicator, keepIndicatorStyle]}>
          <Text style={styles.indicatorText}>KEEP</Text>
        </Animated.View>
        
        <Animated.View style={[styles.indicator, styles.deleteIndicator, deleteIndicatorStyle]}>
          <Text style={styles.indicatorText}>DELETE</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    backgroundColor: COLORS.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    top: 80,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  keepIndicator: {
    right: 20,
    borderColor: COLORS.success,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  deleteIndicator: {
    left: 20,
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
