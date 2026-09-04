import { useEffect, useRef, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import type { ReactNode } from 'react';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CloseIcon,
  PaintBucketIcon,
  TableIcon,
  TrashIcon,
} from '../icons';
import {
  BORDER_SIDES,
  deleteColumn,
  deleteRow,
  deleteTable,
  getCellBackground,
  getTable,
  hasBorder,
  insertColumn,
  insertRow,
  setBorders,
  setCellBackground,
  toggleBorder,
} from '../core/tables';
import { ColorPicker } from './ColorPicker';
import type { DaEditor } from '../core/types';

/** Floating controls anchored under the table containing the selection. */
export function TableToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [menu, setMenu] = useState<'color' | 'borders' | null>(null);

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

  if (!inTable) return null;

  return (
    <div
      ref={ref}
      className="da-table-toolbar"
      role="toolbar"
      aria-label="Table"
      // Rendered before it is measured, so the ref exists for the effect to
      // read; kept invisible until a position is known.
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <Popover
        icon={<PaintBucketIcon />}
        label="Cell background"
        open={menu === 'color'}
        onToggle={() => setMenu(menu === 'color' ? null : 'color')}
      >
        <ColorPicker
          value={getCellBackground(editor)}
          onChange={(color) => setCellBackground(editor, color)}
          onClose={() => setMenu(null)}
          clearLabel="Clear"
        />
      </Popover>

      <Popover
        icon={<TableIcon />}
        label="Borders"
        open={menu === 'borders'}
        onToggle={() => setMenu(menu === 'borders' ? null : 'borders')}
      >
        <div className="da-table-toolbar__menu">
          {BORDER_SIDES.map((side) => (
            <button
              key={side}
              type="button"
              role="menuitemcheckbox"
              aria-checked={hasBorder(editor, side)}
              className="da-tb__item"
              onClick={() => toggleBorder(editor, side)}
            >
              <span className="da-tb__item-icon">
                {hasBorder(editor, side) ? <CheckIcon size={13} /> : null}
              </span>
              <span className="da-tb__item-label">
                {side.charAt(0).toUpperCase() + side.slice(1)} Border
              </span>
            </button>
          ))}

          <button
            type="button"
            className="da-tb__item"
            onClick={() => {
              setBorders(editor, 'none');
              setMenu(null);
            }}
          >
            <span className="da-tb__item-icon" />
            <span className="da-tb__item-label">No Border</span>
          </button>
          <button
            type="button"
            className="da-tb__item"
            onClick={() => {
              setBorders(editor, 'outside');
              setMenu(null);
            }}
          >
            <span className="da-tb__item-icon" />
            <span className="da-tb__item-label">Outside Borders</span>
          </button>
          <button
            type="button"
            className="da-tb__item"
            onClick={() => {
              setBorders(editor, 'all');
              setMenu(null);
            }}
          >
            <span className="da-tb__item-icon" />
            <span className="da-tb__item-label">All Borders</span>
          </button>
        </div>
      </Popover>
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

interface PopoverProps {
  icon: ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A toolbar button whose panel opens above the floater. */
function Popover({ icon, label, open, onToggle, children }: PopoverProps) {
  return (
    <div className="da-table-toolbar__popover">
      <button
        type="button"
        className={`da-tb__btn${open ? ' da-tb__btn--active' : ''}`}
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        {icon}
      </button>
      {open && (
        <div className="da-table-toolbar__panel" role="menu">
          {children}
        </div>
      )}
    </div>
  );
}
