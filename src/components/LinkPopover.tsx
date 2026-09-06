import { useEffect, useRef, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { CheckIcon, UnlinkIcon } from '../icons';
import { isLinkActive, unwrapLink, wrapLink } from '../core/transforms';
import type { DaEditor } from '../core/types';

export interface LinkPopoverProps {
  open: boolean;
  onClose: () => void;
}

export function LinkPopover({ open, onClose }: LinkPopoverProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  // The selection is lost once the input takes focus, so capture it on open.
  const savedSelection = useRef<Range | null>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    savedSelection.current = editor.selection;
    setUrl('');

    let rect: DOMRect | null = null;
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      rect = domSelection.getRangeAt(0).getBoundingClientRect();
    }
    // Selection may be empty right after a toolbar click (no highlighted
    // text yet); fall back to Slate's own selection to find a DOM range.
    if ((!rect || (rect.top === 0 && rect.left === 0)) && editor.selection) {
      try {
        rect = ReactEditor.toDOMRange(editor, editor.selection).getBoundingClientRect();
      } catch {
        rect = null;
      }
    }
    if (!rect) return;

    // Resolved from the editor rather than the popover's own `offsetParent`:
    // the popover is not in the DOM yet on the render that opens it, so its ref
    // is still null here and reading the offset parent off it would leave
    // `position` unset — and an unset position is what keeps it from ever
    // rendering, so it would never open at all.
    let container: HTMLElement | null = null;
    try {
      container = ReactEditor.toDOMNode(editor, editor).closest<HTMLElement>(
        '.da-editor__container',
      );
    } catch {
      container = null;
    }
    const base = container?.getBoundingClientRect();

    setPosition({
      top: rect.bottom - (base?.top ?? 0) + 8,
      left: Math.max(4, rect.left - (base?.left ?? 0)),
    });
    // `editor` is deliberately not a dependency. `useSlate` returns a fresh
    // object identity on every editor change, so including it would re-run this
    // on each keystroke — clearing the input through `setUrl('')` and pinning
    // the popover open by re-setting `position` after a close. This should fire
    // on the open/close transition only; the editor it reads is the same
    // instance throughout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Separate from the effect above: the input does not exist until `position`
  // is set and the popover renders, so focusing there would find a null ref.
  useEffect(() => {
    if (open && position) inputRef.current?.focus();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as globalThis.Node)) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose]);

  if (!open || !position) return null;

  const restore = () => {
    if (savedSelection.current) {
      ReactEditor.focus(editor);
      Editor.withoutNormalizing(editor, () => {
        editor.selection = savedSelection.current;
      });
    }
  };

  const apply = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    restore();
    wrapLink(editor, href);
    onClose();
    // Focus goes back to the document, not the input that is being unmounted,
    // so typing continues where the link was just inserted.
    ReactEditor.focus(editor);
  };

  const remove = () => {
    restore();
    unwrapLink(editor);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="da-link-popover"
      style={{ top: position.top, left: position.left }}
    >
      <input
        ref={inputRef}
        type="url"
        className="da-link-popover__input"
        placeholder="Paste or type a link…"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            apply();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
          }
        }}
      />
      <button
        type="button"
        className="da-tb__btn"
        title="Apply link"
        aria-label="Apply link"
        onMouseDown={(event) => event.preventDefault()}
        onClick={apply}
      >
        <CheckIcon />
      </button>
      {isLinkActive(editor) && (
        <button
          type="button"
          className="da-tb__btn"
          title="Remove link"
          aria-label="Remove link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={remove}
        >
          <UnlinkIcon />
        </button>
      )}
    </div>
  );
}
