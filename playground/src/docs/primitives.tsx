import type { ReactNode } from 'react';
import { PROPS, FEATURES, API, TOKENS } from './content';

export function DocLead({ children }: { children: ReactNode }) {
  return <p className="doc-lead">{children}</p>;
}

export function DocH2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 className="doc-h2" id={id}>
      {children}
    </h2>
  );
}

export function DocCode({ children }: { children: string }) {
  return (
    <pre className="doc-code">
      <code>{children}</code>
    </pre>
  );
}

export function Inline({ children }: { children: ReactNode }) {
  return <code className="doc-inline">{children}</code>;
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
        <div className="doc-table__row" key={prop.name}>
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
        <div className="doc-table__row doc-table__row--api" key={entry.name}>
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
        <div className="doc-table__row doc-table__row--feat" key={feature.name}>
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
