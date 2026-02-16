import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import websocketService from '../services/websocket';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { DashboardPageProps, MetricsData, ChartDataPoint } from '../types';
import '../styles/Dashboard.css';

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [cpuHistory, setCpuHistory] = useState<ChartDataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<ChartDataPoint[]>([]);
  const [threadHistory, setThreadHistory] = useState<ChartDataPoint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    websocketService.connect(
      () => {
        setWsConnected(true);
        websocketService.subscribe('/topic/metrics', handleMetricsUpdate);
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setWsConnected(false);
      }
    );

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleMetricsUpdate = (data: MetricsData): void => {
    setMetrics(data);

    const timestamp = new Date(data.timestamp).toLocaleTimeString();

    setCpuHistory((prev) => {
      const newHistory = [...prev, { time: timestamp, value: parseFloat(String(data.cpu?.system || 0)) }];
      return newHistory.slice(-30);
    });

    setMemoryHistory((prev) => {
      const newHistory = [...prev, { time: timestamp, value: data.memory?.percentage || 0 }];
      return newHistory.slice(-30);
    });

    setThreadHistory((prev) => {
      const newHistory = [...prev, { time: timestamp, value: data.threads?.live || 0 }];
      return newHistory.slice(-30);
    });
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>시스템 모니터링 대시보드</h1>
          <div className="connection-status">
            <span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{wsConnected ? '실시간 연결됨' : '연결 끊김'}</span>
          </div>
        </div>
        <div className="header-right">
          <span className="user-info">관리자: {user.username}</span>
          <button onClick={handleLogout} className="btn-logout">
            로그아웃
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="metrics-grid">
          <MetricCard
            title="CPU 사용률"
            value={metrics?.cpu?.system || '0'}
            unit="%"
            subtitle={`프로세스: ${metrics?.cpu?.process || '0'}%`}
            color="#3b82f6"
            onClick={() => navigate('/cpu-detail')}
          />
          <MetricCard
            title="메모리 사용률"
            value={metrics?.memory?.percentage?.toFixed(2) || '0'}
            unit="%"
            subtitle={`${(metrics?.memory?.used || 0).toFixed(0)} MB / ${(metrics?.memory?.max || 0).toFixed(0)} MB`}
            color="#10b981"
            onClick={() => navigate('/memory-detail')}
          />
          <MetricCard
            title="활성 쓰레드"
            value={metrics?.threads?.live || '0'}
            unit=""
            subtitle={`Peak: ${metrics?.threads?.peak || '0'}`}
            color="#f59e0b"
            onClick={() => navigate('/thread-detail')}
          />
          <MetricCard
            title="시스템 정보"
            value={metrics?.cpu?.cores || '0'}
            unit="코어"
            subtitle={metrics?.system?.osName || 'Unknown OS'}
            color="#8b5cf6"
          />
        </div>

        <div className="charts-grid">
          <ChartCard
            title="CPU 사용률 추이"
            data={cpuHistory}
            color="#3b82f6"
            maxValue={100}
          />
          <ChartCard
            title="메모리 사용률 추이"
            data={memoryHistory}
            color="#10b981"
            maxValue={100}
          />
          <ChartCard
            title="쓰레드 수 추이"
            data={threadHistory}
            color="#f59e0b"
          />
        </div>

        {metrics?.system && (
          <div className="system-info-panel">
            <h3>시스템 상세 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">운영체제:</span>
                <span className="info-value">{metrics.system.osName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">버전:</span>
                <span className="info-value">{metrics.system.osVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">아키텍처:</span>
                <span className="info-value">{metrics.system.architecture}</span>
              </div>
              <div className="info-item">
                <span className="info-label">프로세서:</span>
                <span className="info-value">{metrics.system.availableProcessors} 코어</span>
              </div>
              <div className="info-item">
                <span className="info-label">JVM 최대 메모리:</span>
                <span className="info-value">{(metrics.system.jvmMaxMemory || 0).toFixed(0)} MB</span>
              </div>
              <div className="info-item">
                <span className="info-label">JVM 여유 메모리:</span>
                <span className="info-value">{(metrics.system.jvmFreeMemory || 0).toFixed(0)} MB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
