import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { GithubMark } from '../ui/GithubMark';
import { GITHUB_URL, NPM_URL } from '../home/homeContent';
import { version as PKG_VERSION } from '../../../package.json';

export interface DocsHeaderProps {
  dark: boolean;
  navOpen: boolean;
  onToggleNav: () => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

export function DocsHeader({ dark, navOpen, onToggleNav, onToggleTheme, onOpenSearch }: DocsHeaderProps) {
  return (
    <header className="dx-header">
      <div className="dx-header__inner">
        <button
          type="button"
          className="lp-icon-btn dx-header__burger"
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={navOpen}
          onClick={onToggleNav}
        >
          {navOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link className="lp-brand" to="/">
          <img src="/da-editor-logo-512.png" alt="" width={24} height={24} />
          da-text-editor
        </Link>
        <span className="dx-version">v{PKG_VERSION}</span>

        <button type="button" className="dx-search-btn" onClick={onOpenSearch}>
          <Search size={15} />
          <span className="dx-search-btn__label">Search docs…</span>
          <kbd className="dx-kbd">{IS_MAC ? '⌘' : 'Ctrl'} K</kbd>
        </button>

        <nav className="dx-header__nav" aria-label="Site">
          <NavLink className="dx-header__link" to="/docs/introduction">
            Docs
          </NavLink>
          <Link className="dx-header__link" to="/playground">
            Playground
          </Link>
          <a className="dx-header__link" href={NPM_URL} target="_blank" rel="noreferrer">
            npm
          </a>
        </nav>

        <div className="dx-header__actions">
          <button
            type="button"
            className="lp-icon-btn dx-header__search-icon"
            onClick={onOpenSearch}
            aria-label="Search docs"
          >
            <Search size={16} />
          </button>
          <a className="lp-icon-btn" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubMark />
          </a>
          <button
            type="button"
            className="lp-icon-btn"
            onClick={onToggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
