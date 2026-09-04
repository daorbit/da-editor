import type { EditorValue } from '../../src';

/**
 * Exercises every block, mark and inline element the editor supports, so the
 * playground doubles as a visual check that each renderer works.
 */
export const DEMO_CONTENT: EditorValue = [
  { type: 'h1', children: [{ text: 'da-editor' }] },
  {
    type: 'p',
    children: [
      { text: 'A rich-text editor built on ' },
      { text: 'Slate', bold: true },
      { text: '. Press ' },
      { text: '/', code: true },
      { text: ' for the block menu, ' },
      { text: '@', code: true },
      { text: ' to mention someone, or select text to see the floating toolbar.' },
    ],
  },

  /* Text formatting */
  { type: 'h2', children: [{ text: 'Text formatting' }] },
  {
    type: 'p',
    children: [
      { text: 'You can write ' },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', ' },
      { text: 'underlined', underline: true },
      { text: ', ' },
      { text: 'struck through', strikethrough: true },
      { text: ', and ' },
      { text: 'inline code', code: true },
      { text: '. Text can be ' },
      { text: 'coloured', color: '#e03131' },
      { text: ', ' },
      { text: 'highlighted', highlight: '#ffec99' },
      { text: ', sized ' },
      { text: 'larger', fontSize: 22 },
      { text: ', or set in a ' },
      { text: 'different font', fontFamily: 'Georgia, serif' },
      { text: '. Also H' },
      { text: '2', subscript: true },
      { text: 'O and E=mc' },
      { text: '2', superscript: true },
      { text: ', plus keys like ' },
      { text: 'Ctrl', kbd: true },
      { text: ' + ' },
      { text: 'S', kbd: true },
      { text: '.' },
    ],
  },

  /* Headings */
  { type: 'h2', children: [{ text: 'Headings' }] },
  { type: 'h3', children: [{ text: 'Heading level 3' }] },
  { type: 'h4', children: [{ text: 'Heading level 4' }] },
  { type: 'h5', children: [{ text: 'Heading level 5' }] },
  { type: 'h6', children: [{ text: 'Heading level 6' }] },

  /* Lists */
  { type: 'h2', children: [{ text: 'Lists' }] },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Bulleted lists, with disc, circle or square markers' }] },
      { type: 'li', children: [{ text: 'Nested indentation using Tab and Shift+Tab' }] },
    ],
  },
  {
    type: 'ol',
    listStyle: 'decimal',
    children: [
      { type: 'li', children: [{ text: 'Numbered lists' }] },
      { type: 'li', children: [{ text: 'With decimal, alpha or roman numbering' }] },
    ],
  },
  { type: 'todo_li', checked: true, children: [{ text: 'A completed to-do item' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'An outstanding to-do item' }] },
  {
    type: 'toggle',
    open: true,
    children: [{ text: 'A toggle list — click the arrow to collapse it' }],
  },

  /* Quote, callout, divider */
  { type: 'h2', children: [{ text: 'Quotes and callouts' }] },
  {
    type: 'blockquote',
    children: [{ text: 'A blockquote, for pulling out a passage worth emphasising.' }],
  },
  {
    type: 'callout',
    variant: 'info',
    emoji: '💡',
    children: [{ text: 'Callouts come in info, warning, success and danger variants.' }],
  },
  {
    type: 'callout',
    variant: 'warning',
    emoji: '⚠️',
    children: [{ text: 'This one warns about something.' }],
  },
  { type: 'hr', children: [{ text: '' }] },

  /* Code */
  { type: 'h2', children: [{ text: 'Code blocks' }] },
  {
    type: 'p',
    children: [
      { text: 'Code blocks are syntax highlighted, with a language picker and a copy button.' },
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

const greet = (name: string): string => {
  // Template literals highlight correctly.
  return \`Hello, \${name}!\`;
};

export default greet;`,
      },
    ],
  },

  /* Links and inline elements */
  { type: 'h2', children: [{ text: 'Links, mentions and emoji' }] },
  {
    type: 'p',
    children: [
      { text: 'Create ' },
      {
        type: 'a',
        url: 'https://docs.slatejs.org',
        children: [{ text: 'links' }],
      },
      { text: ', mention ' },
      { type: 'mention', id: '1', name: 'Alice Chen', children: [{ text: '' }] },
      { text: ' or ' },
      { type: 'mention', id: '2', name: 'Bob Martin', children: [{ text: '' }] },
      { text: ', and insert emoji 🎉 ✨ 🚀 from the picker.' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Inline elements include a date ' },
      { type: 'date', date: new Date().toISOString(), children: [{ text: '' }] },
      { text: ' an equation ' },
      { type: 'inline_equation', formula: 'a² + b² = c²', children: [{ text: '' }] },
      { text: ' and a footnote' },
      { type: 'footnote', note: 'Footnotes hold a short aside.', children: [{ text: '' }] },
      { text: '.' },
    ],
  },

  /* Tables */
  { type: 'h2', children: [{ text: 'Tables' }] },
  {
    type: 'p',
    children: [
      { text: 'Click inside a table to get controls for rows, columns, cell colour and borders.' },
    ],
  },
  {
    type: 'table',
    columnWidths: [180, 150, 150, 160],
    children: [
      {
        type: 'tr',
        children: [
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Feature' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Status' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Owner' }] }] },
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
            children: [{ type: 'p', children: [{ text: '✅ Done' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Alice' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Rows, columns, borders' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Media' }] }] },
          {
            type: 'td',
            background: '#d3f9d8',
            children: [{ type: 'p', children: [{ text: '✅ Done' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Bob' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Image, video, audio, files' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'AI streaming' }] }] },
          {
            type: 'td',
            background: '#fff3bf',
            children: [{ type: 'p', children: [{ text: '🚧 Planned' }] }],
          },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Priya' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Needs a backend route' }] }] },
        ],
      },
    ],
  },

  /* Media */
  { type: 'h2', children: [{ text: 'Media' }] },
  {
    type: 'p',
    children: [{ text: 'Select any media block for controls to edit its link, caption or delete it.' }],
  },
  {
    type: 'img',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    caption: 'Images support captions.',
    children: [{ text: '' }],
  },
  {
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    children: [{ text: '' }],
  },
  {
    type: 'audio',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    children: [{ text: '' }],
  },
  {
    type: 'file',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'sample.pdf',
    children: [{ text: '' }],
  },
  {
    type: 'embed',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    children: [{ text: '' }],
  },

  /* Layout */
  { type: 'h2', children: [{ text: 'Columns and alignment' }] },
  {
    type: 'columns',
    children: [
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'The first column.' }] }],
      },
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'The second column.' }] }],
      },
      {
        type: 'column',
        children: [{ type: 'p', children: [{ text: 'The third column.' }] }],
      },
    ],
  },
  { type: 'p', align: 'center', children: [{ text: 'This paragraph is centred.' }] },
  { type: 'p', align: 'right', children: [{ text: 'This one is aligned right.' }] },
  { type: 'p', indent: 1, children: [{ text: 'And this one is indented.' }] },

  /* Equation */
  { type: 'h2', children: [{ text: 'Equations' }] },
  { type: 'equation', formula: 'E = mc²', children: [{ text: '' }] },

  /* Markdown shortcuts */
  { type: 'h2', children: [{ text: 'Markdown shortcuts' }] },
  {
    type: 'p',
    children: [
      { text: 'Type ' },
      { text: '# ', code: true },
      { text: ' for a heading, ' },
      { text: '- ', code: true },
      { text: ' for a list, ' },
      { text: '> ', code: true },
      { text: ' for a quote, ' },
      { text: '``` ', code: true },
      { text: ' for a code block, or ' },
      { text: '**bold**', code: true },
      { text: ' inline. Typing ' },
      { text: '--', code: true },
      { text: ' becomes an em dash.' },
    ],
  },

  { type: 'p', children: [{ text: '' }] },
];
