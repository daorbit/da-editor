import type { ReactNode } from 'react';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BulletedListIcon,
  CalloutIcon,
  CodeBlockIcon,
  CodeIcon,
  ColumnsThreeIcon,
  DividerIcon,
  EquationIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  H4Icon,
  H5Icon,
  H6Icon,
  ToggleIcon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  KbdIcon,
  LinkIcon,
  MentionIcon,
  NumberedListIcon,
  QuoteIcon,
  SparklesIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TableIcon,
  TextIcon,
  TodoListIcon,
  UnderlineIcon,
  VideoIcon,
} from '../icons';
import { insertDivider, replaceBlock } from '../core/transforms';
import { insertTable } from '../core/tables';
import {
  ELEMENT,
  MARK,
  type Align,
  type DaEditor,
  type ElementType,
  type MarkType,
  type MediaKind,
} from '../core/types';

export interface MarkSpec {
  mark: MarkType;
  label: string;
  icon: ReactNode;
  shortcut?: string;
}

export const MARK_SPECS: MarkSpec[] = [
  { mark: MARK.bold, label: 'Bold', icon: <BoldIcon />, shortcut: 'Ctrl+B' },
  { mark: MARK.italic, label: 'Italic', icon: <ItalicIcon />, shortcut: 'Ctrl+I' },
  { mark: MARK.underline, label: 'Underline', icon: <UnderlineIcon />, shortcut: 'Ctrl+U' },
  {
    mark: MARK.strikethrough,
    label: 'Strikethrough',
    icon: <StrikethroughIcon />,
    shortcut: 'Ctrl+Shift+X',
  },
  { mark: MARK.code, label: 'Inline code', icon: <CodeIcon />, shortcut: 'Ctrl+E' },
];

export const EXTRA_MARK_SPECS: MarkSpec[] = [
  { mark: MARK.kbd, label: 'Keyboard input', icon: <KbdIcon /> },
  { mark: MARK.superscript, label: 'Superscript', icon: <SuperscriptIcon /> },
  { mark: MARK.subscript, label: 'Subscript', icon: <SubscriptIcon /> },
];

export interface BlockSpec {
  type: ElementType;
  label: string;
  icon: ReactNode;
  hint?: string;
}

export const BLOCK_SPECS: BlockSpec[] = [
  { type: ELEMENT.paragraph, label: 'Text', icon: <TextIcon />, hint: 'Ctrl+Alt+0' },
  { type: ELEMENT.h1, label: 'Heading 1', icon: <H1Icon />, hint: 'Ctrl+Alt+1' },
  { type: ELEMENT.h2, label: 'Heading 2', icon: <H2Icon />, hint: 'Ctrl+Alt+2' },
  { type: ELEMENT.h3, label: 'Heading 3', icon: <H3Icon />, hint: 'Ctrl+Alt+3' },
  { type: ELEMENT.h4, label: 'Heading 4', icon: <H4Icon /> },
  { type: ELEMENT.h5, label: 'Heading 5', icon: <H5Icon /> },
  { type: ELEMENT.h6, label: 'Heading 6', icon: <H6Icon /> },
  { type: ELEMENT.bulletedList, label: 'Bulleted list', icon: <BulletedListIcon /> },
  { type: ELEMENT.numberedList, label: 'Numbered list', icon: <NumberedListIcon /> },
  { type: ELEMENT.todoListItem, label: 'To-do list', icon: <TodoListIcon /> },
  { type: ELEMENT.toggleList, label: 'Toggle list', icon: <ToggleIcon /> },
  { type: ELEMENT.codeBlock, label: 'Code', icon: <CodeBlockIcon /> },
  { type: ELEMENT.blockquote, label: 'Quote', icon: <QuoteIcon />, hint: 'Ctrl+Shift+.' },
  { type: ELEMENT.callout, label: 'Callout', icon: <CalloutIcon /> },
  { type: ELEMENT.divider, label: 'Divider', icon: <DividerIcon /> },
  { type: ELEMENT.columns, label: '3 columns', icon: <ColumnsThreeIcon /> },
];

export const ALIGN_SPECS: Array<{ align: Align; label: string; icon: ReactNode }> = [
  { align: 'left', label: 'Align left', icon: <AlignLeftIcon /> },
  { align: 'center', label: 'Align center', icon: <AlignCenterIcon /> },
  { align: 'right', label: 'Align right', icon: <AlignRightIcon /> },
  { align: 'justify', label: 'Justify', icon: <AlignJustifyIcon /> },
];

export interface MediaSpec {
  kind: MediaKind;
  label: string;
  icon: ReactNode;
}

export const MEDIA_SPECS: MediaSpec[] = [
  { kind: 'image', label: 'Image', icon: <ImageIcon /> },
  { kind: 'video', label: 'Video', icon: <VideoIcon /> },
  { kind: 'audio', label: 'Audio', icon: <EquationIcon /> },
  { kind: 'file', label: 'File attachment', icon: <LinkIcon /> },
  { kind: 'embed', label: 'Embed', icon: <CodeIcon /> },
];

export interface InsertHandlers {
  onMedia?: (kind: MediaKind) => void;
  onAskAi?: () => void;
  onLink?: () => void;
}

export interface InsertSpec {
  key: string;
  label: string;
  /** Section heading this item appears under in the insert menu. */
  group: 'Basic blocks' | 'Lists' | 'Media' | 'Advanced blocks' | 'Inline';
  icon: ReactNode;
  run: (editor: DaEditor, handlers: InsertHandlers) => void;
}

