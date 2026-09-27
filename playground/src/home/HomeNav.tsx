import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { GithubMark } from '../ui/GithubMark';
import { GITHUB_URL, NPM_URL } from './homeContent';

export interface HomeNavProps {
  dark: boolean;
  onToggleTheme: () => void;
}

const SECTION_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#ai', label: 'Build with AI' },
  { href: '#menus', label: 'Menus' },
  { href: '#faq', label: 'FAQ' },
];

export function HomeNav({ dark, onToggleTheme }: HomeNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}${open ? ' lp-nav--open' : ''}`}>
      <div className="lp-nav__inner">
        <Link className="lp-brand" to="/" onClick={close}>
          <img src="/da-editor-logo-512.png" alt="" width={26} height={26} />
          da-text-editor
        </Link>

        <nav className="lp-nav__links" aria-label="Main">
          {SECTION_LINKS.map((link) => (
            <a key={link.href} className="lp-nav__link" href={link.href} onClick={close}>
              {link.label}
            </a>
          ))}
          <Link className="lp-nav__link" to="/docs/introduction" onClick={close}>
            Docs
          </Link>
          <Link className="lp-nav__link" to="/playground" onClick={close}>
            Playground
          </Link>
          <a className="lp-nav__link" href={NPM_URL} target="_blank" rel="noreferrer">
            npm
          </a>
        </nav>

        <div className="lp-nav__actions">
          <a
            className="lp-icon-btn"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
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
          <Link className="lp-btn lp-btn--primary lp-btn--sm lp-nav__cta" to="/docs/quickstart">
            Get started
          </Link>
          <button
            type="button"
            className="lp-icon-btn lp-nav__toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
