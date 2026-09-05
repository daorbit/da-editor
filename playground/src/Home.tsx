import { useRef, useState } from 'react';
import {
  BoldIcon,
  BulletedListIcon,
  CalloutIcon,
  CodeBlockIcon,
  DaEditor,
  EmojiIcon,
  H1Icon,
  ImageIcon,
  LinkIcon,
  MoonIcon,
  PaletteIcon,
  SparklesIcon,
  TableIcon,
  TodoListIcon,
  type DaEditorHandle,
  type Mentionable,
} from '../../src';
import type { Route } from './router';
import { HERO_CONTENT } from './demoContent';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
];

const FEATURES = [
  {
    icon: <SparklesIcon size={18} />,
    title: 'Slash menu',
    body: 'Press / anywhere to insert any block. Grouped, filterable, fully keyboard navigable.',
  },
  {
    icon: <BulletedListIcon size={18} />,
    title: 'Markdown as you type',
    body: 'Type # for a heading, - for a list, > for a quote, **bold** inline. Formats on the fly.',
  },
  {
    icon: <TableIcon size={18} />,
    title: 'Tables',
    body: 'Insert, resize, add and remove rows and columns, with a contextual toolbar on selection.',
  },
  {
    icon: <LinkIcon size={18} />,
    title: 'Mentions',
    body: 'Type @ to open a combobox over your own data. You supply the list, the editor handles the rest.',
  },
  {
    icon: <CodeBlockIcon size={18} />,
    title: 'Code blocks',
    body: 'Syntax highlighting via Prism across every common language, with a language picker.',
  },
  {
    icon: <ImageIcon size={18} />,
    title: 'Media and emoji',
    body: 'Images with a caption and alignment toolbar, plus a searchable emoji picker.',
  },
  {
    icon: <H1Icon size={18} />,
    title: 'Import and export',
    body: 'HTML, Markdown and Slate JSON both ways — plus .docx import through Mammoth.',
  },
  {
    icon: <PaletteIcon size={18} />,
    title: 'Themeable',
    body: 'Light, dark or follow the OS. Every colour is a CSS custom property you can override.',
  },
  {
    icon: <BoldIcon size={18} />,
    title: 'Composable',
    body: 'Every toolbar, menu and primitive is exported. Drop DaEditor and assemble your own.',
  },
];

const ROADMAP = [
  { icon: <TodoListIcon size={16} />, label: 'Drag handles' },
  { icon: <CalloutIcon size={16} />, label: 'Comments' },
  { icon: <SparklesIcon size={16} />, label: 'AI streaming' },
  { icon: <EmojiIcon size={16} />, label: 'Collaborative cursors' },
];

const INSTALL = 'npm install da-text-editor';

const USAGE = `import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

export function Example() {
  return (
    <DaEditor
      theme="system"
      onChange={(value) => console.log(value)}
    />
  );
}`;

export interface HomeProps {
  navigate: (route: Route) => void;
  onToggleTheme: () => void;
  dark: boolean;
}

export function Home({ navigate, onToggleTheme, dark }: HomeProps) {
  const editorRef = useRef<DaEditorHandle>(null);
  const [copied, setCopied] = useState(false);

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
            className="pg-btn pg-btn--ghost"
            href="https://www.npmjs.com/package/da-text-editor"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            className="pg-btn pg-btn--ghost"
            href="https://github.com/daorbit/da-editor"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <button type="button" className="pg-btn pg-btn--ghost pg-btn--icon" onClick={onToggleTheme}>
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
          The rich-text editor
          <br />
          React was missing.
        </h1>
        <p className="pg-hero__lead">
          Tables, mentions, slash commands, Markdown shortcuts and a full toolbar —
          in one install. No icon packages to wire up, no plugin graph to assemble.
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
            Open full playground
          </button>
        </div>
      </section>

      {/* The product is the demo — so it sits above the fold, editable. */}
      <section className="pg-demo">
        <div className="pg-demo__frame">
          <DaEditor
            ref={editorRef}
            theme={dark ? 'dark' : 'light'}
            defaultValue={HERO_CONTENT}
            minHeight="380px"
            maxHeight="380px"
            maxWidth="720px"
            mentionables={MENTIONABLES}
          />
        </div>
        <p className="pg-demo__caption">
          This is the editor, running. Type in it — press <kbd>/</kbd> for the block
          menu or <kbd>@</kbd> to mention someone.
        </p>
      </section>

      <section className="pg-section">
        <h2 className="pg-h2">What's inside</h2>
        <div className="pg-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="pg-card">
              <span className="pg-card__icon">{feature.icon}</span>
              <h3 className="pg-card__title">{feature.title}</h3>
              <p className="pg-card__body">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pg-section">
        <h2 className="pg-h2">Getting started</h2>
        <div className="pg-start">
          <pre className="pg-code">
            <code>{USAGE}</code>
          </pre>
          <div className="pg-start__notes">
            <h3 className="pg-start__title">Two lines to a working editor</h3>
            <p className="pg-start__body">
              One import for the component, one for the stylesheet. React 18 or 19 is
              the only peer dependency — Slate, the icon set and the document model
              ship inside the package.
            </p>
            <button
              type="button"
              className="pg-link"
              onClick={() => navigate('/playground')}
            >
              See every prop in the playground →
            </button>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <h2 className="pg-h2">On the roadmap</h2>
        <div className="pg-chips">
          {ROADMAP.map((item) => (
            <span key={item.label} className="pg-chip">
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
      </section>

      <footer className="pg-footer">
        MIT licensed ·{' '}
        <a
          className="pg-footer__link"
          href="https://github.com/daorbit/da-editor"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>{' '}
        ·{' '}
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
