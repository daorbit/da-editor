import { useEffect, useState } from 'react';

export type Route = '/' | '/playground';

function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '/playground' ? '/playground' : '/';
}

/** Hash routing so the playground needs no router dependency or server config. */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = next;
    window.scrollTo(0, 0);
  };

  return [route, navigate];
}
