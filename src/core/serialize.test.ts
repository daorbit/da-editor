import { JSDOM } from 'jsdom';
import { describe, expect, it, beforeAll } from 'vitest';
import { serializeHtml, deserializeHtml } from './serialize';
import { ELEMENT } from './types';
import type { EditorValue } from './types';

/**
 * `deserializeHtml` needs a DOM. Installing one globally before the suite lets
 * these run under plain Node rather than a browser environment.
 */
beforeAll(() => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.document = dom.window.document;
  globalThis.DOMParser = dom.window.DOMParser;
});

/**
 * A document that uses every element the editor can produce, so the round-trip
 * guards below fail when a new type is added to the serializer without a
 * matching branch in the parser.
 */
const DEMO_CONTENT: EditorValue = [
  { type: ELEMENT.h1, children: [{ text: 'Title' }] },
  { type: ELEMENT.h2, children: [{ text: 'Section' }] },
  { type: ELEMENT.h3, children: [{ text: 'Sub' }] },
  { type: ELEMENT.h4, children: [{ text: 'Minor' }] },
  { type: ELEMENT.h5, children: [{ text: 'Small' }] },
  { type: ELEMENT.h6, children: [{ text: 'Smallest' }] },
  {
    type: ELEMENT.paragraph,
    children: [
      { text: 'Bold', bold: true },
      { text: ' code', code: true },
      { text: ' high', highlight: '#fef08a' },
      { text: ' colour', color: '#e03131' },
      { type: ELEMENT.link, url: 'https://example.com', children: [{ text: 'link' }] },
      { type: ELEMENT.mention, id: '1', name: 'Alice', children: [{ text: '' }] },
      { type: ELEMENT.date, date: '2026-01-01T00:00:00.000Z', children: [{ text: '' }] },
      { type: ELEMENT.inlineEquation, formula: 'a^2', children: [{ text: '' }] },
      { type: ELEMENT.footnote, note: 'aside', children: [{ text: '' }] },
    ],
  },
  { type: ELEMENT.paragraph, align: 'center', children: [{ text: 'Centred' }] },
  { type: ELEMENT.paragraph, indent: 1, children: [{ text: 'Indented' }] },
  { type: ELEMENT.blockquote, children: [{ text: 'Quote' }] },
  { type: ELEMENT.codeBlock, lang: 'ts', children: [{ text: 'const x = 1;' }] },
  {
    type: ELEMENT.bulletedList,
    listStyle: 'square',
    children: [{ type: ELEMENT.listItem, children: [{ text: 'one' }] }],
  },
  {
    type: ELEMENT.numberedList,
    children: [{ type: ELEMENT.listItem, children: [{ text: 'first' }] }],
  },
  { type: ELEMENT.todoListItem, checked: true, children: [{ text: 'done' }] },
  { type: ELEMENT.todoListItem, checked: false, children: [{ text: 'todo' }] },
  { type: ELEMENT.divider, children: [{ text: '' }] },
  { type: ELEMENT.callout, variant: 'warning', emoji: '⚠️', children: [{ text: 'Careful' }] },
  {
    type: ELEMENT.toggleList,
    open: true,
    children: [
      { type: ELEMENT.paragraph, children: [{ text: 'Summary' }] },
      { type: ELEMENT.paragraph, children: [{ text: 'Body' }] },
    ],
  },
  {
    type: ELEMENT.columns,
    children: [
      {
        type: ELEMENT.column,
        children: [{ type: ELEMENT.paragraph, children: [{ text: 'left' }] }],
      },
      {
        type: ELEMENT.column,
        children: [{ type: ELEMENT.paragraph, children: [{ text: 'right' }] }],
      },
    ],
  },
  {
    type: ELEMENT.table,
    columnWidths: [120, 200],
    children: [
      {
        type: ELEMENT.tableRow,
        children: [
          { type: ELEMENT.tableHeaderCell, children: [{ text: 'Feature' }] },
          { type: ELEMENT.tableHeaderCell, children: [{ text: 'Notes' }] },
        ],
      },
      {
        type: ELEMENT.tableRow,
        children: [
          { type: ELEMENT.tableCell, background: '#d3f9d8', children: [{ text: 'Yes' }] },
          { type: ELEMENT.tableCell, children: [{ text: 'Fine' }] },
        ],
      },
    ],
  },
  { type: ELEMENT.image, url: 'https://example.com/a.png', caption: 'A photo', children: [{ text: '' }] },
  { type: ELEMENT.video, url: 'https://example.com/a.mp4', children: [{ text: '' }] },
  { type: ELEMENT.audio, url: 'https://example.com/a.mp3', children: [{ text: '' }] },
  { type: ELEMENT.file, url: 'https://example.com/a.pdf', caption: 'Spec.pdf', children: [{ text: '' }] },
  { type: ELEMENT.embed, url: 'https://example.com/embed', children: [{ text: '' }] },
  { type: ELEMENT.equation, formula: 'E = mc^2', children: [{ text: '' }] },
] as EditorValue;

