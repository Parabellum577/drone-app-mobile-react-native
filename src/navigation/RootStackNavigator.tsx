import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  RegistrationScreen,
  CreateServiceScreen,
  UserProfileScreen,
  EditProfileScreen,
  ProductDetailsScreen,
  CreateProductScreen,
} from '../screens';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="CreateService" 
        component={CreateServiceScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="CreateProduct" 
        component={CreateProductScreen}
        options={{ headerShown: true, title: "Create Product" }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          headerShown: true,
          title: "Edit Profile"
        }}
      />
    </Stack.Navigator>
  );
};

export default RootStackNavigator; 