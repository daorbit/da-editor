import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CodeWindow } from '../ui/CodeWindow';
import { BENEFITS, FEATURE_PILLS, STATS } from './homeContent';
import { SectionHeading } from './SectionHeading';

export function FeaturesSection() {
  return (
    <section className="lp-section" id="features">
      <SectionHeading
        eyebrow="Features"
        align="center"
        title={
          <>
            Flexible features, <b>on by default</b>
          </>
        }
        lead="Blocks, inline elements, media and writing tools arrive together in one package, with no extensions to install or configure."
      />

      <dl className="lp-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="lp-stats__item">
            <dt className="lp-stats__value">{stat.value}</dt>
            <dd className="lp-stats__label">{stat.label}</dd>
          </div>
        ))}
      </dl>

      <ul className="lp-pills">
        {FEATURE_PILLS.map((feature) => (
          <li key={feature.label} className="lp-pills__item">
            <feature.icon size={15} />
            {feature.label}
          </li>
        ))}
      </ul>

      <div className="lp-benefits">
        {BENEFITS.map((benefit) => (
          <article key={benefit.title} className="lp-benefit">
            <h3 className="lp-benefit__title">{benefit.title}</h3>
            <p className="lp-benefit__body">{benefit.body}</p>
            <CodeWindow
              code={benefit.code}
              language={benefit.language}
              title={benefit.file}
              compact
            />
            <Link className="lp-arrow-link" to={benefit.href}>
              Show docs
              <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
