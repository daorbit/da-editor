import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { execCommand, isActive, shortcutFor } from '../commands';
import type { EditorHandle, EditorProps, ToolbarItem } from '../types';
import { Toolbar } from './Toolbar';

export const DEFAULT_TOOLBAR: ToolbarItem[] = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'code',
  'bulletedList',
  'numberedList',
  'link',
  'clear',
  'undo',
  'redo',
];

const TRACKED: ToolbarItem[] = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'code',
  'paragraph',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'bulletedList',
  'numberedList',
];

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  {
    defaultValue = '',
    value,
    onChange,
    placeholder = 'Write something…',
    readOnly = false,
    toolbar,
    className,
    style,
    minHeight = '220px',
  },
  ref,
) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeItems, setActiveItems] = useState<ToolbarItem[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);

  const isControlled = value !== undefined;

  const readHTML = useCallback(() => contentRef.current?.innerHTML ?? '', []);

  const syncEmpty = useCallback(() => {
    const el = contentRef.current;
    setIsEmpty(!el || el.textContent?.trim() === '');
  }, []);

  const refreshActive = useCallback(() => {
    if (readOnly) return;
    setActiveItems(TRACKED.filter(isActive));
  }, [readOnly]);

  // Seed the DOM once for uncontrolled use, and keep it in sync when
  // controlled — but only when the incoming value actually differs, so typing
  // does not reset the caret.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const next = isControlled ? value : defaultValue;
    if (next !== undefined && next !== el.innerHTML) {
      el.innerHTML = next;
    }
    syncEmpty();
    // defaultValue is intentionally only applied on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled ? value : undefined]);

  useEffect(() => {
    const handler = () => {
      const el = contentRef.current;
      const selection = document.getSelection();
      if (!el || !selection?.anchorNode) return;
      if (el.contains(selection.anchorNode)) refreshActive();
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [refreshActive]);

  const handleInput = useCallback(() => {
    syncEmpty();
    refreshActive();
    onChange?.(readHTML());
  }, [onChange, readHTML, refreshActive, syncEmpty]);

  const runCommand = useCallback(
    (item: ToolbarItem) => {
      if (readOnly) return;
      contentRef.current?.focus();
      execCommand(item);
      handleInput();
    },
    [handleInput, readOnly],
  );

  useImperativeHandle(
    ref,
    (): EditorHandle => ({
      getHTML: readHTML,
      getText: () => contentRef.current?.textContent ?? '',
      setHTML: (html) => {
        if (contentRef.current) contentRef.current.innerHTML = html;
        handleInput();
      },
      focus: () => contentRef.current?.focus(),
      exec: runCommand,
    }),
    [handleInput, readHTML, runCommand],
  );

  const items = toolbar === false ? null : (toolbar ?? DEFAULT_TOOLBAR);

  return (
    <div
      className={`da-editor${readOnly ? ' da-editor--readonly' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {items && (
        <Toolbar
          items={items}
          activeItems={activeItems}
          disabled={readOnly}
          onCommand={runCommand}
        />
      )}
      <div
        ref={contentRef}
        className="da-editor__content"
        style={{ minHeight }}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly}
        data-placeholder={placeholder}
        data-empty={isEmpty || undefined}
        onInput={handleInput}
        onBlur={handleInput}
        onKeyDown={(event) => {
          const item = shortcutFor(event);
          if (item) {
            event.preventDefault();
            runCommand(item);
          }
        }}
      />
    </div>
  );
});
