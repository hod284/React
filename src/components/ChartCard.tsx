import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Area,
  AreaChart,
} from 'recharts';
import { ChartCardProps } from '../types';
import '../styles/Components.css';

const ChartCard: React.FC<ChartCardProps> = ({ title, data, color, maxValue, unit = '' }) => {
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: `2px solid ${color}`,
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#f3f4f6',
            boxShadow: `0 8px 32px ${color}40`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
            {`${payload[0].value?.toFixed(2)}${unit}`}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            {title}
          </p>
        </div>
      );
    }
    return null;
  };

  // 색상에서 RGB 추출하여 그라디언트 생성
  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <div className="chart-card-enhanced">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-value-display" style={{ color }}>
          {data.length > 0 && `${data[data.length - 1].value.toFixed(1)}${unit}`}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            domain={maxValue ? [0, maxValue] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ 
              r: 6, 
              fill: color, 
              stroke: '#0f172a', 
              strokeWidth: 2,
              filter: 'url(#glow)'
            }}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
