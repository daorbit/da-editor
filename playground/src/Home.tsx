import {
  BoldIcon,
  BulletedListIcon,
  CalloutIcon,
  CodeBlockIcon,
  H1Icon,
  ImageIcon,
  LinkIcon,
  MoonIcon,
  PaletteIcon,
  SparklesIcon,
  TableIcon,
  TodoListIcon,
} from '../../src';
import type { Route } from './router';

const FEATURES = [
  {
    icon: <BoldIcon size={18} />,
    title: 'Rich marks',
    body: 'Bold, italic, underline, strikethrough, inline code, subscript, superscript, keyboard keys, text color and highlight.',
  },
  {
    icon: <H1Icon size={18} />,
    title: 'Every block you need',
    body: 'Headings, quotes, code blocks, bulleted, numbered and to-do lists, callouts, dividers, images and links.',
  },
  {
    icon: <SparklesIcon size={18} />,
    title: 'Slash menu',
    body: 'Press / anywhere to insert a block. Grouped, filterable, and fully keyboard navigable.',
  },
  {
    icon: <BulletedListIcon size={18} />,
    title: 'Markdown shortcuts',
    body: 'Type # for a heading, - for a list, > for a quote, or **bold** inline — it formats as you type.',
  },
  {
    icon: <PaletteIcon size={18} />,
    title: 'Light and dark',
    body: 'Follows the OS by default, or pin a theme. Every colour is a CSS custom property you can override.',
  },
  {
    icon: <CodeBlockIcon size={18} />,
    title: 'HTML, Markdown, JSON',
    body: 'Serialize the document three ways, and parse HTML back in. Nothing is locked inside the editor.',
  },
];

const ROADMAP = [
  { icon: <TableIcon size={16} />, label: 'Tables' },
  { icon: <ImageIcon size={16} />, label: 'Media embeds' },
  { icon: <TodoListIcon size={16} />, label: 'Drag handles' },
  { icon: <LinkIcon size={16} />, label: 'Mentions' },
  { icon: <CalloutIcon size={16} />, label: 'Comments' },
  { icon: <SparklesIcon size={16} />, label: 'AI streaming' },
];

export interface HomeProps {
  navigate: (route: Route) => void;
  onToggleTheme: () => void;
  dark: boolean;
}

export function Home({ navigate, onToggleTheme, dark }: HomeProps) {
  return (
    <div className="pg-page">
      <header className="pg-nav">
        <span className="pg-brand">da-text-editor</span>
        <div className="pg-nav__actions">
          <button type="button" className="pg-btn pg-btn--ghost" onClick={onToggleTheme}>
            {dark ? '☀' : <MoonIcon size={15} />}
            {dark ? 'Light' : 'Dark'}
          </button>
          <button type="button" className="pg-btn" onClick={() => navigate('/playground')}>
            Open playground
          </button>
        </div>
      </header>

      <section className="pg-hero">
        <span className="pg-badge">
          <SparklesIcon size={13} />
          Built on Slate
        </span>
        <h1 className="pg-hero__title">
          A professional rich-text editor
          <br />
          for React.
        </h1>
        <p className="pg-hero__lead">
          One install. No icon packages to wire up — the editor, its icon set and
          its document model ship together. React is the only peer dependency.
        </p>

        <div className="pg-hero__actions">
          <button
            type="button"
            className="pg-btn pg-btn--lg"
            onClick={() => navigate('/playground')}
          >
            Try the editor
          </button>
          <code className="pg-install">npm install da-text-editor</code>
        </div>
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
        <pre className="pg-code">
          <code>{`import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

export function Example() {
  return (
    <DaEditor
      theme="system"
      onChange={(value) => console.log(value)}
    />
  );
}`}</code>
        </pre>
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
        MIT licensed · <button type="button" className="pg-link" onClick={() => navigate('/playground')}>Open the playground</button>
      </footer>
    </div>
  );
}
