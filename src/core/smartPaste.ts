import { Editor, Element as SlateElement, Node, Path, Range, Transforms } from 'slate';
import { ELEMENT, type CustomElement, type DaEditor, type FetchLinkMeta } from './types';
import { parseMarkdown } from './io';
import { isEmbeddable, toEmbedUrl } from './media';
import { detectLanguage } from './highlight';
import { wrapLink } from './transforms';

const URL_ONLY = /^\s*(https?:\/\/[^\s]+)\s*$/i;
const IMAGE_URL = /\.(png|jpe?g|gif|webp|avif|svg)(\?[^\s]*)?$/i;

const MARKDOWN_HINT =
  /^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.*\|)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)/m;

function looksLikeMarkdown(text: string): boolean {
  if (!MARKDOWN_HINT.test(text)) return false;
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const marked = lines.filter((line) => MARKDOWN_HINT.test(line)).length;
  return lines.length > 0 && (marked / lines.length >= 0.3 || lines.length <= 3);
}

function looksLikeCode(text: string): boolean {
  if (text.split('\n').length < 2) return false;
  const codeSignals =
    /[{};]\s*$|^\s{2,}\S|=>|\bfunction\b|\bconst\b|\bimport\b|\bdef\b|\bclass\b|<\/?[a-z][\s\S]*>/m;
  const indentedLines = text
    .split('\n')
    .filter((line) => /^\s{2,}\S/.test(line)).length;
  return codeSignals.test(text) && indentedLines >= 1;
}

const PRE_WHITESPACE = /white-space:\s*pre/i;
const MONO_FONT = /font-family:[^;"]*(consolas|monaco|menlo|courier|mono)/i;

/**
 * IDEs such as VS Code put coloured `white-space: pre` markup on the clipboard.
 * Parsed as HTML it becomes a stack of styled paragraphs, so it is better read
 * as the plain code it is.
 */
export function isCodeEditorHtml(html: string): boolean {
  const head = html.slice(0, 2000);
  return PRE_WHITESPACE.test(head) && MONO_FONT.test(head);
}

/**
 * Inserts a block at the caret. Pasting onto an empty top-level line replaces
 * that line, rather than leaving a blank paragraph behind the new block.
 */
function insertBlock(editor: DaEditor, node: CustomElement): void {
  const entry = Editor.above<CustomElement>(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });
  const emptyLine =
    entry &&
    entry[1].length === 1 &&
    entry[0].type === ELEMENT.paragraph &&
    entry[0].children.length === 1 &&
    Node.string(entry[0]) === ''
      ? Editor.pathRef(editor, entry[1])
      : null;

  Transforms.insertNodes(editor, node);

  const stale = emptyLine?.unref();
  if (stale) Transforms.removeNodes(editor, { at: stale });
}

export interface SmartPasteResult {
  handled: boolean;
}

export interface SmartPasteOptions {
  /** When set, a bare URL is inserted as a rich preview card and this fills it. */
  fetchLinkMeta?: FetchLinkMeta;
}

/**
 * Inspects clipboard text and, when it recognises a shape, inserts it as the
 * right kind of content instead of dropping it in as a plain string. Returns
 * `handled: false` to let the editor fall back to its normal paste.
 */
export function smartPasteText(
  editor: DaEditor,
  raw: string,
  options: SmartPasteOptions = {},
): SmartPasteResult {
  const text = raw.replace(/\r\n/g, '\n').replace(/\n+$/, '');

  const url = text.match(URL_ONLY)?.[1];
  if (url) {
    insertUrl(editor, url, options);
    return { handled: true };
  }

  if (looksLikeMarkdown(text)) {
    const blocks = parseMarkdown(text);
    if (blocks.length) {
      Transforms.insertFragment(editor, blocks);
      return { handled: true };
    }
  }

  if (looksLikeCode(text)) {
    insertBlock(editor, {
      type: ELEMENT.codeBlock,
      lang: detectLanguage(text) || undefined,
      children: [{ text }],
    });
    return { handled: true };
  }

  return { handled: false };
}

function insertUrl(editor: DaEditor, url: string, options: SmartPasteOptions): void {
  const { selection } = editor;
  const hasSelection = !!selection && !Range.isCollapsed(selection);

  if (IMAGE_URL.test(url)) {
    insertBlock(editor, {
      type: ELEMENT.image,
      url,
      children: [{ text: '' }],
    });
    return;
  }

  if (!hasSelection && isEmbeddable(url)) {
    insertBlock(editor, {
      type: ELEMENT.embed,
      url: toEmbedUrl(url),
      children: [{ text: '' }],
    });
    return;
  }

  if (hasSelection) {
    wrapSelectionInLink(editor, url);
    return;
  }

  if (options.fetchLinkMeta) {
    insertLinkCard(editor, url, options.fetchLinkMeta);
    return;
  }

  wrapLink(editor, url);
}

function insertLinkCard(editor: DaEditor, url: string, fetchMeta: FetchLinkMeta): void {
  insertBlock(editor, {
    type: ELEMENT.linkCard,
    url,
    loading: true,
    children: [{ text: '' }],
  });

  void fetchMeta(url)
    .then((meta) => {
      const at = findCardPath(editor, url);
      if (!at) return;
      Transforms.setNodes(
        editor,
        { loading: false, ...(meta ? { meta } : null) },
        { at },
      );
    })
    .catch(() => {
      const at = findCardPath(editor, url);
      if (at) Transforms.setNodes(editor, { loading: false }, { at });
    });
}

function findCardPath(editor: DaEditor, url: string): Path | null {
  for (let i = editor.children.length - 1; i >= 0; i -= 1) {
    const node = editor.children[i];
    if (
      SlateElement.isElement(node) &&
      node.type === ELEMENT.linkCard &&
      'url' in node &&
      node.url === url
    ) {
      return [i];
    }
  }
  return null;
}

function wrapSelectionInLink(editor: DaEditor, url: string): void {
  const isLink = (n: unknown) =>
    SlateElement.isElement(n as SlateElement) &&
    (n as SlateElement).type === ELEMENT.link;

  Transforms.unwrapNodes(editor, { match: isLink, split: true });
  Transforms.wrapNodes(
    editor,
    { type: ELEMENT.link, url, children: [] },
    { split: true },
  );
  Transforms.collapse(editor, { edge: 'end' });
}