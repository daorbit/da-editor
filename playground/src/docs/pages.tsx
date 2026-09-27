import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiTable,
  Callout,
  DocCards,
  DocCode,
  DocH2,
  DocLead,
  FeaturesTable,
  Inline,
  PropsTable,
  ShortcutsTable,
  Step,
  Steps,
  TokensList,
} from './primitives';
import { HOOKS, INSTALL, USAGE } from './content';

export const DOC_BODIES: Record<string, () => ReactNode> = {
  introduction: () => (
    <>
      <DocLead>
        <strong>da-text-editor</strong> is a Slate-based rich-text editor for React.
        Tables, mentions, slash commands, find &amp; replace, image and column
        resizing, drag-and-drop uploads, smart paste and Markdown shortcuts all work
        on the first render. There is no plugin graph to assemble.
      </DocLead>

      <DocH2>What you get</DocH2>
      <p>
        The package ships one component, <Inline>&lt;DaEditor /&gt;</Inline>, and one
        stylesheet. React 18 or 19 is the only peer dependency; Slate, the icon set
        and the document model come bundled.
      </p>
      <p>
        Opt-in extras, such as a content-checks panel, focus and typewriter writing
        modes, link preview cards, a dictionary spell checker and a device-framed
        preview, are one prop each and stay out of the way until you turn them on.
        See <Link to="/docs/features">Features</Link>.
      </p>

      <DocH2>Your backend, your rules</DocH2>
      <p>
        AI, uploads, mentions, link metadata and the spelling dictionary are exposed
        as handlers rather than built-in integrations. The editor calls your function
        and never makes a network request of its own.
      </p>
      <Callout type="tip" title="Keys stay on your server">
        Because every integration is a handler you pass, API keys and credentials
        never need to reach the browser. See{' '}
        <Link to="/docs/backend">Bring your own backend</Link>.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['installation', 'quickstart', 'props', 'features']} />
    </>
  ),

  installation: () => (
    <>
      <DocLead>One dependency, two imports.</DocLead>

      <DocH2>Requirements</DocH2>
      <p>
        React 18 or 19 must already be in your project, along with a bundler that
        can import CSS, such as Vite or Next.js.
      </p>

      <DocH2>Install and import</DocH2>
      <Steps>
        <Step title="Add the package">
          <DocCode language="bash">{INSTALL}</DocCode>
        </Step>
        <Step title="Import the component and its stylesheet">
          <p>Import both once, anywhere in your bundle:</p>
          <DocCode title="App.tsx">{`import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';`}</DocCode>
        </Step>
      </Steps>

      <Callout type="note" title="Scoped styles">
        The stylesheet is scoped to <Inline>.da-editor</Inline> and its menus and
        portals. It will not touch the rest of your page.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['quickstart', 'props']} />
    </>
  ),

  quickstart: () => (
    <>
      <DocLead>
        A controlled editor that reports every change and offers @-mentions.
      </DocLead>

      <DocH2>Render the editor</DocH2>
      <DocCode title="Editor.tsx">{USAGE}</DocCode>

      <DocH2>Track changes</DocH2>
      <p>
        <Inline>onChange</Inline> fires on every document change with the current{' '}
        <Inline>EditorValue</Inline> (Slate JSON). Pass a <Inline>ref</Inline> to read
        HTML or Markdown out on demand; see the <Link to="/docs/ref-api">Ref API</Link>.
      </p>

      <DocH2>Turn features off</DocH2>
      <p>
        The slash menu, the floating toolbar, Markdown input rules and find &amp;
        replace are on by default. Turn any of them off with the matching boolean
        prop.
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor slashMenu={false} floatingToolbar={false} />`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['props', 'ref-api', 'theming']} />
    </>
  ),

  props: () => (
    <>
      <DocLead>
        Every prop on <Inline>&lt;DaEditor /&gt;</Inline>. All are optional.
      </DocLead>
      <DocH2>All props</DocH2>
      <PropsTable />
    </>
  ),

  'ref-api': () => (
    <>
      <DocLead>
        Pass a <Inline>ref</Inline> to read and write the document from outside.
      </DocLead>

      <DocH2>Attach a ref</DocH2>
      <DocCode title="Editor.tsx">{`import { useRef } from 'react';
import { DaEditor, type DaEditorHandle } from 'da-text-editor';

const ref = useRef<DaEditorHandle>(null);
// ref.current?.getMarkdown()

<DaEditor ref={ref} />`}</DocCode>

      <DocH2>Methods</DocH2>
      <ApiTable />
    </>
  ),

  features: () => (
    <>
      <DocLead>
        Most of the list is on by default, with no separate plugin to install and no
        peer dependency to resolve.
      </DocLead>

      <Callout type="note" title="Opt-in features">
        Pass <Inline>lintPanel</Inline>, <Inline>spellCheckEngine</Inline>,{' '}
        <Inline>onFetchLinkMeta</Inline>, <Inline>preview</Inline>,{' '}
        <Inline>defaultFocusMode</Inline> or <Inline>defaultTypewriter</Inline> to turn
        one on. Turn defaults off with the matching boolean.
      </Callout>

      <DocH2>Feature reference</DocH2>
      <FeaturesTable />
      <p>
        Every trigger and hotkey is listed on the{' '}
        <Link to="/docs/shortcuts">Keyboard shortcuts</Link> page.
      </p>
    </>
  ),

  shortcuts: () => (
    <>
      <DocLead>
        <Inline>Mod</Inline> is <Inline>Ctrl</Inline> on Windows and Linux and{' '}
        <Inline>Cmd</Inline> on macOS. Trigger keys fire while typing; the rest work
        whenever the document has focus.
      </DocLead>
      <ShortcutsTable />
    </>
  ),

  theming: () => (
    <>
      <DocLead>
        Every colour resolves through a custom property on <Inline>.da-editor</Inline>.
        Override any of them in your own stylesheet, with no build step and no theme
        object.
      </DocLead>

      <DocH2>Override tokens</DocH2>
      <DocCode title="theme.css" language="css">{`.da-editor {
  --da-accent: #3b5bfd;
  --da-radius: 12px;
}`}</DocCode>

      <DocH2>Token reference</DocH2>
      <TokensList />

      <DocH2>Gradient accent</DocH2>
      <p>
        Passing <Inline>accent="gradient"</Inline> switches active affordances, such as
        toolbar state, the slash icon, the focus ring and the drop indicator, to a
        gradient. Override it with <Inline>--da-accent-gradient</Inline>:
      </p>
      <DocCode title="App.tsx">{`<DaEditor accent="gradient" />`}</DocCode>
      <DocCode title="theme.css" language="css">{`.da-editor {
  --da-accent-gradient: linear-gradient(120deg, #6d5efc, #ff8a5c);
}`}</DocCode>
    </>
  ),

  backend: () => (
    <>
      <DocLead>
        AI, uploads, mentions, link metadata and the spelling dictionary are handlers,
        not integrations. The editor calls your function and never makes a network
        request of its own.
      </DocLead>
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
    </>
  ),
};

