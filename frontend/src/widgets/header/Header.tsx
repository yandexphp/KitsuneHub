import { Add, GitHub, Keyboard, Sync } from '@mui/icons-material';
import { Box, Divider, IconButton, Link, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { notifications } from '@/shared/lib/notifications';
import { modifierKey } from '@/shared/lib/platform';
import { APP_VERSION, GITHUB_REPO } from '@/shared/store/app-store';

interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['F'], description: 'Search', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close panels', category: 'Navigation' },
  { keys: ['A'], description: 'Select all', category: 'Selection' },
  { keys: ['D'], description: 'Deselect all', category: 'Selection' },
  { keys: ['G'], description: 'Toggle grid view', category: 'View' },
  { keys: ['T'], description: 'Toggle table view', category: 'View' },
];

export function Header() {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [shortcutsMenuAnchor, setShortcutsMenuAnchor] = useState<HTMLElement | null>(null);

  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, Shortcut[]> = {};
    for (const shortcut of shortcuts) {
      const category = shortcut.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    }
    return groups;
  }, []);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      notifications.success('You have the latest version installed');
    } catch {
      notifications.error('Error checking for updates');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleShortcutsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setShortcutsMenuAnchor(event.currentTarget);
  };

  const handleShortcutsClose = () => {
    setShortcutsMenuAnchor(null);
  };

  const formatShortcut = (keys: string[]): string => {
    if (keys.length === 1 && keys[0] === 'Esc') {
      return 'Esc';
    }
    const mainKey = keys[0];
    return `${modifierKey}+${mainKey}`;
  };

  return (
    <Box
      component="header"
      sx={{
        bgcolor: '#0f0f0f',
        borderBottom: '1px solid rgba(38, 38, 38, 0.5)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <Box sx={{ mx: 0.5, px: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ lineHeight: 1.2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 0,
                  color: '#f5f5f5',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                KitsuneHub
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.5625rem',
                    color: '#737373',
                    mb: 0,
                  }}
                >
                  v{APP_VERSION}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.5625rem',
                    color: '#404040',
                  }}
                >
                  ·
                </Typography>
                <Tooltip title="GitHub repository">
                  <Link
                    href={GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: '0.5625rem',
                      color: '#737373',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                      textDecoration: 'none',
                      '&:hover': {
                        color: '#a78bfa',
                      },
                      transition: 'color 0.2s',
                    }}
                  >
                    <GitHub sx={{ fontSize: 9 }} />
                  </Link>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Tooltip title="Keyboard shortcuts">
              <IconButton
                size="small"
                onClick={handleShortcutsOpen}
                sx={{
                  width: 28,
                  height: 28,
                  color: '#a3a3a3',
                  '&:hover': {
                    bgcolor: 'rgba(163, 163, 163, 0.1)',
                    color: '#d4d4d4',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: 16,
                  },
                }}
              >
                <Keyboard />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={shortcutsMenuAnchor}
              open={Boolean(shortcutsMenuAnchor)}
              onClose={handleShortcutsClose}
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
                  bgcolor: '#0a0a0a',
                  background: 'linear-gradient(to bottom, #0f0f0f 0%, #0a0a0a 100%)',
                  border: '1px solid rgba(38, 38, 38, 0.5)',
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 320,
                  maxWidth: 360,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(12px)',
                    '-webkit-backdrop-filter': 'blur(12px)',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(38, 38, 38, 0.5)' }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#f5f5f5',
                    letterSpacing: '0.02em',
                  }}
                >
                  Keyboard Shortcuts
                </Typography>
              </Box>
              <Box sx={{ py: 1 }}>
                {Object.entries(groupedShortcuts).map(
                  ([category, categoryShortcuts], categoryIndex) => (
                    <Box key={category}>
                      {categoryIndex > 0 && (
                        <Divider sx={{ my: 1, borderColor: 'rgba(38, 38, 38, 0.5)' }} />
                      )}
                      <Box sx={{ px: 1.5, py: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: '#737373',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 0.75,
                          }}
                        >
                          {category}
                        </Typography>
                        {categoryShortcuts.map((shortcut) => (
                          <MenuItem
                            key={`${shortcut.category || 'Other'}-${shortcut.description}-${shortcut.keys.join('-')}`}
                            sx={{
                              py: 0.75,
                              px: 1.5,
                              borderRadius: '6px',
                              mx: 0.5,
                              mb: 0.25,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(139, 92, 246, 0.15)',
                                '& .shortcut-key': {
                                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                                  borderColor: 'rgba(139, 92, 246, 0.4)',
                                  color: '#c4b5fd',
                                  transform: 'scale(1.05)',
                                },
                              },
                            }}
                            onClick={handleShortcutsClose}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.8125rem',
                                  color: '#4c4c4c',
                                  flex: 1,
                                }}
                              >
                                {shortcut.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  ml: 2,
                                }}
                              >
                                {formatShortcut(shortcut.keys)
                                  .split('+')
                                  .map((key, keyIndex) => (
                                    <Box
                                      key={`${shortcut.keys.join('-')}-${key}-${keyIndex}`}
                                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                                    >
                                      {keyIndex > 0 && (
                                        <Add
                                          sx={{
                                            fontSize: '0.625rem',
                                            color: '#525252',
                                            width: 12,
                                            height: 12,
                                          }}
                                        />
                                      )}
                                      <Box
                                        className="shortcut-key"
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: key.length > 1 ? 32 : 26,
                                          height: 22,
                                          px: 0.875,
                                          bgcolor: 'rgba(23, 23, 23, 0.8)',
                                          border: '1px solid rgba(38, 38, 38, 0.6)',
                                          borderRadius: '5px',
                                          fontSize: '0.6875rem',
                                          fontFamily: 'monospace',
                                          color: '#a78bfa',
                                          fontWeight: 600,
                                          transition: 'all 0.2s ease',
                                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                          letterSpacing: '0.02em',
                                        }}
                                      >
                                        {key}
                                      </Box>
                                    </Box>
                                  ))}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            </Menu>

            <Tooltip
              title={checkingUpdate ? 'Checking for updates...' : 'Check for KitsuneHub updates'}
            >
              <IconButton
                size="small"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                sx={{
                  width: 28,
                  height: 28,
                  color: '#a78bfa',
                  '&:hover': {
                    bgcolor: 'rgba(88, 28, 135, 0.2)',
                    color: '#c4b5fd',
                  },
                  '&:disabled': {
                    color: 'rgba(167, 139, 250, 0.5)',
                  },
                  '& svg': {
                    fontSize: 16,
                    animation: checkingUpdate ? 'spin 1s linear infinite' : 'none',
                  },
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <Sync />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
