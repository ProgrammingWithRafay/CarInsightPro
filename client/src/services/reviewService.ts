import api from './api';
import { Review, ApiResponse, SubScores } from '../types';

export interface ReviewResponse {
  reviews: Review[];
  aggregatedSubScores?: SubScores;
}

/**
 * Service to manage all API interactions related to car reviews.
 * Handles fetching, adding, updating, and deleting user reviews, as well as voting on helpfulness.
 */
export const reviewService = {
  async getReviews(carId: string) {
    const response = await api.get<ApiResponse<ReviewResponse>>(`/reviews/${carId}`);
    return response.data;
  },

  async getMyReviews() {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/user/me');
    return response.data;
  },

  async addReview(carId: string, data: { title: string; subScores: SubScores; comment: string }) {
    const response = await api.post<ApiResponse<Review>>(`/reviews/${carId}`, data);
    return response.data;
  },

  async updateReview(id: string, data: { rating?: number; comment?: string }) {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data;
  },

  async deleteReview(id: string) {
    const response = await api.delete<ApiResponse<null>>(`/reviews/${id}`);
    return response.data;
  },

  async markHelpful(id: string) {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}/helpful`);
    return response.data;
  }
};
