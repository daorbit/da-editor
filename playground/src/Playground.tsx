import { useRef, useState } from 'react';
import {
  DaEditor,
  type DaEditorHandle,
  type EditorValue,
  type Mentionable,
  type Theme,
} from '../../src';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
  { id: '4', name: 'Diego Alvarez', detail: 'diego@example.com' },
  { id: '5', name: 'Yuki Tanaka', detail: 'yuki@example.com' },
];

const INITIAL: EditorValue = [
  { type: 'h1', children: [{ text: 'Welcome to the playground' }] },
  {
    type: 'p',
    children: [
      { text: 'A rich-text editor built on ' },
      { text: 'Slate', bold: true },
      { text: '. Press ' },
      { text: '/', code: true },
      { text: ' for the block menu, ' },
      { text: '@', code: true },
      { text: ' to mention someone, or select text for the floating toolbar.' },
    ],
  },
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
      { text: ' for a quote, or ' },
      { text: '**bold**', code: true },
      { text: ' inline.' },
    ],
  },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Bulleted and numbered lists' }] },
      { type: 'li', children: [{ text: 'To-do items with checkboxes' }] },
      { type: 'li', children: [{ text: 'Tables, media, mentions and emoji' }] },
    ],
  },
  { type: 'todo_li', checked: true, children: [{ text: 'Ship dark mode' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Ship AI integration' }] },
  {
    type: 'callout',
    variant: 'info',
    children: [{ text: 'Callouts support info, warning, success and danger variants.' }],
  },
  { type: 'h2', children: [{ text: 'Tables' }] },
  {
    type: 'table',
    columnWidths: [200, 160, 160],
    children: [
      {
        type: 'tr',
        children: [
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Feature' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Status' }] }] },
          { type: 'th', children: [{ type: 'p', children: [{ text: 'Owner' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Tables' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: '✅ Done' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Alice' }] }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ type: 'p', children: [{ text: 'AI streaming' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: '🚧 Planned' }] }] },
          { type: 'td', children: [{ type: 'p', children: [{ text: 'Bob' }] }] },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
];

export function Playground() {
  const ref = useRef<DaEditorHandle>(null);
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div className="pg-editor-page">
      <DaEditor
        ref={ref}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
        }
        defaultValue={INITIAL}
        className="pg-editor-fill"
        minHeight="100%"
        maxWidth="820px"
        autoFocus
        mentionables={MENTIONABLES}
        onAskAi={() => window.alert('Ask AI — wire this to your own endpoint.')}
        onComment={() => window.alert('Comment — wire this to your own store.')}
      />
    </div>
  );
}
