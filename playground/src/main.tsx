import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor, type EditorHandle } from '../../src';

function App() {
  const [html, setHtml] = useState('<h2>@da/editor</h2><p>Start typing…</p>');
  const editorRef = useRef<EditorHandle>(null);

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h1>@da/editor playground</h1>
      <Editor ref={editorRef} value={html} onChange={setHtml} />
      <button type="button" onClick={() => editorRef.current?.focus()} style={{ marginTop: 12 }}>
        Focus editor
      </button>
      <h2>HTML output</h2>
      <pre style={{ background: '#f6f7f9', padding: 12, whiteSpace: 'pre-wrap' }}>{html}</pre>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
