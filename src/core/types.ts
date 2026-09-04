import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';

export const ELEMENT = {
  paragraph: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  blockquote: 'blockquote',
  codeBlock: 'code_block',
  bulletedList: 'ul',
  numberedList: 'ol',
  listItem: 'li',
  todoListItem: 'todo_li',
  divider: 'hr',
  callout: 'callout',
  image: 'img',
  link: 'a',
} as const;

export type ElementType = (typeof ELEMENT)[keyof typeof ELEMENT];

export const MARK = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikethrough',
  code: 'code',
  subscript: 'subscript',
  superscript: 'superscript',
  highlight: 'highlight',
  kbd: 'kbd',
  color: 'color',
} as const;

export type MarkType = (typeof MARK)[keyof typeof MARK];

export type Align = 'left' | 'center' | 'right' | 'justify';

export interface BaseElement {
  type: ElementType;
  align?: Align;
  indent?: number;
  children: Descendant[];
}

export interface TodoElement extends BaseElement {
  type: typeof ELEMENT.todoListItem;
  checked?: boolean;
}

export interface CodeBlockElement extends BaseElement {
  type: typeof ELEMENT.codeBlock;
  lang?: string;
}

export interface CalloutElement extends BaseElement {
  type: typeof ELEMENT.callout;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  emoji?: string;
}

export interface ImageElement extends BaseElement {
  type: typeof ELEMENT.image;
  url: string;
  caption?: string;
  width?: number;
}

export interface LinkElement extends BaseElement {
  type: typeof ELEMENT.link;
  url: string;
}

export type CustomElement =
  | BaseElement
  | TodoElement
  | CodeBlockElement
  | CalloutElement
  | ImageElement
  | LinkElement;

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  highlight?: string;
  kbd?: boolean;
  color?: string;
}

export type DaEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: DaEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export type EditorValue = Descendant[];

export type Theme = 'light' | 'dark' | 'system';
