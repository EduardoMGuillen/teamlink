import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../utils/i18n';

// Función para obtener quotes traducidos según el idioma actual
const getTranslatedQuotes = () => {
  const lang = i18n.getLanguage();
  const quotes = [];
  for (let i = 1; i <= 25; i++) {
    const quoteKey = `sparkQuote${i}`;
    const quote = i18n.t(quoteKey);
    if (quote && quote !== quoteKey) {
      quotes.push(quote);
    }
  }
  return quotes;
};

// Base de datos de frases motivacionales organizadas por categoría (usando traducciones)
const getMOTIVATIONAL_QUOTES = () => {
  const allQuotes = getTranslatedQuotes();
  return {
    progress: allQuotes.slice(0, 5),
    focus: allQuotes.slice(5, 10),
    consistency: allQuotes.slice(10, 15),
    teamwork: allQuotes.slice(15, 20),
    growth: allQuotes.slice(20, 25),
  };
};

// Función determinística para obtener frase del día
// Usa la fecha como seed para garantizar la misma frase durante todo el día
export const getDailyMotivation = () => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Crear un hash simple de la fecha
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Obtener quotes traducidos según el idioma actual
  const MOTIVATIONAL_QUOTES = getMOTIVATIONAL_QUOTES();
  
  // Combinar todas las categorías
  const allQuotes = Object.values(MOTIVATIONAL_QUOTES).flat();
  
  // Usar el hash para seleccionar una frase
  const index = Math.abs(hash) % allQuotes.length;
  
  return {
    quote: allQuotes[index],
    category: Object.keys(MOTIVATIONAL_QUOTES).find(
      cat => MOTIVATIONAL_QUOTES[cat].includes(allQuotes[index])
    ),
    date: dateString,
  };
};

// Obtener frase de una categoría específica
export const getMotivationByCategory = (category) => {
  const MOTIVATIONAL_QUOTES = getMOTIVATIONAL_QUOTES();
  const quotes = MOTIVATIONAL_QUOTES[category] || [];
  if (quotes.length === 0) return null;
  
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
};

// Preferencias de usuario
const PREFERENCES_KEY = '@teamlink_motivation_preferences';

export const motivationService = {
  // Obtener frase del día
  getDailyQuote() {
    return getDailyMotivation();
  },

  // Obtener preferencias del usuario
  async getPreferences() {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Valores por defecto
      return {
        enabled: true,
        notificationsEnabled: false,
        notificationCount: 1, // 1-3 notificaciones por día
        preferredTimes: ['morning'], // 'morning', 'afternoon', 'evening'
        showSpark: true,
      };
    } catch (error) {
      console.error('Error loading motivation preferences:', error);
      return {
        enabled: true,
        notificationsEnabled: false,
        notificationCount: 1,
        preferredTimes: ['morning'],
        showSpark: true,
      };
    }
  },

  // Guardar preferencias
  async savePreferences(preferences) {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      return { success: true };
    } catch (error) {
      console.error('Error saving motivation preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener todas las categorías disponibles
  getCategories() {
    return Object.keys(getMOTIVATIONAL_QUOTES());
  },

  // Obtener todas las frases (útil para historial futuro)
  getAllQuotes() {
    return getMOTIVATIONAL_QUOTES();
  },

  // Calcular horarios de notificaciones basados en preferencias
  calculateNotificationTimes(preferences) {
    const { notificationCount, preferredTimes } = preferences;
    const times = [];
    
    // Rangos de horario
    const timeRanges = {
      morning: { start: 8, end: 11 },
      afternoon: { start: 13, end: 16 },
      evening: { start: 17, end: 20 },
    };
    
    preferredTimes.forEach((timeSlot) => {
      const range = timeRanges[timeSlot];
      if (!range) return;
      
      // Distribuir las notificaciones dentro del rango
      const interval = (range.end - range.start) / notificationCount;
      for (let i = 0; i < notificationCount; i++) {
        const hour = Math.floor(range.start + (interval * i) + (interval / 2));
        times.push(hour);
      }
    });
    
    return times.sort((a, b) => a - b);
  },
};
