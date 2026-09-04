import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';

export const ELEMENT = {
  paragraph: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  blockquote: 'blockquote',
  codeBlock: 'code_block',
  bulletedList: 'ul',
  numberedList: 'ol',
  listItem: 'li',
  todoListItem: 'todo_li',
  divider: 'hr',
  callout: 'callout',
  image: 'img',
  video: 'video',
  audio: 'audio',
  file: 'file',
  embed: 'embed',
  table: 'table',
  tableRow: 'tr',
  tableCell: 'td',
  tableHeaderCell: 'th',
  link: 'a',
  mention: 'mention',
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
  backgroundColor: 'backgroundColor',
  fontSize: 'fontSize',
  fontFamily: 'fontFamily',
  comment: 'comment',
} as const;

export type MarkType = (typeof MARK)[keyof typeof MARK];

export type Align = 'left' | 'center' | 'right' | 'justify';

/** Editing mode, mirroring a document editor's Editing / Suggesting / Viewing. */
export type EditorMode = 'editing' | 'suggesting' | 'viewing';

export interface BaseElement {
  type: ElementType;
  align?: Align;
  indent?: number;
  lineHeight?: number;
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

export interface MediaElement extends BaseElement {
  type:
    | typeof ELEMENT.image
    | typeof ELEMENT.video
    | typeof ELEMENT.audio
    | typeof ELEMENT.file
    | typeof ELEMENT.embed;
  url: string;
  caption?: string;
  name?: string;
  width?: number;
}

export interface TableElement extends BaseElement {
  type: typeof ELEMENT.table;
  /** Column widths in pixels, index-aligned with the cells in each row. */
  columnWidths?: number[];
}

export interface TableCellElement extends BaseElement {
  type: typeof ELEMENT.tableCell | typeof ELEMENT.tableHeaderCell;
}

export interface LinkElement extends BaseElement {
  type: typeof ELEMENT.link;
  url: string;
}

export interface MentionElement extends BaseElement {
  type: typeof ELEMENT.mention;
  /** Stable id of the mentioned entity. */
  id: string;
  name: string;
}

export type CustomElement =
  | BaseElement
  | TodoElement
  | CodeBlockElement
  | CalloutElement
  | MediaElement
  | TableElement
  | TableCellElement
  | LinkElement
  | MentionElement;

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
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  comment?: string;
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

/** An entry offered by the `@` mention combobox. */
export interface Mentionable {
  id: string;
  name: string;
  /** Optional secondary line, e.g. an email or handle. */
  detail?: string;
  avatar?: string;
}

export type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'embed';


export type UploadHandler = (file: File, kind: MediaKind) => Promise<string>;
