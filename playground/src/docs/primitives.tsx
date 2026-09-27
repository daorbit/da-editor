import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Info, Lightbulb } from 'lucide-react';
import { CodeWindow, type CodeLanguage } from '../ui/CodeWindow';
import { PROPS, FEATURES, API, TOKENS, SHORTCUTS } from './content';
import { findDoc } from './nav';
import { anchorId, slugify, textOf } from './slug';

export function DocLead({ children }: { children: ReactNode }) {
  return <p className="doc-lead">{children}</p>;
}

function Heading({ level, id, children }: { level: 2 | 3; id?: string; children: ReactNode }) {
  const anchor = id ?? slugify(textOf(children));
  const Tag = level === 2 ? 'h2' : 'h3';

  return (
    <Tag className={`doc-h${level}`} id={anchor}>
      {children}
      <a className="doc-anchor" href={`#${anchor}`} aria-label="Link to this section">
        #
      </a>
    </Tag>
  );
}

export function DocH2(props: { id?: string; children: ReactNode }) {
  return <Heading level={2} {...props} />;
}

export function DocH3(props: { id?: string; children: ReactNode }) {
  return <Heading level={3} {...props} />;
}

export function DocCode({
  children,
  title,
  language = 'tsx',
}: {
  children: string;
  title?: string;
  language?: CodeLanguage;
}) {
  return (
    <div className="doc-code">
      <CodeWindow code={children} title={title ?? (language === 'bash' ? 'Terminal' : undefined)} language={language} compact />
    </div>
  );
}

export function Inline({ children }: { children: ReactNode }) {
  return <code className="doc-inline">{children}</code>;
}

const CALLOUT_ICONS = { note: Info, tip: Lightbulb, warning: AlertTriangle };

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_ICONS;
  title?: string;
  children: ReactNode;
}) {
  const Icon = CALLOUT_ICONS[type];
  return (
    <aside className={`doc-callout doc-callout--${type}`}>
      <Icon size={17} className="doc-callout__icon" />
      <div className="doc-callout__body">
        {title && <p className="doc-callout__title">{title}</p>}
        <div>{children}</div>
      </div>
    </aside>
  );
}

export function DocCards({ slugs }: { slugs: string[] }) {
  return (
    <div className="doc-cards">
      {slugs.map((slug) => {
        const page = findDoc(slug);
        if (!page) return null;
        return (
          <Link key={slug} className="doc-card" to={`/docs/${slug}`}>
            <span className="doc-card__title">
              {page.title}
              <ArrowRight size={15} />
            </span>
            <span className="doc-card__body">{page.description}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="doc-steps">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="doc-step">
      <p className="doc-step__title">{title}</p>
      {children}
    </li>
  );
}

export function PropsTable() {
  return (
    <div className="doc-table">
      <div className="doc-table__head doc-table__row">
        <span>Prop</span>
        <span>Type</span>
        <span>Default</span>
        <span>Detail</span>
      </div>
      {PROPS.map((prop) => (
        <div className="doc-table__row" key={prop.name} id={anchorId('prop', prop.name)}>
          <span className="doc-table__name">{prop.name}</span>
          <span className="doc-table__type">{prop.type}</span>
          <span className="doc-table__def">{prop.def}</span>
          <span className="doc-table__body">{prop.body}</span>
        </div>
      ))}
    </div>
  );
}

export function ApiTable() {
  return (
    <div className="doc-table">
      <div className="doc-table__head doc-table__row doc-table__row--api">
        <span>Method</span>
        <span>Signature</span>
        <span>Detail</span>
      </div>
      {API.map((entry) => (
        <div className="doc-table__row doc-table__row--api" key={entry.name} id={anchorId('api', entry.name)}>
          <span className="doc-table__name">{entry.name}</span>
          <span className="doc-table__type">{entry.sig}</span>
          <span className="doc-table__body">{entry.body}</span>
        </div>
      ))}
    </div>
  );
}

export function FeaturesTable() {
  return (
    <div className="doc-table">
      <div className="doc-table__head doc-table__row doc-table__row--feat">
        <span>Feature</span>
        <span>Reached by</span>
        <span>Detail</span>
      </div>
      {FEATURES.map((feature) => (
        <div className="doc-table__row doc-table__row--feat" key={feature.name} id={anchorId('feature', feature.name)}>
          <span className="doc-table__name">{feature.name}</span>
          <span>
            <code className="doc-inline">{feature.how}</code>
          </span>
          <span className="doc-table__body">{feature.body}</span>
        </div>
      ))}
    </div>
  );
}

export function TokensList() {
  return (
    <dl className="doc-caps">
      {TOKENS.map(([token, detail]) => (
        <div className="doc-caps__row" key={token}>
          <dt>
            <code className="doc-inline">{token}</code>
          </dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ShortcutsTable() {
  return (
    <>
      {SHORTCUTS.map((section) => (
        <div key={section.group} className="doc-keys">
          <DocH3>{section.group}</DocH3>
          <div className="doc-table">
            {section.rows.map(([keys, what]) => (
              <div className="doc-table__row doc-table__row--keys" key={keys}>
                <kbd className="doc-kbd">{keys}</kbd>
                <span className="doc-table__body">{what}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
