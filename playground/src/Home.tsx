import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowRightLeft,
  Code2,
  FileDown,
  Hash,
  Image,
  Moon,
  Palette,
  Search,
  Slash,
  Sun,
  Table,
  Type,
  Undo2,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DaEditor, type DaEditorHandle, type Mentionable } from '../../src';
import { Link } from 'react-router-dom';
import { HERO_CONTENT } from './demoContent';
import { INSTALL, USAGE } from './docs/content';

const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
];


/* A visual highlight reel — the fuller list lives at /docs/features. */
const FEATURE_HIGHLIGHTS: {
  icon: LucideIcon;
  title: string;
  body: string;
  how: string;
}[] = [
  {
    icon: Slash,
    title: 'Slash menu',
    body: 'Grouped, filterable block inserter. Arrow keys move, Enter inserts, Escape closes.',
    how: 'Type /',
  },
  {
    icon: Hash,
    title: 'Markdown shortcuts',
    body: 'Input rules convert as you type. Pasted Markdown is parsed into real blocks too.',
    how: 'Type ## or - ',
  },
  {
    icon: Search,
    title: 'Find & replace',
    body: 'Live match count, every hit highlighted. Case toggle, replace one, replace all.',
    how: 'Ctrl/Cmd+F',
  },
  {
    icon: Table,
    title: 'Tables',
    body: 'Drag a border to resize a column. Add and remove rows and columns inline.',
    how: 'Slash menu',
  },
  {
    icon: Image,
    title: 'Images',
    body: 'Resize from the side handles, reorder from the gutter grip, align left, centre or right.',
    how: 'Drop or paste',
  },
  {
    icon: Upload,
    title: 'Uploads',
    body: 'Files and screenshots route through your onUpload handler, or fall back to object URLs.',
    how: 'Drag & drop',
  },
  {
    icon: Code2,
    title: 'Code blocks',
    body: 'Prism highlighting across 20+ languages, with a language picker on the block.',
    how: 'Type ``` ',
  },
  {
    icon: FileDown,
    title: 'Import & export',
    body: 'HTML, Markdown and .docx in; HTML, Markdown or Slate JSON out. Tables and lists survive.',
    how: 'Toolbar or ref',
  },
  {
    icon: ArrowRightLeft,
    title: 'Backend hooks',
    body: 'AI, uploads and mentions are handlers you pass. The editor never makes its own request.',
    how: 'onAskAi / onUpload',
  },
  {
    icon: Type,
    title: 'Word count',
    body: 'Words, characters and an estimated reading time, in a footer bar.',
    how: 'wordCount prop',
  },
  {
    icon: Undo2,
    title: 'Undo grouping',
    body: 'Typing is grouped by word and by pause, so one undo never eats a whole paragraph.',
    how: 'Ctrl+Z',
  },
  {
    icon: Palette,
    title: 'Theming tokens',
    body: 'Every colour resolves through a CSS custom property. Override any of them — no build step.',
    how: 'CSS variables',
  },
];

export interface HomeProps {
  navigate: (to: string) => void;
  onToggleTheme: () => void;
  dark: boolean;
}

const FEEDBACK_FORM_SRC = 'https://forms.daorbit.in/form/6a9e9287282c134d26c0f753/view';

export function Home({ navigate, onToggleTheme, dark }: HomeProps) {
  const editorRef = useRef<DaEditorHandle>(null);
  const feedbackFrameRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);

  /* The feedback form is an iframe that posts its own height so the frame can
     grow with its content instead of scrolling inside a fixed box. */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (new URL(FEEDBACK_FORM_SRC).origin !== event.origin) return;
      const data = event.data as { type?: string; height?: number };
      if (data?.type !== 'da-forms:height' || typeof data.height !== 'number') return;
      if (feedbackFrameRef.current) {
        feedbackFrameRef.current.style.height = `${data.height}px`;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const copyInstall = () => {
    void navigator.clipboard.writeText(INSTALL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="pg-page">
      <header className="pg-nav">
        <Link className="pg-brand" to="/">
          <img
            className="pg-brand__mark"
            src="/da-editor-logo-512.png"
            alt=""
            width={26}
            height={26}
          />
          da-text-editor
        </Link>
        <div className="pg-nav__actions">
          <Link className="pg-navlink" to="/docs/introduction">
            Docs
          </Link>
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
            {dark ? <Sun size={15} /> : <Moon size={15} />}
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
          Everything a <em>rich-text editor</em>
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

      {/* A real editor instance. For an editor library this is the argument —
          everything else is commentary. */}
      <section className="pg-demo">
        <div className="pg-demo__shell pg-demo__shell--solo">
          <div className="pg-demo__editor">
            <DaEditor
              ref={editorRef}
              theme={dark ? 'dark' : 'light'}
              defaultValue={HERO_CONTENT}
              minHeight="460px"
              maxHeight="460px"
              preview={false}
              mentionables={MENTIONABLES}
            />
          </div>
        </div>
        <p className="pg-demo__caption">
          A real instance. Press <kbd>/</kbd> for blocks, <kbd>@</kbd> to mention,
          or select text for the floating toolbar.
        </p>
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
              Every prop, in the playground
              <ArrowRight size={14} />
            </button>
          </div>
          <pre className="pg-code">
            <code>{USAGE}</code>
          </pre>
        </div>
      </section>

      <section className="pg-section" id="features">
        <h2 className="pg-h2">Everything, on by default</h2>
        <p className="pg-lead">
          No plugin graph to assemble, no peer dependencies to resolve. Each of
          these works on the first render.
        </p>
        <div className="pg-feat-grid">
          {FEATURE_HIGHLIGHTS.map((f) => (
            <article className="pg-feat" key={f.title}>
              <span className="pg-feat__icon">
                <f.icon size={17} />
              </span>
              <h3 className="pg-feat__title">{f.title}</h3>
              <p className="pg-feat__body">{f.body}</p>
              <code className="pg-feat__how">{f.how}</code>
            </article>
          ))}
        </div>
        <div className="pg-feat-cta">
          <Link className="pg-btn" to="/docs/features">
            Full feature reference
            <ArrowRight size={15} />
          </Link>
          <Link className="pg-link" to="/docs/introduction">
            Browse the docs
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="pg-section" id="feedback">
        <h2 className="pg-h2">Feedback</h2>
        <p className="pg-lead">
          Found a bug, want a prop, or using it in something? Tell us here — it
          goes straight to the maintainers.
        </p>
        <div className="pg-feedback">
          <iframe
            ref={feedbackFrameRef}
            className="pg-feedback__frame"
            src={FEEDBACK_FORM_SRC}
            title="Feedback form"
            loading="lazy"
          />
        </div>
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
