import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createEditor, Editor, Transforms, type Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import isHotkey from 'is-hotkey';
import { withDaEditor } from '../core/withDaEditor';
import {
  autoformatBlock,
  autoformatMark,
  autoformatText,
} from '../core/autoformat';
import {
  clearMarks,
  indent,
  isEditorEmpty,
  replaceBlock,
  toggleMark,
} from '../core/transforms';
import {
  deserializeHtml,
  emptyValue,
  serializeHtml,
  type SerializeHtmlOptions,
  serializeMarkdown,
} from '../core/serialize';
import { insertMedia } from '../core/media';
import { moveToCell } from '../core/tables';
import {
  ELEMENT,
  MARK,
  type DaEditor as DaEditorType,
  type EditorMode,
  type EditorValue,
  type Mentionable,
  type MediaKind,
  type Theme,
  type UploadHandler,
} from '../core/types';
import { ElementRenderer } from './ElementRenderer';
import { LeafRenderer } from './LeafRenderer';
import { FixedToolbar } from './FixedToolbar';
import { FloatingToolbar } from './FloatingToolbar';
import { SlashMenu } from './SlashMenu';
import { LinkPopover } from './LinkPopover';
import { MentionCombobox } from './MentionCombobox';
import { MediaDialog } from './MediaDialog';
import { TableToolbar } from './TableToolbar';
import { MediaToolbar } from './MediaToolbar';
import { LinkToolbar } from './LinkToolbar';
import { decorateCode } from '../core/highlight';
import {
  exportHtml,
  exportMarkdown,
  importWordFile,
  parseHtmlFile,
  parseMarkdown,
  pickTextFile,
} from '../core/io';

const MARK_HOTKEYS: Record<string, keyof typeof MARK> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+shift+x': 'strikethrough',
  'mod+e': 'code',
};

const BLOCK_HOTKEYS: Record<string, (typeof ELEMENT)[keyof typeof ELEMENT]> = {
  'mod+alt+0': ELEMENT.paragraph,
  'mod+alt+1': ELEMENT.h1,
  'mod+alt+2': ELEMENT.h2,
  'mod+alt+3': ELEMENT.h3,
  'mod+shift+.': ELEMENT.blockquote,
  'mod+shift+7': ELEMENT.numberedList,
  'mod+shift+8': ELEMENT.bulletedList,
  'mod+shift+9': ELEMENT.todoListItem,
};

export interface DaEditorHandle {
  /** The underlying Slate editor. */
  editor: DaEditorType;
  getValue: () => EditorValue;
  setValue: (value: EditorValue) => void;
  /**
   * Serialized HTML. Pass `{ inlineStyles: true }` to embed the editor's own
   * styling as `style` attributes, so the output looks the same wherever it is
   * rendered without loading the stylesheet.
   */
  getHTML: (options?: SerializeHtmlOptions) => string;
  getMarkdown: () => string;
  getText: () => string;
  setHTML: (html: string) => void;
  focus: () => void;
  clear: () => void;
}

export interface DaEditorProps {
  /** Initial document. Use `onChange` to track updates. */
  defaultValue?: EditorValue;
  /** Initial document as HTML; ignored when `defaultValue` is set. */
  defaultHtml?: string;
  onChange?: (value: EditorValue) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** Defaults to `'light'`; pass `'system'` to follow the OS setting. */
  theme?: Theme;
  /** Show the toolbar pinned above the content. */
  fixedToolbar?: boolean;
  /** Show the toolbar over the current selection. */
  floatingToolbar?: boolean;
  /** Enable the `/` block menu. */
  slashMenu?: boolean;
  /** Enable Markdown input rules while typing. */
  autoformat?: boolean;
  /** Renders the Ask AI affordances and fires when one is used. */
  onAskAi?: () => void;
  /** Entries offered by the `@` mention combobox. */
  mentionables?: Mentionable[];
  /** Uploads a file picked from the device; falls back to a local object URL. */
  onUpload?: UploadHandler;
  
  onPickMedia?: (kind: MediaKind) => Promise<{ url: string; name?: string } | null>;
  /** Renders a light/dark toggle in the toolbar and fires on click. */
  onToggleTheme?: () => void;
  /** `'viewing'` locks the document, like `readOnly`. */
  mode?: EditorMode;
  className?: string;
  style?: CSSProperties;
  minHeight?: string;
  maxHeight?: string;
  /** Constrain the text column, like a document editor. */
  maxWidth?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
}

