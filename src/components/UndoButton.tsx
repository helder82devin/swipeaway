import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants';
import { useHaptics } from '../hooks/useHaptics';

interface UndoButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function UndoButton({ onPress, disabled }: UndoButtonProps) {
  const scale = useSharedValue(1);
  const { triggerLight } = useHaptics();

  const handlePress = () => {
    if (disabled) return;
    
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    triggerLight();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, disabled && styles.iconDisabled]}>↩</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.cardBackground,
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
    color: COLORS.text,
  },
  iconDisabled: {
    color: COLORS.textSecondary,
  },
});
