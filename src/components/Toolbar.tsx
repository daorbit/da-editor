import type { ToolbarItem } from '../types';

const LABELS: Record<ToolbarItem, string> = {
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strikeThrough: 'S',
  code: '</>',
  paragraph: 'P',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  blockquote: '❝',
  bulletedList: '• List',
  numberedList: '1. List',
  undo: '↶',
  redo: '↷',
  link: 'Link',
  clear: 'Clear',
};

const TITLES: Partial<Record<ToolbarItem, string>> = {
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
  strikeThrough: 'Strikethrough',
  code: 'Code block',
  blockquote: 'Quote',
  clear: 'Clear formatting',
};

export interface ToolbarProps {
  items: ToolbarItem[];
  activeItems: ToolbarItem[];
  disabled: boolean;
  onCommand: (item: ToolbarItem) => void;
}

export function Toolbar({ items, activeItems, disabled, onCommand }: ToolbarProps) {
  return (
    <div className="da-editor__toolbar" role="toolbar" aria-label="Formatting">
      {items.map((item) => {
        const active = activeItems.includes(item);
        return (
          <button
            key={item}
            type="button"
            className={`da-editor__button${active ? ' da-editor__button--active' : ''}`}
            title={TITLES[item] ?? LABELS[item]}
            aria-label={TITLES[item] ?? LABELS[item]}
            aria-pressed={active}
            disabled={disabled}
            // Keep the selection in the editable area when the button is clicked.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onCommand(item)}
          >
            {LABELS[item]}
          </button>
        );
      })}
    </div>
  );
}
