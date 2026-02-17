import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { ThreadMetrics, SystemInfo } from '../types';
import type { TooltipItem } from 'chart.js';
import '../DetailView.css';
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
        label: '활성 스레드',
        data: data.map((d) => d.live || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: '데몬 스레드',
        data: data.map((d) => d.daemon || 0),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: '최대 스레드',
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
        text: '시간에 따른 스레드 수 (상세 보기)',
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
              label += Math.floor(context.parsed.y) + ' 스레드';
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
          text: '스레드 개수',
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

  const barChartData = {
    labels: ['활성 스레드', '데몬 스레드', '일반 스레드', '최대 스레드'],
    datasets: [
      {
        label: '스레드 개수',
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
        text: '현재 스레드 분포',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1a1a1a',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return Math.floor(context.parsed.y || 0) + ' 스레드';
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
          text: '스레드 개수',
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
        <h2>🔄 스레드 메트릭 - 상세 분석</h2>
        <p>실시간 JVM 스레드 모니터링 및 라이프사이클 추적</p>
      </div>

      <div className="detail-stats-grid">
        <div className="stat-card thread-live">
          <h3>활성 스레드</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.live) : 'N/A'}
          </div>
          <div className="stat-label">현재 활성화</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {Math.floor(stats.avgLive)}</span>
              <span>최대: {Math.floor(stats.maxLive)}</span>
            </div>
          )}
        </div>

        <div className="stat-card thread-daemon">
          <h3>데몬 스레드</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.daemon) : 'N/A'}
          </div>
          <div className="stat-label">백그라운드 스레드</div>
          {stats && (
            <div className="stat-sub">
              <span>평균: {Math.floor(stats.avgDaemon)}</span>
            </div>
          )}
        </div>

        <div className="stat-card thread-user">
          <h3>일반 스레드</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.live - latestData.daemon) : 'N/A'}
          </div>
          <div className="stat-label">논데몬 스레드</div>
          {latestData && (
            <div className="stat-sub">
              <span>
                {((((latestData.live - latestData.daemon) / latestData.live) * 100) || 0).toFixed(1)}% 전체 중
              </span>
            </div>
          )}
        </div>

        <div className="stat-card thread-peak">
          <h3>최대 스레드</h3>
          <div className="stat-value">
            {latestData ? Math.floor(latestData.peak) : 'N/A'}
          </div>
          <div className="stat-label">최대 도달</div>
          {stats && (
            <div className="stat-sub">
              <span>최대: {Math.floor(stats.maxPeak)}</span>
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
              <h3>💡 스레드 유형 설명</h3>
              <ul>
                <li>
                  <strong>활성 스레드:</strong> JVM에서 현재 활성화된 모든 스레드
                </li>
                <li>
                  <strong>데몬 스레드:</strong> JVM 종료를 방해하지 않는 백그라운드 스레드
                </li>
                <li>
                  <strong>일반 스레드:</strong> JVM이 종료되기 전에 완료되어야 하는 일반 스레드
                </li>
                <li>
                  <strong>최대 스레드:</strong> JVM 시작 이후 최대 스레드 개수
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📊 현재 상태</h3>
              <ul>
                <li>
                  <strong>데몬 비율:</strong>{' '}
                  {((latestData.daemon / latestData.live) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>일반 비율:</strong>{' '}
                  {(((latestData.live - latestData.daemon) / latestData.live) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>최대 사용률:</strong>{' '}
                  {((latestData.live / latestData.peak) * 100 || 0).toFixed(1)}%
                </li>
                <li>
                  <strong>사용 가능한 프로세서:</strong> {systemData?.availableProcessors || 'N/A'}
                </li>
              </ul>
            </div>
          </div>

          <div className="detail-table">
            <h3>통계 요약</h3>
            <table>
              <thead>
                <tr>
                  <th>메트릭</th>
                  <th>현재</th>
                  <th>평균</th>
                  <th>최대</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>활성 스레드</td>
                  <td>{Math.floor(latestData.live)}</td>
                  <td>{Math.floor(stats.avgLive)}</td>
                  <td>{Math.floor(stats.maxLive)}</td>
                </tr>
                <tr>
                  <td>데몬 스레드</td>
                  <td>{Math.floor(latestData.daemon)}</td>
                  <td>{Math.floor(stats.avgDaemon)}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>일반 스레드</td>
                  <td>{Math.floor(latestData.live - latestData.daemon)}</td>
                  <td>
                    {Math.floor(stats.avgLive - stats.avgDaemon)}
                  </td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>최대 스레드</td>
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
