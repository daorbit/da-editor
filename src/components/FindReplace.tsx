import { useEffect, useMemo, useRef, useState } from 'react';
import { useSlate } from 'slate-react';
import { ChevronDownIcon, CloseIcon, ReplaceIcon, SearchIcon } from '../icons';
import { findMatches, replaceAll, replaceMatch, type SearchOptions } from '../core/search';
import type { DaEditor } from '../core/types';

export interface FindReplaceProps {
  open: boolean;
  onClose: () => void;

  query: string;
  onQueryChange: (query: string) => void;
  caseSensitive: boolean;
  onCaseSensitiveChange: (caseSensitive: boolean) => void;
  wholeWord: boolean;
  onWholeWordChange: (wholeWord: boolean) => void;
  regex: boolean;
  onRegexChange: (regex: boolean) => void;
  inSelection: boolean;
  onInSelectionChange: (inSelection: boolean) => void;
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
  wholeWord,
  onWholeWordChange,
  regex,
  onRegexChange,
  inSelection,
  onInSelectionChange,
  activeIndex,
  onActiveIndexChange,
}: FindReplaceProps) {
  const editor = useSlate() as DaEditor;
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo<SearchOptions>(
    () => ({ caseSensitive, wholeWord, regex, inSelection }),
    [caseSensitive, wholeWord, regex, inSelection],
  );

  const regexError = useMemo(() => {
    if (!regex || !query) return null;
    try {
      new RegExp(query);
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'Invalid pattern';
    }
  }, [regex, query]);

  const matches = useMemo(
    () => findMatches(editor, query, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor.children, editor.selection, query, options],
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

  const runReplace = () => {
    if (matches.length === 0) return;
    replaceMatch(editor, matches[activeIndex], replacement, options);
  };

  const runReplaceAll = () => {
    replaceAll(editor, query, replacement, options);
  };

  const status = regexError
    ? 'Invalid pattern'
    : matches.length === 0
      ? 'No results'
      : `${activeIndex + 1} of ${matches.length}`;

  return (
    <div className="da-find" role="search">
      <div className="da-find__row">
        <span className="da-find__icon" aria-hidden="true">
          <SearchIcon size={15} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className={`da-find__input${regexError ? ' da-find__input--error' : ''}`}
          placeholder={regex ? 'Pattern' : 'Find'}
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

        <span className="da-find__count" title={regexError ?? undefined}>
          {status}
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
          className={`da-find__btn${wholeWord ? ' da-find__btn--on' : ''}`}
          title="Whole word"
          aria-label="Whole word"
          aria-pressed={wholeWord}
          onClick={() => onWholeWordChange(!wholeWord)}
        >
          <span className="da-find__ab">ab</span>
        </button>

        <button
          type="button"
          className={`da-find__btn${regex ? ' da-find__btn--on' : ''}`}
          title="Use regular expression"
          aria-label="Use regular expression"
          aria-pressed={regex}
          onClick={() => onRegexChange(!regex)}
        >
          .*
        </button>

        <button
          type="button"
          className={`da-find__btn${inSelection ? ' da-find__btn--on' : ''}`}
          title="Find in selection"
          aria-label="Find in selection"
          aria-pressed={inSelection}
          onClick={() => onInSelectionChange(!inSelection)}
        >
          <span className="da-find__insel" />
        </button>

        <button
          type="button"
          className={`da-find__btn${showReplace ? ' da-find__btn--on' : ''}`}
          title="Toggle replace"
          aria-label="Toggle replace"
          aria-pressed={showReplace}
          onClick={() => setShowReplace((value) => !value)}
        >
          <ReplaceIcon size={14} />
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
            placeholder={regex ? 'Replace with ($1, $2…)' : 'Replace with'}
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                runReplace();
              }
              if (event.key === 'Escape') onClose();
            }}
          />
          <button
            type="button"
            className="da-find__text-btn"
            disabled={matches.length === 0}
            onClick={runReplace}
          >
            Replace
          </button>
          <button
            type="button"
            className="da-find__text-btn"
            disabled={matches.length === 0}
            onClick={runReplaceAll}
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}
