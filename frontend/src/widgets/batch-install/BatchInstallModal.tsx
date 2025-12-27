import { Cancel, CheckCircle, Close, Download } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useBatchInstall, useInstallers } from '@/shared/hooks';
import { INSTALL_STATUS, type InstallStatus } from '@/shared/types/installer';

interface BatchInstallModalProps {
  open: boolean;
  ids: string[];
  onClose: () => void;
  onComplete: () => void;
}

export function BatchInstallModal({ open, ids, onClose, onComplete }: BatchInstallModalProps) {
  const batchInstallMutation = useBatchInstall();
  const { data: allInstallers = [] } = useInstallers();

  useEffect(() => {
    if (open && ids.length > 0 && !batchInstallMutation.isPending && !batchInstallMutation.data) {
      batchInstallMutation.mutate(ids);
    }
  }, [
    open,
    ids,
    batchInstallMutation.isPending,
    batchInstallMutation.data,
    batchInstallMutation.mutate,
  ]);

  const getInstallerName = (id: string) => {
    return allInstallers.find((inst) => inst.id === id)?.name || id;
  };

  const getStatusIcon = (status: InstallStatus) => {
    switch (status) {
      case INSTALL_STATUS.COMPLETED:
        return <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />;
      case INSTALL_STATUS.FAILED:
        return <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />;
      case INSTALL_STATUS.INSTALLING:
        return <CircularProgress size={14} sx={{ color: '#8b5cf6' }} />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    if (!batchInstallMutation.isPending) {
      if (batchInstallMutation.data) {
        onComplete();
      }
      onClose();
    }
  };

  const allCompleted = batchInstallMutation.data
    ? batchInstallMutation.data.completed + batchInstallMutation.data.failed ===
      batchInstallMutation.data.total
    : false;

  const progress = batchInstallMutation.data?.progress || [];
  const activeProgress = progress.filter((item) => item.status !== INSTALL_STATUS.PENDING);
  const activeTotal = activeProgress.length;
  const overallProgress =
    batchInstallMutation.data && activeTotal > 0
      ? Math.round(
          ((batchInstallMutation.data.completed + batchInstallMutation.data.failed) / activeTotal) *
            100
        )
      : 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
        sx: {
          bgcolor: '#0a0a0a',
          background: 'linear-gradient(to bottom, #0f0f0f 0%, #0a0a0a 100%)',
          color: '#f5f5f5',
          border: '1px solid rgba(23, 23, 23, 0.8)',
          borderRadius: 1.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          color: '#f5f5f5',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: '1px solid rgba(23, 23, 23, 0.6)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download sx={{ fontSize: 18, color: '#8b5cf6' }} />
          <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#f5f5f5' }}>
            Installation ({ids.length})
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={batchInstallMutation.isPending}
          sx={{
            width: 24,
            height: 24,
            color: '#737373',
            '&:hover': {
              color: '#f5f5f5',
              bgcolor: 'rgba(23, 23, 23, 0.6)',
            },
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {/* Overall progress */}
          {batchInstallMutation.data && (
            <Box
              sx={{
                bgcolor: 'rgba(10, 10, 10, 0.6)',
                borderRadius: 1,
                p: 1.5,
                border: '1px solid rgba(23, 23, 23, 0.6)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#a3a3a3', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.75rem', color: '#d4d4d4', fontWeight: 600 }}
                >
                  {overallProgress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 6,
                  borderRadius: 0.5,
                  bgcolor: 'rgba(23, 23, 23, 0.6)',
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    bgcolor:
                      allCompleted && batchInstallMutation.data.failed === 0
                        ? '#10b981'
                        : '#8b5cf6',
                    borderRadius: 0.5,
                  },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.6875rem' }}>
                <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.6875rem' }}>
                  ✓ {batchInstallMutation.data.completed}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: '#737373' }}>
                  {batchInstallMutation.data.completed + batchInstallMutation.data.failed}/
                  {batchInstallMutation.data.total}
                </Typography>
                {batchInstallMutation.data.failed > 0 && (
                  <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '0.6875rem' }}>
                    ✗ {batchInstallMutation.data.failed}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {!batchInstallMutation.data && batchInstallMutation.isPending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
              <CircularProgress size={20} sx={{ color: '#8b5cf6' }} />
              <Typography variant="body2" sx={{ color: '#a3a3a3', fontSize: '0.8125rem' }}>
                Starting installation...
              </Typography>
            </Box>
          )}

          {/* Applications list */}
          {progress.length > 0 && (
            <List
              sx={{
                maxHeight: 300,
                overflowY: 'auto',
                bgcolor: 'rgba(10, 10, 10, 0.4)',
                borderRadius: 1,
                border: '1px solid rgba(23, 23, 23, 0.6)',
                '& .MuiListItem-root': {
                  borderBottom: '1px solid rgba(23, 23, 23, 0.4)',
                  py: 1,
                  px: 1.5,
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                },
              }}
            >
              {progress.map((item) => (
                <ListItem key={item.id}>
                  <Stack spacing={0.75} sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}
                      >
                        {getStatusIcon(item.status)}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#d4d4d4',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px',
                          }}
                          title={getInstallerName(item.id)}
                        >
                          {getInstallerName(item.id)}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          item.status === INSTALL_STATUS.COMPLETED
                            ? 'Completed'
                            : item.status === INSTALL_STATUS.FAILED
                              ? 'Error'
                              : item.status === INSTALL_STATUS.INSTALLING
                                ? '...'
                                : 'Pending'
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.625rem',
                          fontWeight: 500,
                          bgcolor:
                            item.status === INSTALL_STATUS.COMPLETED
                              ? 'rgba(16, 185, 129, 0.15)'
                              : item.status === INSTALL_STATUS.FAILED
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(115, 115, 115, 0.15)',
                          color:
                            item.status === INSTALL_STATUS.COMPLETED
                              ? '#10b981'
                              : item.status === INSTALL_STATUS.FAILED
                                ? '#ef4444'
                                : '#737373',
                          border: 'none',
                          '& .MuiChip-label': {
                            px: 1,
                            py: 0,
                          },
                        }}
                      />
                    </Box>
                    {item.status !== INSTALL_STATUS.PENDING && (
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          height: 4,
                          borderRadius: 0.5,
                          bgcolor: 'rgba(23, 23, 23, 0.6)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor:
                              item.status === INSTALL_STATUS.FAILED
                                ? '#ef4444'
                                : item.status === INSTALL_STATUS.COMPLETED
                                  ? '#10b981'
                                  : '#8b5cf6',
                            borderRadius: 0.5,
                          },
                        }}
                      />
                    )}
                    {item.message && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#737373', fontSize: '0.625rem', lineHeight: 1.3 }}
                      >
                        {item.message}
                      </Typography>
                    )}
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <Divider sx={{ borderColor: 'rgba(23, 23, 23, 0.6)' }} />
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={batchInstallMutation.isPending}
          variant="outlined"
          size="small"
          sx={{
            color: '#a3a3a3',
            borderColor: 'rgba(23, 23, 23, 0.6)',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 2,
            '&:hover': {
              borderColor: 'rgba(139, 92, 246, 0.4)',
              bgcolor: 'rgba(139, 92, 246, 0.08)',
              color: '#a78bfa',
            },
            '&:disabled': {
              color: '#525252',
              borderColor: 'rgba(23, 23, 23, 0.4)',
            },
          }}
        >
          {allCompleted ? 'Close' : batchInstallMutation.isPending ? 'Cancel' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
