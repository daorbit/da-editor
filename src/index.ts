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
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
} from './components/toolbarConfig';
export type { MarkSpec, BlockSpec } from './components/toolbarConfig';

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
  isEditorEmpty,
} from './core/transforms';
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
  CustomElement,
  CustomText,
} from './core/types';

/* Icons */
export * from './icons';
