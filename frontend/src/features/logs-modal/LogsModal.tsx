import { AccessTime, Cancel, CheckCircle, Info } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useInstallerLogs } from '@/shared/hooks';

interface LogsModalProps {
  open: boolean;
  installerId: string;
  installerName: string;
  onClose: () => void;
}

export function LogsModal({ open, installerId, installerName, onClose }: LogsModalProps) {
  const { data: logs = [], isLoading, refetch } = useInstallerLogs(installerId);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'failed':
        return <Cancel sx={{ color: '#ef4444' }} />;
      case 'info':
        return <Info sx={{ color: '#3b82f6' }} />;
      default:
        return <AccessTime sx={{ color: '#8b5cf6' }} />;
    }
  };

  const getStatusColorForTimelineDot = (
    status: string
  ): 'success' | 'error' | 'info' | 'inherit' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'inherit';
    }
  };

  const getStatusColorForChip = (status: string): 'success' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'install':
        return 'Installation';
      case 'update':
        return 'Update';
      case 'uninstall':
        return 'Uninstall';
      case 'check':
        return 'Check';
      default:
        return action;
    }
  };

  const reversedLogs = [...logs].reverse();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#0a0a0a',
            color: '#f5f5f5',
          },
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(38, 38, 38, 0.5)', pb: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5, color: '#f5f5f5', fontSize: '0.875rem' }}>
          Installation Logs
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: '#d4d4d4', fontSize: '0.6875rem', fontWeight: 500 }}
          >
            {installerName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#525252', fontSize: '0.5625rem' }}>
            ID: {installerId}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: '65vh', overflowY: 'auto', p: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ color: '#a3a3a3' }}>
              Loading logs...
            </Typography>
          </Box>
        ) : reversedLogs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <Typography variant="body1" sx={{ color: '#d4d4d4' }}>
              No logs available
            </Typography>
          </Box>
        ) : (
          <Timeline>
            {reversedLogs.map((log, index) => (
              <TimelineItem key={`${log.timestamp}-${index}`}>
                <TimelineSeparator>
                  <TimelineDot color={getStatusColorForTimelineDot(log.status)}>
                    {getStatusIcon(log.status)}
                  </TimelineDot>
                  {index < reversedLogs.length - 1 && (
                    <TimelineConnector sx={{ bgcolor: 'rgba(38, 38, 38, 0.5)' }} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Box sx={{ pb: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getActionLabel(log.action)}
                          size="small"
                          color={getStatusColorForChip(log.status)}
                          sx={{
                            height: 18,
                            fontSize: '0.5625rem',
                            '& .MuiChip-label': {
                              px: 1,
                              py: 0.25,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: '#737373', fontSize: '0.625rem' }}
                        >
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          log.status === 'success'
                            ? 'Success'
                            : log.status === 'failed'
                              ? 'Error'
                              : log.status === 'info'
                                ? 'Info'
                                : 'In Progress'
                        }
                        size="small"
                        color={getStatusColorForChip(log.status)}
                        sx={{
                          height: 18,
                          fontSize: '0.5625rem',
                          '& .MuiChip-label': {
                            px: 1,
                            py: 0.25,
                          },
                        }}
                      />
                    </Box>
                    {log.message && (
                      <Typography
                        variant="body2"
                        sx={{ color: '#d4d4d4', fontSize: '0.6875rem', fontWeight: 500, mb: 0.5 }}
                      >
                        {log.message}
                      </Typography>
                    )}
                    {log.output?.trim() && (
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: '#0a0a0a',
                          p: 1.25,
                          borderRadius: 1,
                          border: '1px solid rgba(38, 38, 38, 0.6)',
                          mt: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.625rem',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: '#a3a3a3',
                            lineHeight: 1.6,
                            display: 'block',
                          }}
                        >
                          {log.output}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </DialogContent>
    </Dialog>
  );
}
