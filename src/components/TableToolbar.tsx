import { useEffect, useRef, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CloseIcon,
  PaintBucketIcon,
  TableIcon,
  TrashIcon,
} from '../icons';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  getTable,
  insertColumn,
  insertRow,
  toggleHeaderRow,
} from '../core/tables';
import type { DaEditor } from '../core/types';

/** Floating controls anchored under the table containing the selection. */
export function TableToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const entry = getTable(editor);
  const inTable = Boolean(entry);

  useEffect(() => {
    const el = ref.current;
    if (!el || !entry) {
      setPosition(null);
      return;
    }

    try {
      const dom = ReactEditor.toDOMNode(editor, entry[0]);
      const rect = dom.getBoundingClientRect();
      const container = el.offsetParent as HTMLElement | null;
      const base = container?.getBoundingClientRect();

      setPosition({
        top: rect.bottom - (base?.top ?? 0) + 8,
        left:
          rect.left - (base?.left ?? 0) + rect.width / 2 - el.offsetWidth / 2,
      });
    } catch {
      setPosition(null);
    }
  });

  if (!inTable || !position) return null;

  return (
    <div
      ref={ref}
      className="da-table-toolbar"
      role="toolbar"
      aria-label="Table"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="da-tb__btn"
        title="Toggle header row"
        aria-label="Toggle header row"
        onClick={() => toggleHeaderRow(editor)}
      >
        <PaintBucketIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Toggle header row"
        aria-label="Header row"
        onClick={() => toggleHeaderRow(editor)}
      >
        <TableIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Delete table"
        aria-label="Delete table"
        onClick={() => deleteTable(editor)}
      >
        <TrashIcon />
      </button>

      <span className="da-tb__sep" />

      <button
        type="button"
        className="da-tb__btn"
        title="Insert row above"
        aria-label="Insert row above"
        onClick={() => insertRow(editor, 'above')}
      >
        <ArrowUpIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Insert row below"
        aria-label="Insert row below"
        onClick={() => insertRow(editor, 'below')}
      >
        <ArrowDownIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Delete row"
        aria-label="Delete row"
        onClick={() => deleteRow(editor)}
      >
        <CloseIcon />
      </button>

      <span className="da-tb__sep" />

      <button
        type="button"
        className="da-tb__btn"
        title="Insert column left"
        aria-label="Insert column left"
        onClick={() => insertColumn(editor, 'left')}
      >
        <ArrowLeftIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Insert column right"
        aria-label="Insert column right"
        onClick={() => insertColumn(editor, 'right')}
      >
        <ArrowRightIcon />
      </button>
      <button
        type="button"
        className="da-tb__btn"
        title="Delete column"
        aria-label="Delete column"
        onClick={() => deleteColumn(editor)}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
