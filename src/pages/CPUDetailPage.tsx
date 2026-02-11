import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocket';
import DetailLayout from '../components/DetailLayout';
import { DetailPageProps, MetricsData, ChartDataPoint } from '../types';
import '../styles/Detail.css';

interface CPUData {
  system: ChartDataPoint[];
  process: ChartDataPoint[];
  cores: number;
}

const CPUDetailPage: React.FC<DetailPageProps> = ({ user, onLogout }) => {
  const [cpuData, setCpuData] = useState<CPUData>({
    system: [],
    process: [],
    cores: 0,
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
    if (!data.cpu) return;

    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const systemCpu = parseFloat(String(data.cpu.system || 0));
    const processCpu = parseFloat(String(data.cpu.process || 0));

    setCpuData((prev) => ({
      system: [...prev.system, { time: timestamp, value: systemCpu }].slice(-60),
      process: [...prev.process, { time: timestamp, value: processCpu }].slice(-60),
      cores: data.cpu.cores || prev.cores,
    }));
  };

  const metrics = [
    {
      label: '시스템 CPU 사용률',
      value: cpuData.system[cpuData.system.length - 1]?.value.toFixed(2) || '0',
      unit: '%',
      color: '#3b82f6',
    },
    {
      label: '프로세스 CPU 사용률',
      value: cpuData.process[cpuData.process.length - 1]?.value.toFixed(2) || '0',
      unit: '%',
      color: '#8b5cf6',
    },
    {
      label: 'CPU 코어 수',
      value: cpuData.cores,
      unit: '코어',
      color: '#06b6d4',
    },
  ];

  const charts = [
    {
      title: '시스템 CPU 사용률',
      data: cpuData.system,
      color: '#3b82f6',
      maxValue: 100,
    },
    {
      title: '프로세스 CPU 사용률',
      data: cpuData.process,
      color: '#8b5cf6',
      maxValue: 100,
    },
  ];

  return (
    <DetailLayout
      title="CPU 모니터링"
      user={user}
      onLogout={onLogout}
      onBack={() => navigate('/dashboard')}
      metrics={metrics}
      charts={charts}
    />
  );
};

export default CPUDetailPage;
