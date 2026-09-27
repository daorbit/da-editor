import { STACK } from './homeContent';

export function StackStrip() {
  const items = [...STACK, ...STACK];

  return (
    <section className="lp-strip" aria-label="Built with">
      <p className="lp-strip__label">Built on proven foundations</p>
      <div className="lp-strip__viewport">
        <ul className="lp-strip__track">
          {items.map((item, index) => (
            <li key={index} className="lp-strip__item" aria-hidden={index >= STACK.length}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
