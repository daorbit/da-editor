import { useMemo, useRef } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { BLOCK_SPECS, INSERT_SPECS } from './toolbarConfig';
import {
  EmojiIcon,
  ImageIcon,
  LinkIcon,
  SparklesIcon,
  TableIcon,
  VideoIcon,
} from '../icons';
import { replaceBlock } from '../core/transforms';
import { insertTable } from '../core/tables';
import { ELEMENT, type DaEditor, type ElementType, type MediaKind } from '../core/types';
import { useEditorFocused } from '../core/useDismiss';
import {
  useAnchoredPosition,
  useMenuNavigation,
  useTriggerQuery,
} from '../core/useInlineCombobox';

const TRIGGER = /(?:^|\s)\/(\w*)$/;

/** Insert-menu entries also offered from the slash menu, keyed by `INSERT_SPECS`. */
const EXTRA_INSERTS: Array<{ key: string; group: string; keywords: string[] }> = [
  { key: 'toggle', group: 'Lists', keywords: ['toggle', 'collapse', 'details'] },
  { key: 'columns', group: 'Advanced', keywords: ['columns', 'layout', 'grid'] },
  { key: 'toc', group: 'Advanced', keywords: ['toc', 'contents', 'outline'] },
  { key: 'equation', group: 'Advanced', keywords: ['equation', 'math', 'latex', 'formula'] },
  { key: 'date', group: 'Inline', keywords: ['date', 'today', 'time', 'calendar'] },
  { key: 'footnote', group: 'Inline', keywords: ['footnote', 'note', 'reference'] },
];

export interface SlashItem {
  key: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  keywords: string[];
  run: (editor: DaEditor) => void;
}

function blockItem(type: ElementType, label: string, group: string, icon: React.ReactNode, keywords: string[]): SlashItem {
  return {
    key: type,
    label,
    group,
    icon,
    keywords,
    run: (editor) => replaceBlock(editor, type),
  };
}

const GROUPS = ['Recent', 'AI', 'Basic blocks', 'Lists', 'Advanced', 'Inline', 'Media'] as const;

/** Item keys picked this session, most recent first. Not persisted. */
const recentKeys: string[] = [];

function rememberRecent(key: string) {
  const at = recentKeys.indexOf(key);
  if (at !== -1) recentKeys.splice(at, 1);
  recentKeys.unshift(key);
  recentKeys.length = Math.min(recentKeys.length, 3);
}

function buildItems(
  onAskAi?: () => void,
  onMedia?: (kind: MediaKind) => void,
): SlashItem[] {
  const spec = (type: ElementType) => BLOCK_SPECS.find((s) => s.type === type)!;

  const items: SlashItem[] = [
    blockItem(ELEMENT.paragraph, 'Text', 'Basic blocks', spec(ELEMENT.paragraph).icon, ['text', 'paragraph', 'p']),
    blockItem(ELEMENT.h1, 'Heading 1', 'Basic blocks', spec(ELEMENT.h1).icon, ['h1', 'title', 'heading']),
    blockItem(ELEMENT.h2, 'Heading 2', 'Basic blocks', spec(ELEMENT.h2).icon, ['h2', 'subtitle', 'heading']),
    blockItem(ELEMENT.h3, 'Heading 3', 'Basic blocks', spec(ELEMENT.h3).icon, ['h3', 'heading']),
    blockItem(ELEMENT.blockquote, 'Quote', 'Basic blocks', spec(ELEMENT.blockquote).icon, ['quote', 'blockquote', 'citation']),
    blockItem(ELEMENT.codeBlock, 'Code block', 'Basic blocks', spec(ELEMENT.codeBlock).icon, ['code', 'snippet', 'pre']),
    blockItem(ELEMENT.callout, 'Callout', 'Basic blocks', spec(ELEMENT.callout).icon, ['callout', 'note', 'info']),
    blockItem(ELEMENT.divider, 'Divider', 'Basic blocks', spec(ELEMENT.divider).icon, ['divider', 'hr', 'separator', 'rule']),
    blockItem(ELEMENT.bulletedList, 'Bulleted list', 'Lists', spec(ELEMENT.bulletedList).icon, ['ul', 'bullet', 'unordered', 'list']),
    blockItem(ELEMENT.numberedList, 'Numbered list', 'Lists', spec(ELEMENT.numberedList).icon, ['ol', 'number', 'ordered', 'list']),
    blockItem(ELEMENT.todoListItem, 'To-do list', 'Lists', spec(ELEMENT.todoListItem).icon, ['todo', 'task', 'checkbox', 'check']),
    {
      key: 'table',
      label: 'Table',
      group: 'Advanced',
      icon: <TableIcon />,
      keywords: ['table', 'grid', 'rows', 'columns'],
      run: (editor) => insertTable(editor),
    },
  ];

  for (const extra of EXTRA_INSERTS) {
    const spec = INSERT_SPECS.find((entry) => entry.key === extra.key);
    if (!spec) continue;
    items.push({
      key: extra.key,
      label: spec.label,
      group: extra.group,
      icon: spec.icon,
      keywords: extra.keywords,
      run: (editor) => spec.run(editor, { onMedia, onAskAi }),
    });
  }

  if (onMedia) {
    items.push(
      {
        key: 'image',
        label: 'Image',
        group: 'Media',
        icon: <ImageIcon />,
        keywords: ['image', 'picture', 'photo', 'img', 'upload'],
        run: () => onMedia('image'),
      },
      {
        key: 'video',
        label: 'Video',
        group: 'Media',
        icon: <VideoIcon />,
        keywords: ['video', 'movie', 'youtube', 'mp4'],
        run: () => onMedia('video'),
      },
      {
        key: 'audio',
        label: 'Audio',
        group: 'Media',
        icon: <EmojiIcon />,
        keywords: ['audio', 'sound', 'music', 'mp3'],
        run: () => onMedia('audio'),
      },
      {
        key: 'file',
        label: 'File attachment',
        group: 'Media',
        icon: <LinkIcon />,
        keywords: ['file', 'attach', 'attachment', 'document'],
        run: () => onMedia('file'),
      },
    );
  }

  if (onAskAi) {
    items.unshift({
      key: 'ai',
      label: 'Ask AI',
      group: 'AI',
      icon: <SparklesIcon />,
      keywords: ['ai', 'ask', 'generate', 'write'],
      run: () => onAskAi(),
    });
  }

  return items;
}

