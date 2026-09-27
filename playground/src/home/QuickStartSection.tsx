import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { USAGE } from '../docs/content';
import { CodeWindow } from '../ui/CodeWindow';
import { INSTALL_COMMANDS } from './homeContent';
import { SectionHeading } from './SectionHeading';

const REQUIREMENTS = [
  'React 18 or 19',
  'A bundler that imports CSS, such as Vite or Next.js',
  'That is it. Slate and the icons ship with the package.',
];

export function QuickStartSection() {
  return (
    <section className="lp-section lp-split" id="quickstart">
      <div className="lp-split__text">
        <SectionHeading
          eyebrow="Quick start"
          title={
            <>
              Up and running <b>in a minute</b>
            </>
          }
          lead="Install the package, import the component and its stylesheet, and render it. Every feature is already switched on."
        />
        <h3 className="lp-h4">Requirements</h3>
        <ul className="lp-checklist">
          {REQUIREMENTS.map((item) => (
            <li key={item}>
              <Check size={15} />
              {item}
            </li>
          ))}
        </ul>
        <Link className="lp-arrow-link" to="/docs/installation">
          Read the installation guide
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="lp-split__code">
        <CodeWindow tabs={INSTALL_COMMANDS} language="bash" compact />
        <CodeWindow title="Editor.tsx" code={USAGE} />
      </div>
    </section>
  );
}
