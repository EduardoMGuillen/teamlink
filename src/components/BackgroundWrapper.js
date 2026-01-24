import React, { useMemo, useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { backgroundService } from '../services/backgroundService';
import { colors } from '../utils/theme';

export default function BackgroundWrapper({ children }) {
  const { selectedBackground } = useAppState();
  const [imageError, setImageError] = useState(false);
  
  const background = useMemo(() => {
    const bg = backgroundService.getBackgroundById(selectedBackground);
    console.log('[BackgroundWrapper] Selected background:', selectedBackground, 'Background object:', bg);
    return bg;
  }, [selectedBackground]);

  // Reset error state when background changes
  useEffect(() => {
    setImageError(false);
  }, [selectedBackground]);

  const handleImageError = (error) => {
    console.error('[BackgroundWrapper] Image load error:', error);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('[BackgroundWrapper] Image loaded successfully');
    setImageError(false);
  };

  if (background.id === 'default' || !background.path || imageError) {
    return (
      <View style={styles.defaultContainer} key={`default-${selectedBackground}`}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.backgroundContainer} key={`bg-container-${selectedBackground}`}>
      <Image
        key={`bg-image-${selectedBackground}`}
        source={background.path}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 1,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
