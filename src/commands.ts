import type { ToolbarItem } from './types';

/**
 * Maps a toolbar item onto a `document.execCommand` call. execCommand is
 * deprecated but remains the only cross-browser way to get undo-aware rich
 * text editing without shipping a document model. The model lives in the DOM;
 * swapping this file out is the seam for a custom model later.
 */
export function execCommand(item: ToolbarItem): void {
  switch (item) {
    case 'bold':
    case 'italic':
    case 'underline':
    case 'strikeThrough':
    case 'undo':
    case 'redo':
      document.execCommand(item);
      break;
    case 'code':
      document.execCommand('formatBlock', false, 'pre');
      break;
    case 'paragraph':
      document.execCommand('formatBlock', false, 'p');
      break;
    case 'h1':
    case 'h2':
    case 'h3':
      document.execCommand('formatBlock', false, item);
      break;
    case 'blockquote':
      document.execCommand('formatBlock', false, 'blockquote');
      break;
    case 'bulletedList':
      document.execCommand('insertUnorderedList');
      break;
    case 'numberedList':
      document.execCommand('insertOrderedList');
      break;
    case 'link': {
      const url = window.prompt('Link URL');
      if (url) document.execCommand('createLink', false, url);
      break;
    }
    case 'clear':
      document.execCommand('removeFormat');
      document.execCommand('formatBlock', false, 'p');
      break;
  }
}

const MARK_STATE: Partial<Record<ToolbarItem, string>> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikeThrough: 'strikeThrough',
  bulletedList: 'insertUnorderedList',
  numberedList: 'insertOrderedList',
};

const BLOCK_TAG: Partial<Record<ToolbarItem, string>> = {
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  paragraph: 'P',
  blockquote: 'BLOCKQUOTE',
  code: 'PRE',
};

/** Whether a toolbar item is active for the current selection. */
export function isActive(item: ToolbarItem): boolean {
  const stateCommand = MARK_STATE[item];
  if (stateCommand) {
    try {
      return document.queryCommandState(stateCommand);
    } catch {
      return false;
    }
  }

  const tag = BLOCK_TAG[item];
  if (!tag) return false;
  try {
    return document.queryCommandValue('formatBlock').toUpperCase() === tag;
  } catch {
    return false;
  }
}

/** Keyboard shortcuts handled inside the editable area. */
export function shortcutFor(event: KeyboardEvent | React.KeyboardEvent): ToolbarItem | null {
  if (!event.metaKey && !event.ctrlKey) return null;
  switch (event.key.toLowerCase()) {
    case 'b':
      return 'bold';
    case 'i':
      return 'italic';
    case 'u':
      return 'underline';
    default:
      return null;
  }
}
