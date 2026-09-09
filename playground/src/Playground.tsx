import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  DaEditor,
  type DaEditorHandle,
  type Mentionable,
  type Theme,
} from '../../src';
import { DEMO_CONTENT } from './demoContent';
import { AiWorkspace, type AiWorkspaceHandle } from './ai';
import { loadSpellEngine } from './spellEngine';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
  { id: '4', name: 'Diego Alvarez', detail: 'diego@example.com' },
  { id: '5', name: 'Yuki Tanaka', detail: 'yuki@example.com' },
];

export function Playground({ navigate }: { navigate: (to: string) => void }) {
  const ref = useRef<DaEditorHandle>(null);
  const aiRef = useRef<AiWorkspaceHandle>(null);
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div className="pg-editor-page">
      <AiWorkspace
        getEditor={() => ref.current}
        theme={theme === 'dark' ? 'dark' : 'light'}
        handleRef={aiRef}
      >
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
              <ArrowLeft size={16} />
            </button>
          }
          defaultValue={DEMO_CONTENT}
          className="pg-editor-fill"
          minHeight="0"
          maxWidth="1100px"
          autoFocus
          spellCheck
          spellCheckEngine={loadSpellEngine}
          wordCount
          preview={true}
          lintPanel
          smartPaste
          fixedToolbar
          floatingToolbar
          slashMenu
          emoji
          autoformat
          toasts
          mentionables={MENTIONABLES}
          onAskAi={() => aiRef.current?.open()}
          onUpload={async (file) => URL.createObjectURL(file)}
          onPickMedia={async (kind) => {
            const url = window.prompt(`Paste a ${kind} URL`);
            return url ? { url } : null;
          }}
          onClearAll={true}
          onFetchLinkMeta={async (url) => {
            let host = url;
            try {
              host = new URL(url).hostname.replace(/^www\./, '');
            } catch {
              /* keep raw */
            }
            return {
              title: `Preview title — ${host}`,
              description:
                'Placeholder open-graph description so the card renders in the playground. Wire a real fetch in your app.',
              siteName: host,
            };
          }}
        />
      </AiWorkspace>

    </div>
  );
}
