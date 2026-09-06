import { useCallback, useRef, useState } from 'react';
import {
  DaEditor,
  MoonIcon,
  type DaEditorHandle,
  type EditorValue,
  type Mentionable,
} from '../../src';
import type { Route } from './router';
import { HERO_CONTENT } from './demoContent';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
];

/* The three things that actually differentiate this editor, each shown
   rather than described. */
const PILLARS = [
  {
    title: 'Slash commands',
    body: 'Press / on any empty line. Grouped, filterable, keyboard-driven — no mouse required.',
    demo: (
      <div className="pg-mini pg-mini--menu">
        <div className="pg-mini__input">
          <span className="pg-mini__slash">/</span>
          <span className="pg-mini__caret" />
        </div>
        <div className="pg-mini__menu">
          <div className="pg-mini__group">Basic blocks</div>
          <div className="pg-mini__item pg-mini__item--active">Heading 1</div>
          <div className="pg-mini__item">Bulleted list</div>
          <div className="pg-mini__item">Code block</div>
          <div className="pg-mini__item">Table</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Mentions over your data',
    body: 'Type @ to open a combobox. You pass the list, the editor handles matching, keyboard nav and insertion.',
    demo: (
      <div className="pg-mini pg-mini--mention">
        <div className="pg-mini__input">
          <span className="pg-mini__dim">Ping</span>
          <span className="pg-mini__at">@ali</span>
          <span className="pg-mini__caret" />
        </div>
        <div className="pg-mini__menu">
          <div className="pg-mini__row pg-mini__row--active">
            <span className="pg-mini__avatar">AC</span>
            <span>
              Alice Chen
              <em>alice@example.com</em>
            </span>
          </div>
          <div className="pg-mini__row">
            <span className="pg-mini__avatar pg-mini__avatar--b">BM</span>
            <span>
              Bob Martin
              <em>bob@example.com</em>
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Markdown as you type',
    body: 'Type # for a heading, - for a list, > for a quote. Input rules fire on the fly, no mode switch.',
    demo: (
      <div className="pg-mini pg-mini--md">
        <div className="pg-mini__before">
          <code>## </code>
          <span className="pg-mini__label">type</span>
        </div>
        <div className="pg-mini__arrow" />
        <div className="pg-mini__after">
          <span className="pg-mini__h2">Section title</span>
          <span className="pg-mini__label">becomes</span>
        </div>
      </div>
    ),
  },
];

/* Everything else, as a dense scannable list rather than nine equal cards. */
/** Every `DaEditor` prop, kept in step with the exported interface. */
const PROPS: { name: string; type: string; def: string; body: string }[] = [
  { name: 'defaultValue', type: 'EditorValue', def: '—', body: 'Initial document. Track updates with onChange.' },
  { name: 'defaultHtml', type: 'string', def: '—', body: 'Initial document as HTML. Ignored when defaultValue is set.' },
  { name: 'onChange', type: '(value) => void', def: '—', body: 'Fires on every document change.' },
  { name: 'placeholder', type: 'string', def: "'Write something…'", body: 'Shown only while the document is empty.' },
  { name: 'readOnly', type: 'boolean', def: 'false', body: 'Locks the document and hides the editing chrome.' },
  { name: 'mode', type: "'editing' | 'viewing'", def: "'editing'", body: "'viewing' locks the document, like readOnly." },
  { name: 'theme', type: "'light' | 'dark' | 'system'", def: "'light'", body: "'system' follows the OS setting and updates live." },
  { name: 'onToggleTheme', type: '() => void', def: '—', body: 'Renders the theme toggle in the toolbar and fires on click.' },
  { name: 'fixedToolbar', type: 'boolean', def: 'true', body: 'The toolbar pinned above the content.' },
  { name: 'floatingToolbar', type: 'boolean', def: 'true', body: 'The toolbar that appears over a selection.' },
  { name: 'slashMenu', type: 'boolean', def: 'true', body: 'The / block menu.' },
  { name: 'autoformat', type: 'boolean', def: 'true', body: 'Markdown input rules while typing.' },
  { name: 'wordCount', type: 'boolean', def: 'false', body: 'Words, characters and reading time, in a footer bar.' },
  { name: 'mentionables', type: 'Mentionable[]', def: '—', body: 'Entries offered by the @ combobox. Omit to disable mentions.' },
  { name: 'onAskAi', type: '() => void', def: '—', body: 'Renders the Ask AI button and binds Ctrl+J.' },
  { name: 'onUpload', type: '(file, kind) => Promise<string>', def: '—', body: 'Uploads a file and returns its URL. Falls back to an object URL.' },
  { name: 'onPickMedia', type: '(kind) => Promise<Picked | null>', def: '—', body: 'Opens your own media library instead of the built-in dialog.' },
  { name: 'maxWidth', type: 'string', def: '—', body: 'Constrains the text column, like a document editor.' },
  { name: 'minHeight', type: 'string', def: "'320px'", body: "Pass '0' to fill a flex parent instead." },
  { name: 'maxHeight', type: 'string', def: '—', body: 'Caps the height; the document scrolls inside it.' },
  { name: 'autoFocus', type: 'boolean', def: 'false', body: 'Focuses the document on mount.' },
  { name: 'spellCheck', type: 'boolean', def: 'true', body: "The browser's native spell checking." },
  { name: 'className', type: 'string', def: '—', body: 'Applied to the editor root.' },
  { name: 'style', type: 'CSSProperties', def: '—', body: 'Applied to the editor root.' },
];

/** What each feature does and how it is reached. */
const FEATURES: { name: string; how: string; body: string }[] = [
  { name: 'Slash menu', how: 'Type /', body: 'Grouped and filterable block inserter. Arrow keys move, Enter inserts, Escape closes.' },
  { name: 'Mentions', how: 'Type @', body: 'Combobox over the mentionables you pass. The editor handles matching, keyboard nav and insertion.' },
  { name: 'Find & replace', how: 'Ctrl/Cmd+F', body: 'Live match count with every hit highlighted in the document. Case toggle, replace one, replace all.' },
  { name: 'Markdown shortcuts', how: 'Type ## or - ', body: 'Input rules convert as you type. Pasting Markdown is parsed into real blocks too.' },
  { name: 'Tables', how: 'Slash menu or toolbar', body: 'Drag a column border to resize. Add and remove rows and columns from the contextual toolbar.' },
  { name: 'Images', how: 'Drop, paste or toolbar', body: 'Drag the side handles to resize, the gutter grip to reorder, and align left, centre or right.' },
  { name: 'Uploads', how: 'Drag & drop or paste', body: 'Files and screenshots route through your onUpload handler. Without one they become local object URLs.' },
  { name: 'Code blocks', how: 'Slash menu or ```', body: 'Prism highlighting across 20+ languages, with a language picker on the block.' },
  { name: 'Import', how: 'Toolbar', body: 'HTML, Markdown and .docx via Mammoth — tables, lists and callouts survive the round trip.' },
  { name: 'Export', how: 'Toolbar or ref', body: 'HTML, Markdown or Slate JSON. getHTML({ inlineStyles: true }) embeds the styling.' },
  { name: 'Word count', how: 'wordCount prop', body: 'Words, characters and an estimated reading time, in a footer bar.' },
  { name: 'Undo grouping', how: 'Ctrl+Z', body: 'Typing is grouped by word and by pause, so one undo never swallows a whole paragraph.' },
];

/** The ref handle, and the helpers worth knowing about. */
const API: { name: string; sig: string; body: string }[] = [
  { name: 'getValue', sig: '() => EditorValue', body: 'The document as Slate JSON.' },
  { name: 'setValue', sig: '(value) => void', body: 'Replaces the document wholesale.' },
  { name: 'getHTML', sig: '(options?) => string', body: 'Serialized HTML. Pass { inlineStyles: true } to embed the styling.' },
  { name: 'getMarkdown', sig: '() => string', body: 'The document as Markdown.' },
  { name: 'getText', sig: '() => string', body: 'Plain text, for search indexing or a summary.' },
  { name: 'setHTML', sig: '(html) => void', body: 'Replaces the document from an HTML string.' },
  { name: 'focus', sig: '() => void', body: 'Moves focus into the document.' },
  { name: 'clear', sig: '() => void', body: 'Empties the document.' },
  { name: 'editor', sig: 'DaEditor', body: 'The underlying Slate editor, for your own transforms.' },
];

/** The custom properties every colour in the editor resolves through. */
const TOKENS: [string, string][] = [
  ['--da-bg', 'Editor and menu background'],
  ['--da-fg', 'Body text'],
  ['--da-muted', 'Secondary text and carets'],
  ['--da-faint', 'Disabled text and placeholders'],
  ['--da-border', 'Hairlines and menu borders'],
  ['--da-surface', 'Insets: inputs, code blocks, slash icons'],
  ['--da-surface-hover', 'Hover fill on buttons and menu items'],
  ['--da-accent', 'Active state; neutral by default'],
  ['--da-accent-soft', 'Active background behind toolbar buttons'],
  ['--da-tb-icon', 'Toolbar and menu icons'],
  ['--da-link', 'Links in the document'],
  ['--da-selection', 'Text selection'],
  ['--da-radius', 'Corner radius for panels'],
  ['--da-font', 'UI and document font stack'],
  ['--da-mono', 'Code and monospace stack'],
];

const INSTALL = 'npm install da-text-editor';

const USAGE = `import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

export function Editor() {
  return (
    <DaEditor
      theme="system"
      mentionables={people}
      onChange={(value) => save(value)}
    />
  );
}`;

/* The three integration points people actually ask about. Each is a hook the
   editor calls — it never talks to a network itself. */
const HOOKS = [
  {
    id: 'ai',
    label: 'Ask AI',
    prop: 'onAskAi',
    blurb:
      'Renders the Ask AI button and binds Ctrl+J. You read the document off the ref, call your own endpoint, and write the answer back. Nothing is sent anywhere by the editor.',
    code: `const ref = useRef<DaEditorHandle>(null);

async function askAi() {
  const editor = ref.current;
  if (!editor) return;

  const prompt =
    window.getSelection()?.toString() || editor.getText();

  const res = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  editor.setHTML((await res.json()).html);
}

<DaEditor ref={ref} onAskAi={askAi} />`,
  },
  {
    id: 'upload',
    label: 'Uploads',
    prop: 'onUpload',
    blurb:
      'Return a URL and the editor inserts it. Without this, media embeds as base64 data URLs — fine for a demo, heavy for real documents.',
    code: `<DaEditor
  onUpload={async (file, kind) => {
    const body = new FormData();
    body.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body,
    });

    const { url } = await res.json();
    return url; // becomes the media src
  }}
/>`,
  },
  {
    id: 'mentions',
    label: 'Mentions',
    prop: 'mentionables',
    blurb:
      'Pass a list and @ opens a combobox over it. Matching, keyboard navigation and insertion are handled for you.',
    code: `<DaEditor
  mentionables={[
    {
      id: '1',
      name: 'Alice Chen',
      detail: 'alice@example.com',
    },
    {
      id: '2',
      name: 'Bob Martin',
      avatar: '/bob.jpg',
    },
  ]}
/>`,
  },
] as const;

type OutputTab = 'html' | 'markdown';

export interface HomeProps {
  navigate: (route: Route) => void;
  onToggleTheme: () => void;
  dark: boolean;
}

export function Home({ navigate, onToggleTheme, dark }: HomeProps) {
  const editorRef = useRef<DaEditorHandle>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<OutputTab>('html');
  const [output, setOutput] = useState('');
  const [hook, setHook] = useState<(typeof HOOKS)[number]['id']>('ai');

  const activeHook = HOOKS.find((h) => h.id === hook) ?? HOOKS[0];

  /* Reading through the ref on every change is what makes the output panel
     feel live — it is the same API a consumer would use. */
  const syncOutput = useCallback(
    (next?: OutputTab) => {
      const handle = editorRef.current;
      if (!handle) return;
      const which = next ?? tab;
      setOutput(which === 'html' ? handle.getHTML() : handle.getMarkdown());
    },
    [tab],
  );

  const handleChange = useCallback(
    (_value: EditorValue) => {
      syncOutput();
    },
    [syncOutput],
  );

  const selectTab = (next: OutputTab) => {
    setTab(next);
    syncOutput(next);
  };

  const copyInstall = () => {
    void navigator.clipboard.writeText(INSTALL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="pg-page">
      <header className="pg-nav">
        <a className="pg-brand" href="#/">
          <img
            className="pg-brand__mark"
            src="/da-editor-logo-512.png"
            alt=""
            width={26}
            height={26}
          />
          da-text-editor
        </a>
        <div className="pg-nav__actions">
          <a
            className="pg-navlink"
            href="https://www.npmjs.com/package/da-text-editor"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            className="pg-navlink"
            href="https://github.com/daorbit/da-editor"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <button
            type="button"
            className="pg-btn pg-btn--ghost pg-btn--icon"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {dark ? '☀' : <MoonIcon size={15} />}
          </button>
        </div>
      </header>

      <section className="pg-hero">
        <img
          className="pg-hero__mark"
          src="/da-editor-logo-512.png"
          alt="da-text-editor"
          width={76}
          height={76}
        />
        <h1 className="pg-hero__title">
          Everything a rich-text editor
          <br />
          needs. In one install.
        </h1>
        <p className="pg-hero__lead">
          Tables, mentions, slash commands, find &amp; replace, image and column
          resizing, drag-and-drop uploads, Markdown shortcuts and a full toolbar —
          working on the first render, with no plugin graph to assemble.
        </p>

        <div className="pg-hero__actions">
          <button type="button" className="pg-install-btn" onClick={copyInstall}>
            <code>{INSTALL}</code>
            <span className="pg-install-btn__hint">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            className="pg-btn pg-btn--lg"
            onClick={() => navigate('/playground')}
          >
            Full playground
          </button>
        </div>

        <div className="pg-stats">
          <span>
            <strong>81 KB</strong> gzipped
          </span>
          <span className="pg-stats__dot" />
          <span>
            <strong>React 18 &amp; 19</strong>
          </span>
          <span className="pg-stats__dot" />
          <span>
            <strong>TypeScript</strong> throughout
          </span>
          <span className="pg-stats__dot" />
          <span>
            <strong>MIT</strong>
          </span>
        </div>
      </section>

      {/* The editor and its serialized output, side by side. For an editor
          library this is the argument — everything else is commentary. */}
      <section className="pg-demo">
        <div className="pg-demo__shell">
          <div className="pg-demo__editor">
            <DaEditor
              ref={editorRef}
              theme={dark ? 'dark' : 'light'}
              defaultValue={HERO_CONTENT}
              onChange={handleChange}
              minHeight="420px"
              maxHeight="420px"
              mentionables={MENTIONABLES}
            />
          </div>
          <aside className="pg-demo__out">
            <div className="pg-demo__tabs">
              <button
                type="button"
                className={`pg-tab ${tab === 'html' ? 'pg-tab--active' : ''}`}
                onClick={() => selectTab('html')}
              >
                HTML
              </button>
              <button
                type="button"
                className={`pg-tab ${tab === 'markdown' ? 'pg-tab--active' : ''}`}
                onClick={() => selectTab('markdown')}
              >
                Markdown
              </button>
              <span className="pg-demo__live">live</span>
            </div>
            <pre className="pg-demo__code">
              {output || 'Start typing in the editor —\nserialized output appears here.'}
            </pre>
          </aside>
        </div>
        <p className="pg-demo__caption">
          A real instance. Press <kbd>/</kbd> for blocks, <kbd>@</kbd> to mention,
          or select text for the floating toolbar.
        </p>
      </section>

      <section className="pg-section">
        <div className="pg-pillars">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="pg-pillar">
              <div className="pg-pillar__demo">{pillar.demo}</div>
              <h3 className="pg-pillar__title">{pillar.title}</h3>
              <p className="pg-pillar__body">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-start">
          <div className="pg-start__notes">
            <h2 className="pg-h2">Two imports and you're done</h2>
            <p className="pg-start__body">
              One for the component, one for the stylesheet. React 18 or 19 is the
              only peer dependency — Slate, the icon set and the document model
              come with the package.
            </p>
            <button
              type="button"
              className="pg-link"
              onClick={() => navigate('/playground')}
            >
              Every prop, in the playground →
            </button>
          </div>
          <pre className="pg-code">
            <code>{USAGE}</code>
          </pre>
        </div>
      </section>

      <section className="pg-section">
        <h2 className="pg-h2">Bring your own backend</h2>
        <p className="pg-section__lead">
          AI, uploads and mentions are hooks, not integrations. The editor calls
          your handler and never makes a network request of its own — so your
          keys stay on your server and your data stays yours.
        </p>

        <div className="pg-hooks">
          <div className="pg-hooks__tabs">
            {HOOKS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pg-hooks__tab ${hook === item.id ? 'pg-hooks__tab--active' : ''}`}
                onClick={() => setHook(item.id)}
              >
                {item.label}
                <code>{item.prop}</code>
              </button>
            ))}
          </div>
          <div className="pg-hooks__panel">
            <p className="pg-hooks__blurb">{activeHook.blurb}</p>
            <pre className="pg-code">
              <code>{activeHook.code}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="pg-section" id="features">
        <h2 className="pg-h2">Features</h2>
        <p className="pg-lead">
          Everything below is on by default. Nothing here is a plugin you install
          separately or a peer dependency you resolve yourself.
        </p>
        <div className="pg-docs-table">
          <div className="pg-docs-table__head pg-docs-table__row pg-docs-table__row--feat">
            <span>Feature</span>
            <span>Reached by</span>
            <span>Detail</span>
          </div>
          {FEATURES.map((feature) => (
            <div
              className="pg-docs-table__row pg-docs-table__row--feat"
              key={feature.name}
            >
              <span className="pg-docs-table__name">{feature.name}</span>
              <span>
                <code className="pg-code-inline">{feature.how}</code>
              </span>
              <span className="pg-docs-table__body">{feature.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" id="props">
        <h2 className="pg-h2">Props</h2>
        <p className="pg-lead">
          Every prop on <code className="pg-code-inline">&lt;DaEditor /&gt;</code>.
          All of them are optional.
        </p>
        <div className="pg-docs-table">
          <div className="pg-docs-table__head pg-docs-table__row">
            <span>Prop</span>
            <span>Type</span>
            <span>Default</span>
            <span>Detail</span>
          </div>
          {PROPS.map((prop) => (
            <div className="pg-docs-table__row" key={prop.name}>
              <span className="pg-docs-table__name">{prop.name}</span>
              <span className="pg-docs-table__type">{prop.type}</span>
              <span className="pg-docs-table__def">{prop.def}</span>
              <span className="pg-docs-table__body">{prop.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" id="api">
        <h2 className="pg-h2">Ref API</h2>
        <p className="pg-lead">
          Pass a <code className="pg-code-inline">ref</code> to read and write the
          document from outside.
        </p>
        <div className="pg-docs-table">
          <div className="pg-docs-table__head pg-docs-table__row pg-docs-table__row--api">
            <span>Method</span>
            <span>Signature</span>
            <span>Detail</span>
          </div>
          {API.map((entry) => (
            <div className="pg-docs-table__row pg-docs-table__row--api" key={entry.name}>
              <span className="pg-docs-table__name">{entry.name}</span>
              <span className="pg-docs-table__type">{entry.sig}</span>
              <span className="pg-docs-table__body">{entry.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" id="theming">
        <h2 className="pg-h2">Theming</h2>
        <p className="pg-lead">
          Every colour resolves through a custom property on{' '}
          <code className="pg-code-inline">.da-editor</code>. Override any of them
          in your own stylesheet — no build step, no theme object.
        </p>
        <dl className="pg-caps">
          {TOKENS.map(([token, detail]) => (
            <div className="pg-caps__row" key={token}>
              <dt>
                <code className="pg-code-inline">{token}</code>
              </dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="pg-footer">
        <span>MIT licensed</span>
        <a
          className="pg-footer__link"
          href="https://github.com/daorbit/da-editor"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className="pg-footer__link"
          href="https://www.npmjs.com/package/da-text-editor"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
      </footer>
    </div>
  );
}
