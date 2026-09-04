import { Element as SlateElement, Node, Text, type Descendant } from 'slate';
import { ELEMENT, type CustomElement, type EditorValue } from './types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeLeaf(node: Text): string {
  let html = escapeHtml(node.text);
  if (html === '') return '';
  if (node.code) html = `<code>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  if (node.subscript) html = `<sub>${html}</sub>`;
  if (node.superscript) html = `<sup>${html}</sup>`;
  if (node.kbd) html = `<kbd>${html}</kbd>`;
  if (node.highlight) html = `<mark style="background:${node.highlight}">${html}</mark>`;
  if (node.color) html = `<span style="color:${node.color}">${html}</span>`;
  return html;
}

function styleAttr(element: CustomElement): string {
  const styles: string[] = [];
  if (element.align && element.align !== 'left') styles.push(`text-align:${element.align}`);
  if (element.indent) styles.push(`margin-left:${element.indent * 24}px`);
  return styles.length ? ` style="${styles.join(';')}"` : '';
}

/** Serializes editor value to HTML. */
export function serializeHtml(value: EditorValue): string {
  return value.map(serializeNode).join('');
}

function serializeNode(node: Node): string {
  if (Text.isText(node)) return serializeLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const children = node.children.map(serializeNode).join('') || '<br>';
  const attrs = styleAttr(node);

  switch (node.type) {
    case ELEMENT.h1:
      return `<h1${attrs}>${children}</h1>`;
    case ELEMENT.h2:
      return `<h2${attrs}>${children}</h2>`;
    case ELEMENT.h3:
      return `<h3${attrs}>${children}</h3>`;
    case ELEMENT.blockquote:
      return `<blockquote${attrs}>${children}</blockquote>`;
    case ELEMENT.codeBlock:
      return `<pre${attrs}><code>${children}</code></pre>`;
    case ELEMENT.bulletedList:
      return `<ul${attrs}>${children}</ul>`;
    case ELEMENT.numberedList:
      return `<ol${attrs}>${children}</ol>`;
    case ELEMENT.listItem:
      return `<li${attrs}>${children}</li>`;
    case ELEMENT.todoListItem: {
      const checked = 'checked' in node && node.checked ? ' checked' : '';
      return `<div data-todo${checked}${attrs}><input type="checkbox"${checked} disabled>${children}</div>`;
    }
    case ELEMENT.divider:
      return '<hr>';
    case ELEMENT.callout: {
      const variant = 'variant' in node && node.variant ? node.variant : 'info';
      return `<div data-callout="${variant}"${attrs}>${children}</div>`;
    }
    case ELEMENT.image: {
      const url = 'url' in node ? escapeHtml(node.url) : '';
      const caption = 'caption' in node && node.caption ? escapeHtml(node.caption) : '';
      return caption
        ? `<figure><img src="${url}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`
        : `<img src="${url}" alt="">`;
    }
    case ELEMENT.link: {
      const url = 'url' in node ? escapeHtml(node.url) : '';
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    default:
      return `<p${attrs}>${children}</p>`;
  }
}

/* ------------------------------------------------------------- markdown -- */

function serializeMarkdownLeaf(node: Text): string {
  let text = node.text;
  if (text === '') return '';
  if (node.code) text = `\`${text}\``;
  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.strikethrough) text = `~~${text}~~`;
  return text;
}

function serializeMarkdownNode(node: Node, depth = 0, index = 0): string {
  if (Text.isText(node)) return serializeMarkdownLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const inner = node.children
    .map((child, i) => serializeMarkdownNode(child, depth + 1, i))
    .join('');

  switch (node.type) {
    case ELEMENT.h1:
      return `# ${inner}\n\n`;
    case ELEMENT.h2:
      return `## ${inner}\n\n`;
    case ELEMENT.h3:
      return `### ${inner}\n\n`;
    case ELEMENT.blockquote:
      return `> ${inner}\n\n`;
    case ELEMENT.codeBlock: {
      const lang = 'lang' in node && node.lang ? node.lang : '';
      return `\`\`\`${lang}\n${Node.string(node)}\n\`\`\`\n\n`;
    }
    case ELEMENT.bulletedList:
    case ELEMENT.numberedList:
      return `${inner}\n`;
    case ELEMENT.listItem: {
      return `- ${inner}\n`;
    }
    case ELEMENT.todoListItem: {
      const checked = 'checked' in node && node.checked ? 'x' : ' ';
      return `- [${checked}] ${inner}\n`;
    }
    case ELEMENT.divider:
      return `---\n\n`;
    case ELEMENT.image: {
      const url = 'url' in node ? node.url : '';
      const caption = 'caption' in node && node.caption ? node.caption : '';
      return `![${caption}](${url})\n\n`;
    }
    case ELEMENT.link: {
      const url = 'url' in node ? node.url : '';
      return `[${inner}](${url})`;
    }
    case ELEMENT.callout:
      return `> ${inner}\n\n`;
    default:
      return index >= 0 && depth > 0 ? `${inner}\n\n` : `${inner}\n\n`;
  }
}

