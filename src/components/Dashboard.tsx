import React, { useState, useEffect, useCallback } from 'react';
import CpuChart from './CpuChart';
import MemoryChart from './MemoryChart';
import ThreadChart from './ThreadChart';
import SystemInfo from './SystemInfo';
import WebSocketService from '../services/WebSocketService';
import AuthService from '../services/AuthService';
import {
  CpuMetrics,
  MemoryMetrics,
  ThreadMetrics,
  SystemInfo as SystemInfoType,
  MetricsData,
} from '../types';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [cpuData, setCpuData] = useState<CpuMetrics[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryMetrics[]>([]);
  const [threadData, setThreadData] = useState<ThreadMetrics[]>([]);
  const [systemData, setSystemData] = useState<SystemInfoType | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const maxDataPoints = 30;

  const handleMetricsMessage = useCallback((metrics: MetricsData) => {
    console.log('Received metrics:', metrics);
    setLastUpdate(new Date());
    setConnectionError(null);

    if (metrics.cpu) {
      setCpuData((prev) => {
        const newData = [...prev, metrics.cpu];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.memory) {
      setMemoryData((prev) => {
        const newData = [...prev, metrics.memory];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.threads) {
      setThreadData((prev) => {
        const newData = [...prev, metrics.threads];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.system) {
      setSystemData(metrics.system);
    }
  }, []);

  const handleConnect = useCallback(() => {
    console.log('Connected to WebSocket');
    setConnected(true);
    setConnectionError(null);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    setConnected(false);
    setConnectionError('Connection error. Attempting to reconnect...');
  }, []);

  useEffect(() => {
    WebSocketService.connect(handleMetricsMessage, handleConnect, handleError);

    return () => {
      WebSocketService.disconnect();
    };
  }, [handleMetricsMessage, handleConnect, handleError]);

  const handleLogout = async () => {
    WebSocketService.disconnect();
    await AuthService.logout();
    onLogout();
  };

  const user = AuthService.getCurrentUser();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>System Monitoring Dashboard</h1>
          <div className="connection-status">
            <span
              className={`status-indicator ${
                connected ? 'connected' : 'disconnected'
              }`}
            >
              {connected ? '● Connected' : '○ Disconnected'}
            </span>
            {lastUpdate && (
              <span className="last-update">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <span className="user-info">
            Welcome, {user?.username} ({user?.role})
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {connectionError && (
        <div className="alert alert-warning">{connectionError}</div>
      )}

      <div className="dashboard-grid">
        <div className="chart-container">
          <div className="card">
            <CpuChart data={cpuData} maxDataPoints={maxDataPoints} />
          </div>
        </div>

        <div className="chart-container">
          <div className="card">
            <MemoryChart data={memoryData} maxDataPoints={maxDataPoints} />
          </div>
        </div>

        <div className="chart-container">
          <div className="card">
            <ThreadChart data={threadData} />
          </div>
        </div>

        <div className="chart-container">
          <div className="card">
            <SystemInfo systemData={systemData} />
          </div>
        </div>
      </div>

      <div className="metrics-summary">
        <div className="summary-card">
          <h4>CPU</h4>
          <div className="metric-value">
            {cpuData.length > 0
              ? `${parseFloat(cpuData[cpuData.length - 1]?.system || '0').toFixed(
                  2
                )}%`
              : 'N/A'}
          </div>
          <div className="metric-label">System Usage</div>
        </div>

        <div className="summary-card">
          <h4>Memory</h4>
          <div className="metric-value">
            {memoryData.length > 0
              ? `${parseFloat(
                  String(memoryData[memoryData.length - 1]?.percentage || 0)
                ).toFixed(2)}%`
              : 'N/A'}
          </div>
          <div className="metric-label">Usage</div>
        </div>

        <div className="summary-card">
          <h4>Threads</h4>
          <div className="metric-value">
            {threadData.length > 0
              ? Math.floor(threadData[threadData.length - 1]?.live || 0)
              : 'N/A'}
          </div>
          <div className="metric-label">Live Threads</div>
        </div>

        <div className="summary-card">
          <h4>Cores</h4>
          <div className="metric-value">
            {systemData?.availableProcessors || 'N/A'}
          </div>
          <div className="metric-label">Available</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
