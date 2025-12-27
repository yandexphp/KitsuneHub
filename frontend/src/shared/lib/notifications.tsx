import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import type { ComponentType } from 'react';
import { type ToastOptions, toast } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastConfig = {
  Icon: ComponentType<{ sx?: { color?: string; fontSize?: number } }>;
  color: string;
  autoClose: number;
};

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    Icon: CheckCircleIcon,
    color: '#10b981',
    autoClose: 3500,
  },
  error: {
    Icon: ErrorIcon,
    color: '#ef4444',
    autoClose: 5000,
  },
  info: {
    Icon: InfoIcon,
    color: '#8b5cf6',
    autoClose: 3000,
  },
  warning: {
    Icon: WarningIcon,
    color: '#f59e0b',
    autoClose: 4000,
  },
};

const createToast = (type: ToastType, message: string) => {
  const config = toastConfigs[type];
  const toastMethod = toast[type];

  const options: ToastOptions = {
    position: 'top-center',
    toastId: `${type}-${Date.now()}-${Math.random()}`,
    autoClose: config.autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: 'dark',
    icon: () => <config.Icon sx={{ color: config.color, fontSize: 20 }} />,
  };

  toastMethod(message, options);
};

export const notifications = {
  success: (message: string) => createToast('success', message),
  error: (message: string) => createToast('error', message),
  info: (message: string) => createToast('info', message),
  warning: (message: string) => createToast('warning', message),
};
