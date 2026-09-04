import { useRef, useState } from 'react';
import {
  DaEditor,
  MoonIcon,
  SunIcon,
  type DaEditorHandle,
  type EditorValue,
  type Theme,
} from '../../src';
import type { Route } from './router';

const INITIAL: EditorValue = [
  { type: 'h1', children: [{ text: 'Welcome to the playground' }] },
  {
    type: 'p',
    children: [
      { text: 'A rich-text editor built on ' },
      { text: 'Slate', bold: true },
      { text: '. Press ' },
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
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Bulleted and numbered lists' }] },
      { type: 'li', children: [{ text: 'To-do items with checkboxes' }] },
      { type: 'li', children: [{ text: 'Callouts, code blocks and dividers' }] },
    ],
  },
  { type: 'todo_li', checked: true, children: [{ text: 'Ship dark mode' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Ship AI integration' }] },
  {
    type: 'callout',
    variant: 'info',
    children: [{ text: 'Callouts support info, warning, success and danger variants.' }],
  },
  { type: 'p', children: [{ text: '' }] },
];

type Tab = 'html' | 'markdown' | 'json';

export interface PlaygroundProps {
  navigate: (route: Route) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Playground({ navigate, theme, onToggleTheme }: PlaygroundProps) {
  const ref = useRef<DaEditorHandle>(null);
  const [tab, setTab] = useState<Tab>('html');
  const [output, setOutput] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  const dark = theme === 'dark';

  const serialize = (next: Tab) => {
    const handle = ref.current;
    if (!handle) return;
    setTab(next);
    setOutput(
      next === 'html'
        ? handle.getHTML()
        : next === 'markdown'
          ? handle.getMarkdown()
          : JSON.stringify(handle.getValue(), null, 2),
    );
  };

  return (
    <div className="pg-editor-page">
      <header className="pg-nav pg-nav--bar">
        <button type="button" className="pg-link" onClick={() => navigate('/')}>
          ← @da/editor
        </button>
        <div className="pg-nav__actions">
          <button
            type="button"
            className="pg-btn pg-btn--ghost"
            onClick={() => {
              setPanelOpen((open) => !open);
              if (!panelOpen) serialize(tab);
            }}
          >
            {panelOpen ? 'Hide output' : 'Show output'}
          </button>
          <button type="button" className="pg-btn pg-btn--ghost" onClick={onToggleTheme}>
            {dark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <div className={`pg-editor-body${panelOpen ? ' pg-editor-body--split' : ''}`}>
        <div className="pg-editor-main">
          <DaEditor
            ref={ref}
            theme={theme}
            defaultValue={INITIAL}
            className="pg-editor-fill"
            minHeight="100%"
            maxWidth="760px"
            autoFocus
            onAskAi={() => window.alert('Ask AI — wire this to your own endpoint.')}
            onChange={() => panelOpen && serialize(tab)}
          />
        </div>

        {panelOpen && (
          <aside className="pg-panel">
            <div className="pg-panel__tabs">
              {(['html', 'markdown', 'json'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`pg-tab${tab === key ? ' pg-tab--active' : ''}`}
                  onClick={() => serialize(key)}
                >
                  {key}
                </button>
              ))}
            </div>
            <pre className="pg-panel__output">
              <code>{output}</code>
            </pre>
          </aside>
        )}
      </div>
    </div>
  );
}
