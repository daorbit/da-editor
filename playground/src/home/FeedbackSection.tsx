import { FEEDBACK_FORM_SRC } from './homeContent';
import { SectionHeading } from './SectionHeading';
import { useFrameHeight } from './useFrameHeight';

export function FeedbackSection() {
  const frameRef = useFrameHeight(FEEDBACK_FORM_SRC);

  return (
    <section className="lp-section" id="feedback">
      <SectionHeading
        eyebrow="Feedback"
        align="center"
        title={
          <>
            Tell us what <b>you need</b>
          </>
        }
        lead="Found a bug, want a prop, or using it in something? It goes straight to the maintainers."
      />
      <div className="lp-feedback">
        <iframe
          ref={frameRef}
          className="lp-feedback__frame"
          src={FEEDBACK_FORM_SRC}
          title="Feedback form"
          loading="lazy"
        />
      </div>
    </section>
  );
}
