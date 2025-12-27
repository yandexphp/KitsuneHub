import {
  CheckCircle,
  Close,
  Delete,
  Description,
  Download,
  Language,
  Refresh,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { LogsModal } from '@/features/logs-modal';
import {
  useInstaller,
  useInstallInstaller,
  useSwitchVersion,
  useUninstallInstaller,
  useUpdateInstaller,
} from '@/shared/hooks';
import { formatDate, formatDownloads, getIconColorHex, getInitial } from '@/shared/lib/utils';
import { useAppStore } from '@/shared/store/app-store';
import { VersionInfo } from '@/shared/types/installer';

export function DetailsPanel() {
  const { detailsPanelOpen, selectedInstallerId, setDetailsPanelOpen } = useAppStore();
  const { data: installer } = useInstaller(selectedInstallerId || '');
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  const installMutation = useInstallInstaller();
  const updateMutation = useUpdateInstaller();
  const uninstallMutation = useUninstallInstaller();
  const switchVersionMutation = useSwitchVersion();
  const [versionMenuAnchor, setVersionMenuAnchor] = useState<null | HTMLElement>(null);

  const isLoading =
    installMutation.isPending ||
    updateMutation.isPending ||
    uninstallMutation.isPending ||
    switchVersionMutation.isPending;

  if (!installer) {
    return null;
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        slotProps={{
          paper: {
          sx: {
            width: 480,
            background: 'linear-gradient(to bottom, #0f0f0f 0%, #0a0a0a 100%)',
            color: '#f5f5f5',
            borderLeft: '1px solid rgba(38, 38, 38, 0.5)',
            },
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              position: 'relative',
              pb: 2,
              borderBottom: '1px solid rgba(38, 38, 38, 0.5)',
            }}
          >
            <IconButton
              onClick={() => setDetailsPanelOpen(false)}
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                color: '#a3a3a3',
                bgcolor: 'rgba(20, 20, 20, 0.8)',
                border: '1px solid rgba(38, 38, 38, 0.5)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: 'rgba(38, 38, 38, 0.6)',
                  color: '#f5f5f5',
                },
              }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${getIconColorHex(installer.name)} 0%, ${getIconColorHex(installer.name)}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.5rem',
                boxShadow: `0 4px 12px ${getIconColorHex(installer.name)}40`,
              }}
            >
              {getInitial(installer.name)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 0, color: '#f5f5f5', fontSize: '1.125rem', fontWeight: 600 }}
                >
                  {installer.name}
                </Typography>
                {installer.installed && <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />}
              </Box>
              <Chip
                label={installer.category}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  bgcolor: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>

          {/* Description */}
          <Box
            sx={{
              bgcolor: 'rgba(20, 20, 20, 0.4)',
              border: '1px solid rgba(38, 38, 38, 0.4)',
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#d4d4d4', lineHeight: 1.7, fontSize: '0.8125rem' }}
            >
              {installer.description}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.25 }}>
            {!installer.installed ? (
              <Button
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Download />
                }
                disabled={isLoading}
                onClick={() => installMutation.mutate({ id: installer.id })}
                fullWidth
                sx={{
                  bgcolor: '#8b5cf6',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.25,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    bgcolor: '#7c3aed',
                    boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(139, 92, 246, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                Install
              </Button>
            ) : (
              <>
                {installer.can_update && (
                  <Button
                    variant="outlined"
                    startIcon={isLoading ? <CircularProgress size={16} /> : <Refresh />}
                    disabled={isLoading}
                    onClick={() => updateMutation.mutate({ id: installer.id })}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(249, 115, 22, 0.4)',
                      color: '#fb923c',
                      fontWeight: 600,
                      py: 1.25,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      bgcolor: 'rgba(249, 115, 22, 0.08)',
                      '&:hover': {
                        borderColor: 'rgba(249, 115, 22, 0.6)',
                        bgcolor: 'rgba(249, 115, 22, 0.12)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(249, 115, 22, 0.2)',
                        color: 'rgba(251, 146, 60, 0.5)',
                      },
                    }}
                  >
                    Update
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={isLoading ? <CircularProgress size={16} /> : <Delete />}
                  disabled={isLoading}
                  onClick={() => uninstallMutation.mutate(installer.id)}
                  sx={{
                    ...(installer.can_update ? {} : { flex: 1 }),
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontWeight: 600,
                    py: 1.25,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                    '&:hover': {
                      borderColor: 'rgba(239, 68, 68, 0.6)',
                      bgcolor: 'rgba(239, 68, 68, 0.12)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: 'rgba(248, 113, 113, 0.5)',
                    },
                  }}
                >
                  Uninstall
                </Button>
              </>
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(38, 38, 38, 0.5)', my: 0.5 }} />

          {/* Info */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'rgba(20, 20, 20, 0.4)',
              border: '1px solid rgba(38, 38, 38, 0.4)',
              borderRadius: 1.5,
              p: 1.75,
            }}
          >
            {installer.current_version && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Current version
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {installer.current_version}
                </Typography>
              </Box>
            )}

            {installer.latest_version && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Latest version
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#10b981',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {installer.latest_version}
                </Typography>
              </Box>
            )}

            {installer.installed && installer.versions && installer.versions.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Switch version
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => setVersionMenuAnchor(e.currentTarget)}
                  sx={{
                    fontSize: '0.6875rem',
                    py: 0.5,
                    px: 1.25,
                    minWidth: 'auto',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    color: '#a78bfa',
                    bgcolor: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'rgba(139, 92, 246, 0.6)',
                      bgcolor: 'rgba(139, 92, 246, 0.12)',
                    },
                  }}
                >
                  Select...
                </Button>
                <Menu
                  anchorEl={versionMenuAnchor}
                  open={Boolean(versionMenuAnchor)}
                  onClose={() => setVersionMenuAnchor(null)}
                  slotProps={{
                    paper: {
                    sx: {
                      bgcolor: '#141414',
                      border: '1px solid rgba(38, 38, 38, 0.5)',
                      borderRadius: 1.5,
                      mt: 0.5,
                      minWidth: 200,
                      },
                    },
                  }}
                >
                  {installer.versions.map((version: VersionInfo) => (
                    <MenuItem
                      key={version.version}
                      onClick={() => {
                        switchVersionMutation.mutate({
                          id: installer.id,
                          version: version.version,
                        });
                        setVersionMenuAnchor(null);
                      }}
                      disabled={version.version === installer.current_version}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(139, 92, 246, 0.1)',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.5,
                        },
                      }}
                    >
                      <ListItemText>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: '0.8125rem', color: '#d4d4d4' }}
                        >
                          {version.version}{' '}
                          <span style={{ color: '#737373' }}>({version.type})</span>
                        </Typography>
                      </ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}

            {installer.size && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Size
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#d4d4d4', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {installer.size}
                </Typography>
              </Box>
            )}

            {installer.downloads && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Downloads
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#d4d4d4', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {formatDownloads(installer.downloads)}
                </Typography>
              </Box>
            )}

            {installer.author && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Author
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#d4d4d4', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {installer.author}
                </Typography>
              </Box>
            )}

            {installer.last_updated && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Updated
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#d4d4d4', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {formatDate(installer.last_updated)}
                </Typography>
              </Box>
            )}

            {installer.dependencies.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  pt: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#737373', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Dependencies
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    justifyContent: 'flex-end',
                    maxWidth: '60%',
                  }}
                >
                  {installer.dependencies.map((dep) => (
                    <Chip
                      key={dep}
                      label={dep}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.625rem',
                        bgcolor: 'rgba(139, 92, 246, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 0.875,
                          py: 0,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(38, 38, 38, 0.5)', my: 0.5 }} />

          {/* Links */}
          <Box sx={{ display: 'flex', gap: 1.25 }}>
            {installer.homepage && (
              <Button
                startIcon={<Language />}
                size="small"
                onClick={() => window.open(installer.homepage, '_blank')}
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: 'rgba(38, 38, 38, 0.5)',
                  color: '#a3a3a3',
                  fontWeight: 500,
                  py: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  bgcolor: 'rgba(20, 20, 20, 0.4)',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    color: '#a78bfa',
                    bgcolor: 'rgba(139, 92, 246, 0.08)',
                  },
                }}
              >
                Website
              </Button>
            )}
            <Button
              startIcon={<Description />}
              size="small"
              onClick={() => setLogsModalOpen(true)}
              fullWidth
              variant="outlined"
              sx={{
                borderColor: 'rgba(38, 38, 38, 0.5)',
                color: '#a3a3a3',
                fontWeight: 500,
                py: 1,
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '0.8125rem',
                bgcolor: 'rgba(20, 20, 20, 0.4)',
                '&:hover': {
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  color: '#a78bfa',
                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                },
              }}
            >
              Logs
            </Button>
          </Box>
        </Box>
      </Drawer>

      <LogsModal
        open={logsModalOpen}
        installerId={installer.id}
        installerName={installer.name}
        onClose={() => setLogsModalOpen(false)}
      />
    </>
  );
}
