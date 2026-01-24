import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../utils/i18n';
import { authService } from '../services/authService';
import { backgroundService } from '../services/backgroundService';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('en');
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize i18n
      await i18n.init();
      const savedLanguage = i18n.getLanguage();
      setLanguage(savedLanguage);

      // Load background preference
      const savedBackground = await backgroundService.getSelectedBackground();
      setSelectedBackground(savedBackground);

      // Check if user is already logged in (Supabase session)
      const session = await authService.getSession();
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No active session: ensure we don't keep stale auth state
        setCurrentUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@teamlink_user');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        // También guardar en AsyncStorage como backup
        await AsyncStorage.setItem('@teamlink_user', JSON.stringify(result.user));
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('@teamlink_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setCurrentUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('@teamlink_user');
    }
  };

  const changeLanguage = async (lang) => {
    await i18n.setLanguage(lang);
    setLanguage(lang);
  };

  const changeBackground = async (backgroundId) => {
    console.log('[AppStateContext] Changing background to:', backgroundId);
    const result = await backgroundService.saveSelectedBackground(backgroundId);
    if (result.success) {
      console.log('[AppStateContext] Background saved successfully, updating state');
      setSelectedBackground(backgroundId);
    } else {
      console.error('[AppStateContext] Failed to save background:', result.error);
    }
    return result;
  };

  return (
    <AppStateContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setCurrentUser,
        notifications,
        setNotifications,
        login,
        logout,
        language,
        changeLanguage,
        selectedBackground,
        changeBackground,
        isLoading,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

