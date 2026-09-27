import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { findDoc, findGroup } from './nav';
import { DOC_BODIES } from './pages';
import { DocsHeader } from './DocsHeader';
import { DocsPager } from './DocsPager';
import { DocsSearch } from './DocsSearch';
import { DocsSidebar } from './DocsSidebar';
import { DocsToc } from './DocsToc';
import { useDocHeadings } from './useDocHeadings';
import { useHashScroll } from './useHashScroll';
import { GITHUB_URL, ISSUES_URL, NPM_URL } from '../home/homeContent';
import '../home/home.css';

interface DocsLayoutProps {
  onToggleTheme: () => void;
  dark: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

export function DocsLayout({ onToggleTheme, dark }: DocsLayoutProps) {
  const { page } = useParams<{ page?: string }>();
  const slug = page ?? 'introduction';
  const doc = findDoc(slug);
  const group = findGroup(slug);
  const Body = DOC_BODIES[slug];

  const articleRef = useRef<HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { headings, activeId } = useDocHeadings(articleRef, slug);

  useHashScroll();
  useEffect(() => setNavOpen(false), [slug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !isTypingTarget(event.target);
      if (combo || slash) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="lp dx">
      <DocsHeader
        dark={dark}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onToggleTheme={onToggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="dx-body">
        <DocsSidebar open={navOpen} />
        {navOpen && <div className="dx-scrim" onClick={() => setNavOpen(false)} aria-hidden />}

        <main className="dx-main">
          <article className="dx-article" ref={articleRef}>
            {doc && Body ? (
              <>
                <nav className="dx-crumbs" aria-label="Breadcrumb">
                  <Link to="/docs/introduction">Docs</Link>
                  <ChevronRight size={13} />
                  <span>{group?.label}</span>
                  <ChevronRight size={13} />
                  <span aria-current="page">{doc.title}</span>
                </nav>
                <h1 className="dx-title">{doc.title}</h1>
                <Body />
              </>
            ) : (
              <>
                <h1 className="dx-title">Page not found</h1>
                <p className="doc-lead">
                  No docs page at <code className="doc-inline">/docs/{slug}</code>.{' '}
                  <Link to="/docs/introduction">Back to Introduction</Link>.
                </p>
              </>
            )}
          </article>

          <DocsPager slug={slug} />

          <footer className="dx-footer">
            <span>MIT licensed</span>
            <span className="dx-footer__links">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={NPM_URL} target="_blank" rel="noreferrer">
                npm
              </a>
              <a href={ISSUES_URL} target="_blank" rel="noreferrer">
                Report an issue
              </a>
            </span>
          </footer>
        </main>

        <DocsToc headings={headings} activeId={activeId} />
      </div>

      <DocsSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
