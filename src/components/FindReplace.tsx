import { useEffect, useMemo, useRef, useState } from 'react';
import { useSlate } from 'slate-react';
import { ChevronDownIcon, CloseIcon, SearchIcon } from '../icons';
import { findMatches, replaceAll, replaceMatch } from '../core/search';
import type { DaEditor } from '../core/types';

export interface FindReplaceProps {
  open: boolean;
  onClose: () => void;
 
  query: string;
  onQueryChange: (query: string) => void;
  caseSensitive: boolean;
  onCaseSensitiveChange: (caseSensitive: boolean) => void;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function FindReplace({
  open,
  onClose,
  query,
  onQueryChange,
  caseSensitive,
  onCaseSensitiveChange,
  activeIndex,
  onActiveIndexChange,
}: FindReplaceProps) {
  const editor = useSlate() as DaEditor;
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => findMatches(editor, query, { caseSensitive }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor.children, query, caseSensitive],
  );

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (activeIndex >= matches.length) onActiveIndexChange(0);
  }, [matches.length, activeIndex, onActiveIndexChange]);

  if (!open) return null;

  const step = (delta: number) => {
    if (matches.length === 0) return;
    onActiveIndexChange((activeIndex + delta + matches.length) % matches.length);
  };

  return (
    <div className="da-find" role="search">
      <div className="da-find__row">
        <span className="da-find__icon" aria-hidden="true">
          <SearchIcon size={15} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="da-find__input"
          placeholder="Find"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              step(event.shiftKey ? -1 : 1);
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              onClose();
            }
          }}
        />

        <span className="da-find__count">
          {matches.length === 0 ? 'No results' : `${activeIndex + 1} of ${matches.length}`}
        </span>

        <button
          type="button"
          className="da-find__btn"
          title="Previous match"
          aria-label="Previous match"
          disabled={matches.length === 0}
          onClick={() => step(-1)}
        >
          <ChevronDownIcon size={14} className="da-find__up" />
        </button>
        <button
          type="button"
          className="da-find__btn"
          title="Next match"
          aria-label="Next match"
          disabled={matches.length === 0}
          onClick={() => step(1)}
        >
          <ChevronDownIcon size={14} />
        </button>

        <button
          type="button"
          className={`da-find__btn${caseSensitive ? ' da-find__btn--on' : ''}`}
          title="Match case"
          aria-label="Match case"
          aria-pressed={caseSensitive}
          onClick={() => onCaseSensitiveChange(!caseSensitive)}
        >
          Aa
        </button>

        <button
          type="button"
          className={`da-find__btn${showReplace ? ' da-find__btn--on' : ''}`}
          title="Toggle replace"
          aria-label="Toggle replace"
          aria-pressed={showReplace}
          onClick={() => setShowReplace((value) => !value)}
        >
          ⇄
        </button>

        <button
          type="button"
          className="da-find__btn"
          title="Close"
          aria-label="Close find"
          onClick={onClose}
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {showReplace && (
        <div className="da-find__row">
          <span className="da-find__icon" aria-hidden="true" />
          <input
            type="text"
            className="da-find__input"
            placeholder="Replace with"
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose();
            }}
          />
          <button
            type="button"
            className="da-find__text-btn"
            disabled={matches.length === 0}
            onClick={() => {
              replaceMatch(editor, matches[activeIndex], replacement);
            }}
          >
            Replace
          </button>
          <button
            type="button"
            className="da-find__text-btn"
            disabled={matches.length === 0}
            onClick={() => {
              replaceAll(editor, query, replacement, { caseSensitive });
            }}
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}
