import { useCallback, useEffect, useState } from 'react';

interface Options {
  contentWidth: number;
  contentHeight: number;
  padding?: { x: number; y: number };
}

interface FitScale {
  ref: (node: HTMLElement | null) => void;
  scale: number;
  measured: boolean;
}

 
export function useFitScale({ contentWidth, contentHeight, padding }: Options): FitScale {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [measured, setMeasured] = useState(false);

  const padX = padding?.x ?? 0;
  const padY = padding?.y ?? 0;

  const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

  useEffect(() => {
    if (!element) return;

    let frame = 0;

    const fit = () => {
      const width = element.clientWidth - padX;
      const height = element.clientHeight - padY;
      if (width <= 0 || height <= 0) return false;

      const next = Math.min(1, width / contentWidth, height / contentHeight);
      if (!Number.isFinite(next) || next <= 0) return false;

      setScale(next);
      setMeasured(true);
      return true;
    };

    const retry = () => {
      if (fit()) return;
      frame = requestAnimationFrame(retry);
    };
    retry();

    const observer = new ResizeObserver(() => fit());
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [element, contentWidth, contentHeight, padX, padY]);

  useEffect(() => {
    if (!element) setMeasured(false);
  }, [element]);

  return { ref, scale, measured };
}
