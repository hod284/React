import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', {
      username,
      password,
    } as LoginRequest);

    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
    }
  }

  async register(
    username: string,
    password: string,
    email: string,
    role: 'USER' | 'ADMIN' = 'USER'  // ← role 파라미터 추가
  ): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', {
      username,
      password,
      email,
      role,  // ← role 전송
    } as RegisterRequest);
    return response.data;
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.accessToken);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}

export default new AuthService();
