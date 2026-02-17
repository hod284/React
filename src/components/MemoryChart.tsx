import React from 'react';
import { Line } from 'react-chartjs-2';
import type { MemoryMetrics } from '../types';
import type { TooltipItem, ChartOptions } from 'chart.js';

interface MemoryChartProps {
  data: MemoryMetrics[];
}

const MemoryChart: React.FC<MemoryChartProps> = ({ data }) => {
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
        label: '사용 중인 메모리 (MB)',
        data: data.map((d) => d.used || 0),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: '메모리 사용률 (%)',
        data: data.map((d) => d.percentage || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
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
        text: '시간에 따른 메모리 사용량',
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
        },
        ticks: {
          callback: function (value: string | number) {
            return typeof value === 'number' ? value.toFixed(0) + ' MB' : value;
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
          text: '백분율 (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: string | number) {
            return typeof value === 'number' ? value + '%' : value;
          },
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

export default MemoryChart;
