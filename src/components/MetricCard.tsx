import React from 'react';
import { MetricCardProps } from '../types';
import '../styles/Components.css';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, subtitle, color, onClick }) => {
  return (
    <div 
      className={`metric-card-enhanced ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
      style={{
        '--card-color': color,
      } as React.CSSProperties}
    >
      <div className="metric-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${color}20, transparent 70%)` }}></div>
      
      <div className="metric-header">
        <h3>{title}</h3>
        {onClick && (
          <div className="metric-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        )}
      </div>

      <div className="metric-value-wrapper">
        <div className="metric-value" style={{ color }}>
          <span className="value">{value}</span>
          <span className="unit">{unit}</span>
        </div>
        <div className="metric-sparkle" style={{ background: `${color}15` }}>
          <div className="sparkle-dot" style={{ background: color }}></div>
        </div>
      </div>

      {subtitle && (
        <div className="metric-subtitle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>{subtitle}</span>
        </div>
      )}

      {onClick && (
        <div className="metric-action">
          <span>상세보기</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      )}

      <div className="metric-border-gradient" style={{ 
        background: `linear-gradient(135deg, ${color}40, transparent)` 
      }}></div>
    </div>
  );
};

export default MetricCard;