export interface SlashMenuProps {
  onAskAi?: () => void;
  onMedia?: (kind: MediaKind) => void;
}

/**
 * Combobox triggered by `/` at a word boundary. The trigger text lives in the
 * document, so it is deleted before an item runs.
 */
export function SlashMenu({ onAskAi, onMedia }: SlashMenuProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const focused = useEditorFocused(editor);
  const { match, dismiss } = useTriggerQuery(editor, TRIGGER);
  const query = match?.query ?? '';

  const allItems = useMemo(() => buildItems(onAskAi, onMedia), [onAskAi, onMedia]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // A "Recent" band above the full list, built from this session's picks.
      const recent = recentKeys
        .map((key) => allItems.find((item) => item.key === key))
        .filter((item): item is SlashItem => Boolean(item))
        .map((item) => ({ ...item, key: `recent-${item.key}`, group: 'Recent' }));
      return [...recent, ...allItems];
    }
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((keyword) => keyword.startsWith(q)),
    );
  }, [allItems, query]);

  // Grouped once so the rendered order and the keyboard order always agree.
  const ordered = useMemo(
    () => GROUPS.flatMap((group) => items.filter((item) => item.group === group)),
    [items],
  );

  const open = focused && !!match && ordered.length > 0;

  const run = (item: SlashItem) => {
    if (match) Transforms.select(editor, match.target);
    Transforms.delete(editor);
    item.run(editor);
    rememberRecent(item.key.replace(/^recent-/, ''));
    ReactEditor.focus(editor);
  };

  const { index, setIndex } = useMenuNavigation(editor, {
    open,
    count: ordered.length,
    resetKey: query,
    menuRef: ref,
    onChoose: (i) => run(ordered[i]),
    onDismiss: dismiss,
  });

  const position = useAnchoredPosition(
    editor,
    open ? match.target : null,
    ref,
    `${query}:${ordered.length}`,
  );

  if (!open) return null;

  let lastGroup = '';

  return (
    <div
      ref={ref}
      className="da-slash da-slash--in"
      role="listbox"
      aria-label="Insert block"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      {ordered.map((item, itemIndex) => {
        const header = item.group !== lastGroup ? item.group : null;
        lastGroup = item.group;

        return [
          header && (
            <div key={`h-${header}`} className="da-slash__group">
              {header}
            </div>
          ),
          <button
            key={item.key}
            type="button"
            role="option"
            aria-selected={itemIndex === index}
            className={`da-slash__item${itemIndex === index ? ' da-slash__item--active' : ''}`}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => itemIndex !== index && setIndex(itemIndex)}
            onClick={() => run(item)}
          >
            <span className="da-slash__icon">{item.icon}</span>
            <span className="da-slash__label">{item.label}</span>
            {itemIndex === index && <kbd className="da-slash__hint">↵</kbd>}
          </button>,
        ];
      })}
    </div>
  );
}
