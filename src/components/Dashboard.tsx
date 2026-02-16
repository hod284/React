import React, { useState, useEffect, useCallback } from 'react';
import CpuChart from './CpuChart';
import MemoryChart from './MemoryChart';
import ThreadChart from './ThreadChart';
import SystemInfo from './SystemInfo';
import WebSocketService from '../services/WebSocketService';
import MonitoringService from '../services/MonitoringService';
import AuthService from '../services/AuthService';
import type {
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
  const [selectedView, setSelectedView] = useState<'all' | 'cpu' | 'memory' | 'thread'>('all');
  const [isRealtime, setIsRealtime] = useState(true);
  const [loading, setLoading] = useState(false);

  const maxDataPoints = 30;

  const handleMetricsMessage = useCallback((metrics: MetricsData) => {
    console.log('Received metrics:', metrics);
    setLastUpdate(new Date());
    setConnectionError(null);

    if (metrics.cpu) {
      setCpuData((prev) => {
        const newData = [...prev, { ...metrics.cpu, timestamp: metrics.timestamp }];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.memory) {
      setMemoryData((prev) => {
        const newData = [...prev, { ...metrics.memory, timestamp: metrics.timestamp }];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.threads) {
      setThreadData((prev) => {
        const newData = [...prev, { ...metrics.threads, timestamp: metrics.timestamp }];
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

  const handleError = useCallback((error: unknown) => {
    console.error('WebSocket error:', error);
    setConnected(false);
    setConnectionError('Connection error. Attempting to reconnect...');
  }, []);

  useEffect(() => {
    if (isRealtime) {
      WebSocketService.connect(handleMetricsMessage, handleConnect, handleError);
    } else {
      WebSocketService.disconnect();
      setConnected(false);
    }

    return () => {
      WebSocketService.disconnect();
    };
  }, [handleMetricsMessage, handleConnect, handleError, isRealtime]);

  const fetchMetricsManually = async (type: 'all' | 'cpu' | 'memory' | 'thread') => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      switch (type) {
        case 'cpu': {
          const cpuMetrics = await MonitoringService.getCpuMetrics();
          setCpuData((prev) => [...prev, { ...cpuMetrics, timestamp }].slice(-maxDataPoints));
          break;
        }
        case 'memory': {
          const memoryMetrics = await MonitoringService.getMemoryMetrics();
          setMemoryData((prev) => [...prev, { ...memoryMetrics, timestamp }].slice(-maxDataPoints));
          break;
        }
        case 'thread': {
          const threadMetrics = await MonitoringService.getThreadMetrics();
          setThreadData((prev) => [...prev, { ...threadMetrics, timestamp }].slice(-maxDataPoints));
          break;
        }
        case 'all': {
          const allMetrics = await MonitoringService.getAllMetrics();
          if (allMetrics.cpu) {
            setCpuData((prev) => [...prev, { ...allMetrics.cpu, timestamp }].slice(-maxDataPoints));
          }
          if (allMetrics.memory) {
            setMemoryData((prev) => [...prev, { ...allMetrics.memory, timestamp }].slice(-maxDataPoints));
          }
          if (allMetrics.threads) {
            setThreadData((prev) => [...prev, { ...allMetrics.threads, timestamp }].slice(-maxDataPoints));
          }
          break;
        }
      }
      setLastUpdate(new Date());
    } catch (error: unknown) {
      console.error('Failed to fetch metrics:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Control Panel */}
      <div className="control-panel">
        <div className="view-selector">
          <button
            className={`view-btn ${selectedView === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedView('all')}
          >
            📊 All Metrics
          </button>
          <button
            className={`view-btn ${selectedView === 'cpu' ? 'active' : ''}`}
            onClick={() => setSelectedView('cpu')}
          >
            💻 CPU Detail
          </button>
          <button
            className={`view-btn ${selectedView === 'memory' ? 'active' : ''}`}
            onClick={() => setSelectedView('memory')}
          >
            🧠 Memory Detail
          </button>
          <button
            className={`view-btn ${selectedView === 'thread' ? 'active' : ''}`}
            onClick={() => setSelectedView('thread')}
          >
            🔄 Thread Detail
          </button>
        </div>

        <div className="mode-controls">
          <button
            className={`mode-btn ${isRealtime ? 'active' : ''}`}
            onClick={() => setIsRealtime(true)}
          >
            🔴 Realtime (WebSocket)
          </button>
          <button
            className={`mode-btn ${!isRealtime ? 'active' : ''}`}
            onClick={() => setIsRealtime(false)}
          >
            📡 Manual (REST API)
          </button>
          {!isRealtime && (
            <button
              className="fetch-btn"
              onClick={() => fetchMetricsManually(selectedView)}
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '🔄 Fetch Data'}
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedView === 'all' && (
        <>
          <div className="dashboard-grid">
            <div className="chart-container">
              <div className="card">
                <CpuChart data={cpuData} />
              </div>
            </div>

            <div className="chart-container">
              <div className="card">
                <MemoryChart data={memoryData} />
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
        </>
      )}

      {selectedView === 'cpu' && (
        <div className="detail-view">
          <div className="detail-card large">
            <CpuChart data={cpuData} />
          </div>
          <div className="detail-info">
            <h3>CPU Details</h3>
            {cpuData.length > 0 && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">System CPU</span>
                  <span className="info-value">{parseFloat(cpuData[cpuData.length - 1]?.system || '0').toFixed(2)}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Process CPU</span>
                  <span className="info-value">{parseFloat(cpuData[cpuData.length - 1]?.process || '0').toFixed(2)}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">CPU Cores</span>
                  <span className="info-value">{cpuData[cpuData.length - 1]?.cores || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedView === 'memory' && (
        <div className="detail-view">
          <div className="detail-card large">
            <MemoryChart data={memoryData} />
          </div>
          <div className="detail-info">
            <h3>Memory Details</h3>
            {memoryData.length > 0 && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Used Memory</span>
                  <span className="info-value">{memoryData[memoryData.length - 1]?.used.toFixed(2)} MB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Max Memory</span>
                  <span className="info-value">{memoryData[memoryData.length - 1]?.max.toFixed(2)} MB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Committed Memory</span>
                  <span className="info-value">{memoryData[memoryData.length - 1]?.committed.toFixed(2)} MB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Usage Percentage</span>
                  <span className="info-value">{memoryData[memoryData.length - 1]?.percentage.toFixed(2)}%</span>
                </div>
                {memoryData[memoryData.length - 1]?.heapUsed && (
                  <div className="info-item">
                    <span className="info-label">Heap Used</span>
                    <span className="info-value">{memoryData[memoryData.length - 1]?.heapUsed?.toFixed(2)} MB</span>
                  </div>
                )}
                {memoryData[memoryData.length - 1]?.nonHeapUsed && (
                  <div className="info-item">
                    <span className="info-label">Non-Heap Used</span>
                    <span className="info-value">{memoryData[memoryData.length - 1]?.nonHeapUsed?.toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedView === 'thread' && (
        <div className="detail-view">
          <div className="detail-card large">
            <ThreadChart data={threadData} />
          </div>
          <div className="detail-info">
            <h3>Thread Details</h3>
            {threadData.length > 0 && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Live Threads</span>
                  <span className="info-value">{Math.floor(threadData[threadData.length - 1]?.live || 0)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Daemon Threads</span>
                  <span className="info-value">{Math.floor(threadData[threadData.length - 1]?.daemon || 0)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Peak Threads</span>
                  <span className="info-value">{Math.floor(threadData[threadData.length - 1]?.peak || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
