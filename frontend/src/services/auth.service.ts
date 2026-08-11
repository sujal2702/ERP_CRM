import api from './api';
import { AuthResponse, UserProfileResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async getMe(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/auth/me');
    return response.data;
  },
};
