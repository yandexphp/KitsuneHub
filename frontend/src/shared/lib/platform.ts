interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    platform?: string;
  };
}

export function detectMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const nav = navigator as NavigatorWithUserAgentData;

  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform.toUpperCase().includes('MAC');
  }

  return navigator.userAgent.toUpperCase().includes('MAC');
}

export const isMac = detectMacPlatform();
export const modifierKey = isMac ? '⌘' : 'Ctrl';
