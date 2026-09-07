import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiTable,
  DocCode,
  DocLead,
  FeaturesTable,
  Inline,
  PropsTable,
  TokensList,
} from './primitives';
import { HOOKS, INSTALL, USAGE } from './content';

/** slug -> rendered page body. Titles come from nav.ts. */
export const DOC_BODIES: Record<string, () => ReactNode> = {
  introduction: () => (
    <>
      <DocLead>
        <strong>da-text-editor</strong> is a Slate-based rich-text editor for
        React. Tables, mentions, slash commands, find &amp; replace, image and
        column resizing, drag-and-drop uploads and Markdown shortcuts all work on
        the first render — there is no plugin graph to assemble.
      </DocLead>
      <p>
        The package ships one component, <Inline>&lt;DaEditor /&gt;</Inline>, and
        one stylesheet. React 18 or 19 is the only peer dependency; Slate, the
        icon set and the document model come bundled.
      </p>
      <p>
        AI, uploads and mentions are exposed as hooks rather than built-in
        integrations. The editor calls your handler and never makes a network
        request of its own, so your keys stay on your server.
      </p>
      <p>
        Continue to <Link to="/docs/installation">Installation</Link>, or open
        the <Link to="/playground">playground</Link> to try every prop live.
      </p>
    </>
  ),

  installation: () => (
    <>
      <DocLead>One dependency, two imports.</DocLead>
      <DocCode>{INSTALL}</DocCode>
      <p>
        React 18 or 19 must already be in your project. Then import the component
        and its stylesheet once, anywhere in your bundle:
      </p>
      <DocCode>{`import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';`}</DocCode>
      <p>
        The stylesheet is scoped to <Inline>.da-editor</Inline> and its
        menus/portals — it will not touch the rest of your page.
      </p>
    </>
  ),

  quickstart: () => (
    <>
      <DocLead>
        A controlled editor that reports every change and offers @-mentions.
      </DocLead>
      <DocCode>{USAGE}</DocCode>
      <p>
        <Inline>onChange</Inline> fires on every document change with the current{' '}
        <Inline>EditorValue</Inline> (Slate JSON). Pass a <Inline>ref</Inline> to
        read HTML or Markdown out on demand — see the{' '}
        <Link to="/docs/ref-api">Ref API</Link>.
      </p>
      <p>
        Everything else — the slash menu, the floating toolbar, Markdown input
        rules, find &amp; replace — is on by default. Turn pieces off with the
        matching boolean prop.
      </p>
    </>
  ),

  props: () => (
    <>
      <DocLead>
        Every prop on <Inline>&lt;DaEditor /&gt;</Inline>. All optional.
      </DocLead>
      <PropsTable />
    </>
  ),

  'ref-api': () => (
    <>
      <DocLead>
        Pass a <Inline>ref</Inline> to read and write the document from outside.
      </DocLead>
      <DocCode>{`import { useRef } from 'react';
import { DaEditor, type DaEditorHandle } from 'da-text-editor';

const ref = useRef<DaEditorHandle>(null);
// ref.current?.getMarkdown()

<DaEditor ref={ref} />`}</DocCode>
      <ApiTable />
    </>
  ),

  features: () => (
    <>
      <DocLead>
        Everything below is on by default — no separate plugin to install, no
        peer dependency to resolve.
      </DocLead>
      <FeaturesTable />
    </>
  ),

  theming: () => (
    <>
      <DocLead>
        Every colour resolves through a custom property on{' '}
        <Inline>.da-editor</Inline>. Override any of them in your own stylesheet —
        no build step, no theme object.
      </DocLead>
      <DocCode>{`.da-editor {
  --da-accent: #3b5bfd;
  --da-radius: 12px;
}`}</DocCode>
      <TokensList />
    </>
  ),

  backend: () => (
    <>
      <DocLead>
        AI, uploads and mentions are hooks, not integrations. The editor calls
        your handler and never makes a network request of its own.
      </DocLead>
      {HOOKS.map((hook) => (
        <section key={hook.id} className="doc-hook">
          <h3 className="doc-h3">
            {hook.label} <Inline>{hook.prop}</Inline>
          </h3>
          <p>{hook.blurb}</p>
          <DocCode>{hook.code}</DocCode>
        </section>
      ))}
    </>
  ),
};
