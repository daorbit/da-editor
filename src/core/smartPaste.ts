import { Editor, Element as SlateElement, Node, Path, Range, Transforms } from 'slate';
import {
  ELEMENT,
  type CustomElement,
  type DaEditor,
  type EditorValue,
  type FetchLinkMeta,
} from './types';
import { parseMarkdown, parseWordHtml } from './io';
import { FONT_FAMILIES, loadFontsForValue, normalizeFonts } from './fonts';
import { isEmbeddable, toEmbedUrl } from './media';
import { detectLanguage } from './highlight';
import { wrapLink } from './transforms';

const URL_ONLY = /^\s*(https?:\/\/[^\s]+)\s*$/i;
const IMAGE_URL = /\.(png|jpe?g|gif|webp|avif|svg)(\?[^\s]*)?$/i;

const MARKDOWN_HINT =
  /^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.*\|)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)/m;

const MARKDOWN_TABLE = /^\s*\|.*\|\s*\n\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/m;
const MARKDOWN_FENCE = /^\s*(`{3,}|~{3,})[\w+#.-]*\s*\n[\s\S]*?\n\s*\1\s*$/m;
const MARKDOWN_HEADINGS = /^#{1,6}\s+\S/gm;

function looksLikeMarkdown(text: string): boolean {
  if (MARKDOWN_TABLE.test(text) || MARKDOWN_FENCE.test(text)) return true;
  if ((text.match(MARKDOWN_HEADINGS) ?? []).length >= 2) return true;
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

const HTML_TAG = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
const CONTENT_TAGS = new Set([
  'html', 'head', 'body', 'meta', 'title', 'link', 'style', 'main', 'article', 'section',
  'header', 'footer', 'nav', 'aside', 'div', 'span', 'p', 'br', 'hr', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'sub', 'sup',
  'small', 'code', 'kbd', 'pre', 'blockquote', 'q', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
  'a', 'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio', 'iframe',
  'details', 'summary', 'time', 'abbr', 'cite',
]);
const JSX_SIGNALS = /\bclassName=|=\{|<\/?[A-Z][\w.]*[\s/>]|^\s*(import|export|const|function)\b/m;

export function looksLikeHtml(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.startsWith('<') || JSX_SIGNALS.test(trimmed)) return false;
  const tags = Array.from(trimmed.matchAll(HTML_TAG), (match) => match[1].toLowerCase());
  if (tags.length < 2) return false;
  const known = tags.filter((tag) => CONTENT_TAGS.has(tag)).length;
  const closes = /<\/[a-z][a-z0-9-]*\s*>/i.test(trimmed);
  return closes && known / tags.length >= 0.6;
}

export function isRenderedSource(html: string, plain: string): boolean {
  if (!plain) return false;
  if (looksLikeHtml(plain) && /&lt;\/?[a-z]/i.test(html)) return true;
  return /<(pre|code)[\s>]/i.test(html) && (looksLikeHtml(plain) || looksLikeMarkdown(plain));
}

function insertParsed(editor: DaEditor, blocks: EditorValue): boolean {
  const fonts = editor.fontOptions ?? FONT_FAMILIES;
  const normalized = normalizeFonts(blocks, fonts);
  if (!normalized.length) return false;
  if (editor.loadWebFonts !== false) loadFontsForValue(normalized, fonts);
  Transforms.insertFragment(editor, normalized);
  return true;
}

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

  if (looksLikeHtml(text) && insertParsed(editor, parseWordHtml(text))) {
    return { handled: true };
  }

  if (looksLikeMarkdown(text) && insertParsed(editor, parseMarkdown(text))) {
    return { handled: true };
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