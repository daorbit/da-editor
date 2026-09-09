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
import { createEditor, Editor, Range, Transforms, type Descendant } from 'slate';
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
  type FetchLinkMeta,
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
import { ConfirmDialog } from './ConfirmDialog';
import { DialogContext, type DialogApi } from './dialogContext';
import { applyBlockDrop, isBlockDrag, rowUnderPointer } from './BlockDragHandle';
import { MediaDialog } from './MediaDialog';
import { PreviewPane } from './PreviewPane';
import { ToastHost } from './ToastHost';
import { LintPanel } from './LintPanel';
import { toast } from '../core/toast';
import { smartPasteText } from '../core/smartPaste';
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
  setFocusMode: (on: boolean) => void;
  setTypewriter: (on: boolean) => void;
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
  slashMenu?: boolean;
  emoji?: boolean;

  accent?: 'neutral' | 'gradient';
  /** Enable Markdown input rules while typing. */
  autoformat?: boolean;
  /** Renders the Ask AI affordances and fires when one is used. */
  onAskAi?: () => void;

  onClearAll?: (() => void) | boolean;
  /** Entries offered by the `@` mention combobox. */
  mentionables?: Mentionable[];
  /** Uploads a file picked from the device; falls back to a local object URL. */
  onUpload?: UploadHandler;
  /**
   * Resolves open-graph metadata for a pasted bare URL. When provided, such a
   * paste becomes a rich preview card; without it, a plain link.
   */
  onFetchLinkMeta?: FetchLinkMeta;
  
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
  /**
   * Show the built-in toast for copy / cut / paste and similar actions. On by
   * default; pass `false` to suppress it (e.g. when the host app shows its own).
   */
  toasts?: boolean;
  /**
   * Recognise a pasted bare URL, Markdown block or code snippet and insert it
   * as the matching content instead of plain text. On by default.
   */
  smartPaste?: boolean;
  /** Start in focus mode (dim all but the current block). Toggle: Ctrl+Alt+F. */
  defaultFocusMode?: boolean;
  /** Start in typewriter mode (keep the caret line centred). Toggle: Ctrl+Alt+T. */
  defaultTypewriter?: boolean;
  /** Enable the content-checks panel and its toolbar toggle. */
  lintPanel?: boolean;
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
    onFetchLinkMeta,
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
    toasts = true,
    smartPaste = true,
    defaultFocusMode = false,
    defaultTypewriter = false,
    lintPanel = false,
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
  const [findWholeWord, setFindWholeWord] = useState(false);
  const [findRegex, setFindRegex] = useState(false);
  const [findInSelection, setFindInSelection] = useState(false);
  const [findIndex, setFindIndex] = useState(0);
  const [promptRequest, setPromptRequest] = useState<PromptRequest | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

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

  const [focusMode, setFocusMode] = useState(defaultFocusMode);
  const [typewriter, setTypewriter] = useState(defaultTypewriter);
  const [lintOpen, setLintOpen] = useState(false);

  const [dropActive, setDropActive] = useState(false);
 
  const [dropLine, setDropLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Focus mode dims every block but the one holding the caret; typewriter mode
  // keeps that block vertically centred. Both follow the native selection so
  // arrow-key and click moves count, not just edits.
  useEffect(() => {
    if (!focusMode && !typewriter) return;

    const content = containerRef.current?.querySelector<HTMLElement>('.da-editor__content');
    const scroller = scrollAreaRef.current;
    if (!content) return;

    let frame = 0;
    const clearActive = () =>
      content.querySelectorAll('.da-focus-active').forEach((el) => el.classList.remove('da-focus-active'));

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sel = window.getSelection();
        const anchorNode = sel && sel.rangeCount ? sel.anchorNode : null;
        if (!anchorNode || !content.contains(anchorNode)) return;

        let block =
          anchorNode.nodeType === 3 ? anchorNode.parentElement : (anchorNode as HTMLElement);
        while (block && block.parentElement !== content) block = block.parentElement;
        if (!block) return;

        if (focusMode) {
          clearActive();
          block.classList.add('da-focus-active');
        }
        if (typewriter && scroller) {
          const b = block.getBoundingClientRect();
          const s = scroller.getBoundingClientRect();
          const delta = b.top - s.top - scroller.clientHeight / 2 + b.height / 2;
          if (Math.abs(delta) > 4) scroller.scrollBy({ top: delta, behavior: 'smooth' });
        }
      });
    };

    update();
    document.addEventListener('selectionchange', update);
    return () => {
      document.removeEventListener('selectionchange', update);
      cancelAnimationFrame(frame);
      clearActive();
    };
  }, [focusMode, typewriter, value]);

  const isFileDrag = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types).includes('Files');

 
  const dragFrame = useRef(0);
  const lastDragY = useRef(-1);

  const handleDragOver = (event: React.DragEvent) => {
    if (locked) return;

    // A block being reordered needs the drop allowed, but not the file-drop
    // overlay — the target is a position in the document, not the whole editor.
    if (isBlockDrag(event.dataTransfer)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const { clientX, clientY } = event;
      if (Math.abs(clientY - lastDragY.current) < 4) return;
      lastDragY.current = clientY;

      if (dragFrame.current) return;
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = 0;
        const target = rowUnderPointer(clientX, clientY);
        const base = containerRef.current?.getBoundingClientRect();
        const next = target && base
          ? (target.after ? target.rect.bottom : target.rect.top) - base.top
          : null;
        setDropLine((current) => (current === next ? current : next));
      });
      return;
    }

    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDropActive(true);
  };

  const endDrag = () => {
    if (dragFrame.current) {
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = 0;
    }
    lastDragY.current = -1;
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as globalThis.Node)) return;
    endDrag();
    setDropActive(false);
    setDropLine(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    if (locked) return;
    endDrag();

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
    if (files.length > 0) {
      event.preventDefault();
      void insertFiles(editor, files, onUpload);
      if (toasts) toast('Pasted', { tone: 'success' });
      return;
    }

    const html = event.clipboardData.getData('text/html');
    const plain = event.clipboardData.getData('text/plain');
 
    if (smartPaste && !html && plain) {
      const { handled } = smartPasteText(editor, plain, {
        fetchLinkMeta: onFetchLinkMeta,
      });
      if (handled) {
        event.preventDefault();
        if (toasts) toast('Pasted', { tone: 'success' });
        return;
      }
    }

    if (toasts) toast('Pasted', { tone: 'success' });
  };

  const handleCopy = () => {
    if (toasts) toast('Copied to clipboard', { tone: 'success' });
  };

  const handleCut = () => {
    if (!locked && toasts) toast('Cut to clipboard', { tone: 'success' });
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
    // Selection-only changes are not content changes.
    const isContentChange = editor.operations.some((op) => op.type !== 'set_selection');

    // `value` state only feeds `<Slate initialValue>` (read once per `slateKey`)
    // and the preview pane. Re-setting it on every caret move forces a full
    // DaEditor re-render — and a re-render of the toolbars — for nothing, which
    // is what makes a drag-selection stutter. Update it only when the content
    // actually changed, or when the preview is open and needs to stay live.
    if (isContentChange || previewOpen) setValue(next);
    if (isContentChange) onChange?.(next);
  };

  /**
   * Code highlighting and find highlighting share the one `decorate` slot, so
   * their ranges are concatenated rather than one replacing the other.
   */
  const searchOptions = useMemo(
    () => ({
      caseSensitive: findCaseSensitive,
      wholeWord: findWholeWord,
      regex: findRegex,
      inSelection: findInSelection,
    }),
    [findCaseSensitive, findWholeWord, findRegex, findInSelection],
  );

  const decorate = useCallback(
    (entry: Parameters<typeof decorateCode>[0]) => {
      const code = decorateCode(entry);
      if (!findOpen || !findQuery) return code;

      const active = findMatches(editor, findQuery, searchOptions)[findIndex];
      const scopeRange =
        findInSelection && editor.selection && !Range.isCollapsed(editor.selection)
          ? editor.selection
          : undefined;
      return [
        ...code,
        ...decorateSearch(entry as [unknown, number[]], findQuery, {
          ...searchOptions,
          activeRange: active?.range,
          scopeRange,
        }),
      ];
    },
    [editor, findOpen, findQuery, searchOptions, findIndex],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('mod+alt+f', event.nativeEvent)) {
      event.preventDefault();
      setFocusMode((on) => !on);
      return;
    }
    if (isHotkey('mod+alt+t', event.nativeEvent)) {
      event.preventDefault();
      setTypewriter((on) => !on);
      return;
    }
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
      setFocusMode: (on) => setFocusMode(on),
      setTypewriter: (on) => setTypewriter(on),
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
            focusMode={focusMode}
            onToggleFocusMode={() => setFocusMode((on) => !on)}
            typewriter={typewriter}
            onToggleTypewriter={() => setTypewriter((on) => !on)}
            lintOpen={lintPanel ? lintOpen : undefined}
            onToggleLint={lintPanel ? () => setLintOpen((on) => !on) : undefined}
            onClearAll={
              onClearAll === false
                ? undefined
                : () => {
                    // A host handler owns its own confirmation; the built-in
                    // default must ask first, because clearing the document is
                    // destructive and the button sits in the main toolbar.
                    if (typeof onClearAll === 'function') onClearAll();
                    else setClearConfirmOpen(true);
                  }
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
            wholeWord={findWholeWord}
            onWholeWordChange={setFindWholeWord}
            regex={findRegex}
            onRegexChange={setFindRegex}
            inSelection={findInSelection}
            onInSelectionChange={setFindInSelection}
            activeIndex={findIndex}
            onActiveIndexChange={setFindIndex}
          />
        )}

        <div
          ref={splitRef}
          className={`da-editor__split${previewOpen ? ' da-editor__split--previewing' : ''}`}
        >
        <div
          ref={scrollAreaRef}
          className={`da-editor__scroll${focusMode ? ' da-editor__scroll--focus' : ''}${
            typewriter ? ' da-editor__scroll--typewriter' : ''
          }`}
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
              onCopy={handleCopy}
              onCut={handleCut}
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

        {lintPanel && <LintPanel open={lintOpen} onClose={() => setLintOpen(false)} />}

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
        <ConfirmDialog
          open={clearConfirmOpen}
          title="Clear document"
          message="Remove all content from the document? This cannot be undone."
          confirmLabel="Clear"
          danger
          onConfirm={() => {
            replaceAll(emptyValue());
            setClearConfirmOpen(false);
          }}
          onCancel={() => setClearConfirmOpen(false)}
        />
      </Slate>
      </DialogContext.Provider>
      {toasts && <ToastHost theme={resolvedTheme} />}
    </div>
  );
});
