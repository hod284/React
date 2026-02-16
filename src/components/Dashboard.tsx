import React, { useState, useEffect, useCallback } from 'react';
import CpuChart from './CpuChart';
import MemoryChart from './MemoryChart';
import ThreadChart from './ThreadChart';
import SystemInfo from './SystemInfo';
import CpuDetailView from './CpuDetailView';
import MemoryDetailView from './MemoryDetailView';
import ThreadDetailView from './ThreadDetailView';
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

type ViewMode = 'overview' | 'cpu' | 'memory' | 'thread';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [cpuData, setCpuData] = useState<CpuMetrics[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryMetrics[]>([]);
  const [threadData, setThreadData] = useState<ThreadMetrics[]>([]);
  const [systemData, setSystemData] = useState<SystemInfoType | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const maxDataPoints = 50;

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
    WebSocketService.connect(handleMetricsMessage, handleConnect, handleError);

    return () => {
      WebSocketService.disconnect();
    };
  }, [handleMetricsMessage, handleConnect, handleError]);

  const fetchMetricsManually = async (type: 'cpu' | 'memory' | 'thread') => {
    setLoading(type);
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
      }
      setLastUpdate(new Date());
    } catch (error: unknown) {
      console.error('Failed to fetch metrics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
      setConnectionError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  // ✅ 수정: 화면 전환 시 REST API 호출!
  const handleViewChange = async (view: ViewMode) => {
    if (view === 'overview') {
      setViewMode(view);
      return;
    }

    // Detail 화면으로 전환 시 REST API 호출
    setLoading(view);
    try {
      const timestamp = Date.now();
      
      switch (view) {
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
      }
      
      setLastUpdate(new Date());
      setViewMode(view);  // ← API 호출 성공 후 화면 전환
    } catch (error: unknown) {
      console.error('Failed to fetch metrics for detail view:', error);
      const errorMessage = error instanceof Error ? error.message : 'Access denied';
      setConnectionError(errorMessage);
      alert(`접근 권한이 없습니다: ${errorMessage}`);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    WebSocketService.disconnect();
    await AuthService.logout();
    onLogout();
  };

  const user = AuthService.getCurrentUser();

  const renderContent = () => {
    switch (viewMode) {
      case 'cpu':
        return <CpuDetailView data={cpuData} systemData={systemData} />;
      case 'memory':
        return <MemoryDetailView data={memoryData} systemData={systemData} />;
      case 'thread':
        return <ThreadDetailView data={threadData} systemData={systemData} />;
      default:
        return (
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
                    ? `${parseFloat(cpuData[cpuData.length - 1]?.system || '0').toFixed(2)}%`
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
        );
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>📊 Views</h3>
          <p>Detailed Metrics</p>
        </div>

        <div className="sidebar-buttons">
          <button
            className={`sidebar-btn overview ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => handleViewChange('overview')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">
              {loading === 'overview' ? 'Loading...' : 'Overview'}
            </span>
          </button>

          <button
            className={`sidebar-btn cpu ${viewMode === 'cpu' ? 'active' : ''}`}
            onClick={() => handleViewChange('cpu')}
            disabled={loading !== null}
          >
            <span className="btn-icon">💻</span>
            <span className="btn-text">
              {loading === 'cpu' ? 'Loading...' : 'CPU Detail'}
            </span>
          </button>

          <button
            className={`sidebar-btn memory ${viewMode === 'memory' ? 'active' : ''}`}
            onClick={() => handleViewChange('memory')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🧠</span>
            <span className="btn-text">
              {loading === 'memory' ? 'Loading...' : 'Memory Detail'}
            </span>
          </button>

          <button
            className={`sidebar-btn thread ${viewMode === 'thread' ? 'active' : ''}`}
            onClick={() => handleViewChange('thread')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">
              {loading === 'thread' ? 'Loading...' : 'Thread Detail'}
            </span>
          </button>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-header">
          <h3>📡 Manual Fetch</h3>
          <p>REST API</p>
        </div>

        <div className="sidebar-buttons">
          <button
            className="sidebar-btn cpu-fetch"
            onClick={() => fetchMetricsManually('cpu')}
            disabled={loading !== null}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">
              {loading === 'cpu' ? 'Loading...' : 'Fetch CPU'}
            </span>
          </button>

          <button
            className="sidebar-btn memory-fetch"
            onClick={() => fetchMetricsManually('memory')}
            disabled={loading !== null}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">
              {loading === 'memory' ? 'Loading...' : 'Fetch Memory'}
            </span>
          </button>

          <button
            className="sidebar-btn thread-fetch"
            onClick={() => fetchMetricsManually('thread')}
            disabled={loading !== null}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">
              {loading === 'thread' ? 'Loading...' : 'Fetch Thread'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>System Monitoring Dashboard</h1>
            <div className="connection-status">
              <span
                className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}
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

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
