import api from './api';
import { History, HistoryStats } from '../types/history';

export const historyService = {
  // Get all histories with pagination
  async getAll(page: number = 1, limit: number = 10, search?: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/histories?${params}`);
    return response.data.data;
  },

  // Get single history by ID
  async getById(id: number): Promise<History> {
    const response = await api.get(`/histories/${id}`);
    return response.data.data;
  },

  // Get history statistics
  async getStatsSummary(): Promise<HistoryStats> {
    const response = await api.get('/histories/stats/summary');
    return response.data.data;
  },

  // Delete history
  async delete(id: number): Promise<void> {
    await api.delete(`/histories/${id}`);
  },
};