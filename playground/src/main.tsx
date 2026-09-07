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

function App() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>('light');

  // The page chrome follows the same theme as the editor.
  useEffect(() => {
    document.documentElement.dataset.pgTheme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const go = (to: string) => navigate(to);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home navigate={go} onToggleTheme={toggleTheme} dark={theme === 'dark'} />
        }
      />
      <Route path="/playground" element={<Playground navigate={go} />} />
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
