import { useMemo, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import { Check, Copy } from 'lucide-react';

export type CodeLanguage = 'tsx' | 'bash' | 'css';

export interface CodeTab {
  id: string;
  label: string;
  code: string;
}

export interface CodeWindowProps {
  code?: string;
  tabs?: CodeTab[];
  language?: CodeLanguage;
  title?: string;
  compact?: boolean;
}

export function CodeWindow({ code, tabs, language = 'tsx', title, compact }: CodeWindowProps) {
  const [active, setActive] = useState(tabs?.[0]?.id ?? '');
  const [copied, setCopied] = useState(false);

  const source = tabs ? (tabs.find((tab) => tab.id === active) ?? tabs[0]).code : (code ?? '');
  const html = useMemo(
    () => Prism.highlight(source, Prism.languages[language], language),
    [source, language],
  );

  const copy = () => {
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className={`lp-code${compact ? ' lp-code--compact' : ''}`}>
      <div className="lp-code__bar">
        {tabs ? (
          <div className="lp-code__tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === active}
                className={`lp-code__tab${tab.id === active ? ' lp-code__tab--active' : ''}`}
                onClick={() => setActive(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="lp-code__title">{title}</span>
        )}
        <button
          type="button"
          className="lp-code__copy"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="lp-code__body">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
