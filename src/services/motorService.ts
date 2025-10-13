import api from './api';
import { Motor, CreateMotorData, UpdateMotorData } from '../types/motor';

export const motorService = {
  // Get all motors
  async getAll(): Promise<Motor[]> {
    const response = await api.get('/motors');
    return response.data.data;
  },

  // Get motors with GPS data
  async getWithGps(): Promise<Motor[]> {
    const response = await api.get('/motors/gps');
    return response.data.data;
  },

  // Get single motor by ID
  async getById(id: number): Promise<Motor> {
    const response = await api.get(`/motors/${id}`);
    return response.data.data;
  },

  // Create new motor
  async create(data: CreateMotorData): Promise<Motor> {
    const response = await api.post('/motors', data);
    return response.data.data;
  },

  // Update motor
  async update(id: number, data: UpdateMotorData): Promise<Motor> {
    const response = await api.put(`/motors/${id}`, data);
    return response.data.data;
  },

  // Delete motor
  async delete(id: number): Promise<void> {
    await api.delete(`/motors/${id}`);
  },
};