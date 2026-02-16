import React from 'react';
import { Line } from 'react-chartjs-2';
import type { CpuMetrics, SystemInfo } from '../types';
import type { TooltipItem } from 'chart.js';

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
        label: 'System CPU (%)',
        data: data.map((d) => parseFloat(d.system) || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Process CPU (%)',
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
        },
      },
      title: {
        display: true,
        text: 'CPU Usage Over Time (Detailed View)',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
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
        },
        title: {
          display: true,
          text: 'CPU Usage (%)',
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
          },
        },
        ticks: {
          font: {
            size: 11,
          },
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
        <h2>💻 CPU Metrics - Detailed Analysis</h2>
        <p>Real-time processor utilization and performance metrics</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card system-cpu">
          <h3>System CPU</h3>
          <div className="stat-value">
            {latestData ? `${parseFloat(latestData.system).toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">Current Usage</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {stats.avgSystem.toFixed(2)}%</span>
              <span>Max: {stats.maxSystem.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card process-cpu">
          <h3>Process CPU</h3>
          <div className="stat-value">
            {latestData ? `${parseFloat(latestData.process).toFixed(2)}%` : 'N/A'}
          </div>
          <div className="stat-label">Current Usage</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {stats.avgProcess.toFixed(2)}%</span>
              <span>Max: {stats.maxProcess.toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="stat-card cores">
          <h3>CPU Cores</h3>
          <div className="stat-value">{systemData?.availableProcessors || 'N/A'}</div>
          <div className="stat-label">Available Processors</div>
          <div className="stat-sub">
            <span>Architecture: {systemData?.architecture || 'N/A'}</span>
          </div>
        </div>

        <div className="stat-card data-points">
          <h3>Data Points</h3>
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Collected Samples</div>
          <div className="stat-sub">
            <span>Max: 50 points</span>
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
                <td>System CPU</td>
                <td>{latestData ? parseFloat(latestData.system).toFixed(2) : 'N/A'}%</td>
                <td>{stats.avgSystem.toFixed(2)}%</td>
                <td>{stats.maxSystem.toFixed(2)}%</td>
                <td>{stats.minSystem.toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Process CPU</td>
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
