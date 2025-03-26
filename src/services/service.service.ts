import api from './apiClient';
import { Currency } from '../types/service';

export interface ServiceQuery {
  searchTitle?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Service {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  image: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  location: string;
}

export interface CreateServiceDto {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  image: string;
  location: string;
}

const serviceService = {
  // Create new service
  createService: async (data: CreateServiceDto) => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  // Get all services
  getServices: async (query?: ServiceQuery) => {
    const params = {
      ...(query?.searchTitle && { searchTitle: query.searchTitle }),
      ...(query?.location && { location: query.location }),
      ...(query?.minPrice && { minPrice: query.minPrice }),
      ...(query?.maxPrice && { maxPrice: query.maxPrice }),
    };
    
    const response = await api.get<Service[]>('/services', { 
      params: Object.keys(params).length > 0 ? params : undefined 
    });
    return response.data;
  },

  // Get service by ID
  getServiceById: async (serviceId: string) => {
    const response = await api.get<Service>(`/services/${serviceId}`);
    return response.data;
  },

  // Update service
  updateService: async (serviceId: string, data: Partial<CreateServiceDto>) => {
    const response = await api.put<Service>(`/services/${serviceId}`, data);
    return response.data;
  },

  // Delete service
  deleteService: async (serviceId: string) => {
    await api.delete(`/services/${serviceId}`);
  },

  // Get services by user ID
  getUserServices: async (userId: string) => {
    const response = await api.get<Service[]>(`/services/user/${userId}`);
    return response.data;
  },
};

export default serviceService; 