import api from './api';
import { Car, ApiResponse, FilterState } from '../types';

export const carService = {
  async getCars(filters: Partial<FilterState>) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if ((filters as FilterState & { limit?: number }).limit) params.append('limit', (filters as FilterState & { limit?: number }).limit!.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.brand && filters.brand.length > 0) params.append('brand', filters.brand.join(','));
    if (filters.yearMin) params.append('yearMin', filters.yearMin.toString());
    if (filters.yearMax) params.append('yearMax', filters.yearMax.toString());
    if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
    if (filters.fuelType && filters.fuelType.length > 0) params.append('fuelType', filters.fuelType.join(','));
    if (filters.transmission) params.append('transmission', filters.transmission);

    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get<ApiResponse<Car[]>>(`/cars?${params.toString()}`);
    return response.data;
  },

  async getFeatured() {
    const response = await api.get<ApiResponse<Car[]>>('/cars?sortBy=rating-desc&limit=6');
    return response.data;
  },

  async getPublicStats() {
    const response = await api.get<ApiResponse<{ totalCars: number; totalReviews: number }>>('/cars/stats');
    return response.data;
  },

  async getCarById(id: string) {
    const response = await api.get<ApiResponse<Car>>(`/cars/${id}`);
    return response.data;
  },

  async compareCars(ids: string[]) {
    const response = await api.get<ApiResponse<Car[]>>(`/cars/compare?ids=${ids.join(',')}`);
    return response.data;
  },

  async recommendCars(budget?: number, usage?: string, seats?: number, fuelType?: string) {
    const params = new URLSearchParams();
    if (budget) params.append('budget', budget.toString());
    if (usage) params.append('usage', usage);
    if (seats) params.append('seats', seats.toString());
    if (fuelType) params.append('fuelType', fuelType);
    
    // We added matchPercentage and matchScore in backend, so let's extend Car type temporarily or just use any for data.
    const response = await api.get<ApiResponse<(Car & { matchScore: number; matchPercentage: number })[]>>(`/cars/recommend?${params.toString()}`);
    return response.data;
  },

  async getBookmarks() {
    const response = await api.get<ApiResponse<string[]>>('/bookmarks');
    return response.data;
  },

  async addBookmark(carId: string) {
    const response = await api.post<ApiResponse<string[]>>(`/bookmarks/${carId}`);
    return response.data;
  },

  async removeBookmark(carId: string) {
    const response = await api.delete<ApiResponse<string[]>>(`/bookmarks/${carId}`);
    return response.data;
  },

  async getCarPriceHistory(carId: string) {
    const response = await api.get<ApiResponse<{ oldPrice: number; newPrice: number; date: string }[]>>(`/cars/${carId}/price-history`);
    return response.data;
  }
};
