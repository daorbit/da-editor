import { useEffect, useState } from 'react';

interface Rect {
  left: number;
  width: number;
}

export function useEditorColumnRect(rootRef: React.RefObject<HTMLElement>, active: boolean): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    const target = root.querySelector<HTMLElement>('.da-editor__scroll');
    if (!target) return;

    const measure = () => {
      const outer = root.getBoundingClientRect();
      const inner = target.getBoundingClientRect();
      setRect({ left: inner.left - outer.left, width: inner.width });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    observer.observe(root);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [rootRef, active]);

  return rect;
}
