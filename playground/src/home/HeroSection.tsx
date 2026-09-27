import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { DaEditor } from '../../../src';
import { HERO_CONTENT } from '../demoContent';
import { INSTALL } from '../docs/content';
import { GithubMark } from '../ui/GithubMark';
import { GITHUB_URL, MENTIONABLES } from './homeContent';

export interface HeroSectionProps {
  dark: boolean;
}

export function HeroSection({ dark }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    void navigator.clipboard.writeText(INSTALL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <section className="lp-hero">
      <div className="lp-hero__copy">
        <span className="lp-pill">
          <span className="lp-pill__dot" />
          Open source · MIT licensed
        </span>
        <h1 className="lp-hero__title">
          The drop-in <span className="lp-grad">rich text editor</span> for React
        </h1>
        <p className="lp-hero__lead">
          Tables, mentions, slash commands, media, find &amp; replace and Markdown
          shortcuts, all working on the first render. One component, one stylesheet,
          no plugin graph to assemble.
        </p>

        <div className="lp-hero__actions">
          <Link className="lp-btn lp-btn--primary lp-btn--lg" to="/playground">
            Open playground
            <ArrowRight size={16} />
          </Link>
          <a
            className="lp-btn lp-btn--ghost lp-btn--lg"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            <GithubMark />
            GitHub
          </a>
        </div>

        <button type="button" className="lp-install" onClick={copyInstall}>
          <span className="lp-install__prompt">$</span>
          <code>{INSTALL}</code>
          <span className="lp-install__copy">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </span>
        </button>
      </div>

      <div className="lp-hero__visual">
        <div className="lp-window">
          <div className="lp-window__bar">
            <span className="lp-window__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="lp-window__title">Live editor, try it</span>
          </div>
          <DaEditor
            theme={dark ? 'dark' : 'light'}
            defaultValue={HERO_CONTENT}
            minHeight="380px"
            maxHeight="560px"
            mentionables={MENTIONABLES}
            className="lp-window__editor"
          />
        </div>
        <p className="lp-hero__hint">
          Press <kbd>/</kbd> for blocks, <kbd>@</kbd> to mention, or select text.
        </p>
      </div>
    </section>
  );
}
