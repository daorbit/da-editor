import type { Descendant } from 'slate';
import { ELEMENT, type EditorValue } from './types';
import { deserializeHtml, emptyValue, serializeHtml, serializeMarkdown } from './serialize';

/** Triggers a browser download for text content. */
export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHtml(value: EditorValue, filename = 'document.html'): void {
  const body = serializeHtml(value);
  const page = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${filename.replace(/\.html$/, '')}</title></head>
<body>
${body}
</body>
</html>`;
  downloadText(filename, page, 'text/html');
}

export function exportMarkdown(value: EditorValue, filename = 'document.md'): void {
  downloadText(filename, serializeMarkdown(value), 'text/markdown');
}

/** Opens a file picker and resolves to the chosen file. */
export function pickTextFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      resolve(file);
    });

    document.body.append(input);
    input.click();
  });
}

/** Opens a file picker and resolves to the chosen file's text. */
export async function readTextFile(
  accept: string,
): Promise<{ name: string; text: string } | null> {
  const file = await pickTextFile(accept);
  if (!file) return null;
  return { name: file.name, text: await file.text() };
}

/**
 * Converts a Word document to an editor value.
 *
 * A `.docx` is a ZIP archive, so it must be unpacked rather than read as text;
 * `mammoth` does that and emits HTML. Word's "Save as Web Page" `.htm` output
 * is already HTML and only needs its namespaced markup stripped.
 */
export async function importWordFile(file: File): Promise<EditorValue> {
  const isDocx =
    file.name.toLowerCase().endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (isDocx) {
    // Loaded on demand so the parser stays out of the initial bundle.
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.convertToHtml({ arrayBuffer });
    return deserializeHtml(value);
  }

  if (file.name.toLowerCase().endsWith('.doc')) {
    throw new Error(
      'Legacy .doc files are not supported. Save the document as .docx and try again.',
    );
  }

  return parseWordHtml(await file.text());
}

/**
 * Converts Markdown to an editor value. Deliberately small: block-level syntax
 * plus inline emphasis, which covers what this editor can itself produce.
 */
export function parseMarkdown(markdown: string): EditorValue {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: EditorValue = [];

  let listBuffer: { ordered: boolean; items: string[] } | null = null;
  let codeBuffer: { lang: string; lines: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    blocks.push({
      type: listBuffer.ordered ? ELEMENT.numberedList : ELEMENT.bulletedList,
      children: listBuffer.items.map((item) => ({
        type: ELEMENT.listItem,
        children: parseInline(item),
      })),
    });
    listBuffer = null;
  };

  const flushCode = () => {
    if (!codeBuffer) return;
    blocks.push({
      type: ELEMENT.codeBlock,
      lang: codeBuffer.lang || undefined,
      children: [{ text: codeBuffer.lines.join('\n') }],
    });
    codeBuffer = null;
  };

  for (const line of lines) {
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (codeBuffer) flushCode();
      else {
        flushList();
        codeBuffer = { lang: fence[1], lines: [] };
      }
      continue;
    }

    if (codeBuffer) {
      codeBuffer.lines.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const type = (
        [ELEMENT.h1, ELEMENT.h2, ELEMENT.h3, ELEMENT.h4, ELEMENT.h5, ELEMENT.h6] as const
      )[level - 1];
      blocks.push({ type, children: parseInline(heading[2]) });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushList();
      blocks.push({ type: ELEMENT.divider, children: [{ text: '' }] });
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushList();
      blocks.push({ type: ELEMENT.blockquote, children: parseInline(quote[1]) });
      continue;
    }

    const todo = line.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/);
    if (todo) {
      flushList();
      blocks.push({
        type: ELEMENT.todoListItem,
        checked: todo[1].toLowerCase() === 'x',
        children: parseInline(todo[2]),
      });
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      if (!listBuffer || listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(bullet[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(ordered[1]);
      continue;
    }

    flushList();
    blocks.push({ type: ELEMENT.paragraph, children: parseInline(line) });
  }

  flushList();
  flushCode();

  return blocks.length ? blocks : emptyValue();
}

/** Splits a line into marked text runs. */
function parseInline(text: string): Descendant[] {
  const pattern =
    /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|`(.+?)`|\*(.+?)\*|_(.+?)_|\[(.+?)\]\((.+?)\))/g;

  const runs: Descendant[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }

    const [, , boldItalic, bold, underline, strike, code, italic, italic2, linkText, linkUrl] =
      match;

    if (boldItalic !== undefined) runs.push({ text: boldItalic, bold: true, italic: true });
    else if (bold !== undefined) runs.push({ text: bold, bold: true });
    else if (underline !== undefined) runs.push({ text: underline, underline: true });
    else if (strike !== undefined) runs.push({ text: strike, strikethrough: true });
    else if (code !== undefined) runs.push({ text: code, code: true });
    else if (italic !== undefined) runs.push({ text: italic, italic: true });
    else if (italic2 !== undefined) runs.push({ text: italic2, italic: true });
    else if (linkText !== undefined) {
      runs.push({ type: ELEMENT.link, url: linkUrl, children: [{ text: linkText }] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) runs.push({ text: text.slice(lastIndex) });
  return runs.length ? runs : [{ text: '' }];
}

/**
 * Parses a Word export. A .docx is a zip and cannot be read without a
 * dependency, so this handles the HTML that Word produces on copy or
 * "Save as Web Page", stripping its namespaced markup.
 */
export function parseWordHtml(html: string): EditorValue {
  const cleaned = html
    // Word wraps content in conditional comments and o:/w: namespaced tags.
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?(?:o|w|m|v):[^>]*>/g, '')
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/\sclass="Mso[^"]*"/g, '');

  return deserializeHtml(cleaned);
}

export function parseHtmlFile(html: string): EditorValue {
  return deserializeHtml(html);
}
