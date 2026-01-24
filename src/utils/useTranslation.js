import { useState, useEffect, useCallback } from 'react';
import { i18n } from './i18n';

// Create a simple event emitter for language changes
const languageListeners = new Set();

export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.getLanguage());
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    i18n.init();
    const savedLanguage = i18n.getLanguage();
    setLanguage(savedLanguage);

    // Listen for language changes
    const listener = () => {
      setLanguage(i18n.getLanguage());
      setUpdateKey(prev => prev + 1); // Force re-render
    };
    languageListeners.add(listener);

    return () => {
      languageListeners.delete(listener);
    };
  }, []);

  const t = useCallback((key) => {
    return i18n.t(key);
  }, [updateKey]); // Re-create when language changes

  const changeLanguage = async (lang) => {
    await i18n.setLanguage(lang);
    setLanguage(lang);
    setUpdateKey(prev => prev + 1);
    // Notify all listeners
    languageListeners.forEach(listener => listener());
  };

  return {
    t,
    language: i18n.getLanguage(),
    changeLanguage,
    availableLanguages: i18n.getAvailableLanguages(),
  };
};
