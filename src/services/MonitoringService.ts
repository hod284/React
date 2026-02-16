import axiosInstance from './axiosInstance';

class MonitoringService {
  async getCpuMetrics() {
    const response = await axiosInstance.get('/monitoring/metrics/cpu');
    return response.data;
  }

  async getMemoryMetrics() {
    const response = await axiosInstance.get('/monitoring/metrics/memory');
    return response.data;
  }

  async getThreadMetrics() {
    const response = await axiosInstance.get('/monitoring/metrics/threads');
    return response.data;
  }

  async getAllMetrics() {
    const response = await axiosInstance.get('/monitoring/metrics/all');
    return response.data;
  }
}

export default new MonitoringService();
