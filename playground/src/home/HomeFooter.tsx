import { Link } from 'react-router-dom';
import { DOC_PAGES } from '../docs/nav';
import { GithubMark } from '../ui/GithubMark';
import { GITHUB_URL, ISSUES_URL, NPM_URL } from './homeContent';

const PRODUCT_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#menus', label: 'Menus' },
  { href: '#quickstart', label: 'Quick start' },
  { href: '#faq', label: 'FAQ' },
];

const COMMUNITY_LINKS = [
  { href: GITHUB_URL, label: 'GitHub' },
  { href: NPM_URL, label: 'npm' },
  { href: ISSUES_URL, label: 'Report an issue' },
];

export function HomeFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__grid">
        <div className="lp-footer__brand">
          <Link className="lp-brand" to="/">
            <img src="/da-editor-logo-512.png" alt="" width={26} height={26} />
            da-text-editor
          </Link>
          <p className="lp-muted">A complete rich text editor for React, in one install.</p>
          <a className="lp-icon-btn" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubMark />
          </a>
        </div>

        <nav className="lp-footer__col" aria-label="Product">
          <h3 className="lp-footer__heading">Product</h3>
          <Link className="lp-footer__link" to="/playground">
            Playground
          </Link>
          {PRODUCT_LINKS.map((link) => (
            <a key={link.href} className="lp-footer__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="lp-footer__col" aria-label="Docs">
          <h3 className="lp-footer__heading">Docs</h3>
          {DOC_PAGES.map((page) => (
            <Link key={page.slug} className="lp-footer__link" to={`/docs/${page.slug}`}>
              {page.title}
            </Link>
          ))}
        </nav>

        <nav className="lp-footer__col" aria-label="Community">
          <h3 className="lp-footer__heading">Community</h3>
          {COMMUNITY_LINKS.map((link) => (
            <a key={link.href} className="lp-footer__link" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
          <a className="lp-footer__link" href="#feedback">
            Feedback
          </a>
        </nav>
      </div>

      <div className="lp-footer__bottom">
        <span>© {new Date().getFullYear()} da-text-editor</span>
        <span>MIT licensed</span>
      </div>
    </footer>
  );
}
