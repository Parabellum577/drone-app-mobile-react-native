import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from './src/contexts/AuthContext';
import { LoginScreen, RegistrationScreen, UserProfileScreen, CreateServiceScreen } from './src/screens';
import TabNavigator from './src/navigation/TabNavigator';
import type { RootStackParamList } from './src/types/navigation';
import { COLORS } from './src/constants/theme';
import 'react-native-get-random-values';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuthenticated ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Registration" 
                component={RegistrationScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Main" 
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="UserProfile" 
                component={UserProfileScreen}
                options={{ 
                  headerBackTitle: "Back"
                }}
              />
              <Stack.Screen 
                name="CreateService" 
                component={CreateServiceScreen}
                options={{ 
                  title: "Create Service",
                  headerBackTitle: "Back"
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App; 