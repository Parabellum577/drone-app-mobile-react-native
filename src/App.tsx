import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import RootStackNavigator from './navigation/RootStackNavigator';

const App = () => {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <RootStackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App; 