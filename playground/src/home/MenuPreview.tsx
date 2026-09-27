import {
  AtSign,
  Bold,
  Code,
  Heading,
  Italic,
  Link as LinkIcon,
  List,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from 'lucide-react';
import type { MenuKind } from './homeContent';

const MARKS = [Bold, Italic, Underline, Strikethrough, Code, LinkIcon];

const SLASH_ITEMS = [
  { icon: Heading, label: 'Heading 1' },
  { icon: List, label: 'Bulleted list' },
  { icon: Table, label: 'Table' },
  { icon: AtSign, label: 'Mention' },
];

function FloatingPreview() {
  return (
    <div className="lp-mock">
      <div className="lp-mock__bubble">
        <span className="lp-mock__chip">Text</span>
        <span className="lp-mock__sep" />
        {MARKS.map((Icon, index) => (
          <span key={index} className={`lp-mock__btn${index === 0 ? ' lp-mock__btn--on' : ''}`}>
            <Icon size={14} />
          </span>
        ))}
      </div>
      <p className="lp-mock__text">
        Good editors stay out of the way, <mark className="lp-mock__sel">until you need them</mark>,
        then show exactly the right tools.
      </p>
    </div>
  );
}

function SlashPreview() {
  return (
    <div className="lp-mock">
      <p className="lp-mock__text">
        Meeting notes
        <br />
        <span className="lp-mock__slash">/h</span>
        <span className="lp-mock__caret" />
      </p>
      <div className="lp-mock__menu">
        <span className="lp-mock__group">Basic blocks</span>
        {SLASH_ITEMS.map((item, index) => (
          <span
            key={item.label}
            className={`lp-mock__item${index === 0 ? ' lp-mock__item--active' : ''}`}
          >
            <span className="lp-mock__item-icon">
              <item.icon size={14} />
            </span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FixedPreview() {
  return (
    <div className="lp-mock lp-mock--fixed">
      <div className="lp-mock__toolbar">
        <span className="lp-mock__btn">
          <Undo2 size={14} />
        </span>
        <span className="lp-mock__btn">
          <Redo2 size={14} />
        </span>
        <span className="lp-mock__sep" />
        <span className="lp-mock__chip">Heading 2</span>
        <span className="lp-mock__sep" />
        {MARKS.map((Icon, index) => (
          <span key={index} className="lp-mock__btn">
            <Icon size={14} />
          </span>
        ))}
      </div>
      <div className="lp-mock__page">
        <span className="lp-mock__line lp-mock__line--title" />
        <span className="lp-mock__line" />
        <span className="lp-mock__line" />
        <span className="lp-mock__line lp-mock__line--short" />
      </div>
    </div>
  );
}

export function MenuPreview({ kind }: { kind: MenuKind }) {
  if (kind === 'floating') return <FloatingPreview />;
  if (kind === 'slash') return <SlashPreview />;
  return <FixedPreview />;
}
