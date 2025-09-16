import { Currency } from './service';
import { PaginatedQuery } from './common';

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  DRONE = 'drone',
  CAMERA = 'camera',
  DRONE_PARTS = 'drone_parts',
  ACCESSORIES = 'accessories',
  SOFTWARE = 'software',
  OTHER = 'other',
}

export interface Product {
  id: string;
  productId: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  images: string[];
  category: ProductCategory;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  category: ProductCategory;
  images?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductQuery extends PaginatedQuery {
  searchQuery?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
} 