import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CodeWindow } from '../ui/CodeWindow';
import { MENU_TABS, type MenuKind } from './homeContent';
import { MenuPreview } from './MenuPreview';
import { SectionHeading } from './SectionHeading';

export function MenusSection() {
  const [active, setActive] = useState<MenuKind>('floating');
  const tab = MENU_TABS.find((entry) => entry.id === active) ?? MENU_TABS[0];

  return (
    <section className="lp-section" id="menus">
      <SectionHeading
        eyebrow="Menus"
        align="center"
        title={
          <>
            Three ways to format, <b>one prop each</b>
          </>
        }
        lead="A floating toolbar on selection, a slash menu at the caret and a full toolbar above the page. Use any mix of them."
      />

      <div className="lp-tabs" role="tablist" aria-label="Menu types">
        {MENU_TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={entry.id === active}
            className={`lp-tabs__tab${entry.id === active ? ' lp-tabs__tab--active' : ''}`}
            onClick={() => setActive(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="lp-menu-panel" role="tabpanel" key={tab.id}>
        <div className="lp-menu-panel__preview">
          <MenuPreview kind={tab.id} />
        </div>
        <div className="lp-menu-panel__text">
          <h3 className="lp-h3">{tab.title}</h3>
          <p className="lp-muted">{tab.body}</p>
          <CodeWindow code={tab.code} title="App.tsx" compact />
          <Link className="lp-arrow-link" to="/docs/props">
            Show docs
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
