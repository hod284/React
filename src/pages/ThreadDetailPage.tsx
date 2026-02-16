import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocket';
import DetailLayout from '../components/DetailLayout';
import { DetailPageProps, MetricsData, ChartDataPoint } from '../types';
import '../styles/Detail.css';

interface ThreadData {
  live: ChartDataPoint[];
  daemon: ChartDataPoint[];
  peak: ChartDataPoint[];
}

const ThreadDetailPage: React.FC<DetailPageProps> = ({ user, onLogout }) => {
  const [threadData, setThreadData] = useState<ThreadData>({
    live: [],
    daemon: [],
    peak: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!websocketService.isConnected()) {
      websocketService.connect(() => {
        websocketService.subscribe('/topic/metrics', handleMetricsUpdate);
      });
    } else {
      websocketService.subscribe('/topic/metrics', handleMetricsUpdate);
    }

    return () => {
      websocketService.unsubscribe('/topic/metrics');
    };
  }, []);

  const handleMetricsUpdate = (data: MetricsData): void => {
    if (!data.threads) return;

    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const live = data.threads.live || 0;
    const daemon = data.threads.daemon || 0;
    const peak = data.threads.peak || 0;

    setThreadData((prev) => ({
      live: [...prev.live, { time: timestamp, value: live }].slice(-60),
      daemon: [...prev.daemon, { time: timestamp, value: daemon }].slice(-60),
      peak: [...prev.peak, { time: timestamp, value: peak }].slice(-60),
    }));
  };

  const currentLive = threadData.live[threadData.live.length - 1]?.value || 0;
  const currentDaemon = threadData.daemon[threadData.daemon.length - 1]?.value || 0;
  const currentPeak = threadData.peak[threadData.peak.length - 1]?.value || 0;

  const metrics = [
    {
      label: '활성 쓰레드',
      value: currentLive,
      unit: '개',
      color: '#f59e0b',
    },
    {
      label: '데몬 쓰레드',
      value: currentDaemon,
      unit: '개',
      color: '#8b5cf6',
    },
    {
      label: 'Peak 쓰레드',
      value: currentPeak,
      unit: '개',
      color: '#ef4444',
    },
    {
      label: '사용자 쓰레드',
      value: Math.max(0, currentLive - currentDaemon),
      unit: '개',
      color: '#06b6d4',
    },
  ];

  const charts = [
    {
      title: '활성 쓰레드 수',
      data: threadData.live,
      color: '#f59e0b',
    },
    {
      title: '데몬 쓰레드 수',
      data: threadData.daemon,
      color: '#8b5cf6',
    },
    {
      title: 'Peak 쓰레드 수',
      data: threadData.peak,
      color: '#ef4444',
    },
  ];

  return (
    <DetailLayout
      title="쓰레드 모니터링"
      user={user}
      onLogout={onLogout}
      onBack={() => navigate('/dashboard')}
      metrics={metrics}
      charts={charts}
    />
  );
};

export default ThreadDetailPage;
