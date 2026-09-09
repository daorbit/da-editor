import { Element as SlateElement, Node, Text } from 'slate';
import { ELEMENT, type CustomElement, type EditorValue } from '../types';
import { INLINE_STYLES, STATIC_SKIN, calloutStyle, TOKEN_COLORS } from '../inlineStyles';
import { highlightCodeToHtml } from '../highlight';
import { escapeHtml, safeUrl, safeCss, attrSafeCss, formatDate } from './shared';

const IMAGE_RADIUS: Record<string, string> = {
  sm: '4px',
  md: '10px',
  lg: '18px',
  full: '9999px',
};
const IMAGE_SHADOW: Record<string, string> = {
  sm: '0 2px 8px rgba(16,20,30,0.12)',
  lg: '0 12px 32px rgba(16,20,30,0.22)',
};
const IMAGE_BORDER_COLOR = 'rgba(128,128,128,0.4)';

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
  if (node.kbd) html = `<kbd class="da-kbd"${s('kbd')}>${html}</kbd>`;
  if (node.highlight) {
    const bg = safeCss(String(node.highlight));
    if (bg) html = `<mark style="background:${bg}">${html}</mark>`;
  }
  if (node.color) {
    const fg = safeCss(String(node.color));
    if (fg) html = `<span style="color:${fg}">${html}</span>`;
  }
  const spanStyles: string[] = [];
  if (typeof node.fontSize === 'number' && Number.isFinite(node.fontSize)) {
    spanStyles.push(`font-size:${node.fontSize}px`);
  }
  if (node.fontFamily) {
    const family = safeCss(String(node.fontFamily));
    if (family) spanStyles.push(`font-family:${family}`);
  }
  if (node.backgroundColor) {
    const bg = safeCss(String(node.backgroundColor));
    if (bg) spanStyles.push(`background-color:${bg}`);
  }
  if (spanStyles.length) {
    html = `<span style="${attrSafeCss(spanStyles.join(';'))}">${html}</span>`;
  }
  return html;
}

 
let inlineStyles = false;

