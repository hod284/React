import React from 'react';
import type { SystemInfo as SystemInfoType } from '../types';

interface SystemInfoProps {
  systemData: SystemInfoType | null;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ systemData }) => {
  if (!systemData) {
    return (
      <div className="system-info">
        <h3>시스템 정보</h3>
        <p>시스템 정보 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="system-info">
      <h3>시스템 정보</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">운영체제:</span>
          <span className="info-value">{systemData.osName || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">OS 버전:</span>
          <span className="info-value">{systemData.osVersion || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">아키텍처:</span>
          <span className="info-value">{systemData.architecture || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">사용 가능한 프로세서:</span>
          <span className="info-value">
            {systemData.availableProcessors || 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM 전체 메모리:</span>
          <span className="info-value">
            {systemData.jvmTotalMemory
              ? `${systemData.jvmTotalMemory.toFixed(2)} MB`
              : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM 여유 메모리:</span>
          <span className="info-value">
            {systemData.jvmFreeMemory
              ? `${systemData.jvmFreeMemory.toFixed(2)} MB`
              : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM 최대 메모리:</span>
          <span className="info-value">
            {systemData.jvmMaxMemory
              ? `${systemData.jvmMaxMemory.toFixed(2)} MB`
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
