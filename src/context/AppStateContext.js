import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../utils/i18n';
import { authService } from '../services/authService';

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

      // Check if user is already logged in (Supabase session)
      const session = await authService.getSession();
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } else {
        // Fallback: check AsyncStorage for legacy user (only if valid UUID)
        const savedUser = await AsyncStorage.getItem('@teamlink_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            // Validate that user ID is a valid UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (user.id && uuidRegex.test(user.id)) {
              setCurrentUser(user);
              setIsAuthenticated(true);
            } else {
              // Invalid user ID format, clear it
              console.log('Invalid user ID format, clearing saved user');
              await AsyncStorage.removeItem('@teamlink_user');
            }
          } catch (error) {
            console.error('Error parsing saved user:', error);
            await AsyncStorage.removeItem('@teamlink_user');
          }
        }
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
        isLoading,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

