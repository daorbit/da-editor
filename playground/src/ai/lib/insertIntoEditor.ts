import { Editor, Element, Node, Transforms } from 'slate';
import { deserializeHtml } from '../../../../src';
import type { DaEditorHandle } from '../../../../src';
import { markdownToHtml } from './markdownToHtml';
import type { ComposeMode } from '../types';

type EditorValue = Parameters<DaEditorHandle['setValue']>[0];

const VOID_TYPES = new Set(['image', 'video', 'audio', 'hr', 'divider', 'thematic-break']);

function isMeaningful(node: unknown): boolean {
  if (!Element.isElement(node)) return Node.string(node as Node).trim().length > 0;
  const type = (node as { type?: string }).type;
  if (type && VOID_TYPES.has(type)) return true;
  return Node.string(node as Node).trim().length > 0;
}

function toBlocks(markdown: string): EditorValue {
  const html = markdownToHtml(markdown);
  const parsed = deserializeHtml(html) as EditorValue;
  const blocks = parsed.filter(isMeaningful);
  return (blocks.length ? blocks : parsed) as EditorValue;
}

export function insertComposedText(
  handle: DaEditorHandle,
  markdown: string,
  mode: ComposeMode
): void {
  const editor = handle.editor as unknown as Editor;
  const blocks = toBlocks(markdown);
  if (!blocks.length) return;

  Editor.withoutNormalizing(editor, () => {
    if (mode === 'replace' && editor.selection) {
      Transforms.delete(editor);
    }
    if (!editor.selection) {
      Transforms.select(editor, Editor.end(editor, []));
    }
    Transforms.insertNodes(editor, blocks as Node[]);
  });

  handle.focus();
}
