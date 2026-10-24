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

  it('keeps underscores inside words as text', () => {
    const [paragraph] = parseMarkdown('Set SMTP_FROM_NAME and _this_');
    expect(paragraph).toEqual({
      type: ELEMENT.paragraph,
      children: [{ text: 'Set SMTP_FROM_NAME and ' }, { text: 'this', italic: true }],
    });
  });

  it('reads indented and tilde code fences with a language', () => {
    const value = parseMarkdown('  ```JavaScript\nconst a = 1;\n  ```\n\n~~~bash\nnpm i\n~~~');
    expect(value).toEqual([
      { type: ELEMENT.codeBlock, lang: 'javascript', children: [{ text: 'const a = 1;' }] },
      { type: ELEMENT.codeBlock, lang: 'bash', children: [{ text: 'npm i' }] },
    ]);
  });

  it('reads a code block file name from the fence', () => {
    const [named, bare] = parseMarkdown('```python title="mailer.py"\nimport os\n```\n\n```js send-test.mjs\nrun()\n```');
    expect(named).toEqual({ type: ELEMENT.codeBlock, lang: 'python', title: 'mailer.py', children: [{ text: 'import os' }] });
    expect(bare).toEqual({ type: ELEMENT.codeBlock, lang: 'js', title: 'send-test.mjs', children: [{ text: 'run()' }] });
    expect(serializeMarkdown([named])).toBe('```python title="mailer.py"\nimport os\n```');
  });

  it('turns GitHub alerts into callouts', () => {
    const [callout] = parseMarkdown('> [!WARNING]\n> Shown **once**.\n> Copy it now.');
    expect(callout).toEqual({
      type: ELEMENT.callout,
      variant: 'warning',
      children: [{ text: 'Shown ' }, { text: 'once', bold: true }, { text: '. Copy it now.' }],
    });
  });

  it('keeps nested list indentation', () => {
    const [list] = parseMarkdown('- One\n  - Two');
    expect(list).toEqual({
      type: ELEMENT.bulletedList,
      children: [
        { type: ELEMENT.listItem, children: [{ text: 'One' }] },
        { type: ELEMENT.listItem, indent: 1, children: [{ text: 'Two' }] },
      ],
    });
  });

  it('builds a table with inline code from pasted Markdown', () => {
    const [table] = parseMarkdown('| Setting | Value |\n| --- | --- |\n| Server | `smtp.gmail.com` |');
    expect(table).toMatchObject({
      type: ELEMENT.table,
      children: [
        { type: ELEMENT.tableRow, children: [{ type: ELEMENT.tableHeaderCell }, { type: ELEMENT.tableHeaderCell }] },
        {
          type: ELEMENT.tableRow,
          children: [
            { type: ELEMENT.tableCell },
            {
              type: ELEMENT.tableCell,
              children: [{ type: ELEMENT.paragraph, children: [{ text: 'smtp.gmail.com', code: true }] }],
            },
          ],
        },
      ],
    });
  });

  it('drops unsafe link and image URLs', () => {
    const value = parseMarkdown('![x](javascript:alert(1))\n\n[click](javascript:alert(1))');
    expect(JSON.stringify(value)).not.toContain('javascript:');
  });
});
