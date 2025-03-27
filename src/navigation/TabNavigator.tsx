import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../constants/theme';
import { HomeScreen, ProfileScreen, InboxScreen, EditProfileScreen } from '../screens';
import type { TabParamList } from '../types/navigation';
import ProfileMenu from '../components/profile/ProfileMenu';
import { AuthContext } from '../contexts/AuthContext';
import userService from '../services/user.service';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { checkAuth } = useContext(AuthContext);
  const [username, setUsername] = useState<string>('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const loadUsername = useCallback(async () => {
    try {
      const user = await userService.getCurrentUserProfile();
      setUsername(user.username);
    } catch (error) {
      console.error('Error loading username:', error);
    }
  }, []);

  useEffect(() => {
    loadUsername();
  }, [loadUsername]);

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        lazy: true,
        tabBarStyle: {
          borderTopColor: COLORS.border,
        },
        freezeOnBlur: true,
        unmountOnBlur: true,
      })}
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
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Icon name="account" size={24} color={color} />
          ),
          headerRight: () => (
            <ProfileMenu 
              onClose={() => setIsMenuVisible(false)}
              onLogout={async () => {
                setIsMenuVisible(false);
                try {
                  await AsyncStorage.removeItem('token');
                  await checkAuth();
                } catch (error) {
                  console.error('Error during logout:', error);
                }
              }}
            />
          ),
        }}
        listeners={{
          focus: () => {
            loadUsername();
          },
        }}
      />
      <Tab.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={({ navigation }) => ({
          tabBarButton: () => null,
          headerShown: true,
          title: "Edit Profile",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: SPACING.md }}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 