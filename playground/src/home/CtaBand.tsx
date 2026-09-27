import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CtaBand() {
  return (
    <section className="lp-cta">
      <div className="lp-cta__inner">
        <h2 className="lp-cta__title">
          Ready to get <b>started?</b>
        </h2>
        <p className="lp-cta__lead">
          Add a complete editor to your React app with one install.
        </p>
        <div className="lp-cta__actions">
          <Link className="lp-btn lp-btn--light lp-btn--lg" to="/docs/quickstart">
            Get started
            <ArrowRight size={16} />
          </Link>
          <Link className="lp-btn lp-btn--outline-light lp-btn--lg" to="/playground">
            Open the playground
          </Link>
        </div>
      </div>
    </section>
  );
}
