// Auth related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role?: string;  // ← 추가!
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
}

// Metrics related types
export interface CpuMetrics {
  system: string;
  process: string;
  cores?: number;
  timestamp?: number;
}

export interface MemoryMetrics {
  used: number;
  max: number;
  committed?: number;
  percentage: number;
  heapUsed?: number;
  nonHeapUsed?: number;
  timestamp?: number;
}

export interface ThreadMetrics {
  live: number;
  daemon: number;
  peak: number;
  timestamp?: number;
}

export interface SystemInfo {
  osName: string;
  osVersion: string;
  architecture: string;
  availableProcessors: number;
  jvmTotalMemory: number;
  jvmFreeMemory: number;
  jvmMaxMemory: number;
}

export interface MetricsData {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  threads: ThreadMetrics;
  system: SystemInfo;
  timestamp: number;
}
