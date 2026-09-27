import { ChevronDown } from 'lucide-react';
import { FAQS } from './homeContent';
import { SectionHeading } from './SectionHeading';

export function FaqSection() {
  return (
    <section className="lp-section lp-faq" id="faq">
      <SectionHeading
        title={
          <>
            Frequently asked <b>questions</b>
          </>
        }
      />
      <div className="lp-faq__list">
        {FAQS.map((faq, index) => (
          <details key={faq.question} className="lp-faq__item" open={index === 0}>
            <summary className="lp-faq__question">
              {faq.question}
              <ChevronDown size={18} className="lp-faq__chevron" />
            </summary>
            <p className="lp-faq__answer">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
