import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../utils/i18n';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';
import { DEFAULT_THEME_ID, getTheme } from '../utils/theme';

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
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME_ID);
  const [isLoading, setIsLoading] = useState(true);

  const withTimeout = async (promise, timeoutMs, fallbackValue = null) => {
    let timeoutId;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(fallbackValue), timeoutMs);
    });
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  };

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await withTimeout(authService.getCurrentUser(), 4000, null);
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          await AsyncStorage.setItem('@teamlink_user', JSON.stringify(user));
          return;
        }
      }

      setCurrentUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('@teamlink_user');
    });

    return () => {
      data.subscription?.unsubscribe();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize i18n
      await withTimeout(i18n.init(), 2000);
      const savedLanguage = i18n.getLanguage();
      setLanguage(savedLanguage);

      // Load theme preference
      const savedTheme = await withTimeout(
        AsyncStorage.getItem('@teamlink_theme'),
        2000,
        DEFAULT_THEME_ID
      );
      setSelectedTheme(savedTheme || DEFAULT_THEME_ID);

      // Check if user is already logged in (Supabase session)
      const session = await withTimeout(authService.getSession(), 4000, null);
      if (session) {
        const user = await withTimeout(authService.getCurrentUser(), 4000, null);
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

  const changeTheme = async (themeId) => {
    setSelectedTheme(themeId);
    try {
      await AsyncStorage.setItem('@teamlink_theme', themeId);
      return { success: true };
    } catch (error) {
      console.error('Failed to save theme:', error);
      return { success: false, error: error.message };
    }
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
        selectedTheme,
        theme: getTheme(selectedTheme),
        changeTheme,
        isLoading,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

