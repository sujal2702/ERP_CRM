import api from './api';
import { ChallanListResponse, ChallanDetailResponse, ChallanStatus } from '../types/challan';

export const challanService = {
  async getChallans(search: string = '', status?: ChallanStatus, page: number = 1, limit: number = 10): Promise<ChallanListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<ChallanListResponse>(`/challans?${params.toString()}`);
    return response.data;
  },

  async getChallanById(id: string): Promise<ChallanDetailResponse> {
    const response = await api.get<ChallanDetailResponse>(`/challans/${id}`);
    return response.data;
  },

  async createChallan(data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<ChallanDetailResponse> {
    const response = await api.post<ChallanDetailResponse>('/challans', data);
    return response.data;
  },

  async confirmChallan(id: string): Promise<ChallanDetailResponse> {
    const response = await api.post<ChallanDetailResponse>(`/challans/${id}/confirm`);
    return response.data;
  },

  async cancelChallan(id: string): Promise<ChallanDetailResponse> {
    const response = await api.post<ChallanDetailResponse>(`/challans/${id}/cancel`);
    return response.data;
  },
};