/** Strips the empty-text padding Slate requires so trees compare cleanly. */
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    const kept = value
      .map(normalize)
      .filter((n) => !(n && typeof n === 'object' && 'text' in n && n.text === ''));
    return kept.length ? kept : [{ text: '' }];
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalize(v);
    return out;
  }
  return value;
}

/** The property that matters: HTML is a lossless container for a document. */
function roundTrips(name: string, value: EditorValue) {
  it(name, () => {
    const back = deserializeHtml(serializeHtml(value));
    expect(normalize(back)).toEqual(normalize(value));
  });
}

describe('serializeHtml / deserializeHtml round-trip', () => {
  roundTrips('headings', [
    { type: ELEMENT.h1, children: [{ text: 'One' }] },
    { type: ELEMENT.h2, children: [{ text: 'Two' }] },
    { type: ELEMENT.h3, children: [{ text: 'Three' }] },
  ] as EditorValue);

  roundTrips('paragraph with marks', [
    {
      type: ELEMENT.paragraph,
      children: [
        { text: 'plain ' },
        { text: 'bold', bold: true },
        { text: 'italic', italic: true },
        { text: 'code', code: true },
      ],
    },
  ] as EditorValue);

  roundTrips('link keeps its href', [
    {
      type: ELEMENT.paragraph,
      children: [{ type: ELEMENT.link, url: 'https://example.com', children: [{ text: 'go' }] }],
    },
  ] as EditorValue);

  roundTrips('blockquote', [
    { type: ELEMENT.blockquote, children: [{ text: 'quoted' }] },
  ] as EditorValue);

  roundTrips('code block keeps its language', [
    { type: ELEMENT.codeBlock, lang: 'typescript', children: [{ text: 'const x = 1;' }] },
  ] as EditorValue);

  roundTrips('lists', [
    {
      type: ELEMENT.bulletedList,
      children: [
        { type: ELEMENT.listItem, children: [{ text: 'one' }] },
        { type: ELEMENT.listItem, children: [{ text: 'two' }] },
      ],
    },
  ] as EditorValue);

  roundTrips('todo keeps its checked state', [
    { type: ELEMENT.todoListItem, checked: true, children: [{ text: 'done' }] },
  ] as EditorValue);

  roundTrips('callout keeps its variant', [
    { type: ELEMENT.callout, variant: 'warning', children: [{ text: 'careful' }] },
  ] as EditorValue);

  roundTrips('table keeps its structure and widths', [
    {
      type: ELEMENT.table,
      columnWidths: [120, 200],
      children: [
        {
          type: ELEMENT.tableRow,
          children: [
            { type: ELEMENT.tableHeaderCell, children: [{ text: 'Name' }] },
            { type: ELEMENT.tableHeaderCell, children: [{ text: 'Role' }] },
          ],
        },
        {
          type: ELEMENT.tableRow,
          children: [
            { type: ELEMENT.tableCell, children: [{ text: 'Alice' }] },
            { type: ELEMENT.tableCell, children: [{ text: 'Eng' }] },
          ],
        },
      ],
    },
  ] as EditorValue);

  roundTrips('mention keeps its id and name', [
    {
      type: ELEMENT.paragraph,
      children: [
        { text: 'Ping ' },
        { type: ELEMENT.mention, id: '7', name: 'Bob', children: [{ text: '' }] },
      ],
    },
  ] as EditorValue);

  roundTrips('divider', [
    { type: ELEMENT.divider, children: [{ text: '' }] },
  ] as EditorValue);
});

