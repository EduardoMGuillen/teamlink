import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { motivationService } from '../services/motivationService';
import { colors, radii, shadows } from '../utils/theme';

export default function DailyMotivation() {
  const [quote, setQuote] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [showSpark, setShowSpark] = useState(true);

  useEffect(() => {
    loadMotivation();
  }, []);

  const loadMotivation = async () => {
    try {
      const dailyQuote = motivationService.getDailyQuote();
      const prefs = await motivationService.getPreferences();
      
      setQuote(dailyQuote);
      setPreferences(prefs);
      setShowSpark(prefs.showSpark !== false);
    } catch (error) {
      console.error('Error loading motivation:', error);
    }
  };

  const toggleSpark = async () => {
    const newShowSpark = !showSpark;
    setShowSpark(newShowSpark);
    
    if (preferences) {
      const updatedPrefs = { ...preferences, showSpark: newShowSpark };
      await motivationService.savePreferences(updatedPrefs);
      setPreferences(updatedPrefs);
    }
  };

  if (!quote || !preferences || !preferences.enabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showSpark && (
          <TouchableOpacity 
            onPress={toggleSpark}
            style={styles.sparkIcon}
            activeOpacity={0.7}
          >
            <View style={styles.sparkContainer}>
              <Image 
                source={require('../../spark.png')} 
                style={styles.sparkImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.quote}>{quote.quote}</Text>
          {!showSpark && (
            <TouchableOpacity onPress={toggleSpark} style={styles.showSparkButton}>
              <Ionicons name="bulb-outline" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
  },
  sparkContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  sparkImage: {
    width: 40,
    height: 40,
  },
  sparkIcon: {
    // TouchableOpacity wrapper
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quote: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  showSparkButton: {
    padding: 8,
    marginLeft: 8,
  },
});
