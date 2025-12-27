import { create } from 'zustand';
import packageJson from '../../../package.json';

export type ViewMode = 'grid' | 'table';
export type FilterTab = 'all' | 'installed' | 'not-installed' | 'updates';

export const VIEW_MODE = {
  GRID: 'grid',
  TABLE: 'table',
} as const;

export const FILTER_TAB = {
  ALL: 'all',
  INSTALLED: 'installed',
  NOT_INSTALLED: 'not-installed',
  UPDATES: 'updates',
} as const;

export const CATEGORY = {
  ALL: 'all',
} as const;

export const APP_VERSION = packageJson.version;
export const GITHUB_REPO =
  typeof packageJson.repository === 'string'
    ? packageJson.repository
    : packageJson.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') ||
      'https://github.com/yourusername/KitsuneHub';

interface AppState {
  viewMode: ViewMode;
  filterTab: FilterTab;
  searchQuery: string;
  selectedCategory: string;
  selectedIdsByTab: Record<FilterTab, Set<string>>;
  detailsPanelOpen: boolean;
  selectedInstallerId: string | null;

  setViewMode: (mode: ViewMode) => void;
  setFilterTab: (tab: FilterTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setDetailsPanelOpen: (open: boolean) => void;
  setSelectedInstallerId: (id: string | null) => void;
  getSelectedIds: () => Set<string>;
}

export const useAppStore = create<AppState>((set, get) => ({
  viewMode: VIEW_MODE.GRID,
  filterTab: FILTER_TAB.NOT_INSTALLED,
  searchQuery: '',
  selectedCategory: CATEGORY.ALL,
  selectedIdsByTab: {
    [FILTER_TAB.ALL]: new Set(),
    [FILTER_TAB.INSTALLED]: new Set(),
    [FILTER_TAB.NOT_INSTALLED]: new Set(),
    [FILTER_TAB.UPDATES]: new Set(),
  },
  detailsPanelOpen: false,
  selectedInstallerId: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setFilterTab: (tab) => set({ filterTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleSelection: (id) =>
    set((state) => {
      const currentTab = state.filterTab;
      const currentSet = state.selectedIdsByTab[currentTab];
      const newSet = new Set(currentSet);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return {
        selectedIdsByTab: {
          ...state.selectedIdsByTab,
          [currentTab]: newSet,
        },
      };
    }),
  selectAll: (ids) =>
    set((state) => ({
      selectedIdsByTab: {
        ...state.selectedIdsByTab,
        [state.filterTab]: new Set(ids),
      },
    })),
  clearSelection: () =>
    set((state) => ({
      selectedIdsByTab: {
        ...state.selectedIdsByTab,
        [state.filterTab]: new Set(),
      },
    })),
  getSelectedIds: () => {
    const state = get();
    return state.selectedIdsByTab[state.filterTab];
  },
  setDetailsPanelOpen: (open) => set({ detailsPanelOpen: open }),
  setSelectedInstallerId: (id) => set({ selectedInstallerId: id }),
}));
