import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { colors, radii, shadows } from '../utils/theme';
import { useAppState } from '../context/AppStateContext';
import { backgroundService, AVAILABLE_BACKGROUNDS } from '../services/backgroundService';

export default function BackgroundSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { selectedBackground, changeBackground } = useAppState();
  const [currentBackground, setCurrentBackground] = useState(selectedBackground);

  useEffect(() => {
    setCurrentBackground(selectedBackground);
  }, [selectedBackground]);

  const handleSelectBackground = async (backgroundId) => {
    setCurrentBackground(backgroundId);
    await changeBackground(backgroundId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Background</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="image" size={32} color={colors.primary} />
          <Text style={styles.infoTitle}>Choose Your Background</Text>
          <Text style={styles.infoText}>
            Select a background image to personalize your app experience. You can always change it later.
          </Text>
        </View>

        {/* Background Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Options</Text>
          <View style={styles.backgroundsGrid}>
            {AVAILABLE_BACKGROUNDS.map((bg) => (
              <TouchableOpacity
                key={bg.id}
                style={[
                  styles.backgroundCard,
                  currentBackground === bg.id && styles.backgroundCardSelected,
                ]}
                onPress={() => handleSelectBackground(bg.id)}
              >
                {bg.id === 'default' ? (
                  <View style={styles.defaultBackground}>
                    <Ionicons name="color-palette" size={32} color={colors.textMuted} />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <ImageBackground
                    source={bg.path}
                    style={styles.backgroundImage}
                    imageStyle={styles.backgroundImageStyle}
                  >
                    <View style={styles.backgroundOverlay} />
                  </ImageBackground>
                )}
                {currentBackground === bg.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                )}
                <Text style={styles.backgroundName}>{bg.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
    minHeight: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    ...shadows.soft,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  backgroundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  backgroundCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.soft,
    marginBottom: 8,
  },
  backgroundCardSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  defaultBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  defaultText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 8,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    borderRadius: radii.lg,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  backgroundName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
