import React from 'react';
import { Line } from 'react-chartjs-2';
import type { CpuMetrics, SystemInfo } from '../types';
import type { TooltipItem } from 'chart.js';
import '../DetailView.css';
interface CpuDetailViewProps {
  data: CpuMetrics[];
  systemData: SystemInfo | null;
}

const CpuDetailView: React.FC<CpuDetailViewProps> = ({ data, systemData }) => {
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  const chartData = {
    labels: data.map((item) => {
      if (item.timestamp) {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString();
      }
      return '';
    }),
    datasets: [
      {
        label: '시스템 CPU (%)',
        data: data.map((d) => parseFloat(d.system) || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: '프로세스 CPU (%)',
        data: data.map((d) => parseFloat(d.process) || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          color: '#1a1a1a',
        },
      },
      title: {
        display: true,
        text: '시간에 따른 CPU 사용률 (상세 보기)',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        color: '#1a1a1a',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: string | number) {
            return value + '%';
          },
          font: {
            size: 12,
          },
          color: '#333',
        },
        title: {
          display: true,
          text: 'CPU 사용률 (%)',
          font: {
            size: 14,
          },
          color: '#1a1a1a',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: '시간',
          font: {
            size: 14,
          },
          color: '#1a1a1a',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#333',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const calculateStats = () => {
    if (data.length === 0) return null;

    const systemValues = data.map((d) => parseFloat(d.system) || 0);
    const processValues = data.map((d) => parseFloat(d.process) || 0);

    const avgSystem = systemValues.reduce((a, b) => a + b, 0) / systemValues.length;
    const avgProcess = processValues.reduce((a, b) => a + b, 0) / processValues.length;
    const maxSystem = Math.max(...systemValues);
    const maxProcess = Math.max(...processValues);
    const minSystem = Math.min(...systemValues);
    const minProcess = Math.min(...processValues);

    return {
      avgSystem,
      avgProcess,
      maxSystem,
      maxProcess,
      minSystem,
      minProcess,
    };
  };

  const stats = calculateStats();

  return (
    <div className="detail-view">
      <div className="detail-header">
        <h2>💻 CPU 메트릭 - 상세 분석</h2>
        <p>실시간 프로세서 사용률 및 성능 메트릭</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card system-cpu">
          <h3>시스템 CPU</h3>
          <div className="stat-value">
            {latestData ? `${parseFloat(latestData.system).toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">현재 사용률</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {stats.avgSystem.toFixed(2)}%</span>
              <span>최대: {stats.maxSystem.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card process-cpu">
          <h3>프로세스 CPU</h3>
          <div className="stat-value">
            {latestData ? `${parseFloat(latestData.process).toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">현재 사용률</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {stats.avgProcess.toFixed(2)}%</span>
              <span>최대: {stats.maxProcess.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card cores">
          <h3>CPU 코어</h3>
          <div className="stat-value">{systemData?.availableProcessors || 'N/A'}</div>
          <div className="stat-label">사용 가능한 프로세서</div>
          <div className="stat-sub">
            <span>아키텍처: {systemData?.architecture || 'N/A'}</span>
          </div>
        </div>

        <div className="stat-card data-points">
          <h3>데이터 포인트</h3>
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">수집된 샘플</div>
          <div className="stat-sub">
            <span>최대: 50 포인트</span>
          </div>
        </div>
      </div>

      <div className="detail-chart">
        <div className="chart-wrapper" style={{ height: '500px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {stats && (
        <div className="detail-table">
          <h3>통계 요약</h3>
          <table>
            <thead>
              <tr>
                <th>메트릭</th>
                <th>현재</th>
                <th>평균</th>
                <th>최대</th>
                <th>최소</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>시스템 CPU</td>
                <td>{latestData ? parseFloat(latestData.system).toFixed(2) : 'N/A'}%</td>
                <td>{stats.avgSystem.toFixed(2)}%</td>
                <td>{stats.maxSystem.toFixed(2)}%</td>
                <td>{stats.minSystem.toFixed(2)}%</td>
              </tr>
              <tr>
                <td>프로세스 CPU</td>
                <td>{latestData ? parseFloat(latestData.process).toFixed(2) : 'N/A'}%</td>
                <td>{stats.avgProcess.toFixed(2)}%</td>
                <td>{stats.maxProcess.toFixed(2)}%</td>
                <td>{stats.minProcess.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CpuDetailView;
