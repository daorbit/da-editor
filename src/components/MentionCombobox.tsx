import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { insertMention } from '../core/transforms';
import type { DaEditor, Mentionable } from '../core/types';

export interface MentionComboboxProps {
  mentionables: Mentionable[];
}

/** `@` combobox. The trigger text lives in the document until an item is chosen. */
export function MentionCombobox({ mentionables }: MentionComboboxProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Range | null>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? mentionables.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.detail?.toLowerCase().includes(q),
        )
      : mentionables;
    return matches.slice(0, 8);
  }, [mentionables, query]);

  const { selection } = editor;

  useEffect(() => {
    if (!selection || !Range.isCollapsed(selection)) {
      setTarget(null);
      return;
    }

    const [start] = Range.edges(selection);
    const blockEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n as never),
    });
    if (!blockEntry) {
      setTarget(null);
      return;
    }

    const blockStart = Editor.start(editor, blockEntry[1]);
    const beforeText = Editor.string(editor, { anchor: blockStart, focus: start });
    // Only trigger at a word boundary, so an email address does not open the menu.
    const match = beforeText.match(/(?:^|\s)@(\w*)$/);

    if (!match) {
      setTarget(null);
      return;
    }

    const triggerOffset = beforeText.length - match[0].trimStart().length;
    setTarget({
      anchor: { path: blockStart.path, offset: blockStart.offset + triggerOffset },
      focus: start,
    });
    setQuery(match[1]);
    setIndex(0);
  }, [editor, selection]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !target || items.length === 0) {
      setPosition(null);
      return;
    }
    try {
      const rect = ReactEditor.toDOMRange(editor, target).getBoundingClientRect();
      const container = el.offsetParent as HTMLElement | null;
      const base = container?.getBoundingClientRect();
      setPosition({
        top: rect.bottom - (base?.top ?? 0) + 6,
        left: rect.left - (base?.left ?? 0),
      });
    } catch {
      setPosition(null);
    }
  }, [editor, target, items.length, query]);

  const choose = (item: Mentionable) => {
    if (target) Transforms.select(editor, target);
    Transforms.delete(editor);
    insertMention(editor, item.id, item.name);
    setTarget(null);
    ReactEditor.focus(editor);
  };

  useEffect(() => {
    if (!target || items.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setIndex((i) => (i + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setIndex((i) => (i - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          choose(items[index]);
          break;
        case 'Escape':
          event.preventDefault();
          setTarget(null);
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  });

  if (!target || items.length === 0 || !position) return null;

  return (
    <div
      ref={ref}
      className="da-mention-menu"
      role="listbox"
      aria-label="Mention"
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={i === index}
          className={`da-mention-menu__item${i === index ? ' da-mention-menu__item--active' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => setIndex(i)}
          onClick={() => choose(item)}
        >
          <span className="da-mention-menu__avatar">
            {item.avatar ? (
              <img src={item.avatar} alt="" />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </span>
          <span className="da-mention-menu__text">
            <span className="da-mention-menu__name">{item.name}</span>
            {item.detail && (
              <span className="da-mention-menu__detail">{item.detail}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
