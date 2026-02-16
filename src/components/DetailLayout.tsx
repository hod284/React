import React from 'react';
import ChartCard from './ChartCard';
import { DetailLayoutProps } from '../types';
import '../styles/Detail.css';

const DetailLayout: React.FC<DetailLayoutProps> = ({ title, user, onLogout, onBack, metrics, charts }) => {
  return (
    <div className="detail-container">
      <header className="detail-header">
        <div className="header-left">
          <button onClick={onBack} className="btn-back">
            ← 돌아가기
          </button>
          <h1>{title}</h1>
        </div>
        <div className="header-right">
          <span className="user-info">관리자: {user.username}</span>
          <button onClick={onLogout} className="btn-logout">
            로그아웃
          </button>
        </div>
      </header>

      <div className="detail-content">
        <div className="detail-metrics-grid">
          {metrics.map((metric, index) => (
            <div key={index} className="detail-metric-card">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value-container">
                <span className="metric-main-value" style={{ color: metric.color }}>
                  {metric.value}
                </span>
                <span className="metric-unit">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="detail-charts-grid">
          {charts.map((chart, index) => (
            <ChartCard
              key={index}
              title={chart.title}
              data={chart.data}
              color={chart.color}
              maxValue={chart.maxValue}
              unit={chart.unit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailLayout;
