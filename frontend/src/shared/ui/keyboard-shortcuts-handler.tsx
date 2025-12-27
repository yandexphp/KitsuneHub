import { useEffect } from 'react';
import { isMac } from '@/shared/lib/platform';
import { useAppStore } from '@/shared/store/app-store';

function isInputElement(element: EventTarget | null): boolean {
  if (!element) {
    return false;
  }
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  );
}

function getSearchInput(): HTMLInputElement | null {
  const input = document.querySelector('input[type="text"]');
  return input instanceof HTMLInputElement ? input : null;
}

function getAllInstallerIds(): string[] {
  const cards = document.querySelectorAll('[data-installer-id]');
  return Array.from(cards)
    .map((card): string | undefined => {
      if (card instanceof HTMLElement) {
        return card.dataset.installerId;
      }
      return undefined;
    })
    .filter((id): id is string => Boolean(id));
}

export function KeyboardShortcutsHandler() {
  const { setViewMode, detailsPanelOpen, setDetailsPanelOpen, selectAll, clearSelection } =
    useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = isMac ? e.metaKey : e.ctrlKey;
      const isInputFocused = isInputElement(e.target);

      if (isModifierPressed && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const searchInput = getSearchInput();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return false;
      }

      if (e.key === 'Escape' && !isInputFocused) {
        if (detailsPanelOpen) {
          setDetailsPanelOpen(false);
        }
        return;
      }

      if (isModifierPressed && e.key === 'a' && !isInputFocused) {
        e.preventDefault();
        const ids = getAllInstallerIds();
        if (ids.length > 0) {
          selectAll(ids);
        }
        return;
      }

      if (isModifierPressed && e.key === 'd' && !isInputFocused) {
        e.preventDefault();
        clearSelection();
        return;
      }

      if (isModifierPressed && e.key === 'g' && !isInputFocused) {
        e.preventDefault();
        setViewMode('grid');
        return;
      }

      if (isModifierPressed && e.key === 't' && !isInputFocused) {
        e.preventDefault();
        setViewMode('table');
        return;
      }
    };

    const options = { capture: true, passive: false };
    document.addEventListener('keydown', handleKeyDown, options);
    window.addEventListener('keydown', handleKeyDown, options);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, options);
      window.removeEventListener('keydown', handleKeyDown, options);
    };
  }, [detailsPanelOpen, setDetailsPanelOpen, setViewMode, selectAll, clearSelection]);

  return null;
}
