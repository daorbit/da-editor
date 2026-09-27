import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import type { Theme } from '../../src';
import { Home } from './Home';
import { Playground } from './Playground';
import { DocsLayout } from './docs/DocsLayout';
import './playground.css';
import './docs.css';

const THEME_KEY = 'da-editor:theme';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be blocked; fall back to the OS preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://quantalog-be.daorbit.in/tracker.js';
    s.async = true;
    s.dataset.site = 'lKjFa1AWqady8eh7';
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  // The page chrome follows the same theme as the editor.
  useEffect(() => {
    document.documentElement.dataset.pgTheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const go = (to: string) => navigate(to);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home onToggleTheme={toggleTheme} dark={theme === 'dark'} />
        }
      />
      <Route
        path="/playground"
        element={
          <Playground navigate={go} onToggleTheme={toggleTheme} dark={theme === 'dark'} />
        }
      />
      <Route
        path="/docs"
        element={<Navigate to="/docs/introduction" replace />}
      />
      <Route
        path="/docs/:page"
        element={<DocsLayout onToggleTheme={toggleTheme} dark={theme === 'dark'} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

document.documentElement.dataset.pgTheme = readStoredTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
