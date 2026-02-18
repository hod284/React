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
import '../Dashboard.css';
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
        // 데이터 정규화: 안전하게 문자열로 변환
        const normalizedCpu = {
          system: String(metrics.cpu.system ?? '0'),
          process: String(metrics.cpu.process ?? '0'),
          timestamp: metrics.timestamp
        };
        const newData = [...prev, normalizedCpu];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.memory) {
      setMemoryData((prev) => {
        // 데이터 정규화: 안전하게 숫자로 변환
        const normalizedMemory = {
          used: Number(metrics.memory.used) || 0,
          max: Number(metrics.memory.max) || 0,
          percentage: Number(metrics.memory.percentage) || 0,
          heapUsed: Number(metrics.memory.heapUsed) || 0,
          nonHeapUsed: Number(metrics.memory.nonHeapUsed) || 0,
          timestamp: metrics.timestamp
        };
        const newData = [...prev, normalizedMemory];
        return newData.slice(-maxDataPoints);
      });
    }

    if (metrics.threads) {
      setThreadData((prev) => {
        // 데이터 정규화: 안전하게 숫자로 변환
        const normalizedThread = {
          live: Number(metrics.threads.live) || 0,
          daemon: Number(metrics.threads.daemon) || 0,
          peak: Number(metrics.threads.peak) || 0,
          timestamp: metrics.timestamp
        };
        const newData = [...prev, normalizedThread];
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
    setConnectionError('연결 오류. 재연결을 시도하는 중...');
  }, []);

  useEffect(() => {
    WebSocketService.connect(handleMetricsMessage, handleConnect, handleError);

    return () => {
      WebSocketService.disconnect();
    };
  }, [handleMetricsMessage, handleConnect, handleError]);

  const fetchMetricsManually = async (type: 'cpu' | 'memory' | 'thread') => {
    setLoading(type);
    
    // 조회 시작 시 해당 데이터를 초기화 (0으로 리셋)
    const timestamp = Date.now();
    switch (type) {
      case 'cpu':
        setCpuData((prev) => [...prev, { system: '0', process: '0', timestamp }].slice(-maxDataPoints));
        break;
      case 'memory':
        setMemoryData((prev) => [...prev, { used: 0, max: 0, percentage: 0, heapUsed: 0, nonHeapUsed: 0, timestamp }].slice(-maxDataPoints));
        break;
      case 'thread':
        setThreadData((prev) => [...prev, { live: 0, daemon: 0, peak: 0, timestamp }].slice(-maxDataPoints));
        break;
    }
    
    try {
      switch (type) {
        case 'cpu': {
          const cpuMetrics = await MonitoringService.getCpuMetrics();
          // 데이터 정규화: 안전하게 문자열로 변환
          const normalizedCpu = {
            system: String(cpuMetrics.system ?? '0'),
            process: String(cpuMetrics.process ?? '0'),
            timestamp: Date.now()
          };
          setCpuData((prev) => [...prev, normalizedCpu].slice(-maxDataPoints));
          break;
        }
        case 'memory': {
          const memoryMetrics = await MonitoringService.getMemoryMetrics();
          // 데이터 정규화: 안전하게 숫자로 변환
          const normalizedMemory = {
            used: Number(memoryMetrics.used) || 0,
            max: Number(memoryMetrics.max) || 0,
            percentage: Number(memoryMetrics.percentage) || 0,
            heapUsed: Number(memoryMetrics.heapUsed) || 0,
            nonHeapUsed: Number(memoryMetrics.nonHeapUsed) || 0,
            timestamp: Date.now()
          };
          setMemoryData((prev) => [...prev, normalizedMemory].slice(-maxDataPoints));
          break;
        }
        case 'thread': {
          const threadMetrics = await MonitoringService.getThreadMetrics();
          // 데이터 정규화: 안전하게 숫자로 변환
          const normalizedThread = {
            live: Number(threadMetrics.live) || 0,
            daemon: Number(threadMetrics.daemon) || 0,
            peak: Number(threadMetrics.peak) || 0,
            timestamp: Date.now()
          };
          setThreadData((prev) => [...prev, normalizedThread].slice(-maxDataPoints));
          break;
        }
      }
      setLastUpdate(new Date());
    } catch (error: unknown) {
      console.error('Failed to fetch metrics:', error);
      const errorMessage = error instanceof Error ? error.message : '메트릭 조회 실패';
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
      switch (view) {
        case 'cpu': {
          const cpuMetrics = await MonitoringService.getCpuMetrics();
          // 데이터 정규화: 안전하게 문자열로 변환
          const normalizedCpu = {
            system: String(cpuMetrics.system ?? '0'),
            process: String(cpuMetrics.process ?? '0'),
            timestamp: Date.now()
          };
          setCpuData((prev) => [...prev, normalizedCpu].slice(-maxDataPoints));
          break;
        }
        case 'memory': {
          const memoryMetrics = await MonitoringService.getMemoryMetrics();
          // 데이터 정규화: 안전하게 숫자로 변환
          const normalizedMemory = {
            used: Number(memoryMetrics.used) || 0,
            max: Number(memoryMetrics.max) || 0,
            percentage: Number(memoryMetrics.percentage) || 0,
            heapUsed: Number(memoryMetrics.heapUsed) || 0,
            nonHeapUsed: Number(memoryMetrics.nonHeapUsed) || 0,
            timestamp: Date.now()
          };
          setMemoryData((prev) => [...prev, normalizedMemory].slice(-maxDataPoints));
          break;
        }
        case 'thread': {
          const threadMetrics = await MonitoringService.getThreadMetrics();
          // 데이터 정규화: 안전하게 숫자로 변환
          const normalizedThread = {
            live: Number(threadMetrics.live) || 0,
            daemon: Number(threadMetrics.daemon) || 0,
            peak: Number(threadMetrics.peak) || 0,
            timestamp: Date.now()
          };
          setThreadData((prev) => [...prev, normalizedThread].slice(-maxDataPoints));
          break;
        }
      }
      
      setLastUpdate(new Date());
      setViewMode(view);  // ← API 호출 성공 후 화면 전환
    } catch (error: unknown) {
      console.error('Failed to fetch metrics for detail view:', error);
      const errorMessage = error instanceof Error ? error.message : '접근 거부됨';
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
                <div className="metric-label">시스템 사용률</div>
              </div>

              <div className="summary-card">
                <h4>메모리</h4>
                <div className="metric-value">
                  {memoryData.length > 0
                    ? `${parseFloat(
                        String(memoryData[memoryData.length - 1]?.percentage || 0)
                      ).toFixed(2)}%`
                    : 'N/A'}
                </div>
                <div className="metric-label">사용률</div>
              </div>

              <div className="summary-card">
                <h4>스레드</h4>
                <div className="metric-value">
                  {threadData.length > 0
                    ? Math.floor(threadData[threadData.length - 1]?.live || 0)
                    : 'N/A'}
                </div>
                <div className="metric-label">활성 스레드</div>
              </div>

              <div className="summary-card">
                <h4>코어</h4>
                <div className="metric-value">
                  {systemData?.availableProcessors || 'N/A'}
                </div>
                <div className="metric-label">사용 가능</div>
              </div>
            </div>
          </>
        );
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar - admin만 표시 */}
      {isAdmin && (
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>📊 보기</h3>
          <p>상세 메트릭</p>
        </div>

        <div className="sidebar-buttons">
          <button
            className={`sidebar-btn overview ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => handleViewChange('overview')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">
              {loading === 'overview' ? '로딩 중...' : '개요'}
            </span>
          </button>

          <button
            className={`sidebar-btn cpu ${viewMode === 'cpu' ? 'active' : ''}`}
            onClick={() => handleViewChange('cpu')}
            disabled={loading !== null}
          >
            <span className="btn-icon">💻</span>
            <span className="btn-text">
              {loading === 'cpu' ? '로딩 중...' : 'CPU 상세'}
            </span>
          </button>

          <button
            className={`sidebar-btn memory ${viewMode === 'memory' ? 'active' : ''}`}
            onClick={() => handleViewChange('memory')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🧠</span>
            <span className="btn-text">
              {loading === 'memory' ? '로딩 중...' : '메모리 상세'}
            </span>
          </button>

          <button
            className={`sidebar-btn thread ${viewMode === 'thread' ? 'active' : ''}`}
            onClick={() => handleViewChange('thread')}
            disabled={loading !== null}
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">
              {loading === 'thread' ? '로딩 중...' : '스레드 상세'}
            </span>
          </button>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-header">
          <h3>📡 수동 조회</h3>
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
              {loading === 'cpu' ? '로딩 중...' : 'CPU 조회'}
            </span>
          </button>

          <button
            className="sidebar-btn memory-fetch"
            onClick={() => fetchMetricsManually('memory')}
            disabled={loading !== null}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">
              {loading === 'memory' ? '로딩 중...' : '메모리 조회'}
            </span>
          </button>

          <button
            className="sidebar-btn thread-fetch"
            onClick={() => fetchMetricsManually('thread')}
            disabled={loading !== null}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">
              {loading === 'thread' ? '로딩 중...' : '스레드 조회'}
            </span>
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className={`dashboard ${!isAdmin ? 'full-width' : ''}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <h1>시스템 모니터링 대시보드</h1>
            <div className="connection-status">
              <span
                className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}
              >
                {connected ? '● 연결됨' : '○ 연결 끊김'}
              </span>
              {lastUpdate && (
                <span className="last-update">
                  마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="header-right">
            <span className="user-info">
              환영합니다, {user?.username} ({user?.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              로그아웃
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
