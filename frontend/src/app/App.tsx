import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CursorSpotlight } from '@/shared/ui/cursor-spotlight';
import { KeyboardShortcutsHandler } from '@/shared/ui/keyboard-shortcuts-handler';
import { DetailsPanel } from '@/widgets/details-panel';
import { Header } from '@/widgets/header';
import { InstallerList } from '@/widgets/installer-list';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#0a0a0a',
      paper: '#0f0f0f',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a3a3a3',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1a1a',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.75rem',
          fontWeight: 400,
          color: '#e5e5e5',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          maxWidth: '280px',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        },
        arrow: {
          color: '#1a1a1a',
          '&::before': {
            border: '1px solid rgba(64, 64, 64, 0.4)',
            backgroundColor: '#1a1a1a',
            backdropFilter: 'blur(12px)',
            '-webkit-backdrop-filter': 'blur(12px)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <KeyboardShortcutsHandler />
        <CursorSpotlight />
        <div className="min-h-screen max-h-screen bg-[#0a0a0a] p-3 overflow-hidden">
          <div className="max-w-[1920px] mx-auto h-full flex flex-col">
            <Header />
            <main className="flex-1 px-3 py-3 rounded-b-lg bg-[#0f0f0f] border border-t-0 border-neutral-800/30 overflow-hidden">
              <InstallerList />
            </main>
          </div>
        </div>
        <DetailsPanel />
        <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          closeButton={true}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={true}
          theme="dark"
          limit={3}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
