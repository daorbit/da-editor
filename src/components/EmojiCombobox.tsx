import { useMemo, useRef } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { searchEmojis, type EmojiEntry } from '../core/emoji';
import { insertEmoji } from '../core/transforms';
import type { DaEditor } from '../core/types';
import { useEditorFocused } from '../core/useDismiss';
import {
  useAnchoredPosition,
  useMenuNavigation,
  useTriggerQuery,
} from '../core/useInlineCombobox';

const TRIGGER = /(?:^|\s):([a-z0-9_+-]*)$/i;

/**
 * `:name` combobox for inserting an emoji inline. Opens only once two
 * characters follow the colon, so a lone `:` or `10:30` never triggers it.
 */
export function EmojiCombobox() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const focused = useEditorFocused(editor);
  const { match, dismiss } = useTriggerQuery(editor, TRIGGER);
  const query = match?.query ?? '';

  const items = useMemo<EmojiEntry[]>(
    () => (query.length < 2 ? [] : searchEmojis(query).slice(0, 8)),
    [query],
  );

  const open = focused && !!match && items.length > 0;

  const choose = (entry: EmojiEntry) => {
    if (match) Transforms.select(editor, match.target);
    Transforms.delete(editor);
    insertEmoji(editor, entry.emoji);
    ReactEditor.focus(editor);
  };

  const { index, setIndex } = useMenuNavigation(editor, {
    open,
    count: items.length,
    resetKey: query,
    menuRef: ref,
    onChoose: (i) => choose(items[i]),
    onDismiss: dismiss,
  });

  const position = useAnchoredPosition(
    editor,
    open ? match.target : null,
    ref,
    `${query}:${items.length}`,
  );

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="da-emoji-menu"
      role="listbox"
      aria-label="Emoji"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      {items.map((entry, i) => (
        <button
          key={entry.emoji}
          type="button"
          role="option"
          aria-selected={i === index}
          className={`da-emoji-menu__item${i === index ? ' da-emoji-menu__item--active' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseMove={() => i !== index && setIndex(i)}
          onClick={() => choose(entry)}
        >
          <span className="da-emoji-menu__glyph">{entry.emoji}</span>
          <span className="da-emoji-menu__name">:{entry.name.replace(/\s+/g, '_')}:</span>
        </button>
      ))}
    </div>
  );
}
