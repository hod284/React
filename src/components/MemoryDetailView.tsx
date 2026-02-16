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
        label: 'Used Memory (MB)',
        data: data.map((d) => d.used || 0),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
        borderWidth: 3,
      },
      {
        label: 'Memory Usage (%)',
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
        text: 'Memory Usage Over Time (Detailed View)',
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
          text: 'Memory (MB)',
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
          text: 'Percentage (%)',
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
          text: 'Time',
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
    labels: ['Used Memory', 'Free Memory'],
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
        text: 'Current Memory Distribution',
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
        <h2>🧠 Memory Metrics - Detailed Analysis</h2>
        <p>Real-time memory utilization and allocation tracking</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card memory-used">
          <h3>Used Memory</h3>
          <div className="stat-value">
            {latestData ? `${latestData.used.toFixed(2)} MB` : 'N/A'}
          </div>
          <div className="stat-label">Current Allocation</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {stats.avgUsed.toFixed(2)} MB</span>
              <span>Max: {stats.maxUsed.toFixed(2)} MB</span>
            </div>
          )}
        </div>

        <div className="stat-card memory-percentage">
          <h3>Usage Percentage</h3>
          <div className="stat-value">
            {latestData ? `${latestData.percentage.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">Memory Utilization</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {stats.avgPercentage.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card memory-max">
          <h3>Max Memory</h3>
          <div className="stat-value">
            {latestData ? `${latestData.max.toFixed(2)} MB` : 'N/A'}
          </div>
          <div className="stat-label">Total Available</div>
          {latestData && (
            <div className="stat-sub">
              <span>Free: {(latestData.max - latestData.used).toFixed(2)} MB</span>
            </div>
          )}
        </div>

        <div className="stat-card jvm-memory">
          <h3>JVM Memory</h3>
          <div className="stat-value">
            {systemData ? `${systemData.jvmMaxMemory.toFixed(0)} MB` : 'N/A'}
          </div>
          <div className="stat-label">JVM Max Memory</div>
          {systemData && (
            <div className="stat-sub">
              <span>Total: {systemData.jvmTotalMemory.toFixed(0)} MB</span>
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
          <h3>Statistical Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Average</th>
                <th>Maximum</th>
                <th>Minimum</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Used Memory</td>
                <td>{latestData.used.toFixed(2)} MB</td>
                <td>{stats.avgUsed.toFixed(2)} MB</td>
                <td>{stats.maxUsed.toFixed(2)} MB</td>
                <td>{stats.minUsed.toFixed(2)} MB</td>
              </tr>
              <tr>
                <td>Usage Percentage</td>
                <td>{latestData.percentage.toFixed(2)}%</td>
                <td>{stats.avgPercentage.toFixed(2)}%</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Free Memory</td>
                <td>{(latestData.max - latestData.used).toFixed(2)} MB</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Heap Memory</td>
                <td>{latestData.heapUsed ? latestData.heapUsed.toFixed(2) : 'N/A'} MB</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Non-Heap Memory</td>
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
