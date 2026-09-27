import { useEffect, useState, type RefObject } from 'react';

export interface DocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const ACTIVE_OFFSET = 120;

export function useDocHeadings(articleRef: RefObject<HTMLElement | null>, pageKey: string) {
  const [headings, setHeadings] = useState<DocHeading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const nodes = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    setHeadings(
      nodes.map((node) => ({
        id: node.id,
        text: (node.textContent ?? '').replace(/#$/, ''),
        level: node.tagName === 'H2' ? 2 : 3,
      })),
    );

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
        const passed = nodes.filter((node) => node.getBoundingClientRect().top <= ACTIVE_OFFSET);
        const current = atBottom ? nodes[nodes.length - 1] : passed[passed.length - 1] ?? nodes[0];
        setActiveId(current?.id ?? '');
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [articleRef, pageKey]);

  return { headings, activeId };
}
