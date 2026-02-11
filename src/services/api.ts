import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  logout: (): Promise<AxiosResponse<void>> => api.post('/auth/logout'),
  refresh: (refreshToken: string): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/refresh', { refreshToken }),
};

// Monitoring APIs
export const monitoringAPI = {
  getCPUMetrics: () => api.get('/monitoring/meterics/cpu'),
  getMemoryMetrics: () => api.get('/monitoring/metrics/memory'),
  getThreadMetrics: () => api.get('/monitoring/metrics/threads', { params: { param: 'default' } }),
  getAllMetrics: () => api.get('/monitoring/metrics/all', { params: { param: 'default' } }),
};

export default api;
