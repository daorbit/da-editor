import { useCallback, useRef, useState } from 'react';
import {
  DaEditor,
  MoonIcon,
  SparklesIcon,
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
const CAPABILITIES: [string, string][] = [
  ['Blocks', 'Headings, quotes, code, lists, to-dos, callouts, dividers, images, tables'],
  ['Marks', 'Bold, italic, underline, strike, code, sub, super, kbd, colour, highlight'],
  ['Tables', 'Insert, resize, add and remove rows and columns, contextual toolbar'],
  ['Code', 'Prism highlighting across 20+ languages with a language picker'],
  ['Media', 'Images with captions, alignment toolbar, and a pluggable upload handler'],
  ['Emoji', 'Searchable picker, plus : shortcodes inline'],
  ['Import', 'HTML, Markdown, and .docx through Mammoth'],
  ['Export', 'HTML, Markdown, and Slate JSON — nothing locked in'],
  ['Theming', 'Light, dark or system. Every colour is a CSS custom property'],
  ['Toolbars', 'Fixed and floating, both fully composable from exported primitives'],
  ['Keyboard', 'Full shortcut map, and Tab / Shift+Tab indent handling'],
  ['Composable', 'Every menu, toolbar and primitive exported for your own assembly'],
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
        <span className="pg-brand">da-text-editor</span>
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
        <span className="pg-badge">
          <SparklesIcon size={13} />
          Built on Slate
        </span>
        <h1 className="pg-hero__title">
          A rich-text editor
          <br />
          you can ship on Monday.
        </h1>
        <p className="pg-hero__lead">
          Tables, mentions, slash commands, Markdown shortcuts, code highlighting
          and a full toolbar — in one install, 81&nbsp;KB, no plugin graph to
          assemble.
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

      <section className="pg-section">
        <h2 className="pg-h2">Everything in the box</h2>
        <dl className="pg-caps">
          {CAPABILITIES.map(([term, detail]) => (
            <div className="pg-caps__row" key={term}>
              <dt>{term}</dt>
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