function styleAttr(element: CustomElement, key?: string): string {
  const styles: string[] = [];

  if (inlineStyles && key) {
    if (key === 'callout') {
      const variant =
        'variant' in element && element.variant ? String(element.variant) : 'info';
      styles.push(calloutStyle(variant, staticSkin));
    } else {
      if (INLINE_STYLES[key]) styles.push(INLINE_STYLES[key]);
      if (staticSkin && STATIC_SKIN[key]) styles.push(STATIC_SKIN[key]);
    }
  }

  if (element.align && element.align !== 'left') styles.push(`text-align:${element.align}`);
  if (element.indent) styles.push(`margin-left:${element.indent * 24}px`);
  return styles.length ? ` style="${attrSafeCss(styles.join(';'))}"` : '';
}


 
function c(className: string): string {
  return ` class="${className}"`;
}

 
function cellAttrs(element: CustomElement, attrs: string): string {
  const declarations: string[] = [];

  const background =
    'background' in element && element.background ? safeCss(String(element.background)) : '';
  if (background) declarations.push(`background-color:${background}`);

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


function listStyleAttr(element: CustomElement, attrs: string): string {
  const marker = 'listStyle' in element && element.listStyle ? String(element.listStyle) : '';
  const value = marker ? safeCss(marker) : '';
  if (!value) return attrs;

  const declaration = `list-style-type:${value}`;
  return attrs
    ? attrs.replace(/^ style="/, ` style="${attrSafeCss(declaration)};`)
    : ` style="${attrSafeCss(declaration)}"`;
}

function s(key: string): string {
  if (!inlineStyles) return '';
  const parts = [INLINE_STYLES[key], staticSkin ? STATIC_SKIN[key] : ''].filter(Boolean);
  return parts.length ? ` style="${attrSafeCss(parts.join(';'))}"` : '';
}

export interface SerializeHtmlOptions {
 
  inlineStyles?: boolean | 'static';
}

let staticSkin = false;

export function serializeHtml(value: EditorValue, options: SerializeHtmlOptions = {}): string {
  inlineStyles = options.inlineStyles === 'static' || options.inlineStyles === true;
  staticSkin = options.inlineStyles === 'static';
  try {
    return value.map(serializeNode).join('');
  } finally {
    inlineStyles = false;
    staticSkin = false;
  }
}

 
function highlightPre(code: string, lang: string): string {
  if (!code) return '<br>';
  const markup = highlightCodeToHtml(code, lang);

  return markup.replace(
    /class="token ([^"]+)"/g,
    (_match, rawTypes: string) => {
      const types = rawTypes.trim().split(/\s+/);
      if (inlineStyles) {
        const type = types.find((t) => TOKEN_COLORS[t]);
        return type ? `style="color:${TOKEN_COLORS[type]}"` : 'class="da-token"';
      }
      const classes = ['da-token', ...types.map((t) => `da-token--${t}`)];
      return `class="${classes.join(' ')}"`;
    },
  );
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
      const rawLang = 'lang' in node && node.lang ? String(node.lang) : '';
      const lang = /^[\w+-]{1,30}$/.test(rawLang) ? rawLang : '';
      const cls = lang ? ` class="da-code language-${lang}"` : c('da-code');
      const highlighted = highlightPre(Node.string(node), lang);
      return `<pre${c('da-code-block')}${attrs}><code${cls}${s('code')}>${highlighted}</code></pre>`;
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
      // The wrapper scrolls a wide table on a narrow screen instead of letting
 
      const wrapStyle = inlineStyles
        ? ' style="margin:10px 0;overflow-x:auto;-webkit-overflow-scrolling:touch"'
        : '';
      return `<div class="da-table-wrap"${wrapStyle}><table${c('da-table')}${attrs}>${colgroup}<tbody>${children}</tbody></table></div>`;
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
      const raw = 'date' in node ? String(node.date) : '';
      const iso = escapeHtml(raw);

      return `<time class="da-date" datetime="${iso}"${s('time')}>${escapeHtml(formatDate(raw))}</time>`;
    }
    case ELEMENT.footnote: {
      const note = 'note' in node ? escapeHtml(String(node.note)) : '';

      const label = children === '<br>' ? '' : children;
      return `<sup class="da-footnote" data-footnote="${note}"${s('footnote')}>${label}</sup>`;
    }
    case ELEMENT.tableOfContents:
      return '';
    case ELEMENT.toggleList: {
      const open = 'open' in node && node.open === false ? '' : ' open';
      return `<details class="da-toggle"${open}${attrs}><summary${s('summary')}>${children}</summary></details>`;
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

      const styleParts: string[] = [];
      if (inlineStyles && INLINE_STYLES.img) styleParts.push(INLINE_STYLES.img);
      const radius = 'radius' in node ? node.radius : undefined;
      if (radius && radius !== 'none') {
        styleParts.push(`border-radius:${IMAGE_RADIUS[radius] ?? '0'}`);
      }
      const border = 'border' in node ? node.border : undefined;
      if (border && border !== 'none') {
        styleParts.push(`border:${border === 'medium' ? '3px' : '1px'} solid ${IMAGE_BORDER_COLOR}`);
      }
      const shadow = 'shadow' in node ? node.shadow : undefined;
      if (shadow && shadow !== 'none') {
        styleParts.push(`box-shadow:${IMAGE_SHADOW[shadow]}`);
      }
      const aspect = 'aspect' in node && node.aspect ? String(node.aspect) : '';
      if (aspect) {
        const fit = 'fit' in node && node.fit ? node.fit : 'cover';
        styleParts.push(`aspect-ratio:${aspect.replace('/', ' / ')}`);
        styleParts.push(`object-fit:${fit}`);
        styleParts.push('width:100%');
      }
      const width = 'width' in node && node.width ? Number(node.width) : 0;
      if (width && !aspect) styleParts.push(`width:${width}px`);

      const cls = [
        'da-image',
        radius && radius !== 'none' ? `da-image--r-${radius}` : '',
        border && border !== 'none' ? `da-image--b-${border}` : '',
        shadow && shadow !== 'none' ? `da-image--s-${shadow}` : '',
        aspect ? 'da-image--cropped' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const styleAttr = styleParts.length
        ? ` style="${attrSafeCss(styleParts.join(';'))}"`
        : '';
      const img = `<img class="${cls}" src="${url}" alt="${caption}"${styleAttr}>`;

      return caption
        ? `<figure class="da-figure"${s('figure')}>${img}<figcaption class="da-figcaption"${s('figcaption')}>${caption}</figcaption></figure>`
        : img;
    }
    case ELEMENT.link: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      return `<a class="da-link" href="${url}"${s('link')} target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    case ELEMENT.linkCard: {
      const url = 'url' in node ? safeUrl(node.url) : '';
      const meta = 'meta' in node && node.meta ? node.meta : {};
      const title = meta.title ? escapeHtml(String(meta.title)) : '';
      const description = meta.description ? escapeHtml(String(meta.description)) : '';
      const image = meta.image ? safeUrl(String(meta.image)) : '';
      const siteName = meta.siteName ? escapeHtml(String(meta.siteName)) : '';
      const thumb = image
        ? `<span class="da-linkcard__thumb" style="background-image:url('${image}')"></span>`
        : '';
      return (
        `<a class="da-linkcard" href="${url}" data-link-card target="_blank" rel="noopener noreferrer"` +
        `${siteName ? ` data-site="${siteName}"` : ''}${s('linkCard')}>` +
        `<span class="da-linkcard__body">` +
        `${siteName ? `<span class="da-linkcard__site">${siteName}</span>` : ''}` +
        `<span class="da-linkcard__title">${title || escapeHtml(url)}</span>` +
        `${description ? `<span class="da-linkcard__desc">${description}</span>` : ''}` +
        `</span>${thumb}</a>`
      );
    }
    case ELEMENT.paragraph:
      return `<p${c('da-p')}${attrs}>${children}</p>`;
    default: {
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

