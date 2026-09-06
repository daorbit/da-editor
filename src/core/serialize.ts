import { Element as SlateElement, Node, Text, type Descendant } from 'slate';
import { ELEMENT, type CustomElement, type EditorValue } from './types';
import { INLINE_STYLES, calloutStyle } from './inlineStyles';

/** Maps an element type to its entry in the inline style table. */
const ELEMENT_STYLE_KEY: Record<string, string> = {
  [ELEMENT.paragraph]: 'p',
  [ELEMENT.h1]: 'h1',
  [ELEMENT.h2]: 'h2',
  [ELEMENT.h3]: 'h3',
  [ELEMENT.h4]: 'h4',
  [ELEMENT.h5]: 'h5',
  [ELEMENT.h6]: 'h6',
  [ELEMENT.blockquote]: 'blockquote',
  [ELEMENT.codeBlock]: 'pre',
  [ELEMENT.bulletedList]: 'ul',
  [ELEMENT.numberedList]: 'ol',
  [ELEMENT.listItem]: 'li',
  [ELEMENT.table]: 'table',
  [ELEMENT.tableCell]: 'td',
  [ELEMENT.tableHeaderCell]: 'th',
  [ELEMENT.callout]: 'callout',
  [ELEMENT.toggleList]: 'details',
  [ELEMENT.columns]: 'columns',
  [ELEMENT.column]: 'column',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Schemes that execute code when a link is followed. Serialized HTML is
 * typically stored and rendered again later, so letting one through is stored
 * XSS: it runs for every viewer of the saved document, not just its author.
 */
const UNSAFE_URL = /^\s*(?:javascript|data|vbscript|file)\s*:/i;

function safeUrl(url: string): string {
  return UNSAFE_URL.test(url) ? '' : escapeHtml(url);
}

/**
 * Colour functions, the form a browser normalizes every colour into — reading
 * `element.style.backgroundColor` back gives `rgb(211, 249, 216)`, never the
 * hex that was written. Matching the whole value keeps the parenthesis
 * exception from widening into arbitrary CSS functions.
 */
const COLOR_FUNCTION = /^(?:rgb|rgba|hsl|hsla)\(\s*[\d.,%\s/]+\)$/i;

/**
 * A CSS value safe to place inside a `style` attribute. Colours arrive from
 * pasted content, so they can carry extra declarations or a `url()` payload.
 */
function safeCss(value: string): string {
  const trimmed = value.trim();
  if (COLOR_FUNCTION.test(trimmed)) return trimmed;
  if (/[<>"';(){}]|url\s*\(|expression|@import|\/\*/i.test(trimmed)) return '';
  return escapeHtml(trimmed);
}

function serializeLeaf(node: Text): string {
  let html = escapeHtml(node.text);
  if (html === '') return '';
  if (node.code) html = `<code class="da-inline-code"${s('inlineCode')}>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  if (node.subscript) html = `<sub>${html}</sub>`;
  if (node.superscript) html = `<sup>${html}</sup>`;
  if (node.kbd) html = `<kbd class="da-kbd">${html}</kbd>`;
  if (node.highlight) {
    const bg = safeCss(String(node.highlight));
    if (bg) html = `<mark style="background:${bg}">${html}</mark>`;
  }
  if (node.color) {
    const fg = safeCss(String(node.color));
    if (fg) html = `<span style="color:${fg}">${html}</span>`;
  }
  return html;
}

/**
 * Per-element styles for the current serialization. Module-level rather than
 * threaded through every case, since serialization is synchronous and never
 * interleaved.
 */
let inlineStyles = false;

function styleAttr(element: CustomElement, key?: string): string {
  const styles: string[] = [];

  // The base look comes first so align and indent below can override it.
  if (inlineStyles && key) {
    const base =
      key === 'callout'
        ? calloutStyle(
            'variant' in element && element.variant ? String(element.variant) : 'info',
          )
        : INLINE_STYLES[key];
    if (base) styles.push(base);
  }

  if (element.align && element.align !== 'left') styles.push(`text-align:${element.align}`);
  if (element.indent) styles.push(`margin-left:${element.indent * 24}px`);
  return styles.length ? ` style="${attrSafeCss(styles.join(';'))}"` : '';
}

/**
 * A style value is emitted inside a double-quoted attribute, so a double quote
 * in it (a font family such as "Segoe UI", say) would close the attribute early
 * and scatter the rest as bogus attributes. Swap them for single quotes, which
 * CSS accepts and HTML leaves alone.
 */
function attrSafeCss(value: string): string {
  return value.replace(/"/g, "'");
}

/**
 * The stylesheet shipped as `da-text-editor/styles.css` targets the `da-*`
 * classes the editor renders. Serialized HTML has to carry the same classes or
 * it renders unstyled wherever it is published — the editor and its preview
 * would otherwise never agree.
 */
function c(className: string): string {
  return ` class="${className}"`;
}

/**
 * Cell fill and hidden borders live on the node, the way the editor's own
 * renderer reads them. Without them a coloured comparison table serializes to
 * plain white cells.
 */
function cellAttrs(element: CustomElement, attrs: string): string {
  const declarations: string[] = [];

  const background =
    'background' in element && element.background ? safeCss(String(element.background)) : '';
  if (background) declarations.push(`background-color:${background}`);

  // An absent side means "drawn", so only an explicit false removes it.
  const borders = 'borders' in element ? element.borders : undefined;
  if (borders) {
    if (borders.top === false) declarations.push('border-top-color:transparent');
    if (borders.right === false) declarations.push('border-right-color:transparent');
    if (borders.bottom === false) declarations.push('border-bottom-color:transparent');
    if (borders.left === false) declarations.push('border-left-color:transparent');
  }

  if (!declarations.length) return attrs;

  const declaration = declarations.join(';');
  return attrs
    ? attrs.replace(/"$/, `;${attrSafeCss(declaration)}"`)
    : ` style="${attrSafeCss(declaration)}"`;
}

/**
 * Lists carry their marker as a node property, so it has to be folded into the
 * element's own style attribute — a disc/circle/square choice is otherwise lost
 * the moment the document leaves the editor.
 */
function listStyleAttr(element: CustomElement, attrs: string): string {
  const marker = 'listStyle' in element && element.listStyle ? String(element.listStyle) : '';
  const value = marker ? safeCss(marker) : '';
  if (!value) return attrs;

  const declaration = `list-style-type:${value}`;
  return attrs
    ? attrs.replace(/^ style="/, ` style="${attrSafeCss(declaration)};`)
    : ` style="${attrSafeCss(declaration)}"`;
}

/** Style attribute for elements that carry no Slate node of their own. */
function s(key: string): string {
  if (!inlineStyles) return '';
  const value = INLINE_STYLES[key];
  return value ? ` style="${attrSafeCss(value)}"` : '';
}

export interface SerializeHtmlOptions {
  /**
   * Emit the editor's own styling as `style` attributes, so the output renders
   * the same anywhere — a CMS preview, a published page, an email client —
   * without loading the editor's stylesheet.
   */
  inlineStyles?: boolean;
}

/** Serializes editor value to HTML. */
export function serializeHtml(value: EditorValue, options: SerializeHtmlOptions = {}): string {
  inlineStyles = options.inlineStyles ?? false;
  try {
    return value.map(serializeNode).join('');
  } finally {
    inlineStyles = false;
  }
}

function serializeNode(node: Node): string {
  if (Text.isText(node)) return serializeLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const children = node.children.map(serializeNode).join('') || '<br>';
  const attrs = styleAttr(node, ELEMENT_STYLE_KEY[node.type]);

  switch (node.type) {
    case ELEMENT.h1:
      return `<h1${c('da-h1')}${attrs}>${children}</h1>`;
    case ELEMENT.h2:
      return `<h2${c('da-h2')}${attrs}>${children}</h2>`;
    case ELEMENT.h3:
      return `<h3${c('da-h3')}${attrs}>${children}</h3>`;
    case ELEMENT.h4:
      return `<h4${c('da-h4')}${attrs}>${children}</h4>`;
    case ELEMENT.h5:
      return `<h5${c('da-h5')}${attrs}>${children}</h5>`;
    case ELEMENT.h6:
      return `<h6${c('da-h6')}${attrs}>${children}</h6>`;
    case ELEMENT.blockquote:
      return `<blockquote${c('da-blockquote')}${attrs}>${children}</blockquote>`;
    case ELEMENT.codeBlock: {
      // The language is kept so a downstream highlighter can pick it up —
      // `language-x` is the convention Prism and highlight.js both read.
      // A language name is only ever a bare identifier; anything else is dropped.
      const rawLang = 'lang' in node && node.lang ? String(node.lang) : '';
      const lang = /^[\w+-]{1,30}$/.test(rawLang) ? rawLang : '';
      const cls = lang ? ` class="da-code language-${lang}"` : c('da-code');
      return `<pre${c('da-code-block')}${attrs}><code${cls}${s('code')}>${children}</code></pre>`;
    }
    case ELEMENT.bulletedList:
      return `<ul${c('da-ul')}${listStyleAttr(node, attrs)}>${children}</ul>`;
    case ELEMENT.numberedList:
      return `<ol${c('da-ol')}${listStyleAttr(node, attrs)}>${children}</ol>`;
    case ELEMENT.listItem:
      return `<li${c('da-li')}${attrs}>${children}</li>`;
    case ELEMENT.todoListItem: {
      const isChecked = 'checked' in node && node.checked;
      const checked = isChecked ? ' checked' : '';
      // Checked items get the struck-through style, matching the editor.
      const todoStyle = inlineStyles
        ? ` style="${attrSafeCss(INLINE_STYLES[isChecked ? 'todoChecked' : 'todo'])}"`
        : attrs;
      const cls = `da-todo${isChecked ? ' da-todo--checked' : ''}`;
      return `<div class="${cls}" data-todo${checked}${todoStyle}><span class="da-todo__box"><input type="checkbox"${checked} disabled></span><span class="da-todo__text">${children}</span></div>`;
    }
    case ELEMENT.divider:
      return `<hr${c('da-hr')}>`;
    case ELEMENT.callout: {
      const raw = 'variant' in node && node.variant ? String(node.variant) : 'info';
      // Constrained to the known set rather than escaped, so an unexpected
      // value cannot reach the attribute at all.
      const variant = ['info', 'warning', 'success', 'danger'].includes(raw) ? raw : 'info';
      // The icon is part of the callout, not of its text: emitting it as a
      // sibling of the body reproduces the editor's own layout, and keeps the
      // emoji from being read back as a stray paragraph of content.
      // The attribute is written only when the author picked an icon, so a
      // callout that never had one does not gain the default on a round-trip.
      const chosen = 'emoji' in node && node.emoji ? String(node.emoji) : '';
      const emoji = escapeHtml(chosen || '💡');
      const emojiAttr = chosen ? ` data-emoji="${emoji}"` : '';
      return (
        `<div class="da-callout da-callout--${variant}" data-callout="${variant}"${emojiAttr}${attrs}>` +
        `<span class="da-callout__icon"${s('calloutIcon')}>${emoji}</span>` +
        `<div class="da-callout__body"${s('calloutBody')}>${children}</div>` +
        `</div>`
      );
    }
    case ELEMENT.table: {
      // Column widths are emitted as a colgroup so the layout survives
      // outside the editor, where the resize handles do not exist.
      const widths = 'columnWidths' in node ? node.columnWidths : undefined;
      const colgroup = widths?.length
        ? `<colgroup>${widths.map((w) => `<col style="width:${w}px">`).join('')}</colgroup>`
        : '';
      return `<div class="da-table-wrap"><table${c('da-table')}${attrs}>${colgroup}<tbody>${children}</tbody></table></div>`;
    }
    case ELEMENT.tableRow:
      return `<tr${c('da-tr')}${attrs}>${children}</tr>`;
    case ELEMENT.tableHeaderCell:
      return `<th${c('da-th')}${cellAttrs(node, attrs)}>${children}</th>`;
    case ELEMENT.tableCell:
      return `<td${c('da-td')}${cellAttrs(node, attrs)}>${children}</td>`;
    case ELEMENT.mention: {
      const id = 'id' in node ? escapeHtml(String(node.id)) : '';
      const name = 'name' in node ? escapeHtml(String(node.name)) : '';
      return `<span class="da-mention" data-mention="${id}"${s('mention')}>@${name}</span>`;
    }
    case ELEMENT.equation: {
      // The source formula is the durable form; a renderer downstream can
      // typeset it, and it stays readable if none does.
      const formula = 'formula' in node ? escapeHtml(String(node.formula)) : '';
      return `<div class="da-equation" data-equation="${formula}"${s('equation')}>${formula}</div>`;
    }
    case ELEMENT.inlineEquation: {
      const formula = 'formula' in node ? escapeHtml(String(node.formula)) : '';
      return `<span class="da-inline-equation" data-inline-equation="${formula}"${s('inlineEquation')}>${formula}</span>`;
    }
    case ELEMENT.date: {
      const iso = 'date' in node ? escapeHtml(String(node.date)) : '';
      return `<time class="da-date" datetime="${iso}"${s('time')}>${iso}</time>`;
    }
    case ELEMENT.footnote: {
      const note = 'note' in node ? escapeHtml(String(node.note)) : '';
      // A footnote marker has no text of its own, so the `<br>` placeholder
      // every other block gets would come back as a superscripted newline.
      const label = children === '<br>' ? '' : children;
      return `<sup class="da-footnote" data-footnote="${note}"${s('footnote')}>${label}</sup>`;
    }
    case ELEMENT.tableOfContents:
      // Regenerated from the headings on render; nothing to persist.
      return '';
    case ELEMENT.toggleList: {
      const [summary, ...rest] = node.children;
      const head = summary ? serializeNode(summary) : '';
      const body = rest.map(serializeNode).join('');
      const open = 'open' in node && node.open === false ? '' : ' open';
      return `<details class="da-toggle"${open}${attrs}><summary${s('summary')}>${head}</summary><div class="da-toggle__body">${body}</div></details>`;
    }
    case ELEMENT.columns:
      return `<div class="da-columns" data-columns="${node.children.length}"${attrs}>${children}</div>`;
    case ELEMENT.column:
      return `<div class="da-column" data-column${attrs}>${children}</div>`;
    case ELEMENT.video: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      return `<video class="da-video" src="${url}" controls${s('video')}></video>`;
    }
    case ELEMENT.audio: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      return `<audio class="da-audio" src="${url}" controls${s('audio')}></audio>`;
    }
    case ELEMENT.file: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      const name = 'caption' in node && node.caption ? escapeHtml(node.caption) : url;
      return `<a class="da-file" href="${url}" data-file download${s('file')}><span class="da-file__icon">📎</span><span class="da-file__name">${name}</span></a>`;
    }
    case ELEMENT.embed: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      return `<div class="da-embed" data-embed${s('embed')}><iframe src="${url}" loading="lazy" allowfullscreen${s('iframe')}></iframe></div>`;
    }
    case ELEMENT.image: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      const caption = 'caption' in node && node.caption ? escapeHtml(node.caption) : '';
      return caption
        ? `<figure class="da-figure"${s('figure')}><img class="da-image" src="${url}" alt="${caption}"${s('img')}><figcaption class="da-figcaption"${s('figcaption')}>${caption}</figcaption></figure>`
        : `<img class="da-image" src="${url}" alt=""${s('img')}>`;
    }
    case ELEMENT.link: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      return `<a class="da-link" href="${url}"${s('link')} target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    case ELEMENT.paragraph:
      return `<p${c('da-p')}${attrs}>${children}</p>`;
    default: {
      // An unrecognised type used to become a paragraph silently, which turned
      // a typo in a node's `type` into invisible data loss — and, for inline
      // and table nodes, into invalid markup the browser then reshuffles.
      // Warn once and keep the content rather than the wrapper.
      // `node` narrows to never here now that every known type is handled —
      // this branch exists for values arriving at runtime from outside.
      warnUnknownType((node as CustomElement).type);
      return children;
    }
  }
}

const warnedTypes = new Set<string>();

function warnUnknownType(type: string): void {
  if (warnedTypes.has(type)) return;
  warnedTypes.add(type);
  if (typeof console !== 'undefined') {
    console.warn(
      `[da-text-editor] serializeHtml: unknown element type ${JSON.stringify(type)} — ` +
        'its children were kept but the element was dropped. ' +
        'Check the value against the ELEMENT map (e.g. table cells are "td", not "table_cell").',
    );
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

/**
 * <mark> means highlighted even with no colour of its own — a plain <mark>
 * pasted from elsewhere should still come back as a highlight.
 */
const DEFAULT_HIGHLIGHT = '#fef08a';

/** Elements that live inside a paragraph rather than replacing it. */
const INLINE_ELEMENTS = new Set<string>([
  ELEMENT.link,
  ELEMENT.mention,
  ELEMENT.inlineEquation,
  ELEMENT.date,
  ELEMENT.footnote,
]);

/** Blocks whose background is a fill of their own rather than a text highlight. */
const BLOCK_FILL_TAGS = new Set(['TD', 'TH', 'TR', 'TABLE', 'PRE', 'DIV', 'DETAILS', 'BLOCKQUOTE']);

/**
 * Marks carried by inline CSS rather than by tags. Google Docs, Notion and
 * most web pages style text this way, so ignoring it drops the formatting of
 * anything pasted from them.
 */
function styleMarks(element: HTMLElement): Partial<Text> {
  const style = element.getAttribute('style');
  if (!style) return {};

  // A block's own background is its fill, not a highlight on the text inside
  // it — a coloured table cell would otherwise mark its whole contents.
  if (BLOCK_FILL_TAGS.has(element.nodeName)) return {};

  const marks: Record<string, unknown> = {};
  const weight = /font-weight\s*:\s*(\d+|bold)/i.exec(style)?.[1];
  if (weight && (weight === 'bold' || parseInt(weight, 10) >= 600)) marks.bold = true;
  if (/font-style\s*:\s*italic/i.test(style)) marks.italic = true;
  if (/text-decoration[^;]*underline/i.test(style)) marks.underline = true;
  if (/text-decoration[^;]*line-through/i.test(style)) marks.strikethrough = true;

  // Skip the near-black defaults browsers and editors emit for ordinary text.
  const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  if (color && !/^(inherit|initial|currentcolor|#000000|#000|rgb\(0,\s*0,\s*0\))$/i.test(color)) {
    marks.color = color;
  }

  // Matches both `background-color` and the `background` shorthand the
  // serializer itself writes, or highlights would be lost on reload.
  const bg = /background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  if (bg && !/^(transparent|inherit|initial|#ffffff|#fff|rgb\(255,\s*255,\s*255\))$/i.test(bg)) {
    marks.highlight = bg;
  }

  return marks as Partial<Text>;
}


/** Drops executable URL schemes arriving from pasted or imported HTML. */
function sanitizeIncomingUrl(url: string): string {
  return UNSAFE_URL.test(url) ? '' : url;
}

const BLOCK_TAGS: Record<string, CustomElement['type']> = {
  H1: ELEMENT.h1,
  H2: ELEMENT.h2,
  H3: ELEMENT.h3,
  H4: ELEMENT.h4,
  H5: ELEMENT.h5,
  H6: ELEMENT.h6,
  TIME: ELEMENT.date,
  BLOCKQUOTE: ELEMENT.blockquote,
  PRE: ELEMENT.codeBlock,
  UL: ELEMENT.bulletedList,
  OL: ELEMENT.numberedList,
  LI: ELEMENT.listItem,
  P: ELEMENT.paragraph,
  DIV: ELEMENT.paragraph,
  HR: ELEMENT.divider,
  TABLE: ELEMENT.table,
  TR: ELEMENT.tableRow,
  TD: ELEMENT.tableCell,
  TH: ELEMENT.tableHeaderCell,
  DETAILS: ELEMENT.toggleList,
};

/**
 * Wrappers the serializer adds purely so the stylesheet has a hook. They are
 * not blocks, so parsing has to see through them — otherwise every save nests
 * the document one level deeper.
 */
const DROPPED_CLASSES = ['da-callout__icon', 'da-file__icon', 'da-toggle__caret'];

const PASSTHROUGH_CLASSES = [
  'da-table-wrap',
  'da-callout__body',
  'da-toggle__body',
  'da-todo__text',
  'da-todo__box',
  'da-media-wrap',
];

/**
 * Alignment and indent are node properties the serializer writes into the
 * style attribute, so they have to be read back out of it — a centred or
 * indented paragraph is otherwise flattened on the next load.
 */
function blockLayout(element: HTMLElement): Record<string, unknown> {
  const layout: Record<string, unknown> = {};

  const align = element.style.textAlign;
  if (align && align !== 'left') layout.align = align;

  const indent = parseInt(element.style.marginLeft, 10);
  if (!Number.isNaN(indent) && indent > 0) layout.indent = Math.round(indent / 24);

  return layout;
}

/** Wraps loose inline content so a container that may only hold blocks is valid. */
function asBlocks(children: Descendant[]): Descendant[] {
  if (!children.length) return [{ type: ELEMENT.paragraph, children: [{ text: '' }] } as CustomElement];

  const blocks: Descendant[] = [];
  let run: Descendant[] = [];
  const flush = () => {
    if (run.length) {
      blocks.push({ type: ELEMENT.paragraph, children: run } as CustomElement);
      run = [];
    }
  };

  for (const child of children) {
    if (SlateElement.isElement(child) && !INLINE_ELEMENTS.has(child.type)) {
      flush();
      blocks.push(child);
    } else {
      run.push(child);
    }
  }
  flush();

  return blocks;
}

function deserializeNode(el: globalThis.Node, marks: Partial<Text> = {}): Descendant[] {
  if (el.nodeType === 3) {
    const text = el.textContent ?? '';
    return text ? [{ text, ...marks }] : [];
  }
  if (el.nodeType !== 1) return [];

  const element = el as HTMLElement;
  const tag = element.nodeName;

  const markKey = MARK_TAGS[tag];
  // Inside <pre> the <code> tag is structural, not an inline code mark —
  // without this a code block picks up `code: true` on every reload.
  const isCodeInPre = tag === 'CODE' && element.parentElement?.nodeName === 'PRE';
  const nextMarks = {
    ...marks,
    ...(markKey && !isCodeInPre ? { [markKey]: true } : null),
    ...(tag === 'MARK' ? { highlight: DEFAULT_HIGHLIGHT } : null),
    // Google Docs and most rich web content express marks as inline styles
    // rather than tags, so reading only tags loses all their formatting.
    ...styleMarks(element),
  };

  if (tag === 'BR') {
    // A lone <br> is the placeholder the serializer writes for an empty block,
    // not a line break in the text — keeping it would grow a blank paragraph by
    // one newline on every save.
    const alone = element.parentElement?.childNodes.length === 1;
    return alone ? [] : [{ text: '\n', ...marks }];
  }

  // The serializer writes a disabled checkbox for display; the checked state
  // lives on the todo element itself, so the input carries nothing to keep.
  if (tag === 'INPUT') return [];

  if (tag === 'HR') {
    return [{ type: ELEMENT.divider, children: [{ text: '' }] }];
  }

  if (tag === 'IMG') {
    // Pasted markup is untrusted: an executable scheme here would be stored
    // and re-rendered for every later viewer.
    const url = sanitizeIncomingUrl(element.getAttribute('src') ?? '');
    const alt = element.getAttribute('alt') ?? '';
    return [
      {
        type: ELEMENT.image,
        url,
        ...(alt ? { caption: alt } : null),
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  if (tag === 'VIDEO' || tag === 'AUDIO') {
    const url = sanitizeIncomingUrl(
      element.getAttribute('src') ?? element.querySelector('source')?.getAttribute('src') ?? '',
    );
    return [
      {
        type: tag === 'VIDEO' ? ELEMENT.video : ELEMENT.audio,
        url,
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  if (tag === 'IFRAME') {
    const url = sanitizeIncomingUrl(element.getAttribute('src') ?? '');
    return [{ type: ELEMENT.embed, url, children: [{ text: '' }] } as CustomElement];
  }

  // A figure is the image's caption wrapper, not a block of its own: read the
  // caption off it so an image keeps it across a save.
  if (tag === 'FIGURE') {
    const img = element.querySelector('img');
    if (img) {
      const url = sanitizeIncomingUrl(img.getAttribute('src') ?? '');
      const caption =
        element.querySelector('figcaption')?.textContent?.trim() ??
        img.getAttribute('alt') ??
        '';
      return [
        {
          type: ELEMENT.image,
          url,
          ...(caption ? { caption } : null),
          children: [{ text: '' }],
        } as CustomElement,
      ];
    }
  }

  // Structural wrappers carry no meaning of their own; passing their children
  // straight through keeps rows attached to the table rather than turning
  // these into paragraphs.
  if (tag === 'TBODY' || tag === 'THEAD' || tag === 'TFOOT' || tag === 'COLGROUP') {
    return Array.from(element.childNodes).flatMap((child) =>
      deserializeNode(child, nextMarks),
    );
  }

  // Presentational wrappers the serializer emits so the CSS has something to
  // hang off. They hold no content of their own, so lift their children rather
  // than turning each one into a stray paragraph.
  // Chrome the serializer draws, carrying no document content of its own.
  if (DROPPED_CLASSES.some((name) => element.classList.contains(name))) return [];

  if (PASSTHROUGH_CLASSES.some((name) => element.classList.contains(name))) {
    return Array.from(element.childNodes).flatMap((child) =>
      deserializeNode(child, nextMarks),
    );
  }

  const children = Array.from(element.childNodes).flatMap((child) =>
    deserializeNode(child, nextMarks),
  );

  // Round-trip the data-* attributes the serializer writes, so content saved
  // as HTML and loaded back keeps its structure.
  const inlineFormula = element.getAttribute('data-inline-equation');
  if (inlineFormula !== null) {
    return [
      {
        type: ELEMENT.inlineEquation,
        formula: inlineFormula,
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  const blockFormula = element.getAttribute('data-equation');
  if (blockFormula !== null) {
    return [
      {
        type: ELEMENT.equation,
        formula: blockFormula,
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  const note = element.getAttribute('data-footnote');
  if (note !== null) {
    return [
      {
        type: ELEMENT.footnote,
        note,
        children: children.length ? children : [{ text: '' }],
      } as CustomElement,
    ];
  }

  if (element.hasAttribute('data-column')) {
    return [
      {
        type: ELEMENT.column,
        children: asBlocks(children),
      } as CustomElement,
    ];
  }

  if (element.hasAttribute('data-columns')) {
    return [
      {
        type: ELEMENT.columns,
        // A column layout may only hold columns; anything loose gets its own.
        children: children.every(
          (child) => SlateElement.isElement(child) && child.type === ELEMENT.column,
        )
          ? children
          : [{ type: ELEMENT.column, children: asBlocks(children) } as CustomElement],
      } as CustomElement,
    ];
  }

  if (element.hasAttribute('data-embed')) {
    const url = sanitizeIncomingUrl(element.querySelector('iframe')?.getAttribute('src') ?? '');
    return [{ type: ELEMENT.embed, url, children: [{ text: '' }] } as CustomElement];
  }

  if (element.hasAttribute('data-file')) {
    const url = sanitizeIncomingUrl(element.getAttribute('href') ?? '');
    const caption = (element.textContent ?? '').replace(/^📎\s*/, '').trim();
    return [
      {
        type: ELEMENT.file,
        url,
        ...(caption && caption !== url ? { caption } : null),
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  const mentionId = element.getAttribute('data-mention');
  if (mentionId !== null) {
    return [
      {
        type: ELEMENT.mention,
        id: mentionId,
        name: (element.textContent ?? '').replace(/^@/, ''),
        children: [{ text: '' }],
      } as CustomElement,
    ];
  }

  const calloutVariant = element.getAttribute('data-callout');
  if (calloutVariant !== null) {
    // The icon is chrome, not text: reading it back off the attribute keeps it
    // out of the callout's body, where it used to reappear as a stray line.
    const emoji = element.getAttribute('data-emoji') ?? '';
    const body = element.querySelector('.da-callout__body');
    const content = body
      ? Array.from(body.childNodes).flatMap((child) => deserializeNode(child, nextMarks))
      : children;

    return [
      {
        type: ELEMENT.callout,
        variant: calloutVariant,
        ...(emoji ? { emoji } : null),
        children: content.length ? content : [{ text: '' }],
      } as CustomElement,
    ];
  }

  if (element.hasAttribute('data-todo')) {
    return [
      {
        type: ELEMENT.todoListItem,
        checked: element.hasAttribute('checked') || !!element.querySelector('[checked]'),
        // Drop the disabled checkbox the serializer emits for display.
        children: children.length ? children : [{ text: '' }],
      } as CustomElement,
    ];
  }

  if (tag === 'A') {
    const url = sanitizeIncomingUrl(element.getAttribute('href') ?? '');
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
    // A wrapper such as <div> or <p> around real blocks (a heading, a list)
    // must not swallow them into a single paragraph — that is what collapses
    // a pasted web page into one line. Lift the children instead.
    const isWrapper = blockType === ELEMENT.paragraph;
    const hasBlockChild = children.some(
      (child) => SlateElement.isElement(child) && !INLINE_ELEMENTS.has(child.type),
    );
    if (isWrapper && hasBlockChild) {
      return children;
    }

    const extra: Record<string, unknown> = { ...blockLayout(element) };

    if (blockType === ELEMENT.codeBlock) {
      const lang = element
        .querySelector('code')
        ?.className.match(/language-([\w-]+)/)?.[1];
      if (lang) extra.lang = lang;
    }

    if (blockType === ELEMENT.table) {
      const widths = Array.from(element.querySelectorAll('col'))
        .map((col) => parseInt(col.style.width, 10))
        .filter((w) => !Number.isNaN(w));
      if (widths.length) extra.columnWidths = widths;
    }

    if (blockType === ELEMENT.date) {
      extra.date = element.getAttribute('datetime') ?? element.textContent?.trim() ?? '';
      return [{ type: blockType, ...extra, children: [{ text: '' }] } as CustomElement];
    }

    if (blockType === ELEMENT.toggleList) {
      extra.open = element.hasAttribute('open');
    }

    if (blockType === ELEMENT.tableCell || blockType === ELEMENT.tableHeaderCell) {
      const background = element.style.backgroundColor;
      if (background) extra.background = background;

      const borders = {
        top: element.style.borderTopColor !== 'transparent',
        right: element.style.borderRightColor !== 'transparent',
        bottom: element.style.borderBottomColor !== 'transparent',
        left: element.style.borderLeftColor !== 'transparent',
      };
      if (Object.values(borders).some((drawn) => !drawn)) extra.borders = borders;
    }

    if (blockType === ELEMENT.bulletedList || blockType === ELEMENT.numberedList) {
      const marker = element.style.listStyleType;
      if (marker) extra.listStyle = marker;
    }

    return [
      {
        type: blockType,
        ...extra,
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
