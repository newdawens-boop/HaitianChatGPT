// hooks/useAutoResize.ts
import { useCallback, useRef, useEffect } from 'react';

interface UseAutoResizeOptions {
  minRows?: number;
  maxRows?: number;
  lineHeight?: number;
}

export function useAutoResize(options: UseAutoResizeOptions = {}) {
  const { minRows = 1, maxRows = 10, lineHeight = 24 } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialHeightRef = useRef<number>(0);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Store initial height on first call
    if (initialHeightRef.current === 0) {
      initialHeightRef.current = textarea.scrollHeight;
    }

    // Reset to auto to get correct scrollHeight
    textarea.style.height = 'auto';
    
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    const scrollHeight = Math.max(textarea.scrollHeight, minHeight);
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxRows, lineHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Initial resize
    resize();

    // Handle window resize
    const handleWindowResize = () => resize();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [resize]);

  return { textareaRef, resize };
}
