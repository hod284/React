import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { CpuMetrics } from '../types';
import type { TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CpuChartProps {
  data: CpuMetrics[];
}

const CpuChart: React.FC<CpuChartProps> = ({ data }) => {
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
      },
      {
        label: '프로세스 CPU (%)',
        data: data.map((d) => parseFloat(d.process) || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
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
      },
      title: {
        display: true,
        text: '시간에 따른 CPU 사용률',
        font: {
          size: 16,
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
        },
        title: {
          display: true,
          text: 'CPU 사용률 (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: '시간',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CpuChart;
