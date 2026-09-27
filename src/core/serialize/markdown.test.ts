import { describe, expect, it } from 'vitest';
import { serializeMarkdown } from './markdown';
import { parseMarkdown } from '../io';
import { ELEMENT, type EditorValue } from '../types';

describe('serializeMarkdown', () => {
  it('numbers ordered list items', () => {
    const value: EditorValue = [
      {
        type: ELEMENT.numberedList,
        children: [
          { type: ELEMENT.listItem, children: [{ text: 'One' }] },
          { type: ELEMENT.listItem, children: [{ text: 'Two' }] },
        ],
      },
    ];
    expect(serializeMarkdown(value)).toBe('1. One\n2. Two');
  });

  it('writes every heading level', () => {
    const value: EditorValue = [
      { type: ELEMENT.h4, children: [{ text: 'Four' }] },
      { type: ELEMENT.h6, children: [{ text: 'Six' }] },
    ];
    expect(serializeMarkdown(value)).toBe('#### Four\n\n###### Six');
  });

  it('writes tables as GFM tables', () => {
    const value: EditorValue = [
      {
        type: ELEMENT.table,
        children: [
          {
            type: ELEMENT.tableRow,
            children: [
              { type: ELEMENT.tableHeaderCell, children: [{ type: ELEMENT.paragraph, children: [{ text: 'A' }] }] },
              { type: ELEMENT.tableHeaderCell, children: [{ type: ELEMENT.paragraph, children: [{ text: 'B' }] }] },
            ],
          },
          {
            type: ELEMENT.tableRow,
            children: [
              { type: ELEMENT.tableCell, children: [{ type: ELEMENT.paragraph, children: [{ text: '1' }] }] },
              { type: ELEMENT.tableCell, children: [{ type: ELEMENT.paragraph, children: [{ text: 'x|y' }] }] },
            ],
          },
        ],
      },
    ];
    expect(serializeMarkdown(value)).toBe('| A | B |\n| --- | --- |\n| 1 | x\\|y |');
  });
});

describe('parseMarkdown', () => {
  it('round-trips lists, headings, tables and images', () => {
    const markdown = [
      '#### Four',
      '1. One\n2. Two',
      '- [x] Done',
      '| A | B |\n| --- | --- |\n| 1 | x\\|y |',
      '![Alt text](https://example.com/a.png)',
      '**Bold** and __under__',
    ].join('\n\n');

    expect(serializeMarkdown(parseMarkdown(markdown))).toBe(markdown);
  });

  it('drops unsafe link and image URLs', () => {
    const value = parseMarkdown('![x](javascript:alert(1))\n\n[click](javascript:alert(1))');
    expect(JSON.stringify(value)).not.toContain('javascript:');
  });
});
