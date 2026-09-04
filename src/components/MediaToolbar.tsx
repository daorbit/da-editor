import { useEffect, useRef, useState } from 'react';
import { Element as SlateElement, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { TrashIcon } from '../icons';
import { ELEMENT, type DaEditor } from '../core/types';

const MEDIA_TYPES = [
  ELEMENT.image,
  ELEMENT.video,
  ELEMENT.audio,
  ELEMENT.file,
  ELEMENT.embed,
] as const;

/** Floating controls for the selected media block. */
export function MediaToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const [entry] = Array.from(
    editor.nodes({
      match: (n) =>
        SlateElement.isElement(n) &&
        (MEDIA_TYPES as readonly string[]).includes(n.type),
    }),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !entry) {
      setPosition(null);
      return;
    }

    try {
      const rect = ReactEditor.toDOMNode(editor, entry[0]).getBoundingClientRect();
      const container = el.offsetParent as HTMLElement | null;
      const base = container?.getBoundingClientRect();

      setPosition({
        top: rect.bottom - (base?.top ?? 0) + 8,
        left: rect.left - (base?.left ?? 0) + rect.width / 2 - el.offsetWidth / 2,
      });
    } catch {
      setPosition(null);
    }
  });

  if (!entry || !position) return null;

  const [node, path] = entry;
  if (!SlateElement.isElement(node)) return null;

  const url = 'url' in node ? node.url : '';
  const caption = 'caption' in node && node.caption ? node.caption : '';

  return (
    <div
      ref={ref}
      className="da-media-toolbar"
      role="toolbar"
      aria-label="Media"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="da-media-toolbar__btn"
        onClick={() => {
          const next = window.prompt('Media URL', url);
          if (next === null) return;
          Transforms.setNodes(editor, { url: next }, { at: path });
        }}
      >
        Edit link
      </button>

      <button
        type="button"
        className="da-media-toolbar__btn"
        onClick={() => {
          const next = window.prompt('Caption', caption);
          if (next === null) return;
          Transforms.setNodes(editor, { caption: next || undefined }, { at: path });
        }}
      >
        Caption
      </button>

      <span className="da-tb__sep" />

      <button
        type="button"
        className="da-media-toolbar__btn da-media-toolbar__btn--icon"
        title="Delete"
        aria-label="Delete"
        onClick={() => Transforms.removeNodes(editor, { at: path })}
      >
        <TrashIcon size={15} />
      </button>
    </div>
  );
}
