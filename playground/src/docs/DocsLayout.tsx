import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { DOC_NAV, adjacentDocs, findDoc } from './nav';
import { DOC_BODIES } from './pages';
import { version as PKG_VERSION } from '../../../package.json';

interface DocsLayoutProps {
  onToggleTheme: () => void;
  dark: boolean;
}

export function DocsLayout({ onToggleTheme, dark }: DocsLayoutProps) {
  const { page } = useParams<{ page?: string }>();
  const slug = page ?? 'introduction';
  const doc = findDoc(slug);
  const Body = DOC_BODIES[slug];
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [slug]);

  const { prev, next } = adjacentDocs(slug);

  return (
    <div className="docs">
      <header className="docs-header">
        <div className="docs-header__inner">
          <div className="docs-header__left">
            <button
              type="button"
              className="docs-header__burger"
              aria-label="Toggle navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
            <Link className="docs-brand" to="/">
              <img
                className="docs-brand__mark"
                src="/da-editor-logo-512.png"
                alt=""
                width={24}
                height={24}
              />
              da-text-editor
              <span className="docs-brand__ver">v{PKG_VERSION}</span>
            </Link>
          </div>

          <nav className="docs-header__nav">
            <NavLink className="docs-headlink" to="/docs/introduction">
              Docs
            </NavLink>
            <Link className="docs-headlink" to="/playground">
              Playground
            </Link>
            <a
              className="docs-headlink"
              href="https://www.npmjs.com/package/da-text-editor"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <a
              className="docs-headlink"
              href="https://github.com/daorbit/da-editor"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <button
              type="button"
              className="docs-iconbtn"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </nav>
        </div>
      </header>

      <div className="docs-body">
        <aside className={`docs-side ${navOpen ? 'docs-side--open' : ''}`}>
          <nav className="docs-side__nav">
            {DOC_NAV.map((group) => (
              <div className="docs-side__group" key={group.label}>
                <p className="docs-side__label">{group.label}</p>
                {group.pages.map((p) => (
                  <NavLink
                    key={p.slug}
                    to={`/docs/${p.slug}`}
                    className={({ isActive }) =>
                      `docs-side__link ${isActive ? 'docs-side__link--active' : ''}`
                    }
                  >
                    {p.title}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {navOpen && (
          <div
            className="docs-side__scrim"
            onClick={() => setNavOpen(false)}
            aria-hidden
          />
        )}

        <main className="docs-main">
          <article className="docs-article">
            {doc && Body ? (
              <>
                <p className="docs-eyebrow">
                  {DOC_NAV.find((g) => g.pages.some((p) => p.slug === slug))?.label}
                </p>
                <h1 className="docs-title">{doc.title}</h1>
                <Body />
              </>
            ) : (
              <>
                <h1 className="docs-title">Page not found</h1>
                <p className="doc-lead">
                  No docs page at <code className="doc-inline">/docs/{slug}</code>.{' '}
                  <Link to="/docs/introduction">Back to Introduction</Link>.
                </p>
              </>
            )}
          </article>

          {(prev || next) && (
            <nav className="docs-pager">
              {prev ? (
                <Link className="docs-pager__link" to={`/docs/${prev.slug}`}>
                  <span className="docs-pager__dir">Previous</span>
                  <span className="docs-pager__title">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  className="docs-pager__link docs-pager__link--next"
                  to={`/docs/${next.slug}`}
                >
                  <span className="docs-pager__dir">Next</span>
                  <span className="docs-pager__title">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}

          <footer className="docs-footer">
            <span>MIT licensed</span>
            <a
              href="https://github.com/daorbit/da-editor"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/da-text-editor"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
