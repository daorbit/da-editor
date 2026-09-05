import type { EditorValue } from '../../src';

/**
 * A real-feeling blog post that exercises every block, mark and inline
 * element the editor supports, in context, rather than as a feature list.
 */
export const DEMO_CONTENT: EditorValue = [
  { type: 'h1', children: [{ text: 'Building a rich-text editor people actually enjoy using' }] },
  {
    type: 'p',
    children: [
      { text: 'By ' },
      { type: 'mention', id: '1', name: 'Alice Chen', children: [{ text: '' }] },
      { text: '  ·  ' },
      { type: 'date', date: new Date().toISOString(), children: [{ text: '' }] },
      { text: '  ·  6 min read' },
    ],
  },
  {
    type: 'callout',
    variant: 'info',
    emoji: '✍️',
    children: [
      {
        text: 'This post was written entirely in da-editor. Press ',
      },
      { text: '/', code: true },
      { text: ' anywhere to open the block menu, or select text to bring up the floating toolbar.' },
    ],
  },

  { type: 'hr', children: [{ text: '' }] },

  {
    type: 'p',
    children: [
      { text: 'Most editors treat rich text as an afterthought — a ' },
      { text: 'textarea', code: true },
      { text: ' with a few buttons bolted on. We wanted something ' },
      { text: 'different', italic: true },
      { text: ': an editor that feels as ' },
      { text: 'considered', bold: true },
      { text: ' as the writing tools people already love, but that ships as a ' },
      { text: 'drop-in React component', underline: true },
      { text: '.' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'That meant getting the small things right — the kind of details that are ' },
      { text: 'easy to skip', strikethrough: true },
      { text: ' impossible to skip if you want the editor to feel professional: cursor placement, ' },
      { text: 'keyboard shortcuts', kbd: true },
      { text: ' like ' },
      { text: 'Ctrl', kbd: true },
      { text: ' + ' },
      { text: 'B', kbd: true },
      { text: ', autoformatting as you type, and a toolbar that never gets in your way.' },
    ],
  },

  { type: 'h2', children: [{ text: 'Formatting that stays out of your way' }] },
  {
    type: 'p',
    children: [
      { text: 'Selecting text brings up a floating toolbar for ' },
      { text: 'bold', bold: true },
      { text: ', italic and underline, plus less common needs — ' },
      { text: 'coloured text', color: '#e03131' },
      { text: ', ' },
      { text: 'highlights', highlight: '#ffec99' },
      { text: ', a ' },
      { text: 'larger', fontSize: 22 },
      { text: ' size, or an entirely ' },
      { text: 'different typeface', fontFamily: 'Georgia, serif' },
      { text: ' for a pull quote. Scientific notation works too: H' },
      { text: '2', subscript: true },
      { text: 'O, or E = mc' },
      { text: '2', superscript: true },
      { text: '.' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Headings collapse cleanly from a title down to the smallest label:' },
    ],
  },
  { type: 'h3', children: [{ text: 'A section heading (H3)' }] },
  { type: 'h4', children: [{ text: 'A subsection (H4)' }] },
  { type: 'h5', children: [{ text: 'A minor heading (H5)' }] },
  { type: 'h6', children: [{ text: 'The smallest heading (H6)' }] },

  { type: 'h2', children: [{ text: 'Lists, tasks and structure' }] },
  {
    type: 'p',
    children: [{ text: 'Every writing tool needs solid list support. Ours covers the basics:' }],
  },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Bulleted lists, with disc, circle or square markers' }] },
      { type: 'li', children: [{ text: 'Nested indentation with Tab and Shift+Tab' }] },
    ],
  },
  {
    type: 'ol',
    listStyle: 'decimal',
    children: [
      { type: 'li', children: [{ text: 'Numbered steps, for anything sequential' }] },
      { type: 'li', children: [{ text: 'Switchable between decimal, alpha or roman numbering' }] },
    ],
  },
  { type: 'p', children: [{ text: 'And a running punch list for what shipped this release:' }] },
  { type: 'todo_li', checked: true, children: [{ text: 'Floating toolbar with font size control' }] },
  { type: 'todo_li', checked: true, children: [{ text: 'Table cell colour and border editing' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Real-time collaborative cursors' }] },
  {
    type: 'toggle',
    open: false,
    children: [{ text: 'Why we chose Slate as the underlying engine' }],
  },

  { type: 'h2', children: [{ text: 'Code, quotes and asides' }] },
  {
    type: 'p',
    children: [
      { text: 'Code blocks are syntax highlighted, with a language picker and a one-click copy button:' },
    ],
  },
  {
    type: 'code_block',
    lang: 'typescript',
    children: [
      {
        text: `interface Editor {
  /** Serializes the document to HTML. */
  getHTML(): string;
}

const publish = (title: string): string => {
  // Template literals highlight correctly.
  return \`Published: "\${title}"\`;
};

export default publish;`,
      },
    ],
  },
  {
    type: 'blockquote',
    children: [
      {
        text: 'Good software is invisible until the moment you need it — then it does exactly what you expected.',
      },
    ],
  },
  {
    type: 'callout',
    variant: 'warning',
    emoji: '⚠️',
    children: [{ text: 'Import from Word can lose complex nested tables — export to HTML first if you hit issues.' }],
  },
  {
    type: 'callout',
    variant: 'success',
    emoji: '✅',
    children: [{ text: 'Autosave runs on every change, so a dropped connection never costs you a paragraph.' }],
  },

  { type: 'h2', children: [{ text: 'Comparing the alternatives' }] },
  {
    type: 'p',
    children: [{ text: "Here's how da-editor stacks up against a couple of common approaches:" }],
  },
  {
    type: 'table',
    columnWidths: [180, 150, 150, 160],
    children: [
      {
        type: 'tr',
        children: [
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Feature' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'da-editor' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Plain textarea' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Notes' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Tables' }] }] },
          {
            type: 'td',
            background: '#d3f9d8',
            children: [{ type: 'p', children: [{ text: '✅ Built in' }] }],
          },
          {
            type: 'td',
            background: '#ffe3e3',
            children: [{ type: 'p', children: [{ text: '❌ None' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Rows, columns, cell colour and borders' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Media embeds' }] }] },
          {
            type: 'td',
            background: '#d3f9d8',
            children: [{ type: 'p', children: [{ text: '✅ Built in' }] }],
          },
          {
            type: 'td',
            background: '#ffe3e3',
            children: [{ type: 'p', children: [{ text: '❌ None' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Image, video, audio, files and iframes' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Bundle size' }] }] },
          {
            type: 'td',
            background: '#fff3bf',
            children: [{ type: 'p', children: [{ text: '🟡 Moderate' }] }],
          },
          {
            type: 'td',
            background: '#d3f9d8',
            children: [{ type: 'p', children: [{ text: '✅ Tiny' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Trade-off for the feature set' }] }] },
        ],
      },
    ],
  },

  { type: 'h2', children: [{ text: 'Links, mentions and media' }] },
  {
    type: 'p',
    children: [
      { text: 'Paste a ' },
      {
        type: 'a',
        url: 'https://docs.slatejs.org',
        children: [{ text: 'link' }],
      },
      { text: ', ' },
      { text: '@', code: true },
      { text: '-mention a teammate like ' },
      { type: 'mention', id: '2', name: 'Bob Martin', children: [{ text: '' }] },
      { text: ', or drop in an emoji from the picker 🎉 ✨ 🚀.' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Inline math renders as you type it, e.g. ' },
      { type: 'inline_equation', formula: 'a² + b² = c²', children: [{ text: '' }] },
      { text: ', and asides collapse into a footnote' },
      { type: 'footnote', note: 'Footnotes keep tangents out of the main flow of the text.', children: [{ text: '' }] },
      { text: ' instead of interrupting the paragraph.' },
    ],
  },
  {
    type: 'img',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    caption: 'Every image block carries its own caption, alignment and size controls.',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Video and audio embed inline too, so a walkthrough never needs to leave the page:' }],
  },
  {
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    children: [{ text: '' }],
  },
  {
    type: 'embed',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    children: [{ text: '' }],
  },

  { type: 'h2', children: [{ text: 'Layout, when you need it' }] },
  {
    type: 'p',
    children: [{ text: 'Most paragraphs are just paragraphs. But sometimes a layout helps:' }],
  },
  {
    type: 'columns',
    children: [
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'Fast to build.' }] }],
      },
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'Easy to theme.' }] }],
      },
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'Ready for production.' }] }],
      },
    ],
  },
  { type: 'p', align: 'center', children: [{ text: '— centred, for emphasis —' }] },
  { type: 'p', indent: 1, children: [{ text: 'And indented, for a nested aside like this one.' }] },

  { type: 'h2', children: [{ text: 'Try the shortcuts yourself' }] },
  {
    type: 'p',
    children: [
      { text: 'Type ' },
      { text: '# ', code: true },
      { text: 'for a heading, ' },
      { text: '- ', code: true },
      { text: 'for a list, ' },
      { text: '> ', code: true },
      { text: 'for a quote, ' },
      { text: '``` ', code: true },
      { text: 'for a code block, or wrap text in ' },
      { text: '**bold**', code: true },
      { text: '. Typing ' },
      { text: '--', code: true },
      { text: ' becomes an em dash — try it on this line.' },
    ],
  },

  { type: 'p', children: [{ text: '' }] },
];

/**
 * A deliberately short document for the homepage demo frame, which is only
 * tall enough for a few blocks. Shows range without needing to be scrolled.
 */
export const HERO_CONTENT: EditorValue = [
  {
    type: 'h2',
    children: [{ text: 'Try it — this editor is live' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Select this text to see the floating toolbar. Everything works: ' },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', ' },
      { text: 'code', code: true },
      { text: ', and ' },
      { text: 'highlight', highlight: '#fde68a' },
      { text: '.' },
    ],
  },
  {
    type: 'callout',
    variant: 'info',
    children: [
      {
        text: 'Press / on an empty line for the block menu, or @ to mention someone.',
      },
    ],
  },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Type - or * to start a list like this one' }] },
      { type: 'li', children: [{ text: 'Type # for a heading, > for a quote' }] },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
];
