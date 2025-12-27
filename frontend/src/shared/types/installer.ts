export interface VersionInfo {
  version: string;
  download_url: string;
  type: 'early' | 'latest' | 'prev';
  release_date?: string;
}

export interface InstallerInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  current_version: string | null;
  latest_version: string | null;
  can_update: boolean;
  dependencies: string[];
  size?: string;
  rating?: number;
  downloads?: number;
  last_updated?: string;
  author?: string;
  homepage?: string;
  icon?: string;
  versions?: VersionInfo[];
}

export interface InstallResult {
  success: boolean;
  message: string;
}

export interface BatchUninstallResponse {
  total: number;
  completed: number;
  failed: number;
  progress: InstallProgress[];
}

export interface BatchUpdateResponse {
  total: number;
  completed: number;
  failed: number;
  progress: InstallProgress[];
}

export const INSTALL_STATUS = {
  PENDING: 'Pending',
  INSTALLING: 'Installing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
} as const;

export type InstallStatus = (typeof INSTALL_STATUS)[keyof typeof INSTALL_STATUS];

export interface InstallProgress {
  id: string;
  status: InstallStatus;
  progress: number;
  message: string;
}

export interface BatchInstallRequest {
  ids: string[];
}

export interface BatchInstallResponse {
  total: number;
  completed: number;
  failed: number;
  progress: InstallProgress[];
}

export interface LogEntry {
  timestamp: string;
  action: string;
  status: string;
  message: string;
  output: string;
}