describe('pasting foreign HTML', () => {
  /** What actually arrives on the clipboard from other applications. */
  const types = (value: unknown[]) => value.map((n) => (n as { type?: string }).type ?? 'text');

  it('keeps Google Docs marks, which are inline styles rather than tags', () => {
    const [para] = deserializeHtml(
      '<p><span style="font-weight:700">B</span><span style="font-style:italic">I</span></p>',
    ) as { children: { bold?: boolean; italic?: boolean }[] }[];
    expect(para.children[0].bold).toBe(true);
    expect(para.children[1].italic).toBe(true);
  });

  it('keeps highlight from background-color but ignores plain white', () => {
    const [hl] = deserializeHtml(
      '<p><span style="background-color:#ffff00">x</span></p>',
    ) as { children: { highlight?: string }[] }[];
    expect(hl.children[0].highlight).toBe('#ffff00');

    const [plain] = deserializeHtml(
      '<p><span style="background-color:#ffffff">x</span></p>',
    ) as { children: { highlight?: string }[] }[];
    expect(plain.children[0].highlight).toBeUndefined();
  });

  it('does not collapse a nested web page into one paragraph', () => {
    const value = deserializeHtml(
      '<div><article><h2>Head</h2><p>Body</p><ul><li>one</li></ul></article></div>',
    );
    expect(types(value)).toEqual([ELEMENT.h2, ELEMENT.paragraph, ELEMENT.bulletedList]);
  });

  it('keeps a paragraph whose only child is inline', () => {
    const value = deserializeHtml('<p>see <a href="https://x">this</a></p>');
    expect(types(value)).toEqual([ELEMENT.paragraph]);
  });

  it('reads a table pasted from Google Docs', () => {
    const value = deserializeHtml(
      '<table><tbody><tr><td><p>A</p></td><td><p>B</p></td></tr></tbody></table>',
    );
    expect(types(value)).toEqual([ELEMENT.table]);
  });
});


describe('every mark round-trips', () => {
  const cases: [string, Record<string, unknown>][] = [
    ['bold', { bold: true }],
    ['italic', { italic: true }],
    ['underline', { underline: true }],
    ['strikethrough', { strikethrough: true }],
    ['code', { code: true }],
    ['subscript', { subscript: true }],
    ['superscript', { superscript: true }],
    ['kbd', { kbd: true }],
    ['color', { color: '#ff0000' }],
    ['highlight', { highlight: '#ffff00' }],
  ];

  for (const [name, mark] of cases) {
    it(name, () => {
      const html = serializeHtml([
        { type: ELEMENT.paragraph, children: [{ text: 'x', ...mark }] },
      ] as EditorValue);
      const [para] = deserializeHtml(html) as unknown as { children: Record<string, unknown>[] }[];
      for (const [key, want] of Object.entries(mark)) {
        expect(para.children[0][key]).toBe(want);
      }
    });
  }

  it('keeps every mark when they are stacked on one span', () => {
    const marks = {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      color: '#ff0000',
      highlight: '#ffff00',
    };
    const html = serializeHtml([
      { type: ELEMENT.paragraph, children: [{ text: 'x', ...marks }] },
    ] as EditorValue);
    const [para] = deserializeHtml(html) as unknown as { children: Record<string, unknown>[] }[];
    for (const [key, want] of Object.entries(marks)) {
      expect(para.children[0][key]).toBe(want);
    }
  });
});

