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

  it('emits no style attributes by default', () => {
    const html = serializeHtml([
      { type: ELEMENT.h1, children: [{ text: 'Title' }] },
    ] as EditorValue);
    expect(html).toBe('<h1>Title</h1>');
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

    expect(html).toMatch(/<h1 style="[^"]*font-size:30px/);
    expect(html).toMatch(/<div data-callout="warning" style="[^"]*background:#fef6e7/);
    expect(html).toMatch(/<td style="[^"]*border:1px solid/);
    // No custom properties or color-mix, so it survives in email clients.
    expect(html).not.toMatch(/var\(--|color-mix/);
  });

  it('inlined output still round-trips', () => {
    const value = [
      { type: ELEMENT.callout, variant: 'success', children: [{ text: 'ok' }] },
    ] as EditorValue;
    const back = deserializeHtml(serializeHtml(value, { inlineStyles: true }));
    expect((back[0] as { type: string }).type).toBe(ELEMENT.callout);
    expect((back[0] as { variant?: string }).variant).toBe('success');
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
