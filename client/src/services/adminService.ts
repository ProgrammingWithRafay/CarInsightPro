import api from './api';
import { AdminStats, User, Car, ApiResponse } from '../types';

export const adminService = {
  async getStats() {
    const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data;
  },

  async getUsers() {
    const response = await api.get<ApiResponse<User[]>>('/admin/users');
    return response.data;
  },

  async toggleBlockUser(id: string) {
    const response = await api.put<ApiResponse<null>>(`/admin/users/${id}/block`);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },

  async addCar(data: FormData) {
    const response = await api.post<ApiResponse<Car>>('/cars', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async updateCar(id: string, data: FormData | Partial<Car>) {
    const isFormData = data instanceof FormData;
    const response = await api.put<ApiResponse<Car>>(`/cars/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },

  async deleteCar(id: string) {
    const response = await api.delete<ApiResponse<null>>(`/cars/${id}`);
    return response.data;
  }
};
