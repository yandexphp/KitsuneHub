import {
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircle,
  Delete,
  Description,
  Download,
  Language,
  MoreVert,
  Person,
  PlayArrow,
  Refresh,
  VerifiedUser,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import {
  useInstallInstaller,
  useLaunchInstaller,
  useUninstallInstaller,
  useUpdateInstaller,
} from '@/shared/hooks';
import { formatDate, getIconColorTailwind, getInitial } from '@/shared/lib/utils';
import { FILTER_TAB, useAppStore } from '@/shared/store/app-store';
import { InstallerInfo } from '@/shared/types/installer';

interface InstallerCardProps {
  installer: InstallerInfo;
  onOpenDetails: () => void;
}

export function InstallerCard({ installer, onOpenDetails }: InstallerCardProps) {
  const { getSelectedIds, toggleSelection, filterTab } = useAppStore();
  const selectedIds = getSelectedIds();
  const selected = selectedIds.has(installer.id);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const installMutation = useInstallInstaller();
  const updateMutation = useUpdateInstaller();
  const uninstallMutation = useUninstallInstaller();
  const launchMutation = useLaunchInstaller();

  const canSelect = filterTab !== FILTER_TAB.ALL;

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    installMutation.mutate({ id: installer.id });
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate({ id: installer.id });
  };

  const handleUninstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    uninstallMutation.mutate(installer.id);
  };

  const handleCardClick = () => {
    if (canSelect) {
      toggleSelection(installer.id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleSelection(installer.id);
    }
  };

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    launchMutation.mutate(installer.id);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isLoading =
    installMutation.isPending || updateMutation.isPending || uninstallMutation.isPending;
  const isOfficial = installer.rating && installer.rating >= 4.5;

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    const card = cardRef.current;

    if (selected) {
      gsap.to(card, {
        borderColor: 'rgba(139, 92, 246, 0.5)',
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)',
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(card, {
        borderColor: installer.installed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(115, 115, 115, 0.3)',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [selected, installer.installed]);

  useEffect(() => {
    if (!(cardRef.current && iconRef.current)) {
      return;
    }

    const card = cardRef.current;
    const icon = iconRef.current;

    const handleMouseEnter = () => {
      if (selected) {
        return;
      }

      gsap.to(card, {
        rotationY: 2,
        rotationX: -2,
        z: 10,
        borderColor: 'rgba(139, 92, 246, 0.4)',
        duration: 0.4,
        ease: 'power3.out',
      });

      gsap.to(icon, {
        scale: 1.15,
        rotation: 5,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      });

      gsap.to(card, {
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3)',
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      if (selected) {
        return;
      }

      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        z: 0,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        borderColor: installer.installed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(115, 115, 115, 0.3)',
        duration: 0.4,
        ease: 'power3.out',
      });

      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selected, installer.installed]);

  // const renderRating = (rating?: number) => {
  //   if (!rating) {
  //     return null;
  //   }
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 >= 0.5;
  //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  //   return (
  //     <div className="flex items-center gap-0.5">
  //       {Array.from({ length: fullStars }).map((_, i) => (
  //         <Star key={`full-star-${rating}-${i}`} sx={{ fontSize: 9, color: '#fbbf24' }} />
  //       ))}
  //       {hasHalfStar && (
  //         <Star key={`half-star-${rating}`} sx={{ fontSize: 9, color: '#fbbf24', opacity: 0.5 }} />
  //       )}
  //       {Array.from({ length: emptyStars }).map((_, i) => (
  //         <StarBorder key={`empty-star-${rating}-${i}`} sx={{ fontSize: 9, color: '#525252' }} />
  //       ))}
  //       <span className="text-[9px] text-neutral-500 ml-0.5 font-medium">{rating.toFixed(1)}</span>
  //     </div>
  //   );
  // };

  return (
    <div
      ref={cardRef}
      data-installer-id={installer.id}
      className={`group relative bg-gradient-to-br from-[#141414] to-[#0f0f0f] border rounded-xl overflow-hidden flex flex-col ${
        installer.installed
          ? 'border-emerald-900/40 shadow-emerald-950/20'
          : 'border-neutral-800/60'
      } ${selected ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/20' : ''} ${!canSelect ? 'cursor-default' : 'cursor-pointer'}`}
      style={{
        height: '190px',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      {...(canSelect
        ? {
            onClick: handleCardClick,
            onKeyDown: handleCardKeyDown,
            role: 'button',
            tabIndex: 0,
            'aria-label': `Select ${installer.name}`,
          }
        : {})}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          sx={{
            width: 24,
            height: 24,
            color: '#737373',
            opacity: 0,
            flexShrink: 0,
            minWidth: 24,
            padding: 0,
            '&:hover': {
              bgcolor: 'rgba(38, 38, 38, 0.5)',
              color: '#d4d4d4',
            },
            '.group:hover &': {
              opacity: 1,
            },
            transition: 'opacity 0.2s',
          }}
        >
          <MoreVert sx={{ fontSize: 14 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
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
          {!installer.installed && canSelect && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(installer.id);
                handleMenuClose();
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              <ListItemIcon sx={{ minWidth: '25px !important' }}>
                {selected ? (
                  <CheckBox sx={{ fontSize: 16 }} />
                ) : (
                  <CheckBoxOutlineBlank sx={{ fontSize: 16 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={selected ? 'Deselect' : 'Select for installation'}
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.75rem' },
                  },
                }}
              />
            </MenuItem>
          )}
          {installer.installed && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleLaunch(e);
                handleMenuClose();
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              <ListItemIcon sx={{ minWidth: '25px !important' }}>
                <PlayArrow sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Launch"
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.75rem' },
                  },
                }}
              />
            </MenuItem>
          )}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
              handleMenuClose();
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            <ListItemIcon sx={{ minWidth: '25px !important' }}>
              <Description sx={{ fontSize: 16 }} />
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
                <Language sx={{ fontSize: 16 }} />
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
      </Box>

      <div className="flex-1 flex flex-col p-3">
        <div className="flex items-start gap-2.5 mb-2">
          <div
            ref={iconRef}
            className={`w-11 h-11 rounded-xl ${installer.icon ? '' : `bg-gradient-to-br ${getIconColorTailwind(installer.name)}`} flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-lg overflow-hidden`}
          >
            {installer.icon ? (
              <img
                src={installer.icon}
                alt={installer.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const gradientClasses =
                      `bg-gradient-to-br ${getIconColorTailwind(installer.name)}`.split(' ');
                    for (const cls of gradientClasses) {
                      parent.classList.add(cls);
                    }
                    parent.textContent = getInitial(installer.name);
                  }
                }}
              />
            ) : (
              getInitial(installer.name)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Tooltip title={installer.name}>
                <h3
                  className={`text-sm font-semibold truncate ${
                    installer.installed ? 'text-neutral-100' : 'text-neutral-200'
                  }`}
                >
                  {installer.name}
                </h3>
              </Tooltip>
              {installer.installed && (
                <CheckCircle sx={{ fontSize: 12, color: '#10b981', flexShrink: 0 }} />
              )}
              {isOfficial && (
                <Tooltip title="Verified application">
                  <VerifiedUser sx={{ fontSize: 12, color: '#c4b5fd', flexShrink: 0 }} />
                </Tooltip>
              )}
            </div>

            <Tooltip title={installer.description}>
              <p className="text-[11px] text-neutral-400 truncate leading-relaxed">
                {installer.description}
              </p>
            </Tooltip>
          </div>
        </div>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip
            label={installer.category}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.625rem',
              bgcolor: 'rgba(30, 58, 138, 0.3)',
              color: '#60a5fa',
              fontWeight: 500,
              border: 'none',
              '& .MuiChip-label': {
                px: 1,
                py: 0.25,
              },
            }}
          />

          {installer.dependencies.length > 0 && (
            <Tooltip title={`Dependencies: ${installer.dependencies.join(', ')}`}>
              <span className="text-[10px] text-purple-400 font-medium px-2 py-0.5 rounded bg-purple-950/30 cursor-help">
                {installer.dependencies.length} deps
              </span>
            </Tooltip>
          )}
        </Box>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-1.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {installer.current_version && (
                <Tooltip title="Version">
                  <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900/50">
                    {installer.current_version}
                  </span>
                </Tooltip>
              )}
              {installer.size && (
                <Tooltip title="Application size">
                  <span className="text-[10px] text-neutral-500 font-medium px-1.5 py-0.5 rounded bg-neutral-900/50">
                    {installer.size}
                  </span>
                </Tooltip>
              )}
            </div>

            {installer.author && (
              <Tooltip title={`Author: ${installer.author}`}>
                <div className="flex items-center gap-1">
                  <Person sx={{ fontSize: 9, color: '#525252' }} />
                  <span className="text-[9px] text-neutral-500 truncate">{installer.author}</span>
                </div>
              </Tooltip>
            )}
          </div>

          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* {installer.rating && (() => {
                const ratingElement = renderRating(installer.rating);
                if (!ratingElement) {
                  return null;
                }
                return (
                <Tooltip title={`Rating: ${installer.rating.toFixed(1)}/5.0`}>
                    {ratingElement}
                </Tooltip>
                );
              })()}
              {installer.downloads && (
                <Tooltip title={`${installer.downloads.toLocaleString()} downloads`}>
                  <div className="flex items-center gap-0.5">
                    <DownloadIcon sx={{ fontSize: 9, color: '#737373' }} />
                    <span className="text-[9px] text-neutral-500 font-medium">
                      {formatDownloads(installer.downloads)}
                    </span>
                  </div>
                </Tooltip>
              )} */}
            </div>

            {installer.last_updated && (
              <Tooltip title="Last updated">
                <span className="text-[9px] text-neutral-500">
                  {formatDate(installer.last_updated)}
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        <Box sx={{ mt: 'auto', borderTop: '1px solid rgba(38, 38, 38, 0.5)', pt: 1.25 }}>
          {!installer.installed ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {installer.latest_version && (
                <Tooltip title="Latest version">
                  <Chip
                    label={installer.latest_version}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.625rem',
                      fontFamily: 'monospace',
                      bgcolor:
                        installer.current_version &&
                        installer.current_version !== installer.latest_version
                          ? 'rgba(154, 52, 18, 0.3)'
                          : 'rgba(16, 185, 129, 0.2)',
                      color:
                        installer.current_version &&
                        installer.current_version !== installer.latest_version
                          ? '#fb923c'
                          : '#10b981',
                      fontWeight:
                        installer.current_version &&
                        installer.current_version !== installer.latest_version
                          ? 600
                          : 400,
                      border: 'none',
                      '& .MuiChip-label': {
                        px: 1,
                        py: 0.25,
                      },
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title="Install application">
                <Button
                  variant="outlined"
                  startIcon={isLoading ? <CircularProgress size={12} /> : <Download />}
                  size="small"
                  disabled={isLoading}
                  onClick={handleInstall}
                  sx={{
                    flex: 1,
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: 'rgba(38, 38, 38, 0.5)',
                    color: '#a3a3a3',
                    borderRadius: 1.5,
                    textTransform: 'none',
                    bgcolor: 'rgba(20, 20, 20, 0.4)',
                    px: 0,
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
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {installer.can_update && (
                <Tooltip title="Update to latest version">
                  <Button
                    startIcon={isLoading ? <CircularProgress size={12} /> : <Refresh />}
                    size="small"
                    disabled={isLoading}
                    onClick={handleUpdate}
                    sx={{
                      flex: 1,
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(154, 52, 18, 0.3)',
                      color: '#fb923c',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      px: 0,
                      '&:hover': {
                        bgcolor: 'rgba(154, 52, 18, 0.4)',
                        borderColor: 'rgba(249, 115, 22, 0.5)',
                        color: '#fdba74',
                      },
                    }}
                  >
                    Update
                  </Button>
                </Tooltip>
              )}
              {installer.can_update ? (
                <Tooltip title="Uninstall application">
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isLoading}
                    onClick={handleUninstall}
                    sx={{
                      width: 28,
                      height: 28,
                      minWidth: 28,
                      padding: 0,
                      '& .MuiSvgIcon-root': {
                        fontSize: 16,
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={12} /> : <Delete />}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Uninstall application">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={isLoading ? <CircularProgress size={12} /> : <Delete />}
                    size="small"
                    disabled={isLoading}
                    onClick={handleUninstall}
                    sx={{
                      flex: 1,
                      height: 28,
                      fontSize: '0.75rem',
                      px: 0,
                    }}
                  >
                    Uninstall
                  </Button>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
}
