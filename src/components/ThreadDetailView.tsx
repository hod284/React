import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { ThreadMetrics, SystemInfo } from '../types';
import type { TooltipItem } from 'chart.js';

interface ThreadDetailViewProps {
  data: ThreadMetrics[];
  systemData: SystemInfo | null;
}

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({ data, systemData }) => {
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
        label: 'Live Threads',
        data: data.map((d) => d.live || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Daemon Threads',
        data: data.map((d) => d.daemon || 0),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Peak Threads',
        data: data.map((d) => d.peak || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  const lineOptions = {
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
        text: 'Thread Count Over Time (Detailed View)',
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
              label += Math.floor(context.parsed.y) + ' threads';
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          callback: function (value: string | number) {
            return typeof value === 'number' ? Math.floor(value) : value;
          },
          font: {
            size: 12,
          },
          color: '#333',
        },
        title: {
          display: true,
          text: 'Number of Threads',
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
          text: 'Time',
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

  const barChartData = {
    labels: ['Live Threads', 'Daemon Threads', 'Non-Daemon Threads', 'Peak Threads'],
    datasets: [
      {
        label: 'Thread Count',
        data: [
          latestData?.live || 0,
          latestData?.daemon || 0,
          (latestData?.live || 0) - (latestData?.daemon || 0),
          latestData?.peak || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Current Thread Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1a1a1a',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return Math.floor(context.parsed.y || 0) + ' threads';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          callback: function (value: string | number) {
            return typeof value === 'number' ? Math.floor(value) : value;
          },
          color: '#333',
        },
        title: {
          display: true,
          text: 'Number of Threads',
          color: '#1a1a1a',
        },
      },
      x: {
        ticks: {
          color: '#333',
        },
      },
    },
  };

  const calculateStats = () => {
    if (data.length === 0) return null;

    const liveValues = data.map((d) => d.live || 0);
    const daemonValues = data.map((d) => d.daemon || 0);
    const peakValues = data.map((d) => d.peak || 0);

    const avgLive = liveValues.reduce((a, b) => a + b, 0) / liveValues.length;
    const avgDaemon = daemonValues.reduce((a, b) => a + b, 0) / daemonValues.length;
    const maxLive = Math.max(...liveValues);
    const maxPeak = Math.max(...peakValues);

    return {
      avgLive,
      avgDaemon,
      maxLive,
      maxPeak,
    };
  };

  const stats = calculateStats();

  return (
    <div className="detail-view">
      <div className="detail-header">
        <h2>🔄 Thread Metrics - Detailed Analysis</h2>
        <p>Real-time JVM thread monitoring and lifecycle tracking</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card thread-live">
          <h3>Live Threads</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.live) : 'N/A'}
          </div>
          <div className="stat-label">Currently Active</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {Math.floor(stats.avgLive)}</span>
              <span>Max: {Math.floor(stats.maxLive)}</span>
            </div>
          )}
        </div>

        <div className="stat-card thread-daemon">
          <h3>Daemon Threads</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.daemon) : 'N/A'}
          </div>
          <div className="stat-label">Background Threads</div>
          {stats && (
            <div className="stat-sub">
              <span>Avg: {Math.floor(stats.avgDaemon)}</span>
            </div>
          )}
        </div>

        <div className="stat-card thread-user">
          <h3>User Threads</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.live - latestData.daemon) : 'N/A'}
          </div>
          <div className="stat-label">Non-Daemon Threads</div>
          {latestData && (
            <div className="stat-sub">
              <span>
                {((((latestData.live - latestData.daemon) / latestData.live) * 100) || 0).toFixed(1)}% of total
              </span>
            </div>
          )}
        </div>

        <div className="stat-card thread-peak">
          <h3>Peak Threads</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.peak) : 'N/A'}
          </div>
          <div className="stat-label">Maximum Reached</div>
          {stats && (
            <div className="stat-sub">
              <span>Max: {Math.floor(stats.maxPeak)}</span>
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
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {stats && latestData && (
        <>
          <div className="detail-info-grid">
            <div className="info-card">
              <h3>💡 Thread Types Explained</h3>
              <ul>
                <li>
                  <strong>Live Threads:</strong> All currently active threads in the JVM
                </li>
                <li>
                  <strong>Daemon Threads:</strong> Background threads that don't prevent JVM
                  shutdown
                </li>
                <li>
                  <strong>User Threads:</strong> Regular threads that must complete before JVM
                  exits
                </li>
                <li>
                  <strong>Peak Threads:</strong> Highest number of threads since JVM started
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📊 Current Status</h3>
              <ul>
                <li>
                  <strong>Daemon Ratio:</strong>{' '}
                  {((latestData.daemon / latestData.live) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>User Ratio:</strong>{' '}
                  {(((latestData.live - latestData.daemon) / latestData.live) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>Peak Utilization:</strong>{' '}
                  {((latestData.live / latestData.peak) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>Available Processors:</strong> {systemData?.availableProcessors || 'N/A'}
                </li>
              </ul>
            </div>
          </div>

          <div className="detail-table">
            <h3>Statistical Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Current</th>
                  <th>Average</th>
                  <th>Maximum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Live Threads</td>
                  <td>{Math.floor(latestData.live)}</td>
                  <td>{Math.floor(stats.avgLive)}</td>
                  <td>{Math.floor(stats.maxLive)}</td>
                </tr>
                <tr>
                  <td>Daemon Threads</td>
                  <td>{Math.floor(latestData.daemon)}</td>
                  <td>{Math.floor(stats.avgDaemon)}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>User Threads</td>
                  <td>{Math.floor(latestData.live - latestData.daemon)}</td>
                  <td>
                    {Math.floor(stats.avgLive - stats.avgDaemon)}
                  </td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Peak Threads</td>
                  <td>{Math.floor(latestData.peak)}</td>
                  <td>-</td>
                  <td>{Math.floor(stats.maxPeak)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadDetailView;
