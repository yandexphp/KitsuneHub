export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const getIconColorGradient = (name: string): string => {
  const gradients = [
    'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

export const getIconColorTailwind = (name: string): string => {
  const colors = [
    'from-purple-600 to-purple-700',
    'from-violet-600 to-violet-700',
    'from-fuchsia-600 to-fuchsia-700',
    'from-indigo-600 to-indigo-700',
    'from-blue-600 to-blue-700',
    'from-cyan-600 to-cyan-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getIconColorHex = (name: string): string => {
  const colors = [
    '#9333ea',
    '#8b5cf6',
    '#c026d3',
    '#db2777',
    '#e11d48',
    '#6366f1',
    '#3b82f6',
    '#06b6d4',
    '#14b8a6',
    '#10b981',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getSizeMultiplier = (unit: string): number => {
  const normalizedUnit = unit.toUpperCase();
  switch (normalizedUnit) {
    case 'KB':
      return 1024;
    case 'MB':
      return 1024 ** 2;
    case 'GB':
      return 1024 ** 3;
    case 'TB':
      return 1024 ** 4;
    default:
      return 1;
  }
};

export const parseSizeToBytes = (size: string): number => {
  const match = size.match(/^([\d.]+)\s*(KB|MB|GB|TB)?/i);
  if (!match) {
    return 0;
  }
  const value = parseFloat(match[1]);
  const unit = match[2] || 'B';
  return value * getSizeMultiplier(unit);
};

export const formatDownloads = (downloads?: number): string | null => {
  if (!downloads) {
    return null;
  }
  if (downloads >= 1000000) {
    return `${(downloads / 1000000).toFixed(1)}M`;
  }
  if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(0)}K`;
  }
  return downloads.toString();
};

export const formatDate = (date?: string): string | null => {
  if (!date) {
    return null;
  }
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
