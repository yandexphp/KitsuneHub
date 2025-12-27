import {
  Apps,
  Delete,
  Download,
  MoreVert,
  Refresh,
  Search,
  TableChart,
  Update,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { startTransition, useState } from 'react';
import { InstallerCard } from '@/entities/installer-card';
import { FilterTabs } from '@/features/filter-tabs';
import { useBatchUninstall, useBatchUpdate, useCategories, useInstallers } from '@/shared/hooks';
import { CATEGORY, FILTER_TAB, useAppStore } from '@/shared/store/app-store';
import { BatchInstallModal } from '@/widgets/batch-install';
import { BatchOperationsModal } from '@/widgets/batch-operations/BatchOperationsModal';
import { InstallerTable } from '@/widgets/installer-table';

export function InstallerList() {
  const {
    filterTab,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getSelectedIds,
    clearSelection,
    setDetailsPanelOpen,
    setSelectedInstallerId,
  } = useAppStore();

  const selectedIds = getSelectedIds();

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchUninstallModalOpen, setBatchUninstallModalOpen] = useState(false);
  const [batchUpdateModalOpen, setBatchUpdateModalOpen] = useState(false);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<HTMLElement | null>(null);

  const {
    data: allInstallers = [],
    isLoading: installersLoading,
    refetch: refetchInstallers,
  } = useInstallers();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const batchUninstallMutation = useBatchUninstall();
  const batchUpdateMutation = useBatchUpdate();

  const filteredInstallers = allInstallers.filter((installer) => {
    if (filterTab === FILTER_TAB.INSTALLED && !installer.installed) {
      return false;
    }
    if (filterTab === FILTER_TAB.NOT_INSTALLED && installer.installed) {
      return false;
    }
    if (filterTab === FILTER_TAB.UPDATES && !installer.can_update) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !(
          installer.name.toLowerCase().includes(query) ||
          installer.description.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
    }

    if (selectedCategory !== CATEGORY.ALL && installer.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const handleBatchInstall = () => {
    if (selectedIds.size === 0) {
      return;
    }
    setBatchModalOpen(true);
  };

  const handleBatchUninstall = () => {
    if (selectedIds.size === 0) {
      return;
    }
    setBatchUninstallModalOpen(true);
  };

  const handleBatchUpdate = () => {
    if (selectedIds.size === 0) {
      return;
    }
    const updatableIds = Array.from(selectedIds).filter((id) => {
      const installer = allInstallers.find((i) => i.id === id);
      return installer?.can_update === true;
    });
    if (updatableIds.length === 0) {
      return;
    }
    setBatchUpdateModalOpen(true);
  };

  const handleBatchComplete = () => {
    clearSelection();
    refetchInstallers();
  };

  const handleOpenDetails = (installerId: string) => {
    startTransition(() => {
      setSelectedInstallerId(installerId);
      setDetailsPanelOpen(true);
    });
  };

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      setSelectedCategory(value);
    });
  };

  const selectedCount = selectedIds.size;

  if (installersLoading || categoriesLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-104px)]">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ color: '#a3a3a3' }}>
            Loading applications...
          </Typography>
        </Box>
      </div>
    );
  }

  const EmptyState = () => {
    const emptyMessages = {
      all: {
        title: 'No applications found',
        description: 'Try changing search parameters or filters',
      },
      installed: {
        title: 'No installed applications',
        description: 'Go to the "Not Installed" tab to install applications',
      },
      'not-installed': {
        title: 'All applications are already installed',
        description: 'Check for updates on the corresponding tab',
      },
      updates: {
        title: 'No updates available',
        description: 'All applications are using the latest versions',
      },
    };

    const message = emptyMessages[filterTab];

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ color: '#d4d4d4', fontWeight: 500 }}>
          {message.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#737373', fontSize: '0.75rem' }}>
          {message.description}
        </Typography>
      </Box>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-104px)]">
      {/* Filter tabs */}
      <div className="flex-shrink-0 bg-[#0f0f0f] border-b border-neutral-800/50 -mx-3 -mt-3 px-3">
        <FilterTabs />
      </div>

      {/* Search and filters panel */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#141414',
          border: '1px solid rgba(38, 38, 38, 0.5)',
          borderRadius: 1,
          px: 1.25,
          py: 1,
          mt: 1.5,
        }}
      >
        <TextField
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ fontSize: 16, color: '#525252', mr: 1 }} />,
          }}
          sx={{
            flex: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              '& fieldset': {
                borderColor: 'rgba(38, 38, 38, 0.5)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(38, 38, 38, 0.7)',
              },
            },
            '& .MuiInputBase-input': {
              color: '#f5f5f5',
              fontSize: '0.75rem',
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            sx={{
              bgcolor: 'transparent',
              color: '#f5f5f5',
              fontSize: '0.75rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(38, 38, 38, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(38, 38, 38, 0.7)',
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            borderLeft: '1px solid rgba(38, 38, 38, 0.5)',
            pl: 1,
          }}
        >
          <Tooltip title="Grid view">
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{
                width: 28,
                height: 24,
                color: viewMode === 'grid' ? '#8b5cf6' : '#a3a3a3',
                bgcolor: viewMode === 'grid' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              }}
            >
              <Apps sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Table view">
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              sx={{
                width: 28,
                height: 24,
                color: viewMode === 'table' ? '#8b5cf6' : '#a3a3a3',
                bgcolor: viewMode === 'table' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              }}
            >
              <TableChart sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Tooltip title="Refresh list">
          <IconButton
            size="small"
            onClick={() => refetchInstallers()}
            disabled={installersLoading}
            sx={{
              width: 28,
              height: 24,
              color: '#a3a3a3',
            }}
          >
            {installersLoading ? <CircularProgress size={14} /> : <Refresh sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>

        {selectedCount > 0 && filterTab === FILTER_TAB.NOT_INSTALLED && (
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleBatchInstall}
            size="small"
            sx={{
              bgcolor: '#8b5cf6',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#7c3aed',
              },
            }}
          >
            Install ({selectedCount})
          </Button>
        )}
        {selectedCount > 0 &&
          (filterTab === FILTER_TAB.INSTALLED || filterTab === FILTER_TAB.UPDATES) && (
            <>
              <Button
                variant="contained"
                endIcon={<MoreVert sx={{ fontSize: 16 }} />}
                onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                size="small"
                sx={{
                  bgcolor: '#8b5cf6',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#7c3aed',
                  },
                }}
              >
                Actions ({selectedCount})
              </Button>
              <Menu
                anchorEl={actionsMenuAnchor}
                open={Boolean(actionsMenuAnchor)}
                onClose={() => setActionsMenuAnchor(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: '#1a1a1a',
                      border: '1px solid rgba(38, 38, 38, 0.5)',
                    },
                  },
                  list: {
                    sx: {
                      bgcolor: '#1a1a1a',
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleBatchUpdate();
                    setActionsMenuAnchor(null);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  <ListItemIcon sx={{ minWidth: '25px !important' }}>
                    <Update sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Update"
                    slotProps={{
                      primary: {
                        sx: { fontSize: '0.75rem' },
                      },
                    }}
                  />
                </MenuItem>
                {(filterTab === FILTER_TAB.INSTALLED || filterTab === FILTER_TAB.UPDATES) && (
                  <MenuItem
                    onClick={() => {
                      handleBatchUninstall();
                      setActionsMenuAnchor(null);
                    }}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    <ListItemIcon sx={{ minWidth: '25px !important' }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Uninstall"
                      slotProps={{
                        primary: {
                          sx: { fontSize: '0.75rem' },
                        },
                      }}
                    />
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
      </Box>

      {/* Statistics */}
      {filteredInstallers.length > 0 && (
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: 'rgba(20, 20, 20, 0.6)',
            border: '1px solid rgba(38, 38, 38, 0.4)',
            borderRadius: 1,
            px: 1.25,
            py: 0.75,
            mt: 1,
          }}
        >
          <Stack direction="row" spacing={1.75} sx={{ fontSize: '0.625rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Found:
              </Typography>
              <Typography variant="caption" sx={{ color: '#d4d4d4', fontWeight: 600 }}>
                {filteredInstallers.length}
              </Typography>
            </Box>
            {selectedCount > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  pl: 1.5,
                  borderLeft: '1px solid rgba(38, 38, 38, 0.5)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#a78bfa' }}>
                  Selected:
                </Typography>
                <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 700 }}>
                  {selectedCount}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* List/Table */}
      <div className="flex-1 overflow-y-auto mt-2" style={{ padding: '4px' }}>
        {filteredInstallers.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'table' ? (
          <InstallerTable data={filteredInstallers} onOpenDetails={handleOpenDetails} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-2.5 gap-y-2.5">
            {filteredInstallers.map((installer) => (
              <InstallerCard
                key={installer.id}
                installer={installer}
                onOpenDetails={() => handleOpenDetails(installer.id)}
              />
            ))}
          </div>
        )}
      </div>

      <BatchInstallModal
        open={batchModalOpen}
        ids={Array.from(selectedIds)}
        onClose={() => setBatchModalOpen(false)}
        onComplete={handleBatchComplete}
      />

      <BatchOperationsModal
        open={batchUninstallModalOpen}
        ids={Array.from(selectedIds)}
        onClose={() => setBatchUninstallModalOpen(false)}
        onComplete={handleBatchComplete}
        mutation={batchUninstallMutation}
        title="Batch Uninstall"
        actionIcon={<Delete />}
      />

      <BatchOperationsModal
        open={batchUpdateModalOpen}
        ids={Array.from(selectedIds).filter((id) => {
          const installer = allInstallers.find((i) => i.id === id);
          return installer?.can_update === true;
        })}
        onClose={() => setBatchUpdateModalOpen(false)}
        onComplete={handleBatchComplete}
        mutation={batchUpdateMutation}
        title="Batch Update"
        actionIcon={<Update />}
      />
    </div>
  );
}
