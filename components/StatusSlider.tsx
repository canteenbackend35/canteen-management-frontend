import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface StatusSliderProps {
  onComplete: () => void;
  title: string;
  color: string;
  containerStyle?: ViewStyle;
}

const SLIDER_HEIGHT = 50;
const BUTTON_SIZE = 42;
const PADDING = 4;

export const StatusSlider = memo(({ onComplete, title, color, containerStyle }: StatusSliderProps) => {
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const isFinished = useSharedValue(false);

  const containerWidth = useSharedValue(0);
  const maxTranslate = useDerivedValue(() => {
    return Math.max(0, containerWidth.value - BUTTON_SIZE - PADDING * 2);
  });

  const gesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      if (isFinished.value) return;
      const newVal = contextX.value + event.translationX;
      translateX.value = Math.min(Math.max(0, newVal), maxTranslate.value);
    })
    .onEnd(() => {
      if (isFinished.value) return;
      if (translateX.value > maxTranslate.value * 0.8) {
        translateX.value = withSpring(maxTranslate.value);
        isFinished.value = true;
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(onComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, maxTranslate.value * 0.5], [1, 0], Extrapolate.CLAMP),
    transform: [
        { translateX: interpolate(translateX.value, [0, maxTranslate.value], [0, 20], Extrapolate.CLAMP) }
    ]
  }));

  return (
    <View 
        style={[styles.container, { backgroundColor: color + '15', borderColor: color + '30' }, containerStyle]}
        onLayout={(e) => {
            containerWidth.value = e.nativeEvent.layout.width;
        }}
    >
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={[styles.title, { color }]}>{title}</Text>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.button, { backgroundColor: color }, buttonStyle]}>
          <MaterialCommunityIcons name="chevron-double-right" size={24} color="white" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    borderWidth: 1,
    padding: PADDING,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: BUTTON_SIZE,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
