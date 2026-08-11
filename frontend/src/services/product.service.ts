import api from './api';
import { ProductListResponse, ProductDetailResponse } from '../types/product';

export const productService = {
  async getProducts(search: string = '', page: number = 1, limit: number = 10, lowStock: boolean = false): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (lowStock) params.append('lowStock', 'true');

    const response = await api.get<ProductListResponse>(`/products?${params.toString()}`);
    return response.data;
  },

  async getProductById(id: string): Promise<ProductDetailResponse> {
    const response = await api.get<ProductDetailResponse>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: any): Promise<ProductDetailResponse> {
    const response = await api.post<ProductDetailResponse>('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: any): Promise<ProductDetailResponse> {
    const response = await api.put<ProductDetailResponse>(`/products/${id}`, data);
    return response.data;
  },
};
