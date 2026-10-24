import { describe, expect, it } from 'vitest';
import { isRenderedSource, looksLikeHtml } from './smartPaste';

describe('looksLikeHtml', () => {
  it('accepts content markup', () => {
    expect(looksLikeHtml('<h2>Title</h2>\n<table><tr><td>A</td></tr></table>')).toBe(true);
    expect(looksLikeHtml('<!doctype html><html><body><p>Hi</p></body></html>')).toBe(true);
  });

  it('rejects JSX and component code', () => {
    expect(looksLikeHtml('<div className="card">{title}</div>')).toBe(false);
    expect(looksLikeHtml('<Button onClick={go}>Go</Button>')).toBe(false);
  });

  it('rejects plain text and unknown tags', () => {
    expect(looksLikeHtml('Use <b> for bold')).toBe(false);
    expect(looksLikeHtml('<foo-widget></foo-widget><bar-thing></bar-thing>')).toBe(false);
  });
});

describe('isRenderedSource', () => {
  it('spots HTML source shown in a code viewer', () => {
    const plain = '<p>Hello</p>\n<p>World</p>';
    const html = '<pre><span>&lt;p&gt;Hello&lt;/p&gt;</span></pre>';
    expect(isRenderedSource(html, plain)).toBe(true);
  });

  it('spots Markdown copied from a code block', () => {
    const plain = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    expect(isRenderedSource(`<pre><code>${plain}</code></pre>`, plain)).toBe(true);
  });

  it('leaves ordinary rich text alone', () => {
    expect(isRenderedSource('<p><strong>Hello</strong></p>', 'Hello')).toBe(false);
  });
});
