import { useEffect, useRef } from 'react';

/** Grows an iframe to the height its page posts, so it never scrolls inside a fixed box. */
export function useFrameHeight(src: string) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const origin = new URL(src).origin;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as { type?: string; height?: number };
      if (data?.type !== 'da-forms:height' || typeof data.height !== 'number') return;
      if (frameRef.current) frameRef.current.style.height = `${data.height}px`;
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [src]);

  return frameRef;
}
