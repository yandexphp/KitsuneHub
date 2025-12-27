import axios from 'axios';
import {
  BatchInstallResponse,
  BatchUninstallResponse,
  BatchUpdateResponse,
  INSTALL_STATUS,
  InstallerInfo,
  InstallProgress,
  InstallResult,
  LogEntry,
} from '../types/installer';
import { mockInstallers } from './mock-data';

const API_TIMEOUT = 30000;
const MOCK_DELAY_GET_ALL = 300;
const MOCK_DELAY_GET_BY_ID = 200;
const MOCK_DELAY_INSTALL_UPDATE = 1000;
const MOCK_DELAY_SWITCH_VERSION = 1500;
const MOCK_DELAY_LAUNCH = 500;
const MOCK_DELAY_BATCH_START = 500;
const MOCK_DELAY_BATCH_ITEM = 800;
const MOCK_FAILURE_RATE = 0.1;

const api = axios.create({
  baseURL: '/api',
  timeout: API_TIMEOUT,
});

const USE_MOCK = true;

const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const installerApi = {
  getAll: async (): Promise<InstallerInfo[]> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_GET_ALL);
      return mockInstallers;
    }
    const response = await api.get<InstallerInfo[]>('/installers');
    return response.data;
  },

  getById: async (id: string): Promise<InstallerInfo> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_GET_BY_ID);
      const installer = mockInstallers.find((i) => i.id === id);
      if (!installer) {
        throw new Error('Application not found');
      }
      return installer;
    }
    const response = await api.get<InstallerInfo>(`/installers/${id}`);
    return response.data;
  },

  install: async (id: string, version?: string): Promise<InstallResult> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_INSTALL_UPDATE);
      return {
        success: true,
        message: `Application installed successfully${version ? ` (version ${version})` : ''}`,
      };
    }
    const response = await api.post<InstallResult>(`/installers/${id}/install`, { version });
    return response.data;
  },

  update: async (id: string, version?: string): Promise<InstallResult> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_INSTALL_UPDATE);
      return {
        success: true,
        message: `Application updated successfully${version ? ` (version ${version})` : ''}`,
      };
    }
    const response = await api.post<InstallResult>(`/installers/${id}/update`, { version });
    return response.data;
  },

  switchVersion: async (id: string, version: string): Promise<InstallResult> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_SWITCH_VERSION);
      return { success: true, message: `Switched to version ${version} successfully` };
    }
    const response = await api.post<InstallResult>(`/installers/${id}/switch-version`, { version });
    return response.data;
  },

  launch: async (id: string): Promise<InstallResult> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_LAUNCH);
      return { success: true, message: 'Application launched successfully' };
    }
    const response = await api.post<InstallResult>(`/installers/${id}/launch`);
    return response.data;
  },

  uninstall: async (id: string): Promise<InstallResult> => {
    const response = await api.post<InstallResult>(`/installers/${id}/uninstall`);
    return response.data;
  },

  batchInstall: async (ids: string[]): Promise<BatchInstallResponse> => {
    const response = await api.post<BatchInstallResponse>('/installers/batch-install', { ids });
    return response.data;
  },

  batchUninstall: async (ids: string[]): Promise<BatchUninstallResponse> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_BATCH_START);
      const progress: InstallProgress[] = [];
      let completed = 0;
      let failed = 0;

      for (let i = 0; i < ids.length; i++) {
        await delay(MOCK_DELAY_BATCH_ITEM);
        const success = Math.random() > MOCK_FAILURE_RATE;
        if (success) {
          completed++;
        } else {
          failed++;
        }
        progress.push({
          id: ids[i],
          status: success ? INSTALL_STATUS.COMPLETED : INSTALL_STATUS.FAILED,
          progress: 100,
          message: success ? 'Uninstalled successfully' : 'Uninstall failed',
        });
      }

      return {
        total: ids.length,
        completed,
        failed,
        progress,
      };
    }
    const response = await api.post<BatchUninstallResponse>('/installers/batch-uninstall', { ids });
    return response.data;
  },

  batchUpdate: async (ids: string[]): Promise<BatchUpdateResponse> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_BATCH_START);
      const progress: InstallProgress[] = [];
      let completed = 0;
      let failed = 0;

      for (let i = 0; i < ids.length; i++) {
        await delay(MOCK_DELAY_INSTALL_UPDATE);
        const success = Math.random() > MOCK_FAILURE_RATE;
        if (success) {
          completed++;
        } else {
          failed++;
        }
        progress.push({
          id: ids[i],
          status: success ? INSTALL_STATUS.COMPLETED : INSTALL_STATUS.FAILED,
          progress: 100,
          message: success ? 'Updated successfully' : 'Update failed',
        });
      }

      return {
        total: ids.length,
        completed,
        failed,
        progress,
      };
    }
    const response = await api.post<BatchUpdateResponse>('/installers/batch-update', { ids });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_GET_BY_ID);
      const categories = Array.from(new Set(mockInstallers.map((i) => i.category)));
      return categories.sort();
    }
    const response = await api.get<string[]>('/categories');
    return response.data;
  },

  getLogs: async (id: string): Promise<LogEntry[]> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY_GET_BY_ID);
      return [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'install',
          status: 'success',
          message: 'Installation completed successfully',
          output: 'Installation completed successfully',
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: 'check',
          status: 'info',
          message: 'Checking dependencies',
          output: 'Checking dependencies...',
        },
      ];
    }
    const response = await api.get<LogEntry[]>(`/installers/${id}/logs`);
    return response.data;
  },
};