export const DaEditor = forwardRef<DaEditorHandle, DaEditorProps>(function DaEditor(
  {
    defaultValue,
    defaultHtml,
    onChange,
    placeholder = "Write something, or press '/' for commands…",
    readOnly = false,
    theme = 'light',
    fixedToolbar = true,
    floatingToolbar = true,
    slashMenu = true,
    autoformat = true,
    onAskAi,
    onPickMedia,
    mentionables,
    onUpload,
    onToggleTheme,
    mode = 'editing',
    className,
    style,
    minHeight = '320px',
    maxHeight,
    maxWidth,
    autoFocus = false,
    spellCheck = true,
  },
  ref,
) {
  const editor = useMemo(
    () => withDaEditor(withHistory(withReact(createEditor())) as DaEditorType),
    [],
  );

  const initialValue = useMemo<EditorValue>(() => {
    if (defaultValue?.length) return defaultValue;
    if (defaultHtml) return deserializeHtml(defaultHtml);
    return emptyValue();
    // Only read on mount; later updates go through the ref handle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [value, setValue] = useState<EditorValue>(initialValue);
  const [linkOpen, setLinkOpen] = useState(false);
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);

  /**
   * Opens the host's library when it has one, and the built-in dialog when it
   * does not — so the editor stays usable standalone without duplicating a
   * picker the host does better.
   */
  const pickMedia = (kind: MediaKind) => {
    if (!onPickMedia) {
      setMediaKind(kind);
      return;
    }
    void onPickMedia(kind).then((picked) => {
      if (picked?.url) insertMedia(editor, kind, picked.url, { name: picked.name });
    });
  };
  // Bumped to remount <Slate> when the document is replaced wholesale.
  const [slateKey, setSlateKey] = useState(0);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    theme === 'dark' ? 'dark' : 'light',
  );

  // `system` tracks the OS preference and follows it as it changes.
  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
      return;
    }
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setResolvedTheme(media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    if (autoFocus) ReactEditor.focus(editor);
  }, [autoFocus, editor]);

  const renderElement = useCallback(
    (props: Parameters<typeof ElementRenderer>[0]) => <ElementRenderer {...props} />,
    [],
  );
  const renderLeaf = useCallback(
    (props: Parameters<typeof LeafRenderer>[0]) => <LeafRenderer {...props} />,
    [],
  );

  /**
   * Swaps the whole document. `<Slate>` reads `initialValue` only on mount, so
   * the tree is rebuilt and the subtree remounted via `slateKey`.
   */
  const replaceAll = (next: EditorValue) => {
    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      for (let i = editor.children.length - 1; i >= 0; i--) {
        Transforms.removeNodes(editor, { at: [i] });
      }
      Transforms.insertNodes(editor, next, { at: [0] });
    });
    // History from the previous document no longer applies.
    editor.history = { undos: [], redos: [] };
    setValue(editor.children as EditorValue);
    setSlateKey((key) => key + 1);
    onChange?.(editor.children as EditorValue);
  };

  const handleImport = async (format: 'html' | 'markdown' | 'word') => {
    const accept =
      format === 'markdown'
        ? '.md,.markdown,.txt,text/markdown,text/plain'
        : format === 'word'
          ? '.docx,.htm,.html'
          : '.html,.htm,text/html';

    const file = await pickTextFile(accept);
    if (!file) return;

    try {
      // Word documents are archives, so they are unpacked rather than read as text.
      const parsed =
        format === 'word'
          ? await importWordFile(file)
          : format === 'markdown'
            ? parseMarkdown(await file.text())
            : parseHtmlFile(await file.text());

      replaceAll(parsed);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not read that file.';
      window.alert(`Import failed: ${message}`);
    }
  };

  const handleExport = (format: 'html' | 'markdown') => {
    const current = editor.children as EditorValue;
    if (format === 'markdown') exportMarkdown(current);
    else exportHtml(current);
  };

  const handleChange = (next: Descendant[]) => {
    setValue(next);
    // Selection-only changes are not content changes.
    const isContentChange = editor.operations.some((op) => op.type !== 'set_selection');
    if (isContentChange) onChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    for (const [hotkey, mark] of Object.entries(MARK_HOTKEYS)) {
      if (isHotkey(hotkey, event.nativeEvent)) {
        event.preventDefault();
        toggleMark(editor, MARK[mark]);
        return;
      }
    }

    for (const [hotkey, type] of Object.entries(BLOCK_HOTKEYS)) {
      if (isHotkey(hotkey, event.nativeEvent)) {
        event.preventDefault();
        replaceBlock(editor, type);
        return;
      }
    }

    if (isHotkey('mod+k', event.nativeEvent)) {
      event.preventDefault();
      setLinkOpen(true);
      return;
    }

    if (isHotkey('mod+j', event.nativeEvent) && onAskAi) {
      event.preventDefault();
      onAskAi();
      return;
    }

    if (isHotkey('mod+\\', event.nativeEvent)) {
      event.preventDefault();
      clearMarks(editor);
      return;
    }

    // Inside a table Tab walks cells; elsewhere it indents.
    if (isHotkey('tab', event.nativeEvent)) {
      event.preventDefault();
      if (!moveToCell(editor, 'next')) indent(editor, 1);
      return;
    }
    if (isHotkey('shift+tab', event.nativeEvent)) {
      event.preventDefault();
      if (!moveToCell(editor, 'previous')) indent(editor, -1);
      return;
    }

    // Mod+Enter escapes a code block, which swallows plain Enter.
    if (isHotkey('mod+enter', event.nativeEvent)) {
      event.preventDefault();
      Transforms.insertNodes(editor, {
        type: ELEMENT.paragraph,
        children: [{ text: '' }],
      });
      return;
    }

    if (!autoformat || readOnly) return;

    if (event.key === ' ') {
      if (autoformatBlock(editor)) {
        event.preventDefault();
        return;
      }
      if (autoformatText(editor, ' ')) {
        event.preventDefault();
        return;
      }
    } else if (event.key.length === 1) {
      if (autoformatMark(editor, event.key)) {
        event.preventDefault();
        return;
      }
      if (autoformatText(editor, event.key)) {
        event.preventDefault();
        return;
      }
    }
  };

  useImperativeHandle(
    ref,
    (): DaEditorHandle => ({
      editor,
      getValue: () => editor.children as EditorValue,
      setValue: (next) => replaceAll(next),
      getHTML: (options) => serializeHtml(editor.children as EditorValue, options),
      getMarkdown: () => serializeMarkdown(editor.children as EditorValue),
      getText: () => Editor.string(editor, []),
      setHTML: (html) => replaceAll(deserializeHtml(html)),
      focus: () => ReactEditor.focus(editor),
      clear: () => replaceAll(emptyValue()),
    }),
    // `replaceAll` closes over `onChange`, which the caller may redefine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, onChange],
  );

  const showPlaceholder = isEditorEmpty(editor);
  // Viewing mode is read-only regardless of the `readOnly` prop.
  const locked = readOnly || mode === 'viewing';

  return (
    <div
      className={`da-editor${locked ? ' da-editor--readonly' : ''}${className ? ` ${className}` : ''}`}
      data-theme={resolvedTheme}
      data-mode={mode}
      style={style}
    >
      <Slate key={slateKey} editor={editor} initialValue={value} onChange={handleChange}>
        {fixedToolbar && !readOnly && (
          <FixedToolbar
            onAskAi={onAskAi}
            onLink={() => setLinkOpen(true)}
            onMedia={(kind) => pickMedia(kind)}
            onImport={handleImport}
            onExport={handleExport}
            onToggleTheme={onToggleTheme}
            isDark={resolvedTheme === 'dark'}
          />
        )}

        <div
          className="da-editor__scroll"
          // A `minHeight` of "0" lets the editor fill a flex parent instead.
          style={{ minHeight: minHeight === '0' ? undefined : minHeight, maxHeight }}
        >
          <div className="da-editor__container" style={{ maxWidth }}>
            <Editable
              className="da-editor__content"
              readOnly={locked}
              spellCheck={spellCheck}
              // Only passed while the document is empty, so it cannot appear
              // against a block that merely happens to be blank.
              placeholder={showPlaceholder ? placeholder : undefined}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorateCode}
              onKeyDown={handleKeyDown}
            />

            {floatingToolbar && !locked && (
              <FloatingToolbar
                onAskAi={onAskAi}
                onLink={() => setLinkOpen(true)}
              />
            )}
            {slashMenu && !locked && (
              <SlashMenu
                onAskAi={onAskAi}
                onMedia={(kind) => pickMedia(kind)}
              />
            )}
            {mentionables?.length && !locked ? (
              <MentionCombobox mentionables={mentionables} />
            ) : null}
            {!locked && <TableToolbar />}
            {!locked && <MediaToolbar />}
            {!locked && !linkOpen && <LinkToolbar />}
            {!locked && (
              <LinkPopover open={linkOpen} onClose={() => setLinkOpen(false)} />
            )}
          </div>
        </div>

        <MediaDialog
          kind={mediaKind}
          onUpload={onUpload}
          onInsert={(kind, url, name) => insertMedia(editor, kind, url, { name })}
          onClose={() => setMediaKind(null)}
        />
      </Slate>
    </div>
  );
});
