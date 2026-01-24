import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUNDS_KEY = '@teamlink_background_preference';

// Lista de backgrounds disponibles
export const AVAILABLE_BACKGROUNDS = [
  { id: 'default', name: 'Default', path: null },
  { id: '1', name: 'Background 1', path: require('../../bgs/1.jpeg') },
  { id: '2', name: 'Background 2', path: require('../../bgs/2.webp') },
  { id: '3', name: 'Background 3', path: require('../../bgs/3.webp') },
  { id: '4', name: 'Background 4', path: require('../../bgs/4.jpg') },
  { id: '5', name: 'Background 5', path: require('../../bgs/5.jpg') },
  { id: '6', name: 'Background 6', path: require('../../bgs/6.jpg') },
  { id: '8', name: 'Background 8', path: require('../../bgs/8.jpeg') },
];

export const backgroundService = {
  // Obtener el background seleccionado
  async getSelectedBackground() {
    try {
      const stored = await AsyncStorage.getItem(BACKGROUNDS_KEY);
      if (stored) {
        return stored;
      }
      return 'default'; // Por defecto
    } catch (error) {
      console.error('Error loading background preference:', error);
      return 'default';
    }
  },

  // Guardar el background seleccionado
  async saveSelectedBackground(backgroundId) {
    try {
      await AsyncStorage.setItem(BACKGROUNDS_KEY, backgroundId);
      return { success: true };
    } catch (error) {
      console.error('Error saving background preference:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener el objeto de background por ID
  getBackgroundById(id) {
    return AVAILABLE_BACKGROUNDS.find(bg => bg.id === id) || AVAILABLE_BACKGROUNDS[0];
  },

  // Obtener todos los backgrounds disponibles
  getAllBackgrounds() {
    return AVAILABLE_BACKGROUNDS;
  },
};
