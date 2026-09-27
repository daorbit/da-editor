import { useEffect, useState } from 'react';
import { ReactEditor } from 'slate-react';
import type { DaEditor } from './types';

/**
 * Whether the editor currently holds focus.
 *
 * Slate keeps `editor.selection` after the editor blurs, so a floating toolbar
 * driven only by the selection stays open once the user clicks away. This
 * tracks real focus so those toolbars can hide.
 */
export function useEditorFocused(editor: DaEditor): boolean {
  const [focused, setFocused] = useState(() => ReactEditor.isFocused(editor));

  useEffect(() => {
    let dom: HTMLElement;
    try {
      dom = ReactEditor.toDOMNode(editor, editor);
    } catch {
      return;
    }

    const sync = () => setFocused(ReactEditor.isFocused(editor));

    dom.addEventListener('focus', sync);
    dom.addEventListener('blur', sync);
    // A click landing on a floating toolbar blurs the editable but should not
    // close the toolbar, so focus is re-read after the click settles.
    document.addEventListener('mousedown', sync);
    document.addEventListener('focusin', sync);
    sync();

    return () => {
      dom.removeEventListener('focus', sync);
      dom.removeEventListener('blur', sync);
      document.removeEventListener('mousedown', sync);
      document.removeEventListener('focusin', sync);
    };
  }, [editor]);

  return focused;
}

/**
 * Whether the user is mid-way through dragging out a selection in the editor.
 *
 * UI anchored to the selection would otherwise chase the pointer on every
 * selection change of the drag; it waits for the button to be released.
 */
export function usePointerSelecting(editor: DaEditor): boolean {
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    let dom: HTMLElement;
    try {
      dom = ReactEditor.toDOMNode(editor, editor);
    } catch {
      return;
    }

    const start = (event: PointerEvent) => {
      if (event.button === 0) setSelecting(true);
    };
    const end = () => setSelecting(false);

    dom.addEventListener('pointerdown', start);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);

    return () => {
      dom.removeEventListener('pointerdown', start);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
    };
  }, [editor]);

  return selecting;
}

/**
 * Calls `onDismiss` when a pointer or Escape lands outside `ref`.
 *
 * Pass `active: false` when nothing is open so the listeners stay off.
 */
export function useDismissOnOutside(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as globalThis.Node | null;
      if (target && ref.current?.contains(target)) return;
      onDismiss();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, active, onDismiss]);
}
