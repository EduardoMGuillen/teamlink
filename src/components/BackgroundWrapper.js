import React, { useMemo, useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { backgroundService } from '../services/backgroundService';
import { colors } from '../utils/theme';

export default function BackgroundWrapper({ children }) {
  const { selectedBackground } = useAppState();
  const [imageError, setImageError] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const background = useMemo(() => {
    const bg = backgroundService.getBackgroundById(selectedBackground);
    console.log('[BackgroundWrapper] Selected background:', selectedBackground, 'Background object:', bg);
    return bg;
  }, [selectedBackground, forceUpdate]);

  // Reset error state and force update when background changes
  useEffect(() => {
    console.log('[BackgroundWrapper] Background changed to:', selectedBackground);
    setImageError(false);
    setForceUpdate(prev => prev + 1);
  }, [selectedBackground]);

  const handleImageError = (error) => {
    console.error('[BackgroundWrapper] Image load error:', error);
    console.error('[BackgroundWrapper] Failed to load image for background:', selectedBackground);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('[BackgroundWrapper] Image loaded successfully for background:', selectedBackground);
    setImageError(false);
  };

  // Default background
  if (background.id === 'default' || !background.path) {
    return (
      <View style={styles.defaultContainer} key={`default-${selectedBackground}-${forceUpdate}`}>
        {children}
      </View>
    );
  }

  // Custom background with error fallback
  if (imageError) {
    console.warn('[BackgroundWrapper] Image error, falling back to default');
    return (
      <View style={styles.defaultContainer} key={`error-${selectedBackground}-${forceUpdate}`}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.backgroundContainer} key={`bg-container-${selectedBackground}-${forceUpdate}`}>
      <Image
        key={`bg-image-${selectedBackground}-${forceUpdate}`}
        source={background.path}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      minHeight: '100vh',
      minWidth: '100vw',
      zIndex: -1,
    }),
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 1,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      objectFit: 'cover',
      zIndex: -1,
    }),
  },
  overlay: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
});
