import * as Haptics from 'expo-haptics';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text, useTheme } from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

export type OrderStatusType = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface MultiStepSliderProps {
  currentStatus: OrderStatusType;
  onStatusChange: (status: OrderStatusType) => void;
  containerStyle?: ViewStyle;
  compact?: boolean;
}

const STEPS: OrderStatusType[] = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

const STATUS_MAP: Record<string, number> = {
  'CONFIRMED': 0,
  'PREPARING': 1,
  'READY': 2,
  'DELIVERED': 3,
  'PENDING': 0,   // Fallback: If shown, stay at start
  'CANCELLED': 0, // Fallback
};

const STEP_LABELS: Record<string, string> = {
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREP',
  READY: 'READY',
  DELIVERED: 'VERIFY',
};

export const MultiStepSlider = memo(({ currentStatus, onStatusChange, containerStyle, compact = false }: MultiStepSliderProps) => {
  const theme = useTheme();
  
  // Robust status normalization: Trim whitespace and handle case sensitivity
  const normalizedStatus = (currentStatus || '').trim().toUpperCase();
  
  // Use map for safe indexing; fallback to 0 (NEW) only if completely unknown
  const normalizedIndex = useMemo(() => {
    if (normalizedStatus in STATUS_MAP) {
      return STATUS_MAP[normalizedStatus];
    }
    console.warn(`[MultiStepSlider] Received unknown status: "${currentStatus}"`);
    return 0;
  }, [normalizedStatus, currentStatus]);

  const HEIGHT = compact ? 40 : 64;
  const THUMB_SIZE = compact ? 32 : 48;
  const TRACK_HEIGHT = compact ? 8 : 12;

  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const stepWidth = useDerivedValue(() => {
    if (containerWidth.value === 0) return 0;
    return (containerWidth.value - THUMB_SIZE) / (STEPS.length - 1);
  });

  // Sync initial and external status changes
  React.useEffect(() => {
    if (stepWidth.value > 0) {
      const targetPos = normalizedIndex * stepWidth.value;
      translateX.value = withSpring(targetPos, { damping: 20 });
    }
  }, [normalizedIndex, stepWidth.value]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newVal = contextX.value + event.translationX;
      const min = normalizedIndex * stepWidth.value; // Prevent going back
      const max = (STEPS.length - 1) * stepWidth.value;
      translateX.value = Math.min(Math.max(min, newVal), max || 0);
    })
    .onEnd(() => {
        if (stepWidth.value === 0) return;
      const index = Math.round(translateX.value / stepWidth.value);
      
      // Safety: only allow selection of current or future index
      const safeIndex = Math.max(normalizedIndex, index);
      const targetX = safeIndex * stepWidth.value;
      translateX.value = withSpring(targetX);
      
      if (safeIndex !== normalizedIndex) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(onStatusChange)(STEPS[safeIndex]);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }));

  return (
    <View 
      style={[styles.container, { height: HEIGHT + (compact ? 12 : 16) }, containerStyle]}
      onLayout={(e) => {
        containerWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <View style={[styles.track, { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, backgroundColor: theme.colors.surfaceVariant }]}>
        <Animated.View style={[styles.progress, progressStyle, { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, backgroundColor: theme.colors.primary }]} />
        
        {STEPS.map((_, i) => {
          const dotAnimatedStyle = useAnimatedStyle(() => {
            const widthValue = containerWidth.value;
            const stepValue = stepWidth.value;
            const leftPos = i * (widthValue > 0 ? stepValue : 0) + THUMB_SIZE / 2 - (compact ? 3 : 4);
            return {
              left: leftPos,
            };
          });

          return (
            <Animated.View 
              key={i} 
              style={[
                styles.stepDot, 
                { 
                  width: compact ? 6 : 8,
                  height: compact ? 6 : 8,
                  borderRadius: compact ? 3 : 4,
                  backgroundColor: normalizedIndex >= i ? 'white' : theme.colors.outlineVariant
                },
                dotAnimatedStyle
              ]} 
            />
          );
        })}
      </View>

      <View style={styles.labelsContainer}>
        {STEPS.map((step, i) => (
          <Text 
            key={step} 
            numberOfLines={1}
            style={[
              styles.label, 
              { 
                fontSize: compact ? 8 : 10,
                color: normalizedIndex === i ? theme.colors.primary : theme.colors.onSurfaceVariant,
                fontWeight: normalizedIndex === i ? '900' : '600',
                opacity: normalizedIndex === i ? 1 : 0.6
              }
            ]}
          >
            {STEP_LABELS[step]}
          </Text>
        ))}
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[
            styles.thumb, 
            { 
                width: THUMB_SIZE, 
                height: THUMB_SIZE, 
                borderRadius: THUMB_SIZE / 2,
                top: (HEIGHT - THUMB_SIZE) / 2 - (compact ? 6 : 10),
                backgroundColor: theme.colors.primary,
            },
            thumbStyle,
        ]}>
          <View style={[styles.thumbInner, { width: compact ? 12 : 20, height: compact ? 12 : 20, borderRadius: compact ? 6 : 10 }]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.8,
  },
  stepDot: {
    position: 'absolute',
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  thumb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    // @ts-ignore
    boxShadow: '0px 3px 5px rgba(0,0,0,0.4)',
  },
  thumbInner: {
    backgroundColor: 'white',
    elevation: 2,
    // @ts-ignore
    boxShadow: '0px 1px 2px rgba(0,0,0,0.2)',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: 60,
    textAlign: 'center',
    fontSize: 9,
  },
});
