import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeading({ eyebrow, title, lead, align = 'left' }: SectionHeadingProps) {
  return (
    <header className={`lp-heading lp-heading--${align}`}>
      {eyebrow && <span className="lp-eyebrow">{eyebrow}</span>}
      <h2 className="lp-h2">{title}</h2>
      {lead && <p className="lp-lead">{lead}</p>}
    </header>
  );
}
