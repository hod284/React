import React from 'react';
import { Line } from 'react-chartjs-2';
import { MemoryMetrics } from '../types';

interface MemoryChartProps {
  data: MemoryMetrics[];
  maxDataPoints?: number;
}

const MemoryChart: React.FC<MemoryChartProps> = ({ data, maxDataPoints = 30 }) => {
  const chartData = {
    labels: data.map((_, index) => {
      const time = new Date(Date.now() - (data.length - index - 1) * 2000);
      return time.toLocaleTimeString();
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
      },
      {
        label: 'Memory Usage (%)',
        data: data.map((d) => d.percentage || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
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
        text: 'Memory Usage Over Time',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
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
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(0) + ' MB';
          },
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
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
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

export default MemoryChart;
