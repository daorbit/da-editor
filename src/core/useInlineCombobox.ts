import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Editor, Element as SlateElement, Node, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { isPlainTextTarget } from './clipboard';
import type { DaEditor } from './types';

export interface TriggerMatch {
  target: Range;
  query: string;
}


function readTrigger(editor: DaEditor, pattern: RegExp): TriggerMatch | null {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return null;
  if (isPlainTextTarget(editor) || Editor.marks(editor)?.code) return null;

  const block = Editor.above(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });
  if (!block) return null;

  const { anchor } = selection;
  const before = Editor.string(editor, { anchor: Editor.start(editor, block[1]), focus: anchor });
  const match = before.match(pattern);
  if (!match) return null;

  const length = match[0].trimStart().length;
  if (length > anchor.offset || !Node.has(editor, anchor.path)) return null;

  return {
    target: { anchor: { path: anchor.path, offset: anchor.offset - length }, focus: anchor },
    query: match[1] ?? '',
  };
}

/**
 * Tracks the trigger before the caret. Escape dismisses it until the caret
 * leaves that trigger, so it does not reopen on the next keystroke.
 */
export function useTriggerQuery(editor: DaEditor, pattern: RegExp) {
  const [match, setMatch] = useState<TriggerMatch | null>(null);
  const dismissed = useRef<string | null>(null);
  const { selection } = editor;

  useEffect(() => {
    const next = readTrigger(editor, pattern);
    const key = next ? JSON.stringify(next.target.anchor) : null;

    if (!next || key !== dismissed.current) dismissed.current = null;
    if (!next || key === dismissed.current) {
      setMatch(null);
      return;
    }

    setMatch((current) =>
      current && current.query === next.query && Range.equals(current.target, next.target)
        ? current
        : next,
    );
  }, [editor, selection, pattern]);

  const dismiss = () => {
    if (match) dismissed.current = JSON.stringify(match.target.anchor);
    setMatch(null);
  };

  return { match, dismiss };
}

export interface AnchoredPosition {
  top: number;
  left: number;
}

const GAP = 6;
const EDGE = 4;

export function useAnchoredPosition(
  editor: DaEditor,
  range: Range | null,
  popupRef: RefObject<HTMLElement | null>,
  key: unknown,
): AnchoredPosition | null {
  const [position, setPosition] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!range || !popup) {
      setPosition(null);
      return;
    }

    let rect: DOMRect;
    let container: HTMLElement | null;
    try {
      rect = ReactEditor.toDOMRange(editor, range).getBoundingClientRect();
      container = ReactEditor.toDOMNode(editor, editor).closest<HTMLElement>(
        '.da-editor__container',
      );
    } catch {
      setPosition(null);
      return;
    }
    if (!container) return;

    const base = container.getBoundingClientRect();
    const viewport = container.closest('.da-editor__scroll')?.getBoundingClientRect();
    const visibleTop = Math.max(0, viewport?.top ?? 0);
    const visibleBottom = Math.min(window.innerHeight, viewport?.bottom ?? window.innerHeight);

    const height = popup.offsetHeight;
    const width = popup.offsetWidth;
    const spaceBelow = visibleBottom - rect.bottom;
    const spaceAbove = rect.top - visibleTop;
    const above = spaceBelow < height + GAP && spaceAbove > spaceBelow;

    const next = {
      top: above ? rect.top - base.top - height - GAP : rect.bottom - base.top + GAP,
      left: Math.max(EDGE, Math.min(rect.left - base.left, base.width - width - EDGE)),
    };

    setPosition((current) =>
      current && current.top === next.top && current.left === next.left ? current : next,
    );
    // `key` stands in for whatever changes the popup's size or anchor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, range, key]);

  return position;
}

export interface MenuNavigation {
  index: number;
  setIndex: (index: number) => void;
}

export function useMenuNavigation(
  editor: DaEditor,
  options: {
    open: boolean;
    count: number;
    resetKey: unknown;
    menuRef: RefObject<HTMLElement | null>;
    onChoose: (index: number) => void;
    onDismiss: () => void;
  },
): MenuNavigation {
  const { open, count, resetKey, menuRef } = options;
  const [rawIndex, setIndex] = useState(0);
  const index = Math.min(rawIndex, Math.max(0, count - 1));
  const latest = useRef({ ...options, index });
  latest.current = { ...options, index };

  useEffect(() => setIndex(0), [resetKey]);

  useEffect(() => {
    menuRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [index, menuRef]);

  useEffect(() => {
    if (!open || count === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!ReactEditor.isFocused(editor) || event.isComposing) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          setIndex((i) => (i + 1) % count);
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          setIndex((i) => (i - 1 + count) % count);
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          event.stopPropagation();
          latest.current.onChoose(latest.current.index);
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          latest.current.onDismiss();
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [editor, open, count]);

  return { index, setIndex };
}
