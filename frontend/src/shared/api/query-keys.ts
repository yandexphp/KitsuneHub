export const installerQueryKeys = {
  all: ['installers'] as const,
  lists: () => [...installerQueryKeys.all, 'list'] as const,
  list: (filters: { category?: string; search?: string }) =>
    [...installerQueryKeys.lists(), filters] as const,
  details: () => [...installerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...installerQueryKeys.details(), id] as const,
  categories: () => [...installerQueryKeys.all, 'categories'] as const,
  logs: (id: string) => [...installerQueryKeys.all, 'logs', id] as const,
};
