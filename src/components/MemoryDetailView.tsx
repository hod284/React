import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,  // ← 추가!
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { MemoryMetrics, SystemInfo } from '../types';
import type { TooltipItem, ChartOptions } from 'chart.js';
import '../DetailView.css';
// ← ArcElement 등록!
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,  // ← 추가!
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MemoryDetailViewProps {
  data: MemoryMetrics[];
  systemData: SystemInfo | null;
}

const MemoryDetailView: React.FC<MemoryDetailViewProps> = ({ data, systemData }) => {
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  const lineChartData = {
    labels: data.map((item) => {
      if (item.timestamp) {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString();
      }
      return '';
    }),
    datasets: [
      {
        label: '사용 중인 메모리 (MB)',
        data: data.map((d) => d.used || 0),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
        borderWidth: 3,
      },
      {
        label: '메모리 사용률 (%)',
        data: data.map((d) => d.percentage || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        borderWidth: 3,
      },
    ],
  };

  const lineOptions: ChartOptions<'line'> = {
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
          color: '#333',
        },
      },
      title: {
        display: true,
        text: '시간에 따른 메모리 사용량 (상세 보기)',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('%')) {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y.toFixed(2) + ' MB';
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '메모리 (MB)',
          font: {
            size: 14,
          },
          color: '#333',
        },
        ticks: {
          callback: function (value: string | number) {
            return typeof value === 'number' ? value.toFixed(0) + ' MB' : value;
          },
          font: {
            size: 12,
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        max: 100,
        title: {
          display: true,
          text: '백분율 (%)',
          font: {
            size: 14,
          },
          color: '#333',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: string | number) {
            return typeof value === 'number' ? value + '%' : value;
          },
          font: {
            size: 12,
          },
          color: '#666',
        },
      },
      x: {
        title: {
          display: true,
          text: '시간',
          font: {
            size: 14,
          },
          color: '#333',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const doughnutData = {
    labels: ['사용 중인 메모리', '여유 메모리'],
    datasets: [
      {
        data: [
          latestData?.used || 0,
          (latestData?.max || 0) - (latestData?.used || 0),
        ],
        backgroundColor: [
          'rgba(153, 102, 255, 0.8)',
          'rgba(201, 203, 207, 0.3)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 13,
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: '현재 메모리 분포',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)} MB`;
          },
        },
      },
    },
  };

  const calculateStats = () => {
    if (data.length === 0) return null;

    const usedValues = data.map((d) => d.used || 0);
    const percentageValues = data.map((d) => d.percentage || 0);

    const avgUsed = usedValues.reduce((a, b) => a + b, 0) / usedValues.length;
    const avgPercentage =
      percentageValues.reduce((a, b) => a + b, 0) / percentageValues.length;
    const maxUsed = Math.max(...usedValues);
    const minUsed = Math.min(...usedValues);

    return {
      avgUsed,
      avgPercentage,
      maxUsed,
      minUsed,
    };
  };

  const stats = calculateStats();

  return (
    <div className="detail-view">
      <div className="detail-header">
        <h2>🧠 메모리 메트릭 - 상세 분석</h2>
        <p>실시간 메모리 사용률 및 할당 추적</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card memory-used">
          <h3>사용 중인 메모리</h3>
          <div className="stat-value">
            {latestData ? `${latestData.used.toFixed(2)} MB` : 'N/A'}
          </div>
          <div className="stat-label">현재 할당량</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {stats.avgUsed.toFixed(2)} MB</span>
              <span>최대: {stats.maxUsed.toFixed(2)} MB</span>
            </div>
          )}
        </div>

        <div className="stat-card memory-percentage">
          <h3>사용률</h3>
          <div className="stat-value">
            {latestData ? `${latestData.percentage.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">메모리 사용률</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {stats.avgPercentage.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card memory-max">
          <h3>최대 메모리</h3>
          <div className="stat-value">
            {latestData ? `${latestData.max.toFixed(2)} MB` : 'N/A'}
          </div>
          <div className="stat-label">총 사용 가능량</div>
          {latestData && (
            <div className="stat-sub">
              <span>여유: {(latestData.max - latestData.used).toFixed(2)} MB</span>
            </div>
          )}
        </div>

        <div className="stat-card jvm-memory">
          <h3>JVM 메모리</h3>
          <div className="stat-value">
            {systemData ? `${systemData.jvmMaxMemory.toFixed(0)} MB` : 'N/A'}
          </div>
          <div className="stat-label">JVM 최대 메모리</div>
          {systemData && (
            <div className="stat-sub">
              <span>전체: {systemData.jvmTotalMemory.toFixed(0)} MB</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-charts-row">
        <div className="detail-chart">
          <div className="chart-wrapper" style={{ height: '400px' }}>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        <div className="detail-chart-small">
          <div className="chart-wrapper" style={{ height: '400px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {stats && latestData && (
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
                <td>사용 중인 메모리</td>
                <td>{latestData.used.toFixed(2)} MB</td>
                <td>{stats.avgUsed.toFixed(2)} MB</td>
                <td>{stats.maxUsed.toFixed(2)} MB</td>
                <td>{stats.minUsed.toFixed(2)} MB</td>
              </tr>
              <tr>
                <td>사용률</td>
                <td>{latestData.percentage.toFixed(2)}%</td>
                <td>{stats.avgPercentage.toFixed(2)}%</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>여유 메모리</td>
                <td>{(latestData.max - latestData.used).toFixed(2)} MB</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>힙 메모리</td>
                <td>{latestData.heapUsed ? latestData.heapUsed.toFixed(2) : 'N/A'} MB</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>논힙 메모리</td>
                <td>{latestData.nonHeapUsed ? latestData.nonHeapUsed.toFixed(2) : 'N/A'} MB</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemoryDetailView;
