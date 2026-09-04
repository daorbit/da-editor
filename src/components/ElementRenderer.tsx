import type { CSSProperties } from 'react';
import { Transforms } from 'slate';
import {
  ReactEditor,
  useSelected,
  useSlateStatic,
  type RenderElementProps,
} from 'slate-react';
import { ELEMENT } from '../core/types';

function blockStyle(props: RenderElementProps): CSSProperties {
  const { element } = props;
  return {
    textAlign: element.align,
    marginInlineStart: element.indent ? element.indent * 24 : undefined,
  };
}

export function ElementRenderer(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const style = blockStyle(props);

  switch (element.type) {
    case ELEMENT.h1:
      return (
        <h1 {...attributes} style={style} className="da-h1">
          {children}
        </h1>
      );
    case ELEMENT.h2:
      return (
        <h2 {...attributes} style={style} className="da-h2">
          {children}
        </h2>
      );
    case ELEMENT.h3:
      return (
        <h3 {...attributes} style={style} className="da-h3">
          {children}
        </h3>
      );
    case ELEMENT.blockquote:
      return (
        <blockquote {...attributes} style={style} className="da-blockquote">
          {children}
        </blockquote>
      );
    case ELEMENT.codeBlock:
      return (
        <pre {...attributes} style={style} className="da-code-block" spellCheck={false}>
          <code>{children}</code>
        </pre>
      );
    case ELEMENT.bulletedList:
      return (
        <ul {...attributes} style={style} className="da-ul">
          {children}
        </ul>
      );
    case ELEMENT.numberedList:
      return (
        <ol {...attributes} style={style} className="da-ol">
          {children}
        </ol>
      );
    case ELEMENT.listItem:
      return (
        <li {...attributes} style={style} className="da-li">
          {children}
        </li>
      );
    case ELEMENT.todoListItem:
      return <TodoItem {...props} />;
    case ELEMENT.divider:
      return <Divider {...props} />;
    case ELEMENT.callout:
      return <Callout {...props} />;
    case ELEMENT.image:
      return <Image {...props} />;
    case ELEMENT.link:
      return <Link {...props} />;
    default:
      return (
        <p {...attributes} style={style} className="da-p">
          {children}
        </p>
      );
  }
}

function TodoItem({ attributes, children, element }: RenderElementProps) {
  const editor = useSlateStatic();
  const checked = 'checked' in element ? Boolean(element.checked) : false;

  return (
    <div
      {...attributes}
      className={`da-todo${checked ? ' da-todo--checked' : ''}`}
      style={blockStyle({ attributes, children, element } as RenderElementProps)}
    >
      <span contentEditable={false} className="da-todo__box">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { checked: event.target.checked }, { at: path });
          }}
        />
      </span>
      <span className="da-todo__text">{children}</span>
    </div>
  );
}

function Divider({ attributes, children }: RenderElementProps) {
  const selected = useSelected();
  return (
    <div {...attributes} className="da-hr-wrap">
      <div contentEditable={false}>
        <hr className={`da-hr${selected ? ' da-hr--selected' : ''}`} />
      </div>
      {children}
    </div>
  );
}

function Callout({ attributes, children, element }: RenderElementProps) {
  const variant = 'variant' in element && element.variant ? element.variant : 'info';
  const emoji = 'emoji' in element && element.emoji ? element.emoji : '💡';

  return (
    <div {...attributes} className={`da-callout da-callout--${variant}`}>
      <span contentEditable={false} className="da-callout__icon">
        {emoji}
      </span>
      <div className="da-callout__body">{children}</div>
    </div>
  );
}

function Image({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const url = 'url' in element ? element.url : '';
  const caption = 'caption' in element && element.caption ? element.caption : '';
  const width = 'width' in element ? element.width : undefined;

  return (
    <div {...attributes} className="da-image-wrap">
      <div contentEditable={false}>
        <figure className="da-figure">
          <img
            src={url}
            alt={caption}
            width={width}
            className={`da-image${selected ? ' da-image--selected' : ''}`}
            draggable={false}
          />
          {caption && <figcaption className="da-figcaption">{caption}</figcaption>}
        </figure>
      </div>
      {children}
    </div>
  );
}

function Link({ attributes, children, element }: RenderElementProps) {
  const url = 'url' in element ? element.url : '';
  const selected = useSelected();

  return (
    <a
      {...attributes}
      href={url}
      className={`da-link${selected ? ' da-link--selected' : ''}`}
      // The href is live in the editor, so clicks must not navigate away.
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey) window.open(url, '_blank', 'noopener');
      }}
    >
      {children}
    </a>
  );
}
