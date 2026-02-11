import React from 'react';
import { MetricCardProps } from '../types';
import '../styles/Components.css';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, subtitle, color, onClick }) => {
  return (
    <div className={`metric-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="metric-header">
        <h3>{title}</h3>
      </div>
      <div className="metric-value" style={{ color }}>
        <span className="value">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {onClick && (
        <div className="metric-action">
          <span>상세보기 →</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
