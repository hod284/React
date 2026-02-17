import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import type { ThreadMetrics } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ThreadChartProps {
  data: ThreadMetrics[];
}

const ThreadChart: React.FC<ThreadChartProps> = ({ data }) => {
  const latestData = data[data.length - 1] || { live: 0, daemon: 0, peak: 0 };

  const chartData = {
    labels: ['활성 스레드', '데몬 스레드', '최대 스레드'],
    datasets: [
      {
        label: '스레드 개수',
        data: [latestData.live, latestData.daemon, latestData.peak],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'JVM 스레드 통계',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return context.parsed.y + ' 스레드';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value: string | number) {
            return typeof value === 'number' ? Math.floor(value) : value;
          },
        },
        title: {
          display: true,
          text: '스레드 개수',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ThreadChart;
