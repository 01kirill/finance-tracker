import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export const authService = {
  async register(data: RegisterRequest) {
    const response = await api.post<User>('/auth/users/', data);
    return response.data;
  },

  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/jwt/create/', data);
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get<User>('/auth/users/me/');
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
