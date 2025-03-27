import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { HomeScreen, ProfileScreen, InboxScreen } from '../screens';
import type { TabParamList } from '../types/navigation';
import ProfileMenu from '../components/profile/ProfileMenu';
import { AuthContext } from '../contexts/AuthContext';
import userService from '../services/user.service';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { checkAuth } = useContext(AuthContext);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const user = await userService.getCurrentUserProfile();
        setUsername(user.username);
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        lazy: true,
        tabBarStyle: {
          borderTopColor: COLORS.border,
        },
        freezeOnBlur: true,
        unmountOnBlur: true,
      }}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="chat" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: `@${username}`,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Icon name="account" size={24} color={color} />
          ),
          headerRight: () => (
            <ProfileMenu onLogout={async () => {
              try {
                await AsyncStorage.removeItem('token');
                await checkAuth();
              } catch (error) {
                console.error('Error during logout:', error);
              }
            }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 