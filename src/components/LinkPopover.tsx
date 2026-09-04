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

    const el = ref.current;
    const domSelection = window.getSelection();
    if (!el || !domSelection || domSelection.rangeCount === 0) return;

    const rect = domSelection.getRangeAt(0).getBoundingClientRect();
    const container = el.offsetParent as HTMLElement | null;
    const base = container?.getBoundingClientRect();

    setPosition({
      top: rect.bottom - (base?.top ?? 0) + 8,
      left: Math.max(4, rect.left - (base?.left ?? 0)),
    });

    inputRef.current?.focus();
  }, [open, editor]);

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
