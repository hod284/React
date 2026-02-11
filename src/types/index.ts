// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
}

export interface User {
  username: string;
  role: string;
}

// Metrics Types
export interface CPUMetrics {
  system: string | number;
  process: string | number;
  cores: number;
}

export interface MemoryMetrics {
  used: number;
  max: number;
  committed: number;
  percentage: number;
  heapUsed?: number;
  nonHeapUsed?: number;
}

export interface ThreadMetrics {
  live: number;
  daemon: number;
  peak: number;
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
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  threads: ThreadMetrics;
  system: SystemInfo;
  timestamp: number;
}

// Chart Types
export interface ChartDataPoint {
  time: string;
  value: number;
}

// Component Props Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  subtitle?: string;
  color: string;
  onClick?: () => void;
}

export interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
  maxValue?: number;
  unit?: string;
}

export interface DetailMetric {
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

export interface DetailChart {
  title: string;
  data: ChartDataPoint[];
  color: string;
  maxValue?: number;
  unit?: string;
}

export interface DetailLayoutProps {
  title: string;
  user: User;
  onLogout: () => void;
  onBack: () => void;
  metrics: DetailMetric[];
  charts: DetailChart[];
}

// Page Props Types
export interface LoginPageProps {
  onLogin: (authData: AuthResponse) => void;
}

export interface RegisterPageProps {
  onRegister: (authData: AuthResponse) => void;
}

export interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export interface DetailPageProps {
  user: User;
  onLogout: () => void;
}
