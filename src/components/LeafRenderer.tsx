import type { RenderLeafProps } from 'slate-react';

export function LeafRenderer({ attributes, children, leaf }: RenderLeafProps) {
  let content = children;

  if (leaf.bold) content = <strong>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u>{content}</u>;
  if (leaf.strikethrough) content = <s>{content}</s>;
  if (leaf.code) content = <code className="da-inline-code">{content}</code>;
  if (leaf.kbd) content = <kbd className="da-kbd">{content}</kbd>;
  if (leaf.subscript) content = <sub>{content}</sub>;
  if (leaf.superscript) content = <sup>{content}</sup>;

  const style = {
    color: leaf.color,
    backgroundColor: leaf.highlight ?? leaf.backgroundColor,
    fontSize: leaf.fontSize ? `${leaf.fontSize}px` : undefined,
    fontFamily: leaf.fontFamily,
  };

  return (
    <span
      {...attributes}
      style={style}
      className={leaf.comment ? 'da-commented' : undefined}
      data-comment={leaf.comment}
    >
      {content}
    </span>
  );
}
