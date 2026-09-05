import { useEffect, useRef, useState } from 'react';
import { Element as SlateElement, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { CheckIcon, CloseIcon, TrashIcon } from '../icons';
import { ELEMENT, type DaEditor } from '../core/types';

const MEDIA_TYPES = [
  ELEMENT.image,
  ELEMENT.video,
  ELEMENT.audio,
  ELEMENT.file,
  ELEMENT.embed,
] as const;

type EditingField = 'url' | 'caption' | null;

/** Floating controls for the selected media block. */
export function MediaToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [editing, setEditing] = useState<EditingField>(null);
  const [draft, setDraft] = useState('');

  const [entry] = Array.from(
    editor.nodes({
      match: (n) =>
        SlateElement.isElement(n) &&
        (MEDIA_TYPES as readonly string[]).includes(n.type),
    }),
  );

  // Leaving the media block closes editing so it reopens clean next time.
  useEffect(() => {
    if (!entry) setEditing(null);
  }, [entry]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

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

  if (!entry) return null;

  const [node, path] = entry;
  if (!SlateElement.isElement(node)) return null;

  const url = 'url' in node ? node.url : '';
  const caption = 'caption' in node && node.caption ? node.caption : '';

  const startEditing = (field: EditingField) => {
    setDraft(field === 'url' ? url : caption);
    setEditing(field);
  };

  const apply = () => {
    if (editing === 'url') {
      const trimmed = draft.trim();
      if (trimmed) Transforms.setNodes(editor, { url: trimmed }, { at: path });
    } else if (editing === 'caption') {
      Transforms.setNodes(editor, { caption: draft.trim() || undefined }, { at: path });
    }
    setEditing(null);
  };

  return (
    <div
      ref={ref}
      className="da-media-toolbar"
      role="toolbar"
      aria-label="Media"
      // Rendered before measuring so the ref exists; hidden until positioned.
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {editing ? (
        <>
          <input
            ref={inputRef}
            className="da-media-toolbar__input"
            value={draft}
            placeholder={editing === 'url' ? 'Paste or type a link…' : 'Caption'}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setEditing(null);
              }
            }}
          />
          <button
            type="button"
            className="da-media-toolbar__btn da-media-toolbar__btn--icon"
            title="Apply"
            aria-label="Apply"
            onClick={apply}
          >
            <CheckIcon size={15} />
          </button>
          <button
            type="button"
            className="da-media-toolbar__btn da-media-toolbar__btn--icon"
            title="Cancel"
            aria-label="Cancel"
            onClick={() => setEditing(null)}
          >
            <CloseIcon size={15} />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="da-media-toolbar__btn"
            onClick={() => startEditing('url')}
          >
            Edit link
          </button>

          <button
            type="button"
            className="da-media-toolbar__btn"
            onClick={() => startEditing('caption')}
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
        </>
      )}
    </div>
  );
}
