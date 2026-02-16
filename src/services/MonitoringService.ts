import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8080/api/monitoring';

class MonitoringService {
  async getCpuMetrics() {
    const headers = AuthService.getAuthHeader();
    const response = await axios.get(`${API_URL}/meterics/cpu`, { headers });
    return response.data;
  }

  async getMemoryMetrics() {
    const headers = AuthService.getAuthHeader();
    const response = await axios.get(`${API_URL}/metrics/memory`, { headers });
    return response.data;
  }

  async getThreadMetrics() {
    const headers = AuthService.getAuthHeader();
    const response = await axios.get(`${API_URL}/metrics/threads`, { headers });
    return response.data;
  }

  async getAllMetrics() {
    const headers = AuthService.getAuthHeader();
    const response = await axios.get(`${API_URL}/metrics/all`, { headers });
    return response.data;
  }
}

export default new MonitoringService();
