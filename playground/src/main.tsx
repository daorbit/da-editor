import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Theme } from '../../src';
import { Home } from './Home';
import { Playground } from './Playground';
import { useRoute } from './router';
import './playground.css';

function App() {
  const [route, navigate] = useRoute();
  const [theme, setTheme] = useState<Theme>('light');

  // The page chrome follows the same theme as the editor.
  useEffect(() => {
    document.documentElement.dataset.pgTheme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return route === '/playground' ? (
    <Playground navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <Home navigate={navigate} onToggleTheme={toggleTheme} dark={theme === 'dark'} />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
