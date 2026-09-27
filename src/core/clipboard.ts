import { Editor, Element as SlateElement, Node, Range, Text, Transforms } from 'slate';
import { ELEMENT, type DaEditor, type EditorValue } from './types';
import { formatDate, serializeHtml } from './serialize';
import { isBlockActive } from './transforms';

const SLATE_FRAGMENT = 'application/x-slate-fragment';

function inlineVoidText(element: SlateElement): string {
  switch (element.type) {
    case ELEMENT.mention:
      return 'name' in element && element.name ? `@${element.name}` : '';
    case ELEMENT.date:
      return 'date' in element && element.date ? formatDate(element.date) : '';
    case ELEMENT.inlineEquation:
      return 'formula' in element && element.formula ? element.formula : '';
    default:
      return '';
  }
}

function nodeToPlainText(editor: DaEditor, node: Node): string {
  if (Text.isText(node)) return node.text;
  if (!SlateElement.isElement(node)) return '';

  if (editor.isInline(node)) {
    return editor.isVoid(node)
      ? inlineVoidText(node)
      : node.children.map((child) => nodeToPlainText(editor, child)).join('');
  }

  if (editor.isVoid(node)) {
    return 'url' in node && typeof node.url === 'string' ? node.url : '';
  }

  const hasBlockChildren = node.children.some(
    (child) => SlateElement.isElement(child) && !editor.isInline(child),
  );
  const separator =
    node.type === ELEMENT.tableRow ? '\t' : hasBlockChildren ? '\n' : '';
  return node.children.map((child) => nodeToPlainText(editor, child)).join(separator);
}

/** Plain text for a fragment: one line per block, tabs between table cells. */
export function fragmentToPlainText(editor: DaEditor, fragment: Node[]): string {
  return fragment.map((node) => nodeToPlainText(editor, node)).join('\n');
}

/**
 * Writes the copied fragment as clean HTML and text built from the document
 * model, rather than from a clone of the DOM, which drags editor chrome such
 * as drag handles, code block toolbars and hover previews into the clipboard.
 */
function writeFragment(editor: DaEditor, data: DataTransfer): void {
  const { selection } = editor;
  if (!selection || Range.isCollapsed(selection)) return;

  const fragment = Editor.fragment(editor, Editor.unhangRange(editor, selection));
  if (fragment.length === 0) return;

  const encoded = data.getData(SLATE_FRAGMENT);
  const html = serializeHtml(fragment as EditorValue);
  const marker = encoded ? `<span data-slate-fragment="${encoded}"></span>` : '';

  data.setData('text/html', `${marker}${html}`);
  data.setData('text/plain', fragmentToPlainText(editor, fragment));
}

/** Strips the line break a terminal or IDE leaves after copied text. */
function trimTrailingBreak(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n+$/, '');
}

export function withClipboard(editor: DaEditor): DaEditor {
  const { setFragmentData } = editor;

  editor.setFragmentData = (data, originEvent) => {
    setFragmentData(data, originEvent);
    try {
      writeFragment(editor, data);
    } catch {
      // Keep Slate's own clipboard payload if the model could not be serialised.
    }
  };

  editor.insertTextData = (data) => {
    const raw = data.getData('text/plain');
    if (!raw) return false;

    const text = trimTrailingBreak(raw);
    if (!text) return true;

    // Code keeps its line breaks inside the block instead of splitting it.
    if (isPlainTextTarget(editor)) {
      Transforms.insertText(editor, text);
      return true;
    }

    const lines = text.split('\n');
    Editor.withoutNormalizing(editor, () => {
      lines.forEach((line, index) => {
        if (index > 0) Transforms.splitNodes(editor, { always: true });
        if (line) Editor.insertText(editor, line);
      });
    });
    return true;
  };

  return editor;
}

/** True when the pasted text should go in verbatim, untouched by rich parsing. */
export function isPlainTextTarget(editor: DaEditor): boolean {
  return isBlockActive(editor, ELEMENT.codeBlock);
}
