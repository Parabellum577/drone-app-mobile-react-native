import api from './apiClient';
import { Currency, ServiceCategory, WorkingHours } from '../types/service';
import { Paginated } from '../types/common';

export interface ServiceQuery {
  searchTitle?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: ServiceCategory;
  limit?: number;
  offset?: number;
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
  category: ServiceCategory;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  availableDays?: string[];
  workingHours?: WorkingHours;
}

export interface CreateServiceDto {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  image: string;
  location: string;
  category: ServiceCategory;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  availableDays?: string[];
  workingHours?: WorkingHours;
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
      ...(query?.category && { category: query.category }),
      ...(query?.limit && { limit: query.limit }),
      ...(query?.offset && { offset: query.offset }),
    };
    
    const response = await api.get<Paginated<Service>>('/services', { 
      params: Object.keys(params).length > 0 ? params : undefined 
    });
    return response.data.items;
  },

  // Get total count of services
  getServicesCount: async (query?: ServiceQuery) => {
    const params = {
      ...(query?.searchTitle && { searchTitle: query.searchTitle }),
      ...(query?.location && { location: query.location }),
      ...(query?.minPrice && { minPrice: query.minPrice }),
      ...(query?.maxPrice && { maxPrice: query.maxPrice }),
      ...(query?.category && { category: query.category }),
    };
    
    const response = await api.get<Paginated<Service>>('/services', { 
      params: {
        ...Object.keys(params).length > 0 ? params : undefined,
        limit: 1,
        offset: 0
      }
    });
    return response.data.total;
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
    try {
      const response = await api.get<Paginated<Service> | Service[]>(`/services/user/${userId}`);
      
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length,
          limit: response.data.length,
          offset: 0
        };
      }
      return response.data;
    } catch (error) {
      return {
        items: [],
        total: 0,
        limit: 10,
        offset: 0
      };
    }
  },
};

export default serviceService; 