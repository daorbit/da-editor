import { useRef, useState } from 'react';
import {
  AlertDialog,
  ArrowLeftIcon,
  DaEditor,
  type DaEditorHandle,
  type Mentionable,
  type Theme,
} from '../../src';
import { DEMO_CONTENT } from './demoContent';
import type { Route } from './router';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
  { id: '4', name: 'Diego Alvarez', detail: 'diego@example.com' },
  { id: '5', name: 'Yuki Tanaka', detail: 'yuki@example.com' },
];

export function Playground({ navigate }: { navigate: (next: Route) => void }) {
  const ref = useRef<DaEditorHandle>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="pg-editor-page">
      <DaEditor
        ref={ref}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
        }
        toolbarLeading={
          <button
            type="button"
            className="da-tb__btn"
            title="Back to home"
            aria-label="Back to home"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => navigate('/')}
          >
            <ArrowLeftIcon />
          </button>
        }
        defaultValue={DEMO_CONTENT}
        className="pg-editor-fill"
        minHeight="0"
        maxWidth="1100px"
        autoFocus
        wordCount
        mentionables={MENTIONABLES}
        onAskAi={() => setNotice('Wire this to your own endpoint.')}
      />

      <AlertDialog
        message={notice}
        title="Ask AI"
        theme={theme === 'dark' ? 'dark' : 'light'}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
