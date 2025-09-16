import apiClient from './apiClient';
import { PaginatedResponse } from '../types/common';
import { 
  Product, 
  CreateProductDto, 
  ProductQuery, 
  UpdateProductDto 
} from '../types/product';

class ProductService {
  async getProducts(query?: ProductQuery): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: query,
    });
    return response.data;
  }

  async getUserProducts(userId: string): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>(`/products/user/${userId}`);
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    try {
      console.log(`Calling API: /products/${id}`);
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>('/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    const response = await apiClient.patch<Product>(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  async uploadProductImage(productId: string, imageUri: string): Promise<string> {
    const formData = new FormData();
    const imageName = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(imageName || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore
    formData.append('file', {
      uri: imageUri,
      name: imageName || 'product_image.jpg',
      type,
    });

    const response = await apiClient.post<{ url: string }>(
      `/products/${productId}/images`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.url;
  }
}

export default new ProductService(); 