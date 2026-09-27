import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Callout, DataTable, DocCards, DocCode, DocH2, DocH3, DocLead, Inline, List } from '../primitives';
import { HOOKS } from '../content';

export const GUIDE_PAGES: Record<string, () => ReactNode> = {
  backend: () => (
    <>
      <DocLead>
        Every integration is a function you pass. The editor calls it and never makes a
        network request of its own, so you choose the storage, the model and the
        permissions.
      </DocLead>

      <DataTable
        head={['Integration', 'Prop', 'You provide']}
        rows={HOOKS.map((hook) => [
          <a href={`#${hook.id}`}>{hook.label}</a>,
          <Inline>{hook.prop}</Inline>,
          hook.summary,
        ])}
      />

      {HOOKS.map((hook) => (
        <section key={hook.id} className="doc-hook">
          <DocH2 id={hook.id}>{hook.label}</DocH2>
          <p>
            Prop: <Inline>{hook.prop}</Inline>
          </p>
          <p>{hook.blurb}</p>
          <DocCode title="Editor.tsx">{hook.code}</DocCode>
        </section>
      ))}

      <DocH2>Example server endpoints</DocH2>
      <DocH3>Link metadata (Next.js route handler)</DocH3>
      <DocCode title="app/api/unfurl/route.ts">{`export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get('url');
  if (!target || !/^https?:\\/\\//i.test(target)) {
    return Response.json(null, { status: 400 });
  }

  const html = await fetch(target, { redirect: 'follow' }).then((res) => res.text());
  const og = (name: string) =>
    html.match(
      new RegExp(\`<meta[^>]+property=["']og:\${name}["'][^>]+content=["']([^"']*)\`, 'i'),
    )?.[1];

  return Response.json({
    title: og('title'),
    description: og('description'),
    image: og('image'),
    siteName: og('site_name'),
  });
}`}</DocCode>
      <Callout type="warning" title="Protect your unfurl endpoint">
        An endpoint that fetches any URL can be abused to reach your internal network.
        Allow only http and https, block private and loopback addresses, add a timeout,
        and require the user to be signed in.
      </Callout>

      <DocH3>Uploads</DocH3>
      <p>
        Your upload endpoint should check the user is allowed to upload, validate the
        file type and size, store the file (for example in S3, R2 or Cloudinary) and
        return its public URL as <Inline>{'{ url }'}</Inline>. Reject files you do not
        accept with an error status; the editor shows the message in the media dialog.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['ai', 'media', 'links']} />
    </>
  ),

  ai: () => (
    <>
      <DocLead>
        Setting <Inline>onAskAi</Inline> adds an Ask AI button to both toolbars and the
        slash menu, and binds <Inline>Mod + J</Inline>. What happens next is up to you:
        call any model from your server and write the answer into the document.
      </DocLead>

      <DocH2>How it fits together</DocH2>
      <List>
        <li>The user selects text, or places the caret, and triggers Ask AI.</li>
        <li>Your handler reads the selection or the whole document from the ref.</li>
        <li>It sends a prompt to your own API route, which calls the model.</li>
        <li>It writes the answer back at the caret, replacing any selection.</li>
      </List>

      <DocH2>Insert a plain-text answer</DocH2>
      <DocCode title="Editor.tsx">{`const ref = useRef<DaEditorHandle>(null);

async function askAi() {
  const handle = ref.current;
  if (!handle) return;

  const selected = window.getSelection()?.toString() ?? '';
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instruction: 'Improve the writing',
      text: selected || handle.getText(),
    }),
  });
  const { answer } = await res.json();

  handle.focus();
  handle.editor.insertText(answer); // replaces the selection, if there is one
}

<DaEditor ref={ref} onAskAi={askAi} />`}</DocCode>

      <DocH2>Stream the answer as it arrives</DocH2>
      <p>If your endpoint streams text, insert each chunk as it comes in:</p>
      <DocCode title="Editor.tsx">{`const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ text }) });
const reader = res.body!.getReader();
const decoder = new TextDecoder();

handle.focus();
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  handle.editor.insertText(decoder.decode(value, { stream: true }));
}`}</DocCode>

      <DocH2>Insert formatted content</DocH2>
      <p>
        Ask the model for HTML or Markdown, convert it to editor blocks, and insert them
        at the caret:
      </p>
      <DocCode title="Editor.tsx">{`import { deserializeHtml, parseMarkdown } from 'da-text-editor';

handle.editor.insertFragment(parseMarkdown(markdownAnswer));
// or
handle.editor.insertFragment(deserializeHtml(htmlAnswer));`}</DocCode>
      <Callout type="tip" title="Undo">
        Insertions made this way go into the undo history, so users can undo an answer
        they do not like with <Inline>Mod + Z</Inline>.
      </Callout>

      <DocH2>Keep your key on the server</DocH2>
      <p>
        Call the model provider from your own API route, never from the browser, so
        your API key is not exposed to users.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['backend', 'ref-api']} />
    </>
  ),

  troubleshooting: () => (
    <>
      <DocLead>Fixes for the problems people run into most often.</DocLead>

      <DocH2>The editor has no styles</DocH2>
      <p>
        Import <Inline>da-text-editor/styles.css</Inline> once in your app. In Next.js,
        do it in the root layout or <Inline>_app.tsx</Inline>.
      </p>

      <DocH2>document is not defined, or a hydration error</DocH2>
      <p>
        The editor must render in the browser. Load it with{' '}
        <Inline>dynamic(…, {'{ ssr: false }'})</Inline>; see{' '}
        <Link to="/docs/nextjs">Next.js &amp; SSR</Link>.
      </p>

      <DocH2>The content does not update when my data changes</DocH2>
      <p>
        <Inline>defaultValue</Inline> and <Inline>defaultHtml</Inline> are read once, on
        mount. Render the editor after your data loads, change its{' '}
        <Inline>key</Inline> when switching documents, or call{' '}
        <Inline>ref.current.setValue()</Inline>.
      </p>

      <DocH2>The page freezes or onChange loops</DocH2>
      <p>
        Do not call <Inline>setValue</Inline>, <Inline>setHTML</Inline> or{' '}
        <Inline>clear</Inline> inside <Inline>onChange</Inline>: they trigger{' '}
        <Inline>onChange</Inline> again. Debounce expensive work such as saving.
      </p>

      <DocH2>Images disappear after a reload</DocH2>
      <p>
        Without <Inline>onUpload</Inline>, files are stored as temporary{' '}
        <Inline>blob:</Inline> URLs. Upload them to your storage and resolve the
        permanent URL; see <Link to="/docs/media">Images &amp; media</Link>.
      </p>

      <DocH2>Link preview cards only show the URL</DocH2>
      <p>
        Browsers cannot read another site's metadata directly. Make sure{' '}
        <Inline>onFetchLinkMeta</Inline> calls your own server, and that your server can
        reach the page; see <Link to="/docs/backend#link-meta">link metadata</Link>.
      </p>

      <DocH2>The @ menu does not open</DocH2>
      <List>
        <li>Pass a non-empty <Inline>mentionables</Inline> array.</li>
        <li>Type <Inline>@</Inline> after a space or at the start of a line.</li>
        <li>Mentions do not open inside code blocks or inline code.</li>
      </List>

      <DocH2>Clicking my toolbar button loses the selection</DocH2>
      <p>
        Prevent the default mouse-down on your button, so focus stays in the document:
      </p>
      <DocCode title="MyButton.tsx">{`<button onMouseDown={(event) => event.preventDefault()} onClick={run}>
  Run
</button>`}</DocCode>

      <DocH2>The editor does not fill its container</DocH2>
      <p>
        Pass <Inline>minHeight="0"</Inline> and make the parent a flex column with a
        fixed height; see <Link to="/docs/layout">Sizing &amp; layout</Link>.
      </p>

      <DocH2>Still stuck?</DocH2>
      <p>
        Open an issue on{' '}
        <a href="https://github.com/daorbit/da-editor/issues" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        with your React version, browser and a short code sample.
      </p>
    </>
  ),
};
