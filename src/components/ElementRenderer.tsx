import type { CSSProperties } from 'react';
import { Transforms } from 'slate';
import {
  ReactEditor,
  useSelected,
  useSlateStatic,
  type RenderElementProps,
} from 'slate-react';
import { ELEMENT } from '../core/types';

function blockStyle(element: RenderElementProps['element']): CSSProperties {
  return {
    textAlign: element.align,
    marginInlineStart: element.indent ? element.indent * 24 : undefined,
    lineHeight: element.lineHeight,
  };
}

export function ElementRenderer(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const style = blockStyle(element);

  switch (element.type) {
    case ELEMENT.h1:
      return <h1 {...attributes} style={style} className="da-h1">{children}</h1>;
    case ELEMENT.h2:
      return <h2 {...attributes} style={style} className="da-h2">{children}</h2>;
    case ELEMENT.h3:
      return <h3 {...attributes} style={style} className="da-h3">{children}</h3>;
    case ELEMENT.h4:
      return <h4 {...attributes} style={style} className="da-h4">{children}</h4>;
    case ELEMENT.h5:
      return <h5 {...attributes} style={style} className="da-h5">{children}</h5>;
    case ELEMENT.h6:
      return <h6 {...attributes} style={style} className="da-h6">{children}</h6>;
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
      return <ul {...attributes} style={style} className="da-ul">{children}</ul>;
    case ELEMENT.numberedList:
      return <ol {...attributes} style={style} className="da-ol">{children}</ol>;
    case ELEMENT.listItem:
      return <li {...attributes} style={style} className="da-li">{children}</li>;
    case ELEMENT.todoListItem:
      return <TodoItem {...props} />;
    case ELEMENT.divider:
      return <Divider {...props} />;
    case ELEMENT.callout:
      return <Callout {...props} />;
    case ELEMENT.image:
      return <Image {...props} />;
    case ELEMENT.video:
      return <Video {...props} />;
    case ELEMENT.audio:
      return <Audio {...props} />;
    case ELEMENT.file:
      return <FileAttachment {...props} />;
    case ELEMENT.embed:
      return <Embed {...props} />;
    case ELEMENT.table:
      return <Table {...props} />;
    case ELEMENT.tableRow:
      return <tr {...attributes} className="da-tr">{children}</tr>;
    case ELEMENT.tableCell:
      return <td {...attributes} style={style} className="da-td">{children}</td>;
    case ELEMENT.tableHeaderCell:
      return <th {...attributes} style={style} className="da-th">{children}</th>;
    case ELEMENT.link:
      return <Link {...props} />;
    case ELEMENT.mention:
      return <Mention {...props} />;
    default:
      return <p {...attributes} style={style} className="da-p">{children}</p>;
  }
}

function TodoItem({ attributes, children, element }: RenderElementProps) {
  const editor = useSlateStatic();
  const checked = 'checked' in element ? Boolean(element.checked) : false;

  return (
    <div
      {...attributes}
      className={`da-todo${checked ? ' da-todo--checked' : ''}`}
      style={blockStyle(element)}
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
    <div {...attributes} className="da-media-wrap">
      <div contentEditable={false}>
        <figure className="da-figure">
          <img
            src={url}
            alt={caption}
            width={width}
            className={`da-image${selected ? ' da-media--selected' : ''}`}
            draggable={false}
          />
          {caption && <figcaption className="da-figcaption">{caption}</figcaption>}
        </figure>
      </div>
      {children}
    </div>
  );
}

function Video({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const url = 'url' in element ? element.url : '';

  return (
    <div {...attributes} className="da-media-wrap">
      <div contentEditable={false}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={url}
          controls
          className={`da-video${selected ? ' da-media--selected' : ''}`}
        />
      </div>
      {children}
    </div>
  );
}

function Audio({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const url = 'url' in element ? element.url : '';

  return (
    <div {...attributes} className="da-media-wrap">
      <div contentEditable={false}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          src={url}
          controls
          className={`da-audio${selected ? ' da-media--selected' : ''}`}
        />
      </div>
      {children}
    </div>
  );
}

function FileAttachment({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const url = 'url' in element ? element.url : '';
  const name = 'name' in element && element.name ? element.name : url.split('/').pop() || 'File';

  return (
    <div {...attributes} className="da-media-wrap">
      <div contentEditable={false}>
        <a
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          className={`da-file${selected ? ' da-media--selected' : ''}`}
        >
          <span className="da-file__icon">📎</span>
          <span className="da-file__name">{name}</span>
        </a>
      </div>
      {children}
    </div>
  );
}

function Embed({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const url = 'url' in element ? element.url : '';

  return (
    <div {...attributes} className="da-media-wrap">
      <div contentEditable={false}>
        <div className={`da-embed${selected ? ' da-media--selected' : ''}`}>
          <iframe
            src={url}
            title="Embedded content"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
      {children}
    </div>
  );
}

function Table({ attributes, children, element }: RenderElementProps) {
  const widths = 'columnWidths' in element ? element.columnWidths : undefined;

  return (
    <div className="da-table-wrap">
      <table {...attributes} className="da-table">
        {widths && widths.length > 0 && (
          <colgroup contentEditable={false}>
            {widths.map((width, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        )}
        <tbody>{children}</tbody>
      </table>
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
      // The href is live in the editor, so plain clicks must not navigate away.
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey) window.open(url, '_blank', 'noopener');
      }}
    >
      {children}
    </a>
  );
}

function Mention({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const name = 'name' in element ? element.name : '';

  return (
    <span
      {...attributes}
      contentEditable={false}
      className={`da-mention${selected ? ' da-mention--selected' : ''}`}
      data-mention-id={'id' in element ? element.id : undefined}
    >
      @{name}
      {children}
    </span>
  );
}
