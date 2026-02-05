import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const BrandSplashScreen = () => {
  const theme = useTheme();
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);

  useEffect(() => {
    // Start animations
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });
    logoRotation.value = withDelay(400, withSpring(1, { damping: 10 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${(1 - logoRotation.value) * -45}deg` }
      ],
      opacity: opacity.value
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(600, withTiming(opacity.value, { duration: 500 })),
      transform: [
        { translateY: withDelay(600, withSpring(0 - (1 - opacity.value) * 20)) }
      ]
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: '#030712' }]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
          <MaterialCommunityIcons name="cart-variant" size={60} color="white" />
        </View>
        <Animated.View style={styles.forkSpoon}>
           <MaterialCommunityIcons name="silverware-fork-knife" size={30} color="white" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.titleContainer, textStyle]}>
        <Text style={styles.brandName}>CraveCart</Text>
        <Text style={styles.tagline}>Your Canteen, Just Faster.</Text>
      </Animated.View>
      
      <Animated.View 
        entering={FadeIn.delay(1200)}
        style={styles.loadingContainer}
      >
        <View style={styles.progressBar}>
           <Animated.View 
             style={[
               styles.progressFill, 
               { backgroundColor: '#4CAF50' }
             ]} 
           />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  forkSpoon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#030712',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  titleContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 50,
    width: '60%',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%',
    borderRadius: 2,
  }
});
