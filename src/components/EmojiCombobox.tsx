import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { searchEmojis, type EmojiEntry } from '../core/emoji';
import { insertEmoji } from '../core/transforms';
import type { DaEditor } from '../core/types';

/**
 * `:name` combobox for inserting an emoji inline, the same shape as the slash
 * and mention menus: the trigger text lives in the document until an item is
 * chosen, then it is deleted and replaced.
 *
 * Only fires once at least two characters follow the colon, so a lone `:` — or
 * `10:30` — never opens the menu.
 */
export function EmojiCombobox() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Range | null>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const items = useMemo<EmojiEntry[]>(() => {
    if (query.length < 2) return [];
    return searchEmojis(query).slice(0, 8);
  }, [query]);

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
    // A word boundary before the colon, letters only after it.
    const match = beforeText.match(/(?:^|\s):([a-z0-9_+-]*)$/i);

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

  const choose = (entry: EmojiEntry) => {
    if (target) Transforms.select(editor, target);
    Transforms.delete(editor);
    insertEmoji(editor, entry.emoji);
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
      className="da-emoji-menu"
      role="listbox"
      aria-label="Emoji"
      style={{ top: position.top, left: position.left }}
    >
      {items.map((entry, i) => (
        <button
          key={entry.emoji}
          type="button"
          role="option"
          aria-selected={i === index}
          className={`da-emoji-menu__item${i === index ? ' da-emoji-menu__item--active' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => setIndex(i)}
          onClick={() => choose(entry)}
        >
          <span className="da-emoji-menu__glyph">{entry.emoji}</span>
          <span className="da-emoji-menu__name">:{entry.name.replace(/\s+/g, '_')}:</span>
        </button>
      ))}
    </div>
  );
}
