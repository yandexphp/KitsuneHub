import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { installerApi } from '../api/installer-api';
import { installerQueryKeys } from '../api/query-keys';
import { notifications } from '../lib/notifications';

export function useInstallers(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: installerQueryKeys.list(filters || {}),
    queryFn: installerApi.getAll,
    select: (data) => {
      let filtered = data;

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (installer) =>
            installer.name.toLowerCase().includes(query) ||
            installer.description.toLowerCase().includes(query)
        );
      }

      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter((installer) => installer.category === filters.category);
      }

      return filtered;
    },
  });
}

export function useInstaller(id: string) {
  return useQuery({
    queryKey: installerQueryKeys.detail(id),
    queryFn: () => installerApi.getById(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: installerQueryKeys.categories(),
    queryFn: installerApi.getCategories,
  });
}

export function useInstallInstaller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version?: string }) =>
      installerApi.install(id, version),
    onSuccess: (result) => {
      if (result.success) {
        notifications.success(result.message);
        queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
      } else {
        notifications.error(result.message);
      }
    },
    onError: (error: Error) => {
      notifications.error(`Installation error: ${error.message}`);
    },
  });
}

export function useUpdateInstaller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version?: string }) =>
      installerApi.update(id, version),
    onSuccess: (result) => {
      if (result.success) {
        notifications.success(result.message);
        queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
      } else {
        notifications.error(result.message);
      }
    },
    onError: (error: Error) => {
      notifications.error(`Update error: ${error.message}`);
    },
  });
}

export function useUninstallInstaller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: installerApi.uninstall,
    onSuccess: (result) => {
      if (result.success) {
        notifications.success(result.message);
        queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
      } else {
        notifications.error(result.message);
      }
    },
    onError: (error: Error) => {
      notifications.error(`Uninstall error: ${error.message}`);
    },
  });
}

export function useBatchInstall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: installerApi.batchInstall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
    },
    onError: (error: Error) => {
      notifications.error(`Batch installation error: ${error.message}`);
    },
  });
}

export function useInstallerLogs(id: string) {
  return useQuery({
    queryKey: installerQueryKeys.logs(id),
    queryFn: () => installerApi.getLogs(id),
    enabled: !!id,
  });
}

export function useLaunchInstaller() {
  return useMutation({
    mutationFn: installerApi.launch,
    onSuccess: (result) => {
      if (result.success) {
        notifications.success(result.message);
      } else {
        notifications.error(result.message);
      }
    },
    onError: (error: Error) => {
      notifications.error(`Launch error: ${error.message}`);
    },
  });
}

export function useSwitchVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: string }) =>
      installerApi.switchVersion(id, version),
    onSuccess: (result) => {
      if (result.success) {
        notifications.success(result.message);
        queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
      } else {
        notifications.error(result.message);
      }
    },
    onError: (error: Error) => {
      notifications.error(`Version switch error: ${error.message}`);
    },
  });
}

export function useBatchUninstall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: installerApi.batchUninstall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
    },
    onError: (error: Error) => {
      notifications.error(`Batch uninstall error: ${error.message}`);
    },
  });
}

export function useBatchUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: installerApi.batchUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: installerQueryKeys.all });
    },
    onError: (error: Error) => {
      notifications.error(`Batch update error: ${error.message}`);
    },
  });
}
