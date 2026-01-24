import React, { useMemo, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Image } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { backgroundService } from '../services/backgroundService';
import { colors } from '../utils/theme';

export default function BackgroundWrapper({ children }) {
  const { selectedBackground } = useAppState();
  
  const background = useMemo(() => {
    const bg = backgroundService.getBackgroundById(selectedBackground);
    console.log('BackgroundWrapper - Selected:', selectedBackground, 'Background:', bg.id, 'Has path:', !!bg.path);
    return bg;
  }, [selectedBackground]);

  useEffect(() => {
    console.log('BackgroundWrapper - Background changed to:', selectedBackground);
  }, [selectedBackground]);

  if (background.id === 'default' || !background.path) {
    return (
      <View style={styles.defaultContainer}>
        {children}
      </View>
    );
  }

  console.log('BackgroundWrapper - Rendering background:', background.id, 'Path type:', typeof background.path, 'Path value:', background.path);

  return (
    <View style={styles.backgroundContainer}>
      <Image
        key={`bg-${selectedBackground}`}
        source={background.path}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => {
          console.error('BackgroundWrapper - Image load error:', error);
        }}
        onLoad={() => {
          console.log('BackgroundWrapper - Image loaded successfully');
        }}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
    zIndex: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
