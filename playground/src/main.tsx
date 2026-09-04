import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DaEditor,
  MoonIcon,
  SunIcon,
  type DaEditorHandle,
  type EditorValue,
  type Theme,
} from '../../src';

const INITIAL: EditorValue = [
  { type: 'h1', children: [{ text: 'Welcome to the da-editor playground' }] },
  {
    type: 'p',
    children: [
      { text: 'A rich-text editor built on ' },
      { text: 'Slate', bold: true },
      { text: '. Try ' },
      { text: '/', code: true },
      { text: ' for the block menu, or select text for the floating toolbar.' },
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
  { type: 'ul', children: [
    { type: 'li', children: [{ text: 'Bulleted and numbered lists' }] },
    { type: 'li', children: [{ text: 'To-do items with checkboxes' }] },
    { type: 'li', children: [{ text: 'Callouts, code blocks, dividers' }] },
  ] },
  { type: 'todo_li', checked: true, children: [{ text: 'Ship dark mode' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Ship AI integration' }] },
  {
    type: 'callout',
    variant: 'info',
    children: [{ text: 'Callouts support info, warning, success and danger variants.' }],
  },
  { type: 'p', children: [{ text: '' }] },
];

function App() {
  const ref = useRef<DaEditorHandle>(null);
  const [theme, setTheme] = useState<Theme>('system');
  const [tab, setTab] = useState<'html' | 'markdown' | 'json'>('html');
  const [output, setOutput] = useState('');

  const refresh = (next: typeof tab) => {
    setTab(next);
    const handle = ref.current;
    if (!handle) return;
    setOutput(
      next === 'html'
        ? handle.getHTML()
        : next === 'markdown'
          ? handle.getMarkdown()
          : JSON.stringify(handle.getValue(), null, 2),
    );
  };

  return (
    <main style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>@da/editor</h1>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer' }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <DaEditor
        ref={ref}
        theme={theme}
        defaultValue={INITIAL}
        onAskAi={() => window.alert('Ask AI — wire this to your own endpoint.')}
        onChange={() => refresh(tab)}
        maxWidth="720px"
      />

      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        {(['html', 'markdown', 'json'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => refresh(key)}
            style={{ padding: '6px 12px', cursor: 'pointer', fontWeight: tab === key ? 700 : 400 }}
          >
            {key}
          </button>
        ))}
      </div>

      <pre style={{ background: '#f6f7f9', padding: 14, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 12 }}>
        {output || 'Click a tab to serialize the document.'}
      </pre>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
