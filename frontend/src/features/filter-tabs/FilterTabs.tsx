import { Apps, CheckCircle, CloudDownload, Sync } from '@mui/icons-material';
import { Box, Tab, Tabs, Tooltip } from '@mui/material';
import { useInstallers } from '@/shared/hooks';
import type { FilterTab } from '@/shared/store/app-store';
import { useAppStore } from '@/shared/store/app-store';
import { AnimatedCounter } from '@/shared/ui/animated-counter';

export function FilterTabs() {
  const { filterTab, setFilterTab } = useAppStore();
  const { data: installers = [] } = useInstallers();

  const allCount = installers.length;
  const installedCount = installers.filter((i) => i.installed).length;
  const notInstalledCount = installers.filter((i) => !i.installed).length;
  const updatesCount = installers.filter((i) => i.can_update).length;

  const handleChange = (_event: React.SyntheticEvent, newValue: FilterTab) => {
    setFilterTab(newValue);
  };

  return (
    <Tabs
      value={filterTab}
      onChange={handleChange}
      sx={{
        minHeight: 'auto',
        '& .MuiTabs-indicator': {
          bgcolor: '#8b5cf6',
        },
        '& .MuiTab-root': {
          minHeight: 'auto',
          py: 1,
          px: 0.5,
          textTransform: 'none',
          fontSize: '0.75rem',
          color: '#737373',
          '&.Mui-selected': {
            color: '#f5f5f5',
          },
        },
      }}
    >
      <Tab
        value="all"
        label={
          <Tooltip title="All applications in catalog">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <Apps sx={{ fontSize: 11 }} />
              <span style={{ fontSize: '0.75rem' }}>All</span>
              <AnimatedCounter
                value={allCount}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800/50 text-neutral-400 font-medium min-w-[20px] text-center"
              />
            </Box>
          </Tooltip>
        }
      />
      <Tab
        value="not-installed"
        label={
          <Tooltip title="Applications available for installation">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <CloudDownload sx={{ fontSize: 11 }} />
              <span style={{ fontSize: '0.75rem' }}>Not Installed</span>
              <AnimatedCounter
                value={notInstalledCount}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800/50 text-neutral-400 font-medium min-w-[20px] text-center"
              />
            </Box>
          </Tooltip>
        }
      />
      <Tab
        value="updates"
        label={
          <Tooltip title="Applications with available updates">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <Sync sx={{ fontSize: 11 }} />
              <span style={{ fontSize: '0.75rem' }}>Updates</span>
              <AnimatedCounter
                value={updatesCount}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-950/30 text-orange-500 font-medium min-w-[20px] text-center"
              />
            </Box>
          </Tooltip>
        }
      />
      <Tab
        value="installed"
        label={
          <Tooltip title="Installed applications">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <CheckCircle sx={{ fontSize: 11 }} />
              <span style={{ fontSize: '0.75rem' }}>Installed</span>
              <AnimatedCounter
                value={installedCount}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/30 text-emerald-500 font-medium min-w-[20px] text-center"
              />
            </Box>
          </Tooltip>
        }
      />
    </Tabs>
  );
}
