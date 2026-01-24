import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Platform } from 'react-native';
import { AppStateProvider, useAppState } from './src/context/AppStateContext';
import { i18n } from './src/utils/i18n';
import { useTranslation } from './src/utils/useTranslation';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TimeClockScreen from './src/screens/TimeClockScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import TasksScreen from './src/screens/TasksScreen';
import MoreScreen from './src/screens/MoreScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DirectoryScreen from './src/screens/DirectoryScreen';
import ChatScreen from './src/screens/ChatScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ConnectionTestScreen from './src/screens/ConnectionTestScreen';

const Tab = createBottomTabNavigator();
// Usar Stack Navigator nativo para móvil, Stack Navigator regular para web
const NativeStack = createNativeStackNavigator();
const WebStack = createStackNavigator();
const Stack = Platform.OS === 'web' ? WebStack : NativeStack;

function MainTabs() {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Time') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            // Tab name will be set in screenOptions
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabel: route.name === 'Schedule' ? t('calendarSchedule') : undefined,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Time" component={TimeClockScreen} />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ tabBarLabel: t('calendarSchedule') }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAppState();

  useEffect(() => {
    const initI18n = async () => {
      await i18n.init();
    };
    initI18n();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          ...(Platform.OS === 'web' && {
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#007AFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerBackTitleVisible: false,
          }),
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                headerShown: true,
                title: 'Settings',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="Directory" 
              component={DirectoryScreen}
              options={{ 
                headerShown: true,
                title: 'Directory',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ 
                headerShown: true,
                title: 'Chat',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="Updates" 
              component={UpdatesScreen}
              options={{ 
                headerShown: true,
                title: 'Updates',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ 
                headerShown: true,
                title: 'Notifications',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="ConnectionTest" 
              component={ConnectionTestScreen}
              options={{ 
                headerShown: true,
                title: 'Connection Test',
                headerBackTitleVisible: false,
                ...(Platform.OS === 'web' && {
                  headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  },
                  headerTintColor: '#007AFF',
                  headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                  },
                }),
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen 
              name="ConnectionTest" 
              component={ConnectionTestScreen}
              options={{ 
                headerShown: true,
                title: 'Connection Test',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppNavigator />
    </AppStateProvider>
  );
}
