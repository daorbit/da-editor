import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { BLOCK_SPECS } from './toolbarConfig';
import { ImageIcon, SparklesIcon } from '../icons';
import { replaceBlock } from '../core/transforms';
import { ELEMENT, type DaEditor, type ElementType } from '../core/types';

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

const GROUPS = ['AI', 'Basic blocks', 'Lists', 'Media'] as const;

function buildItems(onAskAi?: () => void): SlashItem[] {
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
      key: 'image',
      label: 'Image',
      group: 'Media',
      icon: <ImageIcon />,
      keywords: ['image', 'picture', 'photo', 'img'],
      run: (editor) => {
        const url = window.prompt('Image URL');
        if (!url) return;
        Transforms.insertNodes(editor, { type: ELEMENT.image, url, children: [{ text: '' }] });
      },
    },
  ];

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
}

/**
 * Combobox triggered by `/` at the start of an empty-ish block. The trigger text
 * lives in the document, so it is deleted before an item runs.
 */
export function SlashMenu({ onAskAi }: SlashMenuProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Range | null>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const allItems = useMemo(() => buildItems(onAskAi), [onAskAi]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((keyword) => keyword.startsWith(q)),
    );
  }, [allItems, query]);

  // Track the `/query` run immediately before the caret.
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
    const match = beforeText.match(/(?:^|\s)\/(\w*)$/);

    if (!match) {
      setTarget(null);
      return;
    }

    const triggerOffset = beforeText.length - match[0].trimStart().length;
    const triggerPoint = { path: blockStart.path, offset: blockStart.offset + triggerOffset };

    setTarget({ anchor: triggerPoint, focus: start });
    setQuery(match[1]);
    setIndex(0);
  }, [editor, selection]);

  // Position under the trigger.
  useEffect(() => {
    const el = ref.current;
    if (!el || !target || items.length === 0) {
      setPosition(null);
      return;
    }
    try {
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
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

  const run = (item: SlashItem) => {
    if (target) Transforms.select(editor, target);
    Transforms.delete(editor);
    item.run(editor);
    setTarget(null);
    ReactEditor.focus(editor);
  };

  // Keyboard nav is registered on the document so it beats the Editable handler.
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
          run(items[index]);
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

  let lastGroup = '';

  return (
    <div
      ref={ref}
      className="da-slash"
      role="listbox"
      aria-label="Insert block"
      style={{ top: position.top, left: position.left }}
    >
      {GROUPS.flatMap((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return [];
        const header = group !== lastGroup ? group : null;
        lastGroup = group;

        return [
          header && (
            <div key={`h-${group}`} className="da-slash__group">
              {header}
            </div>
          ),
          ...groupItems.map((item) => {
            const itemIndex = items.indexOf(item);
            return (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={itemIndex === index}
                className={`da-slash__item${itemIndex === index ? ' da-slash__item--active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setIndex(itemIndex)}
                onClick={() => run(item)}
              >
                <span className="da-slash__icon">{item.icon}</span>
                <span className="da-slash__label">{item.label}</span>
              </button>
            );
          }),
        ];
      })}
    </div>
  );
}
