import { Element as SlateElement, Text, type Descendant } from 'slate';
import { ELEMENT, type CustomElement, type EditorValue } from '../types';
import { sanitizeIncomingUrl } from './shared';

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

 
const DEFAULT_HIGHLIGHT = '#fef08a';

const INLINE_ELEMENTS = new Set<string>([
  ELEMENT.link,
  ELEMENT.mention,
  ELEMENT.inlineEquation,
  ELEMENT.date,
  ELEMENT.footnote,
]);

/** Blocks whose background is a fill of their own rather than a text highlight. */
const BLOCK_FILL_TAGS = new Set(['TD', 'TH', 'TR', 'TABLE', 'PRE', 'DIV', 'DETAILS', 'BLOCKQUOTE']);

 
function styleMarks(element: HTMLElement): Partial<Text> {
  const style = element.getAttribute('style');
  if (!style) return {};
 
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
 
  const bg = /background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  if (bg && !/^(transparent|inherit|initial|#ffffff|#fff|rgb\(255,\s*255,\s*255\))$/i.test(bg)) {
    marks.highlight = bg;
  }
 
  const size = /(?:^|;)\s*font-size\s*:\s*([\d.]+)px/i.exec(style)?.[1];
  if (size) {
    const parsed = Number.parseFloat(size);
    if (Number.isFinite(parsed)) marks.fontSize = parsed;
  }

  const family = /(?:^|;)\s*font-family\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
  if (family && !/^(inherit|initial)$/i.test(family)) marks.fontFamily = family;

  return marks as Partial<Text>;
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

 
const DROPPED_CLASSES = ['da-callout__icon', 'da-file__icon', 'da-toggle__caret'];

const PASSTHROUGH_CLASSES = [
  'da-table-wrap',
  'da-callout__body',
  'da-toggle__body',
  'da-todo__text',
  'da-todo__box',
  'da-media-wrap',
];

 
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

 
function isFormattingWhitespace(node: globalThis.Node): boolean {
  if (node.nodeType !== 3) return false;
  if ((node.textContent ?? '').trim() !== '') return false;
  // Whitespace inside a code block is code — the gap between two tokens.
  for (let p = node.parentElement; p; p = p.parentElement) {
    if (p.nodeName === 'PRE' || p.nodeName === 'CODE') return false;
  }
  const siblings = Array.from(node.parentNode?.childNodes ?? []);
  return !siblings.some(
    (s) => s !== node && s.nodeType === 3 && (s.textContent ?? '').trim() !== '',
  );
}

/** Child nodes with the source's pretty-print whitespace removed. */
function contentChildNodes(element: globalThis.Node): globalThis.Node[] {
  return Array.from(element.childNodes).filter((child) => !isFormattingWhitespace(child));
}

function deserializeNode(el: globalThis.Node, marks: Partial<Text> = {}): Descendant[] {
  if (el.nodeType === 3) {
    const text = el.textContent ?? '';
    if (isFormattingWhitespace(el)) return [];
    return text ? [{ text, ...marks }] : [];
  }
  if (el.nodeType !== 1) return [];

  const element = el as HTMLElement;
  const tag = element.nodeName;

  const markKey = MARK_TAGS[tag];

  const isCodeInPre = tag === 'CODE' && element.parentElement?.nodeName === 'PRE';

  let inPre = false;
  for (let p = element.parentElement; p; p = p.parentElement) {
    if (p.nodeName === 'PRE') {
      inPre = true;
      break;
    }
  }
  const nextMarks = inPre
    ? marks
    : {
        ...marks,
        ...(markKey && !isCodeInPre ? { [markKey]: true } : null),
        ...(tag === 'MARK' ? { highlight: DEFAULT_HIGHLIGHT } : null),

        ...styleMarks(element),
      };

  if (tag === 'BR') {

    const parent = element.parentElement;
    const alone = !!parent && contentChildNodes(parent).length === 1;
    return alone ? [] : [{ text: '\n', ...marks }];
  }


  if (tag === 'INPUT') return [];

  if (tag === 'HR') {
    return [{ type: ELEMENT.divider, children: [{ text: '' }] }];
  }

  if (tag === 'IMG') {
    const url = sanitizeIncomingUrl(element.getAttribute('src') ?? '');
    const alt = element.getAttribute('alt') ?? '';
    const cls = element.getAttribute('class') ?? '';

    const radius = cls.match(/da-image--r-(sm|md|lg|full)/)?.[1];
    const border = cls.match(/da-image--b-(thin|medium)/)?.[1];
    const shadow = cls.match(/da-image--s-(sm|lg)/)?.[1];

    const ratio = element.style.aspectRatio?.trim().replace(/\s*\/\s*/, '/');
    const aspect = ratio && ratio !== 'auto' ? ratio : undefined;
    const objectFit = element.style.objectFit;
    const fit = objectFit === 'contain' ? 'contain' : undefined;

    const widthPx = parseInt(element.style.width, 10);
    const width = !aspect && Number.isFinite(widthPx) && widthPx > 0 ? widthPx : undefined;

    return [
      {
        type: ELEMENT.image,
        url,
        ...(alt ? { caption: alt } : null),
        ...(radius ? { radius } : null),
        ...(border ? { border } : null),
        ...(shadow ? { shadow } : null),
        ...(aspect ? { aspect } : null),
        ...(fit ? { fit } : null),
        ...(width ? { width } : null),
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
      const cls = img.getAttribute('class') ?? '';
      const radius = cls.match(/da-image--r-(sm|md|lg|full)/)?.[1];
      const border = cls.match(/da-image--b-(thin|medium)/)?.[1];
      const shadow = cls.match(/da-image--s-(sm|lg)/)?.[1];
      const ratio = img.style.aspectRatio?.trim().replace(/\s*\/\s*/, '/');
      const aspect = ratio && ratio !== 'auto' ? ratio : undefined;
      const fit = img.style.objectFit === 'contain' ? 'contain' : undefined;
      const widthPx = parseInt(img.style.width, 10);
      const width =
        !aspect && Number.isFinite(widthPx) && widthPx > 0 ? widthPx : undefined;
      return [
        {
          type: ELEMENT.image,
          url,
          ...(caption ? { caption } : null),
          ...(radius ? { radius } : null),
          ...(border ? { border } : null),
          ...(shadow ? { shadow } : null),
          ...(aspect ? { aspect } : null),
          ...(fit ? { fit } : null),
          ...(width ? { width } : null),
          children: [{ text: '' }],
        } as CustomElement,
      ];
    }
  }

 
  if (tag === 'TBODY' || tag === 'THEAD' || tag === 'TFOOT' || tag === 'COLGROUP') {
    return Array.from(element.childNodes).flatMap((child) =>
      deserializeNode(child, nextMarks),
    );
  }

 
  if (DROPPED_CLASSES.some((name) => element.classList.contains(name))) return [];

  if (PASSTHROUGH_CLASSES.some((name) => element.classList.contains(name))) {
    return Array.from(element.childNodes).flatMap((child) =>
      deserializeNode(child, nextMarks),
    );
  }

  const children = Array.from(element.childNodes).flatMap((child) =>
    deserializeNode(child, nextMarks),
  );
 
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

  if (element.hasAttribute('data-link-card')) {
    const url = sanitizeIncomingUrl(element.getAttribute('href') ?? '');
    const title = element.querySelector('.da-linkcard__title')?.textContent?.trim() ?? '';
    const description =
      element.querySelector('.da-linkcard__desc')?.textContent?.trim() ?? '';
    const siteName =
      element.getAttribute('data-site') ??
      element.querySelector('.da-linkcard__site')?.textContent?.trim() ??
      '';
    const thumb = element.querySelector<HTMLElement>('.da-linkcard__thumb');
    const image =
      thumb?.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') ?? '';
    const meta: Record<string, string> = {};
    if (title && title !== url) meta.title = title;
    if (description) meta.description = description;
    if (image) meta.image = sanitizeIncomingUrl(image);
    if (siteName) meta.siteName = siteName;
    return [
      {
        type: ELEMENT.linkCard,
        url,
        ...(Object.keys(meta).length ? { meta } : null),
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
      // The serializer bakes highlighting in as one text node per token; a
      // code block holds a single unmarked string, so fold them back together.
      const text = children.map((child) => ('text' in child ? child.text : '')).join('');
      return [{ type: blockType, ...extra, children: [{ text }] } as CustomElement];
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
