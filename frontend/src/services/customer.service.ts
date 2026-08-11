import api from './api';
import {
  CustomerListResponse,
  CustomerDetailResponse,
  CustomerNotesResponse,
} from '../types/customer';

export const customerService = {
  async getCustomers(search: string = '', page: number = 1, limit: number = 10): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<CustomerListResponse>(`/customers?${params.toString()}`);
    return response.data;
  },

  async getCustomerById(id: string): Promise<CustomerDetailResponse> {
    const response = await api.get<CustomerDetailResponse>(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: any): Promise<CustomerDetailResponse> {
    const response = await api.post<CustomerDetailResponse>('/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: any): Promise<CustomerDetailResponse> {
    const response = await api.put<CustomerDetailResponse>(`/customers/${id}`, data);
    return response.data;
  },

  async getCustomerNotes(id: string): Promise<CustomerNotesResponse> {
    const response = await api.get<CustomerNotesResponse>(`/customers/${id}/notes`);
    return response.data;
  },

  async addCustomerNote(id: string, note: string): Promise<any> {
    const response = await api.post(`/customers/${id}/notes`, { note });
    return response.data;
  },
};
