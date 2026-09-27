import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, FileText, Search } from 'lucide-react';
import { searchDocs } from './searchIndex';

export interface DocsSearchProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSearch({ open, onClose }: DocsSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const results = useMemo(() => searchDocs(query), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setIndex(0);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  if (!open) return null;

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && results[index]) {
      event.preventDefault();
      go(results[index].to);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="dx-search" role="presentation" onMouseDown={onClose}>
      <div
        className="dx-search__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dx-search__field">
          <Search size={17} />
          <input
            ref={inputRef}
            className="dx-search__input"
            placeholder="Search props, methods, features…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            aria-controls="dx-search-results"
          />
          <kbd className="dx-kbd">Esc</kbd>
        </div>

        {results.length === 0 ? (
          <p className="dx-search__empty">No results for “{query}”.</p>
        ) : (
          <ul className="dx-search__results" id="dx-search-results" role="listbox" ref={listRef}>
            {results.map((result, i) => (
              <li
                key={`${result.kind}:${result.to}`}
                role="option"
                aria-selected={i === index}
                className={`dx-search__result${i === index ? ' dx-search__result--active' : ''}`}
                onMouseMove={() => i !== index && setIndex(i)}
                onClick={() => go(result.to)}
              >
                <span className="dx-search__icon">
                  <FileText size={15} />
                </span>
                <span className="dx-search__text">
                  <span className="dx-search__title">{result.title}</span>
                  <span className="dx-search__detail">{result.detail}</span>
                </span>
                <span className="dx-search__kind">{result.kind}</span>
                {i === index && <CornerDownLeft size={14} className="dx-search__enter" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
