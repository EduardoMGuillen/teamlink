import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { AppStateProvider, useAppState } from './src/context/AppStateContext';
import { i18n } from './src/utils/i18n';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
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
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Time" component={TimeClockScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Directory" component={DirectoryScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Updates" component={UpdatesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
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
