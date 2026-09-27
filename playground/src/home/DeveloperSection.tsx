import { Link } from 'react-router-dom';
import { ArrowUpRight, Atom, BookOpen, Braces, Feather } from 'lucide-react';
import { DEV_CALLOUTS } from './homeContent';
import { SectionHeading } from './SectionHeading';

const CALLOUT_ICONS = [Atom, Braces, Feather];

export function DeveloperSection() {
  return (
    <section className="lp-section">
      <SectionHeading
        eyebrow="Developers"
        title={
          <>
            Made for the people <b>who ship it</b>
          </>
        }
      />

      <div className="lp-dev">
        <Link className="lp-dev__docs" to="/docs/introduction">
          <span className="lp-dev__docs-icon">
            <BookOpen size={20} />
          </span>
          <span className="lp-dev__docs-title">
            Developer docs
            <ArrowUpRight size={18} />
          </span>
          <span className="lp-dev__docs-body">
            Every prop, the ref API, keyboard shortcuts, theming tokens and a guide to
            wiring your own backend, with examples you can copy.
          </span>
        </Link>

        <ul className="lp-dev__callouts">
          {DEV_CALLOUTS.map((callout, index) => {
            const Icon = CALLOUT_ICONS[index];
            return (
              <li key={callout.title} className="lp-dev__callout">
                <span className="lp-dev__callout-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <h3 className="lp-dev__callout-title">{callout.title}</h3>
                  <p className="lp-muted">{callout.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
