import {
  ArrowDownward,
  ArrowUpward,
  Delete,
  Download,
  Info,
  MoreVert,
  OpenInNew,
  VerifiedUser,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useInstallInstaller, useUninstallInstaller, useUpdateInstaller } from '@/shared/hooks';
import { getIconColorGradient, getInitial, parseSizeToBytes } from '@/shared/lib/utils';
import { FILTER_TAB, useAppStore } from '@/shared/store/app-store';
import { InstallerInfo } from '@/shared/types/installer';

interface InstallerTableProps {
  data: InstallerInfo[];
  onOpenDetails: (id: string) => void;
}

const columnHelper = createColumnHelper<InstallerInfo>();

export function InstallerTable({ data, onOpenDetails }: InstallerTableProps) {
  const { toggleSelection, getSelectedIds, filterTab, selectAll, clearSelection } = useAppStore();
  const installMutation = useInstallInstaller();
  const updateMutation = useUpdateInstaller();
  const uninstallMutation = useUninstallInstaller();
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    installerId: string;
  } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    [key: string]: { top: number; left: number } | null;
  }>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => {
    const getVisibleIds = () => {
      if (filterTab === FILTER_TAB.NOT_INSTALLED) {
        return data.filter((i) => !i.installed).map((i) => i.id);
      }
      if (filterTab === FILTER_TAB.INSTALLED) {
        return data.filter((i) => i.installed).map((i) => i.id);
      }
      if (filterTab === FILTER_TAB.UPDATES) {
        return data.filter((i) => i.can_update).map((i) => i.id);
      }
      return [];
    };

    const visibleIds = getVisibleIds();
    const selectedIds = getSelectedIds();
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    const someSelected = visibleIds.some((id) => selectedIds.has(id));

    const handleSelectAll = () => {
      if (allSelected) {
        clearSelection();
      } else {
        selectAll(visibleIds);
      }
    };

    return [
      ...(filterTab !== FILTER_TAB.ALL
        ? [
            columnHelper.display({
              id: 'select',
              size: 40,
              header: () => (
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                  sx={{
                    color: '#8b5cf6',
                    '&.Mui-checked': {
                      color: '#8b5cf6',
                    },
                  }}
                />
              ),
              cell: ({ row }) => {
                const installer = row.original;

                if (filterTab === FILTER_TAB.NOT_INSTALLED && installer.installed) {
                  return null;
                }
                if (filterTab === FILTER_TAB.INSTALLED && !installer.installed) {
                  return null;
                }
                if (filterTab === FILTER_TAB.UPDATES && !installer.can_update) {
                  return null;
                }

                const selectedIds = getSelectedIds();
                const selected = selectedIds.has(installer.id);
                return (
                  <Checkbox
                    checked={selected}
                    onChange={() => toggleSelection(installer.id)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{
                      color: '#8b5cf6',
                      '&.Mui-checked': {
                        color: '#8b5cf6',
                      },
                    }}
                  />
                );
              },
            }),
          ]
        : []),
      columnHelper.accessor('name', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Application</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 250,
        enableSorting: true,
        cell: ({ row }) => {
          const installer = row.original;
          const isOfficial = installer.rating && installer.rating >= 4.5;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  background: installer.icon ? 'transparent' : getIconColorGradient(installer.name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                }}
              >
                {installer.icon ? (
                  <img
                    src={installer.icon}
                    alt={installer.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.background = getIconColorGradient(installer.name);
                        parent.textContent = getInitial(installer.name);
                      }
                    }}
                  />
                ) : (
                  getInitial(installer.name)
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#e5e5e5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {installer.name}
                  </Typography>
                  {isOfficial && (
                    <Tooltip title="Verified application">
                      <VerifiedUser sx={{ fontSize: 10, color: '#a78bfa', flexShrink: 0 }} />
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    color: '#737373',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {installer.description}
                </Typography>
              </Box>
            </Box>
          );
        },
      }),
      columnHelper.accessor('category', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Category</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 120,
        enableSorting: true,
        cell: ({ getValue }) => (
          <Chip
            label={getValue()}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.625rem',
              bgcolor: 'rgba(30, 58, 138, 0.3)',
              color: '#60a5fa',
              border: 'none',
              maxWidth: '100%',
              '& .MuiChip-label': {
                px: 1,
                py: 0.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        ),
      }),
      columnHelper.accessor('size', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Size</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 80,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const sizeA = rowA.original.size || '';
          const sizeB = rowB.original.size || '';
          return parseSizeToBytes(sizeA) - parseSizeToBytes(sizeB);
        },
        cell: ({ getValue }) => (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6875rem',
              color: '#a3a3a3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getValue() || '—'}
          </Typography>
        ),
      }),
      columnHelper.accessor('current_version', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Version</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 100,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const versionA = rowA.original.current_version || '';
          const versionB = rowB.original.current_version || '';
          return versionA.localeCompare(versionB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        },
        cell: ({ row }) => {
          const { current_version, latest_version } = row.original;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {current_version && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    fontFamily: 'monospace',
                    color: '#a3a3a3',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {current_version}
                </Typography>
              )}
              {latest_version && current_version !== latest_version && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    fontFamily: 'monospace',
                    color: '#fb923c',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  → {latest_version}
                </Typography>
              )}
            </Box>
          );
        },
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => {
          const installer = row.original;
          if (!installer.installed) {
            return (
              <Chip
                label="Not Installed"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  bgcolor: 'rgba(38, 38, 38, 0.3)',
                  color: '#737373',
                  border: 'none',
                  '& .MuiChip-label': {
                    px: 1,
                    py: 0.25,
                  },
                }}
              />
            );
          }

          if (installer.can_update) {
            return (
              <Chip
                label="UPDATE"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  bgcolor: 'rgba(154, 52, 18, 0.3)',
                  color: '#fb923c',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  '& .MuiChip-label': {
                    px: 1,
                    py: 0.25,
                  },
                }}
              />
            );
          }

          return (
            <Chip
              label="INSTALLED"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.625rem',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: 'none',
                '& .MuiChip-label': {
                  px: 1,
                  py: 0.25,
                },
              }}
            />
          );
        },
      }),
      columnHelper.accessor('author', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Author</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 120,
        enableSorting: true,
        cell: ({ getValue }) => (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6875rem',
              color: '#a3a3a3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getValue() || '—'}
          </Typography>
        ),
      }),
      columnHelper.accessor('last_updated', {
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => column.toggleSorting()}
            >
              <span>Last Updated</span>
              {sorted === 'asc' && <ArrowUpward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
              {sorted === 'desc' && <ArrowDownward sx={{ fontSize: 14, color: '#8b5cf6' }} />}
            </Box>
          );
        },
        size: 120,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.last_updated || '';
          const dateB = rowB.original.last_updated || '';
          if (!(dateA || dateB)) {
            return 0;
          }
          if (!dateA) {
            return 1;
          }
          if (!dateB) {
            return -1;
          }
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        },
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) {
            return (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  color: '#a3a3a3',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                —
              </Typography>
            );
          }

          try {
            const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            return (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  color: '#a3a3a3',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formattedDate}
              </Typography>
            );
          } catch {
            return (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  color: '#a3a3a3',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {date}
              </Typography>
            );
          }
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        size: 80,
        cell: ({ row }) => {
          const installer = row.original;
          const isLoading =
            installMutation.isPending || updateMutation.isPending || uninstallMutation.isPending;

          const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            setMenuPosition((prev) => ({
              ...prev,
              [installer.id]: {
                top: rect.bottom + 4,
                left: rect.right - 8,
              },
            }));
          };

          return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  gap: 0.5,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {!installer.installed ? (
                  <Button
                    variant="outlined"
                    startIcon={isLoading ? <CircularProgress size={12} /> : <Download />}
                    size="small"
                    disabled={isLoading}
                    onClick={() => installMutation.mutate({ id: installer.id })}
                    sx={{
                      height: 24,
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      borderColor: 'rgba(38, 38, 38, 0.5)',
                      color: '#a3a3a3',
                      borderRadius: 1.5,
                      textTransform: 'none',
                      bgcolor: 'rgba(20, 20, 20, 0.4)',
                      minWidth: 70,
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                        color: '#a78bfa',
                        bgcolor: 'rgba(139, 92, 246, 0.08)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(38, 38, 38, 0.3)',
                        color: 'rgba(163, 163, 163, 0.5)',
                        bgcolor: 'rgba(20, 20, 20, 0.2)',
                      },
                    }}
                  >
                    Install
                  </Button>
                ) : (
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isLoading}
                      onClick={() => uninstallMutation.mutate(installer.id)}
                      sx={{
                        width: 24,
                        height: 24,
                        flexShrink: 0,
                        minWidth: 24,
                        padding: 0,
                      }}
                    >
                  {isLoading ? <CircularProgress size={12} /> : <Delete sx={{ fontSize: 14 }} />}
                    </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{
                    width: 24,
                    height: 24,
                    color: '#737373',
                    flexShrink: 0,
                    minWidth: 24,
                    padding: 0,
                    marginLeft: 'auto',
                    '&:hover': {
                      bgcolor: 'rgba(38, 38, 38, 0.5)',
                      color: '#d4d4d4',
                    },
                  }}
                >
                  <MoreVert sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
          );
        },
      }),
    ];
  }, [
    data,
    filterTab,
    installMutation,
    updateMutation,
    uninstallMutation,
    getSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleContextMenu = (e: React.MouseEvent<HTMLTableRowElement>, installerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      mouseX: e.clientX,
      mouseY: e.clientY,
      installerId,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  return (
    <div className="overflow-auto h-full">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-neutral-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="text-left text-[11px] font-semibold text-neutral-400 px-3 py-2.5"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              data-installer-id={row.original.id}
              onClick={() => onOpenDetails(row.original.id)}
              onContextMenu={(e) => handleContextMenu(e, row.original.id)}
              className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2.5 text-xs text-neutral-300"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
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
        {contextMenu &&
          (() => {
            const installer = data.find((i) => i.id === contextMenu.installerId);
            if (!installer) {
              return null;
            }

            return (
              <>
                <MenuItem
                  onClick={() => {
                    onOpenDetails(installer.id);
                    handleContextMenuClose();
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  <ListItemIcon sx={{ minWidth: '25px !important' }}>
                    <Info sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Details"
                    slotProps={{
                      primary: {
                        sx: { fontSize: '0.75rem' },
                      },
                    }}
                  />
                </MenuItem>
                {installer.homepage && (
                  <MenuItem
                    onClick={() => {
                      window.open(installer.homepage, '_blank');
                      handleContextMenuClose();
                    }}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    <ListItemIcon sx={{ minWidth: '25px !important' }}>
                      <OpenInNew sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Open website"
                      slotProps={{
                        primary: {
                          sx: { fontSize: '0.75rem' },
                        },
                      }}
                    />
                  </MenuItem>
                )}
              </>
            );
          })()}
      </Menu>
      {Object.entries(menuPosition).map(([installerId, position]) => {
        if (!position) {
          return null;
        }
        const installer = data.find((i) => i.id === installerId);
        if (!installer) {
          return null;
        }

        const menuOpen = Boolean(position);
        const handleMenuClose = () => {
          setMenuPosition((prev) => ({ ...prev, [installerId]: null }));
        };

        return (
          <Menu
            key={installerId}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
            anchorReference="anchorPosition"
            anchorPosition={position ? { top: position.top, left: position.left } : undefined}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            disableAutoFocusItem
            slotProps={{
              root: {
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                },
                onContextMenu: (e: React.MouseEvent) => {
                  e.stopPropagation();
                },
              },
              paper: {
                sx: {
                  bgcolor: '#1a1a1a',
                  border: '1px solid rgba(38, 38, 38, 0.5)',
                  mt: 0.5,
                },
                onClick: (e: React.MouseEvent) => e.stopPropagation(),
              },
              list: {
                sx: {
                  bgcolor: '#1a1a1a',
                },
                onClick: (e: React.MouseEvent) => e.stopPropagation(),
              },
              backdrop: {
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleMenuClose();
                },
              },
            }}
          >
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(installer.id);
                handleMenuClose();
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              <ListItemIcon sx={{ minWidth: '25px !important' }}>
                <Info sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Details"
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.75rem' },
                  },
                }}
              />
            </MenuItem>
            {installer.homepage && (
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(installer.homepage, '_blank');
                  handleMenuClose();
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                <ListItemIcon sx={{ minWidth: '25px !important' }}>
                  <OpenInNew sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Open website"
                  slotProps={{
                    primary: {
                      sx: { fontSize: '0.75rem' },
                    },
                  }}
                />
              </MenuItem>
            )}
          </Menu>
        );
      })}
    </div>
  );
}
