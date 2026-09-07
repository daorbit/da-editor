import { Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { DragHandleIcon } from '../icons';
import type { RenderElementProps } from 'slate-react';

/** Identifies our own block drags, so a text drag is left to Slate. */
const DRAG_TYPE = 'application/x-da-block';

export interface BlockDragHandleProps {
  element: RenderElementProps['element'];
}

 
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

        const row = (event.currentTarget.closest('.da-draggable, .da-media-wrap') ??
          event.currentTarget.parentElement) as HTMLElement | null;
        if (row) {
          const rect = row.getBoundingClientRect();
          const ghost = row.cloneNode(true) as HTMLElement;
          ghost.classList.add('da-drag-ghost');
          ghost.style.width = `${rect.width}px`;
          document.body.appendChild(ghost);
          event.dataTransfer.setDragImage(ghost, event.clientX - rect.left, 16);
          // The element only needs to live for the browser's snapshot.
          window.setTimeout(() => ghost.remove(), 0);
          row.classList.add('da-dragging');
        }
      }}
      onDragEnd={(event) => {
        const row = event.currentTarget.closest('.da-draggable, .da-media-wrap') as HTMLElement | null;
        row?.classList.remove('da-dragging');
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
 * The top-level block row under the pointer, and whether the drop should land
 * before or after it. Drives the drop indicator; the move itself still resolves
 * through Slate's own `findEventRange` so behaviour matches a text drop.
 */
export function rowUnderPointer(
  clientX: number,
  clientY: number,
): { index: number; after: boolean; rect: DOMRect } | null {
  const content = document.querySelector('.da-editor__content');
  if (!content) return null;
  const rows = Array.from(content.children) as HTMLElement[];
  if (rows.length === 0) return null;

  let row =
    (document.elementFromPoint(clientX, clientY) as HTMLElement | null)?.closest(
      '.da-editor__content > *',
    ) as HTMLElement | null;

  if (!row) {
    row =
      rows.find((el) => {
        const r = el.getBoundingClientRect();
        return clientY >= r.top && clientY <= r.bottom;
      }) ?? (clientY < rows[0].getBoundingClientRect().top ? rows[0] : rows[rows.length - 1]);
  }

  const index = rows.indexOf(row);
  if (index === -1) return null;
  const rect = row.getBoundingClientRect();
  const after = clientY > rect.top + rect.height / 2;
  return { index, after, rect };
}

/**
 * Moves the dragged block to `at` (a Slate point from `findEventRange`),
 * trimmed to its top level so a block always lands between blocks.
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
