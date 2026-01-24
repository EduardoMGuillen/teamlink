import React, { useMemo } from 'react';
import { View, ImageBackground, StyleSheet, Platform } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { backgroundService } from '../services/backgroundService';
import { colors } from '../utils/theme';

export default function BackgroundWrapper({ children }) {
  const { selectedBackground } = useAppState();
  
  const background = useMemo(() => {
    return backgroundService.getBackgroundById(selectedBackground);
  }, [selectedBackground]);

  if (background.id === 'default' || !background.path) {
    return (
      <View style={styles.defaultContainer}>
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      key={`bg-${selectedBackground}`}
      source={background.path}
      style={styles.backgroundContainer}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
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
  },
  backgroundImage: {
    opacity: 1, // Imagen completamente visible
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', // Sin overlay para ver el background claramente
  },
});
