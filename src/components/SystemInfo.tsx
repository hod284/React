import React from 'react';
import { SystemInfo as SystemInfoType } from '../types';

interface SystemInfoProps {
  systemData: SystemInfoType | null;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ systemData }) => {
  if (!systemData) {
    return (
      <div className="system-info">
        <h3>System Information</h3>
        <p>Loading system information...</p>
      </div>
    );
  }

  return (
    <div className="system-info">
      <h3>System Information</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Operating System:</span>
          <span className="info-value">{systemData.osName || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">OS Version:</span>
          <span className="info-value">{systemData.osVersion || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Architecture:</span>
          <span className="info-value">{systemData.architecture || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Available Processors:</span>
          <span className="info-value">
            {systemData.availableProcessors || 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM Total Memory:</span>
          <span className="info-value">
            {systemData.jvmTotalMemory
              ? `${systemData.jvmTotalMemory.toFixed(2)} MB`
              : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM Free Memory:</span>
          <span className="info-value">
            {systemData.jvmFreeMemory
              ? `${systemData.jvmFreeMemory.toFixed(2)} MB`
              : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">JVM Max Memory:</span>
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
