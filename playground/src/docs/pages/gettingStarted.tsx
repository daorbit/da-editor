import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Callout, DocCards, DocCode, DocH2, DocLead, Inline, List, Step, Steps } from '../primitives';
import { INSTALL } from '../content';

export const GETTING_STARTED_PAGES: Record<string, () => ReactNode> = {
  introduction: () => (
    <>
      <DocLead>
        <strong>da-text-editor</strong> is a complete rich text editor for React.
        Tables, mentions, slash commands, media, find &amp; replace, smart paste and
        Markdown shortcuts all work on the first render, with no plugins to install
        or wire together.
      </DocLead>

      <DocH2>What you get</DocH2>
      <List>
        <li>
          <strong>One component</strong>, <Inline>&lt;DaEditor /&gt;</Inline>, and{' '}
          <strong>one stylesheet</strong>.
        </li>
        <li>
          <strong>Every common block</strong>: headings, lists, to-dos, toggles, quotes,
          callouts, code with syntax highlighting, tables, columns, images, video,
          audio, files and embeds.
        </li>
        <li>
          <strong>Three ways to format</strong>: a fixed toolbar, a floating toolbar on
          selection and a <Inline>/</Inline> slash menu.
        </li>
        <li>
          <strong>Your content, your format</strong>: save as JSON, HTML or Markdown,
          and load any of them back.
        </li>
        <li>
          <strong>Light, dark or system theme</strong>, restyled with CSS variables.
        </li>
        <li>
          <strong>TypeScript types</strong> for every prop, handler and document node.
        </li>
      </List>

      <DocH2>How integrations work</DocH2>
      <p>
        Uploads, AI, mentions, link previews and the spelling dictionary are handlers
        you pass as props. The editor calls your function and never makes a network
        request of its own, so it works with any backend, storage provider or model.
      </p>
      <Callout type="tip" title="Keys stay on your server">
        Because every integration is a function you control, API keys and credentials
        never need to reach the browser. See{' '}
        <Link to="/docs/backend">Bring your own backend</Link>.
      </Callout>

      <DocH2>Requirements</DocH2>
      <List>
        <li>React 18 or React 19 (the only peer dependencies are react and react-dom).</li>
        <li>A bundler that can import CSS files, such as Vite, Next.js or webpack.</li>
        <li>A browser environment. See <Link to="/docs/nextjs">Next.js &amp; SSR</Link> for server rendering.</li>
      </List>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['installation', 'quickstart', 'content', 'features']} />
    </>
  ),

  installation: () => (
    <>
      <DocLead>Install one package and import two things: the component and its stylesheet.</DocLead>

      <DocH2>Install the package</DocH2>
      <DocCode language="bash">{INSTALL}</DocCode>
      <p>Using another package manager:</p>
      <DocCode language="bash">{`pnpm add da-text-editor
yarn add da-text-editor`}</DocCode>

      <DocH2>Import the stylesheet</DocH2>
      <p>
        Import the CSS once, as high in your app as you can, such as your root
        component or layout. Without it the editor renders unstyled.
      </p>
      <DocCode title="main.tsx">{`import 'da-text-editor/styles.css';`}</DocCode>
      <Callout type="note" title="Scoped styles">
        Every rule is scoped to the editor's own classes, which all start with{' '}
        <Inline>da-</Inline>. The stylesheet will not restyle the rest of your page.
      </Callout>

      <DocH2>Render the editor</DocH2>
      <DocCode title="Editor.tsx">{`import { DaEditor } from 'da-text-editor';

export function Editor() {
  return <DaEditor placeholder="Start writing…" />;
}`}</DocCode>
      <p>
        That is a working editor, with toolbars, menus and shortcuts. The next step is
        saving what people write.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['quickstart', 'nextjs']} />
    </>
  ),

  quickstart: () => (
    <>
      <DocLead>
        Build a real editor in three steps: render it, save changes, and load saved
        content back in.
      </DocLead>

      <DocH2>Build it step by step</DocH2>
      <Steps>
        <Step title="Render the editor with a starting document">
          <p>
            <Inline>defaultHtml</Inline> seeds the editor with HTML. You can also pass{' '}
            <Inline>defaultValue</Inline> with a saved JSON document.
          </p>
          <DocCode title="Editor.tsx">{`import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

export function Editor() {
  return (
    <DaEditor
      defaultHtml="<h1>Welcome</h1><p>Start writing here.</p>"
      theme="system"
    />
  );
}`}</DocCode>
        </Step>

        <Step title="Save changes">
          <p>
            <Inline>onChange</Inline> fires with the whole document, as JSON, every time
            the content changes. Selection moves do not trigger it. Debounce it before
            sending it to a server.
          </p>
          <DocCode title="Editor.tsx">{`import { useMemo } from 'react';
import { DaEditor, type EditorValue } from 'da-text-editor';

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function Editor({ docId }: { docId: string }) {
  const save = useMemo(
    () =>
      debounce((value: EditorValue) => {
        fetch(\`/api/docs/\${docId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });
      }, 800),
    [docId],
  );

  return <DaEditor onChange={save} />;
}`}</DocCode>
        </Step>

        <Step title="Load saved content">
          <p>
            Render the editor once the document has loaded, and give it a{' '}
            <Inline>key</Inline> so that switching documents starts a fresh editor.
          </p>
          <DocCode title="DocumentPage.tsx">{`export function DocumentPage({ docId }: { docId: string }) {
  const [doc, setDoc] = useState<EditorValue | null>(null);

  useEffect(() => {
    fetch(\`/api/docs/\${docId}\`)
      .then((res) => res.json())
      .then(setDoc);
  }, [docId]);

  if (!doc) return <p>Loading…</p>;

  return <DaEditor key={docId} defaultValue={doc} onChange={save} />;
}`}</DocCode>
        </Step>
      </Steps>

      <Callout type="warning" title="defaultValue is read once">
        Like an uncontrolled input, <Inline>defaultValue</Inline> and{' '}
        <Inline>defaultHtml</Inline> are only read on mount. To replace the content of
        an editor that is already on screen, call <Inline>setValue</Inline> or{' '}
        <Inline>setHTML</Inline> on the <Link to="/docs/ref-api">ref</Link>, or change
        its <Inline>key</Inline>.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['content', 'toolbars', 'backend', 'props']} />
    </>
  ),

  nextjs: () => (
    <>
      <DocLead>
        The editor needs a browser: it reads the DOM and the selection. In Next.js and
        other server-rendered frameworks, load it on the client only.
      </DocLead>

      <DocH2>Next.js App Router</DocH2>
      <Steps>
        <Step title="Import the stylesheet in your root layout">
          <DocCode title="app/layout.tsx">{`import 'da-text-editor/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`}</DocCode>
        </Step>
        <Step title="Wrap the editor in a client component">
          <DocCode title="components/Editor.tsx">{`'use client';

import { DaEditor, type EditorValue } from 'da-text-editor';

export default function Editor(props: {
  initial?: EditorValue;
  onChange?: (value: EditorValue) => void;
}) {
  return <DaEditor defaultValue={props.initial} onChange={props.onChange} />;
}`}</DocCode>
        </Step>
        <Step title="Load it without server rendering">
          <DocCode title="app/editor/page.tsx">{`'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <p>Loading editor…</p>,
});

export default function Page() {
  return <Editor />;
}`}</DocCode>
        </Step>
      </Steps>

      <Callout type="note" title="Why ssr: false">
        Parsing <Inline>defaultHtml</Inline>, measuring the selection and positioning
        menus all rely on browser APIs. Skipping server rendering for the editor avoids
        hydration mismatches and errors about <Inline>document</Inline> being undefined.
      </Callout>

      <DocH2>Next.js Pages Router</DocH2>
      <p>
        Import the stylesheet in <Inline>pages/_app.tsx</Inline>, then load the editor
        with <Inline>dynamic(…, {'{ ssr: false }'})</Inline> exactly as above. The{' '}
        <Inline>'use client'</Inline> directive is not needed.
      </p>

      <DocH2>Remix, Astro and others</DocH2>
      <p>
        The same rule applies: render the editor only in the browser. Use your
        framework's client-only boundary, such as <Inline>ClientOnly</Inline> in Remix
        or <Inline>client:only="react"</Inline> in Astro.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['content', 'displaying-content']} />
    </>
  ),
};