/** Serializes editor value to Markdown. */
export function serializeMarkdown(value: EditorValue): string {
  return value
    .map((node, i) => serializeMarkdownNode(node, 0, i))
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ---------------------------------------------------------------- parse -- */

const MARK_TAGS: Record<string, keyof Omit<Text, 'text'>> = {
  STRONG: 'bold',
  B: 'bold',
  EM: 'italic',
  I: 'italic',
  U: 'underline',
  S: 'strikethrough',
  DEL: 'strikethrough',
  CODE: 'code',
  SUB: 'subscript',
  SUP: 'superscript',
  KBD: 'kbd',
};

const BLOCK_TAGS: Record<string, CustomElement['type']> = {
  H1: ELEMENT.h1,
  H2: ELEMENT.h2,
  H3: ELEMENT.h3,
  H4: ELEMENT.h3,
  BLOCKQUOTE: ELEMENT.blockquote,
  PRE: ELEMENT.codeBlock,
  UL: ELEMENT.bulletedList,
  OL: ELEMENT.numberedList,
  LI: ELEMENT.listItem,
  P: ELEMENT.paragraph,
  DIV: ELEMENT.paragraph,
  HR: ELEMENT.divider,
};

function deserializeNode(el: globalThis.Node, marks: Partial<Text> = {}): Descendant[] {
  if (el.nodeType === 3) {
    const text = el.textContent ?? '';
    return text ? [{ text, ...marks }] : [];
  }
  if (el.nodeType !== 1) return [];

  const element = el as HTMLElement;
  const tag = element.nodeName;

  const markKey = MARK_TAGS[tag];
  const nextMarks = markKey ? { ...marks, [markKey]: true } : marks;

  if (tag === 'BR') return [{ text: '\n', ...marks }];

  if (tag === 'HR') {
    return [{ type: ELEMENT.divider, children: [{ text: '' }] }];
  }

  if (tag === 'IMG') {
    const url = element.getAttribute('src') ?? '';
    return [{ type: ELEMENT.image, url, children: [{ text: '' }] }];
  }

  const children = Array.from(element.childNodes).flatMap((child) =>
    deserializeNode(child, nextMarks),
  );

  if (tag === 'A') {
    const url = element.getAttribute('href') ?? '';
    return [
      {
        type: ELEMENT.link,
        url,
        children: children.length ? children : [{ text: url }],
      },
    ];
  }

  const blockType = BLOCK_TAGS[tag];
  if (blockType) {
    return [
      {
        type: blockType,
        children: children.length ? children : [{ text: '' }],
      } as CustomElement,
    ];
  }

  return children;
}

/** Parses an HTML string into an editor value. */
export function deserializeHtml(html: string): EditorValue {
  if (typeof document === 'undefined') return emptyValue();

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const nodes = Array.from(parsed.body.childNodes).flatMap((node) =>
    deserializeNode(node),
  );

  // Loose text at the top level has to be wrapped to keep the document valid.
  const blocks: Descendant[] = [];
  let inlineRun: Descendant[] = [];

  const flush = () => {
    if (inlineRun.length) {
      blocks.push({ type: ELEMENT.paragraph, children: inlineRun } as CustomElement);
      inlineRun = [];
    }
  };

  for (const node of nodes) {
    if (SlateElement.isElement(node) && node.type !== ELEMENT.link) {
      flush();
      blocks.push(node);
    } else {
      inlineRun.push(node);
    }
  }
  flush();

  return blocks.length ? (blocks as EditorValue) : emptyValue();
}

/** A valid empty document. */
export function emptyValue(): EditorValue {
  return [{ type: ELEMENT.paragraph, children: [{ text: '' }] }];
}
