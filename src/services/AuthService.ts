import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

const API_URL = 'http://localhost:8080/api/auth';

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      username,
      password,
    } as LoginRequest);

    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    const user = this.getCurrentUser();
    if (user && user.accessToken) {
      try {
        await axios.post(
          `${API_URL}/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('user');
  }

  async register(
    username: string,
    password: string,
    email: string
  ): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
      username,
      password,
      email,
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

  getAuthHeader(): { Authorization?: string } {
    const user = this.getCurrentUser();
    if (user && user.accessToken) {
      return { Authorization: `Bearer ${user.accessToken}` };
    }
    return {};
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
