import { useEffect, useCallback } from 'react';

interface KeyboardHandlers {
  onEscape?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  [key: string]: (() => void) | undefined;
}

export function useKeyboard(handlers: KeyboardHandlers, deps: unknown[] = []) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'escape':
        handlers.onEscape?.();
        break;
      case 'arrowleft':
        handlers.onArrowLeft?.();
        break;
      case 'arrowright':
        handlers.onArrowRight?.();
        break;
      case 'arrowup':
        handlers.onArrowUp?.();
        break;
      case 'arrowdown':
        handlers.onArrowDown?.();
        break;
      case 'enter':
        handlers.onEnter?.();
        break;
    }
  }, [handlers, ...deps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}