import api from './api';
import { User, LoginCredentials, RegisterCredentials, ApiResponse } from '../types';

export const authService = {
  async register(credentials: RegisterCredentials) {
    const response = await api.post<ApiResponse<{ email: string; requiresVerification: boolean }>>('/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post<ApiResponse<User>>('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.get<ApiResponse<null>>(`/auth/verify/${token}`);
    return response.data;
  },

  async resendVerification(email: string) {
    const response = await api.post<ApiResponse<null>>('/auth/resend-verification', { email });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};
