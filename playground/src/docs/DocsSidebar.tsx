import { NavLink } from 'react-router-dom';
import { DOC_NAV } from './nav';

export function DocsSidebar({ open }: { open: boolean }) {
  return (
    <aside className={`dx-side${open ? ' dx-side--open' : ''}`}>
      <nav className="dx-side__nav" aria-label="Documentation">
        {DOC_NAV.map((group) => (
          <div className="dx-side__group" key={group.label}>
            <p className="dx-side__label">{group.label}</p>
            {group.pages.map((page) => (
              <NavLink
                key={page.slug}
                to={`/docs/${page.slug}`}
                className={({ isActive }) =>
                  `dx-side__link${isActive ? ' dx-side__link--active' : ''}`
                }
              >
                {page.title}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
