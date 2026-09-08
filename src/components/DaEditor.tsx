import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createEditor, Editor, Transforms, type Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import isHotkey from 'is-hotkey';
import { withDaEditor } from '../core/withDaEditor';
import { withUndoGrouping } from '../core/withUndoGrouping';
import { FindReplace } from './FindReplace';
import { WordCount } from './WordCount';
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
import { insertFiles, insertMedia } from '../core/media';
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
import { EmojiCombobox } from './EmojiCombobox';
import { PromptDialog, type PromptRequest } from './PromptDialog';
import { AlertDialog } from './AlertDialog';
import { DialogContext, type DialogApi } from './dialogContext';
import { applyBlockDrop, isBlockDrag, rowUnderPointer } from './BlockDragHandle';
import { MediaDialog } from './MediaDialog';
import { PreviewPane } from './PreviewPane';
import { TableToolbar } from './TableToolbar';
import { MediaToolbar } from './MediaToolbar';
import { LinkToolbar } from './LinkToolbar';
import { decorateCode } from '../core/highlight';
import { decorateSearch, findMatches } from '../core/search';
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

/** How far the split divider can travel, as the editor's share of the width. */
const MIN_SPLIT = 25;
const MAX_SPLIT = 75;

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
  /** Enable the `:name` inline emoji combobox. */
  emoji?: boolean;
  /**
   * Accent style for active affordances (toolbar state, slash icon, focus
   * ring, drop indicator). `'neutral'` (default) uses the flat `--da-accent`
   * token; `'gradient'` uses `--da-accent-gradient`, which you can override.
   */
  accent?: 'neutral' | 'gradient';
  /** Enable Markdown input rules while typing. */
  autoformat?: boolean;
  /** Renders the Ask AI affordances and fires when one is used. */
  onAskAi?: () => void;
  /**
   * Renders a "clear document" button in the fixed toolbar, after Redo. When
   * given, it is called on click (confirm, then empty the document yourself via
   * the handle's `clear()`); when omitted, the button empties the document
   * without asking.
   */
  onClearAll?: (() => void) | boolean;
  /** Entries offered by the `@` mention combobox. */
  mentionables?: Mentionable[];
  /** Uploads a file picked from the device; falls back to a local object URL. */
  onUpload?: UploadHandler;
  
  onPickMedia?: (kind: MediaKind) => Promise<{ url: string; name?: string } | null>;
  onToggleTheme?: () => void;
  mode?: EditorMode;
  className?: string;
  style?: CSSProperties;
  minHeight?: string;
  maxHeight?: string;
  maxWidth?: string;
  wordCount?: boolean;
  toolbarLeading?: ReactNode;
  autoFocus?: boolean;
  spellCheck?: boolean;
  preview?: boolean;
  previewTitle?: string;
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
    emoji = true,
    accent = 'neutral',
    autoformat = true,
    onAskAi,
    onClearAll,
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
    wordCount = false,
    toolbarLeading,
    autoFocus = false,
    spellCheck = true,
    preview = false,
    previewTitle,
  },
  ref,
) {
  const editor = useMemo(
    () =>
      withUndoGrouping(
        withDaEditor(withHistory(withReact(createEditor())) as DaEditorType),
      ),
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
  const [findOpen, setFindOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  /** The editor's share of the split, as a percentage. */
  const [previewSplit, setPreviewSplit] = useState(50);
  const splitRef = useRef<HTMLDivElement>(null);
  const [findQuery, setFindQuery] = useState('');
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);
  const [findIndex, setFindIndex] = useState(0);
  const [promptRequest, setPromptRequest] = useState<PromptRequest | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const dialogs = useMemo<DialogApi>(
    () => ({
      prompt: setPromptRequest,
      alert: (message, title) =>
        setAlert({ title: title ?? 'Something went wrong', message }),
    }),
    [],
  );

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
      setAlert({ title: 'Import failed', message });
    }
  };

  const [dropActive, setDropActive] = useState(false);
  // Pixel position (relative to the container) of the block drop indicator, or
  // null when no block is being dragged over a valid target.
  const [dropLine, setDropLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFileDrag = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types).includes('Files');

  const handleDragOver = (event: React.DragEvent) => {
    if (locked) return;

    // A block being reordered needs the drop allowed, but not the file-drop
    // overlay — the target is a position in the document, not the whole editor.
    if (isBlockDrag(event.dataTransfer)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const target = rowUnderPointer(event.clientX, event.clientY);
      const base = containerRef.current?.getBoundingClientRect();
      if (target && base) {
        const y = target.after ? target.rect.bottom : target.rect.top;
        setDropLine(y - base.top);
      } else {
        setDropLine(null);
      }
      return;
    }

    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDropActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as globalThis.Node)) return;
    setDropActive(false);
    setDropLine(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    if (locked) return;

    // A block being reordered by its grip, handled before files: this drag
    // carries no files, so the file path below would ignore it.
    if (isBlockDrag(event.dataTransfer)) {
      const at = ReactEditor.findEventRange(editor, event);
      if (applyBlockDrop(editor, event.dataTransfer, at ? { path: at.anchor.path } : null)) {
        event.preventDefault();
        setDropActive(false);
        setDropLine(null);
        return;
      }
      setDropLine(null);
    }

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    event.preventDefault();
    setDropActive(false);

    const at = ReactEditor.findEventRange(editor, event);
    if (at) Transforms.select(editor, at);

    void insertFiles(editor, files, onUpload);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    if (locked) return;
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;

    // Screenshot pastes arrive as files with no useful text alternative, so
    // they would otherwise land as nothing at all.
    event.preventDefault();
    void insertFiles(editor, files, onUpload);
  };

 
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const split = splitRef.current;
    if (!split) return;

    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);

    const onMove = (move: PointerEvent) => {
      const rect = split.getBoundingClientRect();
      if (rect.width === 0) return;
      const percent = ((move.clientX - rect.left) / rect.width) * 100;
      setPreviewSplit(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, percent)));
    };

    const onUp = () => {
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  const handleDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowLeft' ? -2 : event.key === 'ArrowRight' ? 2 : 0;
    if (!step) return;
    event.preventDefault();
    setPreviewSplit((current) => Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, current + step)));
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

  /**
   * Code highlighting and find highlighting share the one `decorate` slot, so
   * their ranges are concatenated rather than one replacing the other.
   */
  const decorate = useCallback(
    (entry: Parameters<typeof decorateCode>[0]) => {
      const code = decorateCode(entry);
      if (!findOpen || !findQuery) return code;

      const active = findMatches(editor, findQuery, { caseSensitive: findCaseSensitive })[
        findIndex
      ];
      return [
        ...code,
        ...decorateSearch(entry as [unknown, number[]], findQuery, {
          caseSensitive: findCaseSensitive,
          activeRange: active?.range,
        }),
      ];
    },
    [editor, findOpen, findQuery, findCaseSensitive, findIndex],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('mod+f', event.nativeEvent)) {
      event.preventDefault();
      setFindOpen(true);
      return;
    }

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
      className={`da-editor${locked ? ' da-editor--readonly' : ''}${accent === 'gradient' ? ' da-editor--gradient' : ''}${className ? ` ${className}` : ''}`}
      data-theme={resolvedTheme}
      data-mode={mode}
      style={style}
    >
      {accent === 'gradient' && (
        // Referenced by `fill: url(#da-accent-grad)` on active toolbar icons.
        <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="da-accent-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d5efc" />
              <stop offset="45%" stopColor="#d857c6" />
              <stop offset="100%" stopColor="#ff8a5c" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <DialogContext.Provider value={dialogs}>
      <Slate key={slateKey} editor={editor} initialValue={value} onChange={handleChange}>
        {fixedToolbar && !readOnly && (
          <FixedToolbar
            leading={toolbarLeading}
            onAskAi={onAskAi}
            onLink={() => setLinkOpen(true)}
            onMedia={(kind) => pickMedia(kind)}
            onImport={handleImport}
            onExport={handleExport}
            onToggleTheme={onToggleTheme}
            isDark={resolvedTheme === 'dark'}
            onPreview={preview ? () => setPreviewOpen(true) : undefined}
            onClearAll={
              onClearAll
                ? () => {
                    if (typeof onClearAll === 'function') onClearAll();
                    else replaceAll(emptyValue());
                  }
                : undefined
            }
          />
        )}

        {!locked && (
          <FindReplace
            open={findOpen}
            onClose={() => setFindOpen(false)}
            query={findQuery}
            onQueryChange={setFindQuery}
            caseSensitive={findCaseSensitive}
            onCaseSensitiveChange={setFindCaseSensitive}
            activeIndex={findIndex}
            onActiveIndexChange={setFindIndex}
          />
        )}

        <div
          ref={splitRef}
          className={`da-editor__split${previewOpen ? ' da-editor__split--previewing' : ''}`}
        >
        <div
          className="da-editor__scroll"
          // A `minHeight` of "0" lets the editor fill a flex parent instead.
          style={{
            minHeight: minHeight === '0' ? undefined : minHeight,
            maxHeight,
            // The pane takes the rest; without a basis the editor keeps its
            // full intrinsic width and pushes the preview off the edge.
            flexBasis: previewOpen ? `${previewSplit}%` : undefined,
          }}
        >
          <div
            ref={containerRef}
            className={`da-editor__container${dropActive ? ' da-editor__container--dropping' : ''}`}
            style={{ maxWidth }}
          >
            {dropLine !== null && (
              <div
                className="da-drop-line"
                style={{ top: dropLine }}
                aria-hidden
              />
            )}
            <Editable
              className="da-editor__content"
              readOnly={locked}
              spellCheck={spellCheck}
              // Only passed while the document is empty, so it cannot appear
              // against a block that merely happens to be blank.
              placeholder={showPlaceholder ? placeholder : undefined}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorate}
              onKeyDown={handleKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
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
            {emoji && !locked && <EmojiCombobox />}
            {!locked && <TableToolbar />}
            {!locked && <MediaToolbar />}
            {!locked && !linkOpen && <LinkToolbar />}
            {!locked && (
              <LinkPopover open={linkOpen} onClose={() => setLinkOpen(false)} />
            )}
          </div>
        </div>

        {previewOpen && (
          <>
            <div
              className="da-editor__divider"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize preview"
              aria-valuenow={Math.round(previewSplit)}
              aria-valuemin={MIN_SPLIT}
              aria-valuemax={MAX_SPLIT}
              tabIndex={0}
              onPointerDown={startResize}
              onKeyDown={handleDividerKeyDown}
            />
            <PreviewPane
              onClose={() => setPreviewOpen(false)}
              value={value as EditorValue}
              title={previewTitle}
            />
          </>
        )}
        </div>

        {wordCount && <WordCount />}

        <MediaDialog
          kind={mediaKind}
          onUpload={onUpload}
          onInsert={(kind, url, name) => insertMedia(editor, kind, url, { name })}
          onClose={() => setMediaKind(null)}
        />

        <PromptDialog request={promptRequest} onClose={() => setPromptRequest(null)} />
        <AlertDialog
          message={alert?.message ?? null}
          title={alert?.title}
          onClose={() => setAlert(null)}
        />
      </Slate>
      </DialogContext.Provider>
    </div>
  );
});