describe('document-level integrity', () => {
  it('keeps block order across a mixed document', () => {
    const value = [
      { type: ELEMENT.h1, children: [{ text: '1' }] },
      { type: ELEMENT.paragraph, children: [{ text: '2' }] },
      { type: ELEMENT.divider, children: [{ text: '' }] },
      { type: ELEMENT.h2, children: [{ text: '3' }] },
    ] as EditorValue;
    const back = deserializeHtml(serializeHtml(value)) as { type: string }[];
    expect(back.map((n) => n.type)).toEqual([
      ELEMENT.h1,
      ELEMENT.paragraph,
      ELEMENT.divider,
      ELEMENT.h2,
    ]);
  });

  it('escapes markup in text rather than emitting it', () => {
    const html = serializeHtml([
      { type: ELEMENT.paragraph, children: [{ text: '<script>alert(1)</script>' }] },
    ] as EditorValue);
    expect(html).not.toContain('<script>');
    const [para] = deserializeHtml(html) as { children: { text: string }[] }[];
    expect(para.children[0].text).toBe('<script>alert(1)</script>');
  });

  it('keeps alignment and indent', () => {
    const html = serializeHtml([
      { type: ELEMENT.paragraph, align: 'center', indent: 2, children: [{ text: 'x' }] },
    ] as EditorValue);
    expect(html).toContain('text-align:center');
    expect(html).toContain('margin-left:48px');
  });

  it('drops executable URL schemes', () => {
    const html = serializeHtml([
      {
        type: ELEMENT.paragraph,
        children: [
          { type: ELEMENT.link, url: 'javascript:alert(1)', children: [{ text: 'x' }] },
        ],
      },
    ] as EditorValue);
    expect(html).not.toContain('javascript:');
  });

  it('keeps ordinary URL schemes', () => {
    for (const url of ['https://example.com', 'mailto:a@b.com', '/docs/page']) {
      const html = serializeHtml([
        {
          type: ELEMENT.paragraph,
          children: [{ type: ELEMENT.link, url, children: [{ text: 'x' }] }],
        },
      ] as EditorValue);
      expect(html).toContain(url);
    }
  });
});

