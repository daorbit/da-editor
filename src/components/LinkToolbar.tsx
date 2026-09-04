import { useEffect, useRef, useState } from 'react';
import { Element as SlateElement, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { CheckIcon, CloseIcon, DuplicateIcon, UnlinkIcon } from '../icons';
import { ELEMENT, type DaEditor } from '../core/types';

/** Trims a URL down to something readable in a narrow toolbar. */
function displayUrl(url: string): string {
  const stripped = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return stripped.length > 32 ? `${stripped.slice(0, 32)}…` : stripped;
}

/** Floating controls for the link containing the selection. */
export function LinkToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const [entry] = Array.from(
    editor.nodes({
      match: (n) => SlateElement.isElement(n) && n.type === ELEMENT.link,
    }),
  );

  // Leaving the link closes the editing state so it reopens clean next time.
  useEffect(() => {
    if (!entry) {
      setEditing(false);
      setCopied(false);
    }
  }, [entry]);

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
        left: Math.max(4, rect.left - (base?.left ?? 0)),
      });
    } catch {
      setPosition(null);
    }
  });

  if (!entry) return null;

  const [node, path] = entry;
  if (!SlateElement.isElement(node)) return null;
  const url = 'url' in node ? node.url : '';

  const apply = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const href = /^(https?:|mailto:|tel:|#|\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    Transforms.setNodes(editor, { url: href }, { at: path });
    setEditing(false);
  };

  const remove = () => {
    Transforms.unwrapNodes(editor, {
      at: path,
      match: (n) => SlateElement.isElement(n) && n.type === ELEMENT.link,
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; failing silently beats throwing.
    }
  };

  return (
    <div
      ref={ref}
      className="da-link-toolbar"
      role="toolbar"
      aria-label="Link"
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
            className="da-link-toolbar__input"
            value={draft}
            autoFocus
            placeholder="Paste or type a link…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setEditing(false);
              }
            }}
          />
          <button
            type="button"
            className="da-link-toolbar__btn da-link-toolbar__btn--icon"
            title="Apply"
            aria-label="Apply"
            onClick={apply}
          >
            <CheckIcon size={15} />
          </button>
          <button
            type="button"
            className="da-link-toolbar__btn da-link-toolbar__btn--icon"
            title="Cancel"
            aria-label="Cancel"
            onClick={() => setEditing(false)}
          >
            <CloseIcon size={15} />
          </button>
        </>
      ) : (
        <>
          <a
            className="da-link-toolbar__url"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={url}
          >
            {displayUrl(url)}
          </a>

          <span className="da-tb__sep" />

          <button
            type="button"
            className="da-link-toolbar__btn"
            onClick={() => {
              setDraft(url);
              setEditing(true);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="da-link-toolbar__btn da-link-toolbar__btn--icon"
            title={copied ? 'Copied' : 'Copy link'}
            aria-label={copied ? 'Copied' : 'Copy link'}
            onClick={copy}
          >
            {copied ? <CheckIcon size={15} /> : <DuplicateIcon size={15} />}
          </button>
          <button
            type="button"
            className="da-link-toolbar__btn da-link-toolbar__btn--icon"
            title="Remove link"
            aria-label="Remove link"
            onClick={remove}
          >
            <UnlinkIcon size={15} />
          </button>
        </>
      )}
    </div>
  );
}
