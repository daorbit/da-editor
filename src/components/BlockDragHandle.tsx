import { Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { DragHandleIcon } from '../icons';
import type { RenderElementProps } from 'slate-react';

/** Identifies our own block drags, so a text drag is left to Slate. */
const DRAG_TYPE = 'application/x-da-block';

export interface BlockDragHandleProps {
  element: RenderElementProps['element'];
}

/**
 * Grip for reordering a block by dragging it.
 *
 * The path is read at drop time rather than captured on drag start: the drag
 * itself does not change the document, but anything else in the session may
 * have, and a stale path would move the wrong node.
 */
export function BlockDragHandle({ element }: BlockDragHandleProps) {
  const editor = useSlateStatic();

  return (
    <span
      className="da-block-handle"
      contentEditable={false}
      draggable
      role="button"
      aria-label="Drag to move block"
      title="Drag to move"
      onDragStart={(event) => {
        const path = ReactEditor.findPath(editor, element);
        event.dataTransfer.setData(DRAG_TYPE, JSON.stringify(path));
        event.dataTransfer.effectAllowed = 'move';
      }}
    >
      <DragHandleIcon size={16} />
    </span>
  );
}

/** True when a drag carries one of our blocks rather than text or files. */
export function isBlockDrag(dataTransfer: DataTransfer): boolean {
  return Array.from(dataTransfer.types).includes(DRAG_TYPE);
}

/**
 * Moves the dragged block to the drop point.
 *
 * The target path is trimmed to its top level so a block always lands between
 * blocks, never inside the text of the one it was dropped onto.
 */
export function applyBlockDrop(
  editor: ReturnType<typeof useSlateStatic>,
  dataTransfer: DataTransfer,
  at: { path: number[] } | null,
): boolean {
  if (!at) return false;

  const raw = dataTransfer.getData(DRAG_TYPE);
  if (!raw) return false;

  let from: number[];
  try {
    from = JSON.parse(raw) as number[];
  } catch {
    return false;
  }

  const to = [at.path[0]];
  if (from.length === 0 || from[0] === to[0]) return false;

  Transforms.moveNodes(editor, { at: [from[0]], to });
  return true;
}
