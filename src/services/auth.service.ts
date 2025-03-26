import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './apiClient';
import type { User } from './user.service';

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  location: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

const checkEmail = async (email: string): Promise<boolean> => {
  const { data } = await api.get(`/auth/check-email?email=${email}`);
  return data.available;
};

const checkUsername = async (username: string): Promise<boolean> => {
  const { data } = await api.get(`/auth/check-username?username=${username}`);
  return data.available;
};

export const authService = {
  register: async (userData: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    return response.data;
  },
  
  login: async (credentials: LoginData) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { bio?: string; location?: string; avatar?: string }) => {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  checkEmail,
  checkUsername,
};

export default authService; 