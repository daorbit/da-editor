export type MarkCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'code';

export type BlockCommand =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'blockquote'
  | 'bulletedList'
  | 'numberedList';

export type ToolbarItem = MarkCommand | BlockCommand | 'undo' | 'redo' | 'link' | 'clear';

export interface EditorHandle {
  /** Current HTML content. */
  getHTML: () => string;
  /** Plain text content. */
  getText: () => string;
  /** Replace content. */
  setHTML: (html: string) => void;
  /** Move caret into the editable area. */
  focus: () => void;
  /** Run a formatting command. */
  exec: (command: ToolbarItem) => void;
}

export interface EditorProps {
  /** Uncontrolled initial HTML. */
  defaultValue?: string;
  /** Controlled HTML value. */
  value?: string;
  /** Fires on every content change with the current HTML. */
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** Which toolbar buttons to render. Pass `false` to hide the toolbar. */
  toolbar?: ToolbarItem[] | false;
  className?: string;
  style?: React.CSSProperties;
  /** Minimum height of the editable area, e.g. `"240px"`. */
  minHeight?: string;
}
