import { useMemo, useRef } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { insertMention } from '../core/transforms';
import type { DaEditor, Mentionable } from '../core/types';
import { useEditorFocused } from '../core/useDismiss';
import {
  useAnchoredPosition,
  useMenuNavigation,
  useTriggerQuery,
} from '../core/useInlineCombobox';

// A word boundary before the `@`, so an email address does not open the menu.
const TRIGGER = /(?:^|\s)@(\w*)$/;

export interface MentionComboboxProps {
  mentionables: Mentionable[];
}

export function MentionCombobox({ mentionables }: MentionComboboxProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const focused = useEditorFocused(editor);
  const { match, dismiss } = useTriggerQuery(editor, TRIGGER);
  const query = match?.query ?? '';

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

  const open = focused && !!match && items.length > 0;

  const choose = (item: Mentionable) => {
    if (match) Transforms.select(editor, match.target);
    Transforms.delete(editor);
    insertMention(editor, item.id, item.name);
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
      className="da-mention-menu"
      role="listbox"
      aria-label="Mention"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={i === index}
          className={`da-mention-menu__item${i === index ? ' da-mention-menu__item--active' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseMove={() => i !== index && setIndex(i)}
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
