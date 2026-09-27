import { ArrowUp, Pencil } from 'lucide-react';
import type { DocHeading } from './useDocHeadings';

const EDIT_URL = 'https://github.com/daorbit/da-editor/blob/main/playground/src/docs/pages.tsx';

export interface DocsTocProps {
  headings: DocHeading[];
  activeId: string;
}

export function DocsToc({ headings, activeId }: DocsTocProps) {
  return (
    <aside className="dx-toc" aria-label="On this page">
      {headings.length > 1 && (
        <>
          <p className="dx-toc__label">On this page</p>
          <nav className="dx-toc__list">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`dx-toc__link dx-toc__link--h${heading.level}${
                  heading.id === activeId ? ' dx-toc__link--active' : ''
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </>
      )}

      <div className="dx-toc__extra">
        <a className="dx-toc__action" href={EDIT_URL} target="_blank" rel="noreferrer">
          <Pencil size={13} />
          Edit this page
        </a>
        <button
          type="button"
          className="dx-toc__action"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp size={13} />
          Back to top
        </button>
      </div>
    </aside>
  );
}