describe('serializeHtml element coverage', () => {
  /**
   * Guards the failure mode that made unknown types invisible: anything not
   * handled used to become a paragraph, so a typo in `type` silently lost the
   * element instead of surfacing.
   */
  it('does not emit a block wrapper for an unknown type', () => {
    const html = serializeHtml([
      { type: 'not_a_real_type', children: [{ text: 'kept' }] },
    ] as unknown as EditorValue);
    expect(html).toBe('kept');
  });

  it('emits no style attributes by default, only the stylesheet class', () => {
    const html = serializeHtml([
      { type: ELEMENT.h1, children: [{ text: 'Title' }] },
    ] as EditorValue);
    expect(html).toBe('<h1 class="da-h1">Title</h1>');
  });

  /**
   * Published HTML is styled by the same `styles.css` the editor loads, so the
   * serializer has to write the classes that stylesheet targets — without them
   * a preview renders unstyled however the page is built.
   */
  it('carries the editor class on every block', () => {
    const html = serializeHtml([
      { type: ELEMENT.paragraph, children: [{ text: 'p' }] },
      { type: ELEMENT.blockquote, children: [{ text: 'q' }] },
      {
        type: ELEMENT.bulletedList,
        children: [{ type: ELEMENT.listItem, children: [{ text: 'i' }] }],
      },
      {
        type: ELEMENT.table,
        children: [
          {
            type: ELEMENT.tableRow,
            children: [{ type: ELEMENT.tableCell, children: [{ text: 'c' }] }],
          },
        ],
      },
    ] as EditorValue);

    for (const cls of ['da-p', 'da-blockquote', 'da-ul', 'da-li', 'da-table', 'da-tr', 'da-td']) {
      expect(html).toContain(`class="${cls}"`);
    }
  });

  it('inlines styles when asked, so output renders without the stylesheet', () => {
    const html = serializeHtml(
      [
        { type: ELEMENT.h1, children: [{ text: 'Title' }] },
        { type: ELEMENT.callout, variant: 'warning', children: [{ text: 'Careful' }] },
        {
          type: ELEMENT.table,
          children: [
            {
              type: ELEMENT.tableRow,
              children: [{ type: ELEMENT.tableCell, children: [{ text: 'A' }] }],
            },
          ],
        },
      ] as EditorValue,
      { inlineStyles: true },
    );

    expect(html).toMatch(/<h1 class="da-h1" style="[^"]*font-size:30px/);
    expect(html).toMatch(/data-callout="warning"[^>]*style="[^"]*background:#fef6e7/);
    expect(html).toMatch(/<td class="da-td" style="[^"]*border:1px solid/);
    // No custom properties or color-mix, so it survives in email clients.
    expect(html).not.toMatch(/var\(--|color-mix/);
  });

  it('never puts a double quote inside a style attribute', () => {
    // A font family such as "Segoe UI" would close the attribute early and
    // scatter the rest of the declaration as bogus attributes.
    const html = serializeHtml(
      [
        {
          type: ELEMENT.bulletedList,
          children: [{ type: ELEMENT.listItem, children: [{ text: 'x' }] }],
        },
      ] as EditorValue,
      { inlineStyles: true },
    );
    for (const style of html.match(/style="[^"]*"/g) ?? []) {
      expect(style.slice(7, -1)).not.toContain('"');
    }
  });

  it('inlined styles survive being parsed by a browser', () => {
    const html = serializeHtml(
      [
        {
          type: ELEMENT.bulletedList,
          children: [
            { type: ELEMENT.listItem, children: [{ text: 'a' }] },
            { type: ELEMENT.listItem, children: [{ text: 'b' }] },
          ],
        },
      ] as EditorValue,
      { inlineStyles: true },
    );

    const body = new JSDOM(`<!doctype html><body>${html}</body>`).window.document.body;
    const list = body.querySelector('ul');
    expect(list).not.toBeNull();
    expect(body.querySelectorAll('li')).toHaveLength(2);
    // Anything beyond these means the attribute was terminated early.
    expect([...list!.attributes].map((a) => a.name).sort()).toEqual(['class', 'style']);
  });

  it('inlined output still round-trips', () => {
    const value = [
      { type: ELEMENT.callout, variant: 'success', children: [{ text: 'ok' }] },
    ] as EditorValue;
    const back = deserializeHtml(serializeHtml(value, { inlineStyles: true }));
    expect((back[0] as { type: string }).type).toBe(ELEMENT.callout);
    expect((back[0] as { variant?: string }).variant).toBe('success');
  });

  /**
   * The whole-document guard. Saving as HTML and loading it back is what a CMS
   * does on every edit, so a type the parser cannot read is silent data loss —
   * the document degrades a little more each save. Comparing type counts across
   * a document that uses every block catches that, where a per-feature test
   * only catches the feature someone remembered to add.
   */
  it('keeps every element type across a full-document round-trip', () => {
    const back = deserializeHtml(serializeHtml(DEMO_CONTENT));

    const types = (value: unknown[]): string[] =>
      value.flatMap((node) => {
        const el = node as { type?: string; children?: unknown[] };
        return el.children ? [el.type ?? '', ...types(el.children)] : [];
      });

    const tally = (list: string[]) =>
      list.reduce<Record<string, number>>((acc, key) => {
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});

    expect(tally(types(back))).toEqual(tally(types(DEMO_CONTENT)));
  });

  /**
   * Once through the parser the document has reached its normalized form, so a
   * second save must produce byte-identical HTML. A drift here is a property
   * that survives one save and disappears on the next.
   */
  it('is stable on a second save', () => {
    const once = serializeHtml(deserializeHtml(serializeHtml(DEMO_CONTENT)));
    const twice = serializeHtml(deserializeHtml(once));
    expect(twice).toBe(once);
  });

  it('never nests a block inside a paragraph', () => {
    const html = serializeHtml([
      {
        type: ELEMENT.paragraph,
        children: [{ type: ELEMENT.link, url: 'https://x', children: [{ text: 'go' }] }],
      },
    ] as EditorValue);
    expect(html).not.toMatch(/<p[^>]*>\s*<p/);
  });
});
