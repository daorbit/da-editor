import './styles/editor.css';

/* Components */
export { DaEditor } from './components/DaEditor';
export type { DaEditorProps, DaEditorHandle } from './components/DaEditor';
export { FixedToolbar } from './components/FixedToolbar';
export type { FixedToolbarProps } from './components/FixedToolbar';
export { FloatingToolbar } from './components/FloatingToolbar';
export type { FloatingToolbarProps } from './components/FloatingToolbar';
export { SlashMenu } from './components/SlashMenu';
export type { SlashMenuProps, SlashItem } from './components/SlashMenu';
export { LinkPopover } from './components/LinkPopover';
export type { LinkPopoverProps } from './components/LinkPopover';
export { MentionCombobox } from './components/MentionCombobox';
export type { MentionComboboxProps } from './components/MentionCombobox';
export { MediaDialog } from './components/MediaDialog';
export type { MediaDialogProps } from './components/MediaDialog';
export { PromptDialog } from './components/PromptDialog';
export type { PromptDialogProps, PromptRequest } from './components/PromptDialog';
export { AlertDialog } from './components/AlertDialog';
export type { AlertDialogProps } from './components/AlertDialog';
export { DatePicker } from './components/DatePicker';
export type { DatePickerProps } from './components/DatePicker';
export { FindReplace } from './components/FindReplace';
export type { FindReplaceProps } from './components/FindReplace';
export { WordCount } from './components/WordCount';
export type { WordCountProps } from './components/WordCount';
export { findMatches, goToMatch, replaceMatch, replaceAll } from './core/search';
export type { SearchMatch, SearchOptions } from './core/search';
export { withUndoGrouping } from './core/withUndoGrouping';
export { EmojiPicker } from './components/EmojiPicker';
export type { EmojiPickerProps } from './components/EmojiPicker';
export { CodeBlock } from './components/CodeBlock';
export { TableToolbar } from './components/TableToolbar';
export { MediaToolbar } from './components/MediaToolbar';
export { LinkToolbar } from './components/LinkToolbar';
export { ColorPicker } from './components/ColorPicker';
export type { ColorPickerProps } from './components/ColorPicker';
export { decorateCode, LANGUAGES } from './core/highlight';
export type { LanguageOption } from './core/highlight';
export {
  exportHtml,
  exportMarkdown,
  importWordFile,
  parseMarkdown,
  parseWordHtml,
  parseHtmlFile,
  pickTextFile,
  readTextFile,
  downloadText,
} from './core/io';
export { ElementRenderer } from './components/ElementRenderer';
export { LeafRenderer } from './components/LeafRenderer';
export {
  ToolbarButton,
  ToolbarSeparator,
  ToolbarDropdown,
  MenuItem,
} from './components/ToolbarPrimitives';
export type {
  ToolbarButtonProps,
  DropdownProps,
  MenuItemProps,
} from './components/ToolbarPrimitives';

/* Toolbar configuration */
export {
  MARK_SPECS,
  EXTRA_MARK_SPECS,
  BLOCK_SPECS,
  ALIGN_SPECS,
  MEDIA_SPECS,
  INSERT_SPECS,
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
} from './components/toolbarConfig';
export type {
  MarkSpec,
  BlockSpec,
  MediaSpec,
  InsertSpec,
} from './components/toolbarConfig';

/* Core */
export { withDaEditor } from './core/withDaEditor';
export {
  toggleMark,
  setMark,
  isMarkActive,
  getMarkValue,
  clearMarks,
  toggleBlock,
  isBlockActive,
  getBlockType,
  replaceBlock,
  setAlign,
  getAlign,
  indent,
  wrapLink,
  unwrapLink,
  isLinkActive,
  insertDivider,
  insertImage,
  insertMention,
  insertEmoji,
  isEditorEmpty,
  getFontSize,
  setFontSize,
  stepFontSize,
  getLineHeight,
  setLineHeight,
  FONT_SIZES,
  FONT_FAMILIES,
  LINE_HEIGHTS,
} from './core/transforms';
export {
  insertTable,
  insertRow,
  insertColumn,
  deleteRow,
  deleteColumn,
  deleteTable,
  toggleHeaderRow,
  moveToCell,
  setColumnWidth,
  isInTable,
  isCellSelection,
} from './core/tables';
export {
  insertMedia,
  insertFiles,
  kindForFile,
  pickFile,
  resolveFileUrl,
  toEmbedUrl,
  isEmbeddable,
  ACCEPT_FOR_KIND,
} from './core/media';
export { EMOJI_GROUPS, searchEmojis } from './core/emoji';
export type { EmojiEntry, EmojiGroup } from './core/emoji';
export { autoformatBlock, autoformatMark, autoformatText } from './core/autoformat';
export {
  serializeHtml,
  serializeMarkdown,
  deserializeHtml,
  emptyValue,
} from './core/serialize';
export { ELEMENT, MARK } from './core/types';
export type {
  DaEditor as SlateDaEditor,
  EditorValue,
  ElementType,
  MarkType,
  Align,
  Theme,
  EditorMode,
  Mentionable,
  MediaKind,
  UploadHandler,
  CustomElement,
  CustomText,
} from './core/types';

/* Icons */
export * from './icons';
export type { SerializeHtmlOptions } from './core/serialize';
