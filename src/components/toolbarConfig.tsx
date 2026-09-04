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
  DividerIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  HighlighterIcon,
  ItalicIcon,
  KbdIcon,
  NumberedListIcon,
  QuoteIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TextIcon,
  TodoListIcon,
  UnderlineIcon,
} from '../icons';
import { ELEMENT, MARK, type Align, type ElementType, type MarkType } from '../core/types';

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
  { mark: MARK.subscript, label: 'Subscript', icon: <SubscriptIcon /> },
  { mark: MARK.superscript, label: 'Superscript', icon: <SuperscriptIcon /> },
  { mark: MARK.kbd, label: 'Keyboard key', icon: <KbdIcon /> },
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
  { type: ELEMENT.blockquote, label: 'Quote', icon: <QuoteIcon />, hint: 'Ctrl+Shift+.' },
  { type: ELEMENT.codeBlock, label: 'Code block', icon: <CodeBlockIcon /> },
  { type: ELEMENT.bulletedList, label: 'Bulleted list', icon: <BulletedListIcon /> },
  { type: ELEMENT.numberedList, label: 'Numbered list', icon: <NumberedListIcon /> },
  { type: ELEMENT.todoListItem, label: 'To-do list', icon: <TodoListIcon /> },
  { type: ELEMENT.callout, label: 'Callout', icon: <CalloutIcon /> },
  { type: ELEMENT.divider, label: 'Divider', icon: <DividerIcon /> },
];

export const ALIGN_SPECS: Array<{ align: Align; label: string; icon: ReactNode }> = [
  { align: 'left', label: 'Align left', icon: <AlignLeftIcon /> },
  { align: 'center', label: 'Align center', icon: <AlignCenterIcon /> },
  { align: 'right', label: 'Align right', icon: <AlignRightIcon /> },
  { align: 'justify', label: 'Justify', icon: <AlignJustifyIcon /> },
];

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