export const INSERT_SPECS: InsertSpec[] = [
  /* Basic blocks */
  {
    key: 'paragraph',
    label: 'Paragraph',
    group: 'Basic blocks',
    icon: <TextIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.paragraph),
  },
  {
    key: 'h1',
    label: 'Heading 1',
    group: 'Basic blocks',
    icon: <H1Icon />,
    run: (editor) => replaceBlock(editor, ELEMENT.h1),
  },
  {
    key: 'h2',
    label: 'Heading 2',
    group: 'Basic blocks',
    icon: <H2Icon />,
    run: (editor) => replaceBlock(editor, ELEMENT.h2),
  },
  {
    key: 'h3',
    label: 'Heading 3',
    group: 'Basic blocks',
    icon: <H3Icon />,
    run: (editor) => replaceBlock(editor, ELEMENT.h3),
  },
  {
    key: 'table',
    label: 'Table',
    group: 'Basic blocks',
    icon: <TableIcon />,
    run: (editor) => insertTable(editor),
  },
  {
    key: 'code',
    label: 'Code',
    group: 'Basic blocks',
    icon: <CodeBlockIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.codeBlock),
  },
  {
    key: 'quote',
    label: 'Quote',
    group: 'Basic blocks',
    icon: <QuoteIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.blockquote),
  },
  {
    key: 'callout',
    label: 'Callout',
    group: 'Basic blocks',
    icon: <CalloutIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.callout),
  },
  {
    key: 'divider',
    label: 'Divider',
    group: 'Basic blocks',
    icon: <DividerIcon />,
    run: (editor) => insertDivider(editor),
  },

  /* Lists */
  {
    key: 'ul',
    label: 'Bulleted list',
    group: 'Lists',
    icon: <BulletedListIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.bulletedList),
  },
  {
    key: 'ol',
    label: 'Numbered list',
    group: 'Lists',
    icon: <NumberedListIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.numberedList),
  },
  {
    key: 'todo',
    label: 'To-do list',
    group: 'Lists',
    icon: <TodoListIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.todoListItem),
  },
  {
    key: 'toggle',
    label: 'Toggle list',
    group: 'Lists',
    icon: <ToggleIcon />,
    run: (editor) => replaceBlock(editor, ELEMENT.toggleList),
  },

  /* Media */
  {
    key: 'image',
    label: 'Image',
    group: 'Media',
    icon: <ImageIcon />,
    run: (_editor, { onMedia }) => onMedia?.('image'),
  },
  {
    key: 'video',
    label: 'Video',
    group: 'Media',
    icon: <VideoIcon />,
    run: (_editor, { onMedia }) => onMedia?.('video'),
  },
  {
    key: 'audio',
    label: 'Audio',
    group: 'Media',
    icon: <EquationIcon />,
    run: (_editor, { onMedia }) => onMedia?.('audio'),
  },
  {
    key: 'file',
    label: 'File',
    group: 'Media',
    icon: <LinkIcon />,
    run: (_editor, { onMedia }) => onMedia?.('file'),
  },
  {
    key: 'embed',
    label: 'Embed',
    group: 'Media',
    icon: <CodeIcon />,
    run: (_editor, { onMedia }) => onMedia?.('embed'),
  },

  /* Advanced blocks */
  {
    key: 'toc',
    label: 'Table of contents',
    group: 'Advanced blocks',
    icon: <BulletedListIcon />,
    run: (editor) => insertTableOfContents(editor),
  },
  {
    key: 'columns',
    label: '3 columns',
    group: 'Advanced blocks',
    icon: <ColumnsThreeIcon />,
    run: (editor) => insertColumns(editor, 3),
  },
  {
    key: 'equation',
    label: 'Equation',
    group: 'Advanced blocks',
    icon: <EquationIcon />,
    run: (editor) => insertEquation(editor),
  },
  {
    key: 'ai',
    label: 'Ask AI',
    group: 'Advanced blocks',
    icon: <SparklesIcon />,
    run: (_editor, { onAskAi }) => onAskAi?.(),
  },

  /* Inline */
  {
    key: 'link',
    label: 'Link',
    group: 'Inline',
    icon: <LinkIcon />,
    run: (_editor, { onLink }) => onLink?.(),
  },
  {
    key: 'date',
    label: 'Date',
    group: 'Inline',
    icon: <CalendarIcon />,
    run: (editor) => insertDate(editor),
  },
  {
    key: 'footnote',
    label: 'Footnote',
    group: 'Inline',
    icon: <SuperscriptIcon />,
    run: (editor) => insertFootnote(editor),
  },
  {
    key: 'inline-equation',
    label: 'Inline equation',
    group: 'Inline',
    icon: <EquationIcon />,
    run: (editor) => insertInlineEquation(editor),
  },
];

/** Section order for the insert menu. */
export const INSERT_GROUPS = [
  'Basic blocks',
  'Lists',
  'Media',
  'Advanced blocks',
  'Inline',
] as const;

export const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Gray', value: '#6b7280' },
  { label: 'Brown', value: '#92400e' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Yellow', value: '#ca8a04' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Red', value: '#dc2626' },
];

export const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Purple', value: '#e9d5ff' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Red', value: '#fecaca' },
  { label: 'Orange', value: '#fed7aa' },
];

export const HIGHLIGHT_ICON = <HighlighterIcon />;
export const MENTION_ICON = <MentionIcon />;
