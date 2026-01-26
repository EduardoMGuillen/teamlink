import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
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

  // Auto-logout por inactividad (desactivado por ahora)
  // const inactivityTimerRef = useRef(null);
  // const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Solo manejar eventos específicos que requieren acción
      // Ignorar eventos de refresh de token que no deberían desloguear
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Solo desloguear si es un logout explícito o eliminación de usuario
          setCurrentUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('@teamlink_user');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Si el token se refrescó, mantener la sesión activa
          try {
            const user = await withTimeout(authService.getCurrentUser(), 10000, null);
            if (user) {
              setCurrentUser(user);
              setIsAuthenticated(true);
              await AsyncStorage.setItem('@teamlink_user', JSON.stringify(user));
            }
          } catch (error) {
            console.error('Error refreshing user after token refresh:', error);
            // No desloguear si hay error, mantener estado actual
          }
        }
        return;
      }

      // Para otros eventos (SIGNED_IN, etc.), actualizar estado solo si hay sesión
      if (session?.user) {
        try {
          // Aumentar timeout a 10 segundos para dar más tiempo
          const user = await withTimeout(authService.getCurrentUser(), 10000, null);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@teamlink_user', JSON.stringify(user));
          } else {
            // Si no se puede obtener el usuario pero hay sesión, intentar mantener estado actual
            // No desloguear automáticamente
            const savedUser = await AsyncStorage.getItem('@teamlink_user');
            if (savedUser) {
              try {
                const parsedUser = JSON.parse(savedUser);
                setCurrentUser(parsedUser);
                setIsAuthenticated(true);
              } catch (e) {
                console.error('Error parsing saved user:', e);
              }
            }
          }
        } catch (error) {
          console.error('Error in onAuthStateChange:', error);
          // No desloguear si hay error, mantener estado actual si existe
          const savedUser = await AsyncStorage.getItem('@teamlink_user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setCurrentUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              // Si no se puede parsear, solo entonces limpiar
              setCurrentUser(null);
              setIsAuthenticated(false);
              await AsyncStorage.removeItem('@teamlink_user');
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Solo desloguear si es un logout explícito
        setCurrentUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@teamlink_user');
      }
      // Para otros casos sin sesión, no hacer nada (mantener estado actual)
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
      const session = await withTimeout(authService.getSession(), 10000, null);
      if (session) {
        const user = await withTimeout(authService.getCurrentUser(), 10000, null);
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          await AsyncStorage.setItem('@teamlink_user', JSON.stringify(user));
        } else {
          // Si hay sesión pero no se puede obtener usuario, intentar usar el guardado
          const savedUser = await AsyncStorage.getItem('@teamlink_user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setCurrentUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Error parsing saved user:', e);
              setCurrentUser(null);
              setIsAuthenticated(false);
              await AsyncStorage.removeItem('@teamlink_user');
            }
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // No active session: verificar si hay usuario guardado localmente
        const savedUser = await AsyncStorage.getItem('@teamlink_user');
        if (savedUser) {
          // Intentar verificar si la sesión aún es válida
          try {
            const parsedUser = JSON.parse(savedUser);
            // Verificar sesión una vez más con más tiempo
            const retrySession = await withTimeout(authService.getSession(), 5000, null);
            if (retrySession) {
              setCurrentUser(parsedUser);
              setIsAuthenticated(true);
            } else {
              // Solo limpiar si realmente no hay sesión
              setCurrentUser(null);
              setIsAuthenticated(false);
              await AsyncStorage.removeItem('@teamlink_user');
            }
          } catch (e) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            await AsyncStorage.removeItem('@teamlink_user');
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
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

  const logout = useCallback(async () => {
    try {
      // Limpiar timer de inactividad antes de hacer logout (si está activo)
      // if (inactivityTimerRef.current) {
      //   clearTimeout(inactivityTimerRef.current);
      //   inactivityTimerRef.current = null;
      // }
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
  }, []);

  // Auto-logout por inactividad solo en web (DESACTIVADO - descomentar para activar)
  // useEffect(() => {
  //   if (Platform.OS !== 'web' || !isAuthenticated) {
  //     // Limpiar timer si no es web o no está autenticado
  //     if (inactivityTimerRef.current) {
  //       clearTimeout(inactivityTimerRef.current);
  //       inactivityTimerRef.current = null;
  //     }
  //     return;
  //   }

  //   // Función para resetear el timer de inactividad
  //   const resetInactivityTimer = () => {
  //     // Limpiar timer anterior
  //     if (inactivityTimerRef.current) {
  //       clearTimeout(inactivityTimerRef.current);
  //     }

  //     // Crear nuevo timer
  //     inactivityTimerRef.current = setTimeout(() => {
  //       console.log('Auto-logout por inactividad (1 hora)');
  //       logout();
  //     }, INACTIVITY_TIMEOUT);
  //   };

  //   // Eventos que indican actividad del usuario
  //   const activityEvents = [
  //     'mousedown',
  //     'mousemove',
  //     'keypress',
  //     'scroll',
  //     'touchstart',
  //     'click',
  //     'keydown',
  //   ];

  //   // Agregar listeners para eventos de actividad
  //   activityEvents.forEach((event) => {
  //     window.addEventListener(event, resetInactivityTimer, true);
  //   });

  //   // Iniciar el timer
  //   resetInactivityTimer();

  //   // Cleanup
  //   return () => {
  //     activityEvents.forEach((event) => {
  //       window.removeEventListener(event, resetInactivityTimer, true);
  //     });
  //     if (inactivityTimerRef.current) {
  //       clearTimeout(inactivityTimerRef.current);
  //       inactivityTimerRef.current = null;
  //     }
  //   };
  // }, [isAuthenticated, logout]);

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

