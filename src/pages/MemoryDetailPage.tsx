import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocket';
import DetailLayout from '../components/DetailLayout';
import { DetailPageProps, MetricsData, ChartDataPoint } from '../types';
import '../styles/Detail.css';

interface MemoryData {
  used: ChartDataPoint[];
  committed: ChartDataPoint[];
  percentage: ChartDataPoint[];
  heapUsed: ChartDataPoint[];
  nonHeapUsed: ChartDataPoint[];
  max: number;
}

const MemoryDetailPage: React.FC<DetailPageProps> = ({ user, onLogout }) => {
  const [memoryData, setMemoryData] = useState<MemoryData>({
    used: [],
    committed: [],
    percentage: [],
    heapUsed: [],
    nonHeapUsed: [],
    max: 0,
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
    if (!data.memory) return;

    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const used = data.memory.used || 0;
    const committed = data.memory.committed || 0;
    const percentage = data.memory.percentage || 0;
    const heapUsed = data.memory.heapUsed || 0;
    const nonHeapUsed = data.memory.nonHeapUsed || 0;

    setMemoryData((prev) => ({
      used: [...prev.used, { time: timestamp, value: used }].slice(-60),
      committed: [...prev.committed, { time: timestamp, value: committed }].slice(-60),
      percentage: [...prev.percentage, { time: timestamp, value: percentage }].slice(-60),
      heapUsed: [...prev.heapUsed, { time: timestamp, value: heapUsed }].slice(-60),
      nonHeapUsed: [...prev.nonHeapUsed, { time: timestamp, value: nonHeapUsed }].slice(-60),
      max: data.memory.max || prev.max,
    }));
  };

  const currentUsed = memoryData.used[memoryData.used.length - 1]?.value || 0;
  const currentPercentage = memoryData.percentage[memoryData.percentage.length - 1]?.value || 0;
  const currentHeap = memoryData.heapUsed[memoryData.heapUsed.length - 1]?.value || 0;
  const currentNonHeap = memoryData.nonHeapUsed[memoryData.nonHeapUsed.length - 1]?.value || 0;

  const metrics = [
    {
      label: '사용 중인 메모리',
      value: currentUsed.toFixed(0),
      unit: 'MB',
      color: '#10b981',
    },
    {
      label: '메모리 사용률',
      value: currentPercentage.toFixed(2),
      unit: '%',
      color: '#3b82f6',
    },
    {
      label: '최대 메모리',
      value: memoryData.max.toFixed(0),
      unit: 'MB',
      color: '#6366f1',
    },
    {
      label: 'Heap 메모리',
      value: currentHeap.toFixed(0),
      unit: 'MB',
      color: '#8b5cf6',
    },
    {
      label: 'Non-Heap 메모리',
      value: currentNonHeap.toFixed(0),
      unit: 'MB',
      color: '#ec4899',
    },
  ];

  const charts = [
    {
      title: '메모리 사용률',
      data: memoryData.percentage,
      color: '#3b82f6',
      maxValue: 100,
      unit: '%',
    },
    {
      title: '사용 중인 메모리',
      data: memoryData.used,
      color: '#10b981',
      unit: 'MB',
    },
    {
      title: 'Heap 메모리 사용량',
      data: memoryData.heapUsed,
      color: '#8b5cf6',
      unit: 'MB',
    },
    {
      title: 'Non-Heap 메모리 사용량',
      data: memoryData.nonHeapUsed,
      color: '#ec4899',
      unit: 'MB',
    },
  ];

  return (
    <DetailLayout
      title="메모리 모니터링"
      user={user}
      onLogout={onLogout}
      onBack={() => navigate('/dashboard')}
      metrics={metrics}
      charts={charts}
    />
  );
};

export default MemoryDetailPage;
