import { useEffect, useMemo, useRef, useState } from 'react';
import { Node, Transforms } from 'slate';
import { ReactEditor, useSelected, useSlateStatic, type RenderElementProps } from 'slate-react';
import { CheckIcon, DuplicateIcon, SearchIcon } from '../icons';
import { LANGUAGES } from '../core/highlight';

export function CodeBlock({ attributes, children, element }: RenderElementProps) {
  const editor = useSlateStatic();
  const selected = useSelected();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const lang = 'lang' in element && element.lang ? element.lang : '';
  const current = LANGUAGES.find((entry) => entry.value === lang) ?? LANGUAGES[0];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((entry) => entry.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as globalThis.Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const setLanguage = (value: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { lang: value || undefined }, { at: path });
    setMenuOpen(false);
    setQuery('');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(Node.string(element));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; failing silently is better than throwing.
    }
  };

  return (
    <div
      {...attributes}
      className={`da-code-wrap${selected ? ' da-code-wrap--selected' : ''}`}
    >
      <div className="da-code__bar" contentEditable={false}>
        <div className="da-code__lang" ref={menuRef}>
          <button
            type="button"
            className="da-code__lang-btn"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {current.label}
          </button>

          {menuOpen && (
            <div className="da-code__menu" role="listbox">
              <div className="da-code__search-wrap">
                <SearchIcon size={13} className="da-code__search-icon" />
                <input
                  className="da-code__search"
                  placeholder="Search language..."
                  value={query}
                  autoFocus
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && matches.length > 0) {
                      event.preventDefault();
                      setLanguage(matches[0].value);
                    }
                  }}
                />
              </div>
              <div className="da-code__options">
                {matches.map((entry) => (
                  <button
                    key={entry.value || 'auto'}
                    type="button"
                    role="option"
                    aria-selected={entry.value === lang}
                    className={`da-code__option${entry.value === lang ? ' da-code__option--active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setLanguage(entry.value)}
                  >
                    {entry.label}
                  </button>
                ))}
                {matches.length === 0 && (
                  <div className="da-code__empty">No language found</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="da-code__copy"
          title={copied ? 'Copied' : 'Copy code'}
          aria-label={copied ? 'Copied' : 'Copy code'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={copy}
        >
          {copied ? <CheckIcon size={14} /> : <DuplicateIcon size={14} />}
        </button>
      </div>

      <pre className="da-code-block" spellCheck={false}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
