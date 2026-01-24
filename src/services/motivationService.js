import AsyncStorage from '@react-native-async-storage/async-storage';

// Base de datos de frases motivacionales organizadas por categoría
const MOTIVATIONAL_QUOTES = {
  progress: [
    'El progreso pequeño de hoy impulsa al equipo completo.',
    'Cada paso cuenta, sin importar lo pequeño que parezca.',
    'El avance constante supera los grandes saltos ocasionales.',
    'Hoy avanzaste. Eso es suficiente.',
    'Los pequeños logros se suman en grandes resultados.',
  ],
  focus: [
    'Enfócate en una tarea. El impulso llegará.',
    'La claridad viene de hacer una cosa a la vez.',
    'La atención plena transforma el trabajo.',
    'Un paso a la vez es la forma más rápida.',
    'La concentración es tu superpoder.',
  ],
  consistency: [
    'La consistencia supera a la intensidad.',
    'Las rutinas pequeñas crean grandes cambios.',
    'Hoy es otro día para mantener el ritmo.',
    'La disciplina diaria construye el éxito.',
    'La regularidad es más poderosa que la perfección.',
  ],
  teamwork: [
    'Juntos logramos más de lo que imaginamos.',
    'Tu contribución hace la diferencia en el equipo.',
    'La colaboración multiplica los resultados.',
    'Cada miembro del equipo importa.',
    'El trabajo en equipo convierte desafíos en oportunidades.',
  ],
  growth: [
    'Cada desafío es una oportunidad de crecer.',
    'El aprendizaje continuo es tu ventaja.',
    'Los errores son lecciones disfrazadas.',
    'Tu potencial se expande con cada intento.',
    'El crecimiento personal beneficia a todo el equipo.',
  ],
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
    return Object.keys(MOTIVATIONAL_QUOTES);
  },

  // Obtener todas las frases (útil para historial futuro)
  getAllQuotes() {
    return MOTIVATIONAL_QUOTES;
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
