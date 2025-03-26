import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const createApiClient = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};

// На iOS используем localhost, на Android используем 10.0.2.2
const baseURL = Platform.select({
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
}) || 'http://localhost:8000';

export const api = createApiClient(baseURL);
export default api; 