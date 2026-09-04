import { Editor, Element as SlateElement, Node, Path, Range, Transforms } from 'slate';
import { ELEMENT, type DaEditor } from './types';

const DEFAULT_COLUMN_WIDTH = 160;

function emptyCell(header = false) {
  return {
    type: header ? ELEMENT.tableHeaderCell : ELEMENT.tableCell,
    children: [{ type: ELEMENT.paragraph, children: [{ text: '' }] }],
  } as SlateElement;
}

function emptyRow(columns: number, header = false) {
  return {
    type: ELEMENT.tableRow,
    children: Array.from({ length: columns }, () => emptyCell(header)),
  } as SlateElement;
}

/** The table containing the selection, if any. */
export function getTable(editor: DaEditor) {
  const [entry] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ELEMENT.table,
  });
  return entry;
}

function getCell(editor: DaEditor) {
  const [entry] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n.type === ELEMENT.tableCell || n.type === ELEMENT.tableHeaderCell),
  });
  return entry;
}

function getRow(editor: DaEditor) {
  const [entry] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ELEMENT.tableRow,
  });
  return entry;
}

export function isInTable(editor: DaEditor): boolean {
  return Boolean(getTable(editor));
}

export function insertTable(editor: DaEditor, rows = 3, columns = 3, withHeader = true): void {
  const table = {
    type: ELEMENT.table,
    columnWidths: Array.from({ length: columns }, () => DEFAULT_COLUMN_WIDTH),
    children: [
      ...(withHeader ? [emptyRow(columns, true)] : []),
      ...Array.from({ length: withHeader ? rows - 1 : rows }, () => emptyRow(columns)),
    ],
  } as SlateElement;

  Transforms.insertNodes(editor, table);
  // Land the caret in the first cell.
  const entry = getTable(editor);
  if (entry) {
    const start = Editor.start(editor, entry[1]);
    Transforms.select(editor, start);
  }
}

export function insertRow(editor: DaEditor, position: 'above' | 'below' = 'below'): void {
  const tableEntry = getTable(editor);
  const rowEntry = getRow(editor);
  if (!tableEntry || !rowEntry) return;

  const [row, rowPath] = rowEntry;
  const columns = SlateElement.isElement(row) ? row.children.length : 0;
  if (!columns) return;

  const at = position === 'above' ? rowPath : Path.next(rowPath);
  Transforms.insertNodes(editor, emptyRow(columns), { at });
}

export function insertColumn(editor: DaEditor, position: 'left' | 'right' = 'right'): void {
  const tableEntry = getTable(editor);
  const cellEntry = getCell(editor);
  if (!tableEntry || !cellEntry) return;

  const [table, tablePath] = tableEntry;
  const cellIndex = cellEntry[1][cellEntry[1].length - 1];
  const target = position === 'left' ? cellIndex : cellIndex + 1;

  if (!SlateElement.isElement(table)) return;

  Editor.withoutNormalizing(editor, () => {
    table.children.forEach((row, rowIndex) => {
      if (!SlateElement.isElement(row)) return;
      const isHeaderRow =
        SlateElement.isElement(row.children[0]) &&
        row.children[0].type === ELEMENT.tableHeaderCell;
      Transforms.insertNodes(editor, emptyCell(isHeaderRow), {
        at: [...tablePath, rowIndex, target],
      });
    });

    const widths = 'columnWidths' in table ? [...(table.columnWidths ?? [])] : [];
    widths.splice(target, 0, DEFAULT_COLUMN_WIDTH);
    Transforms.setNodes(editor, { columnWidths: widths }, { at: tablePath });
  });
}

export function deleteRow(editor: DaEditor): void {
  const tableEntry = getTable(editor);
  const rowEntry = getRow(editor);
  if (!tableEntry || !rowEntry) return;

  const [table] = tableEntry;
  // Removing the last row would leave an empty table, so drop the table instead.
  if (SlateElement.isElement(table) && table.children.length <= 1) {
    deleteTable(editor);
    return;
  }
  Transforms.removeNodes(editor, { at: rowEntry[1] });
}

export function deleteColumn(editor: DaEditor): void {
  const tableEntry = getTable(editor);
  const cellEntry = getCell(editor);
  if (!tableEntry || !cellEntry) return;

  const [table, tablePath] = tableEntry;
  if (!SlateElement.isElement(table)) return;

  const cellIndex = cellEntry[1][cellEntry[1].length - 1];
  const firstRow = table.children[0];
  const columns = SlateElement.isElement(firstRow) ? firstRow.children.length : 0;

  if (columns <= 1) {
    deleteTable(editor);
    return;
  }

  Editor.withoutNormalizing(editor, () => {
    // Remove from the last row up so earlier paths stay valid.
    for (let rowIndex = table.children.length - 1; rowIndex >= 0; rowIndex--) {
      Transforms.removeNodes(editor, { at: [...tablePath, rowIndex, cellIndex] });
    }

    const widths = 'columnWidths' in table ? [...(table.columnWidths ?? [])] : [];
    widths.splice(cellIndex, 1);
    Transforms.setNodes(editor, { columnWidths: widths }, { at: tablePath });
  });
}

export function deleteTable(editor: DaEditor): void {
  const entry = getTable(editor);
  if (!entry) return;
  Transforms.removeNodes(editor, { at: entry[1] });
}

export type BorderSide = 'top' | 'right' | 'bottom' | 'left';

export const BORDER_SIDES: BorderSide[] = ['top', 'right', 'bottom', 'left'];

/** The cells covered by the selection, or the single cell holding the caret. */
function selectedCells(editor: DaEditor) {
  return Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === ELEMENT.tableCell || n.type === ELEMENT.tableHeaderCell),
    }),
  );
}

/** Applies a background colour to every selected cell. */
export function setCellBackground(editor: DaEditor, color: string | null): void {
  Editor.withoutNormalizing(editor, () => {
    for (const [, path] of selectedCells(editor)) {
      Transforms.setNodes(
        editor,
        { background: color ?? undefined } as Partial<SlateElement>,
        { at: path },
      );
    }
  });
}

export function getCellBackground(editor: DaEditor): string | undefined {
  const [entry] = selectedCells(editor);
  const node = entry?.[0];
  return SlateElement.isElement(node) && 'background' in node ? node.background : undefined;
}

/** Whether a border side is currently drawn on every selected cell. */
export function hasBorder(editor: DaEditor, side: BorderSide): boolean {
  const cells = selectedCells(editor);
  if (cells.length === 0) return false;

  return cells.every(([node]) => {
    if (!SlateElement.isElement(node)) return false;
    // Absent means "drawn", so only an explicit false hides the side.
    return node.borders?.[side] !== false;
  });
}

export function toggleBorder(editor: DaEditor, side: BorderSide): void {
  const next = !hasBorder(editor, side);

  Editor.withoutNormalizing(editor, () => {
    for (const [node, path] of selectedCells(editor)) {
      if (!SlateElement.isElement(node)) continue;
      Transforms.setNodes(
        editor,
        { borders: { ...node.borders, [side]: next } } as Partial<SlateElement>,
        { at: path },
      );
    }
  });
}

/** Sets every side at once: all on, all off, or just the outer edges. */
export function setBorders(editor: DaEditor, preset: 'all' | 'none' | 'outside'): void {
  const tableEntry = getTable(editor);
  if (!tableEntry) return;

  const [table, tablePath] = tableEntry;
  if (!SlateElement.isElement(table)) return;

  if (preset !== 'outside') {
    const value = preset === 'all';
    Editor.withoutNormalizing(editor, () => {
      for (const [, path] of selectedCells(editor)) {
        Transforms.setNodes(
          editor,
          {
            borders: { top: value, right: value, bottom: value, left: value },
          } as Partial<SlateElement>,
          { at: path },
        );
      }
    });
    return;
  }

  // "Outside" draws only the table's perimeter, so each cell's borders depend
  // on whether it sits on an edge of the grid.
  const rows = table.children.filter((row) => SlateElement.isElement(row));
  const lastRow = rows.length - 1;

  Editor.withoutNormalizing(editor, () => {
    rows.forEach((row, rowIndex) => {
      if (!SlateElement.isElement(row)) return;
      const lastCell = row.children.length - 1;

      row.children.forEach((_, cellIndex) => {
        Transforms.setNodes(
          editor,
          {
            borders: {
              top: rowIndex === 0,
              bottom: rowIndex === lastRow,
              left: cellIndex === 0,
              right: cellIndex === lastCell,
            },
          } as Partial<SlateElement>,
          { at: [...tablePath, rowIndex, cellIndex] },
        );
      });
    });
  });
}

export function toggleHeaderRow(editor: DaEditor): void {
  const entry = getTable(editor);
  if (!entry) return;

  const [table, tablePath] = entry;
  if (!SlateElement.isElement(table)) return;

  const firstRow = table.children[0];
  if (!SlateElement.isElement(firstRow)) return;

  const isHeader =
    SlateElement.isElement(firstRow.children[0]) &&
    firstRow.children[0].type === ELEMENT.tableHeaderCell;

  const nextType = isHeader ? ELEMENT.tableCell : ELEMENT.tableHeaderCell;

  Editor.withoutNormalizing(editor, () => {
    firstRow.children.forEach((_, cellIndex) => {
      Transforms.setNodes(editor, { type: nextType }, { at: [...tablePath, 0, cellIndex] });
    });
  });
}

/**
 * Moves the caret to the next or previous cell, appending a row when Tab is
 * pressed in the last cell. Returns false when not in a table.
 */
export function moveToCell(editor: DaEditor, direction: 'next' | 'previous'): boolean {
  const tableEntry = getTable(editor);
  const cellEntry = getCell(editor);
  if (!tableEntry || !cellEntry) return false;

  const [table, tablePath] = tableEntry;
  if (!SlateElement.isElement(table)) return false;

  const cellPath = cellEntry[1];
  const rowIndex = cellPath[cellPath.length - 2];
  const cellIndex = cellPath[cellPath.length - 1];

  const row = table.children[rowIndex];
  const columns = SlateElement.isElement(row) ? row.children.length : 0;

  let nextRow = rowIndex;
  let nextCell = cellIndex + (direction === 'next' ? 1 : -1);

  if (nextCell >= columns) {
    nextCell = 0;
    nextRow += 1;
  } else if (nextCell < 0) {
    nextCell = columns - 1;
    nextRow -= 1;
  }

  if (nextRow < 0) return true;

  if (nextRow >= table.children.length) {
    if (direction !== 'next') return true;
    Transforms.insertNodes(editor, emptyRow(columns), {
      at: [...tablePath, table.children.length],
    });
  }

  const target = [...tablePath, nextRow, nextCell];
  Transforms.select(editor, Editor.start(editor, target));
  return true;
}

export function setColumnWidth(editor: DaEditor, index: number, width: number): void {
  const entry = getTable(editor);
  if (!entry) return;

  const [table, tablePath] = entry;
  if (!SlateElement.isElement(table)) return;

  const firstRow = table.children[0];
  const columns = SlateElement.isElement(firstRow) ? firstRow.children.length : 0;
  const widths =
    'columnWidths' in table && table.columnWidths?.length === columns
      ? [...table.columnWidths]
      : Array.from({ length: columns }, () => DEFAULT_COLUMN_WIDTH);

  widths[index] = Math.max(60, width);
  Transforms.setNodes(editor, { columnWidths: widths }, { at: tablePath });
}

/**
 * Keeps table structure valid: rows only inside tables, cells only inside rows,
 * and every cell holding at least one block.
 */
export function normalizeTable(
  editor: DaEditor,
  entry: [Node, Path],
): boolean {
  const [node, path] = entry;
  if (!SlateElement.isElement(node)) return false;

  if (node.type === ELEMENT.tableCell || node.type === ELEMENT.tableHeaderCell) {
    // A cell must contain blocks, not raw text.
    const hasBlock = node.children.some(
      (child) => SlateElement.isElement(child) && Editor.isBlock(editor, child),
    );
    if (!hasBlock) {
      Transforms.wrapNodes(
        editor,
        { type: ELEMENT.paragraph, children: [] },
        { at: path, match: (n) => !SlateElement.isElement(n) },
      );
      return true;
    }
  }

  if (node.type === ELEMENT.table) {
    // Rows must all have the same number of cells.
    const rows = node.children.filter((child) => SlateElement.isElement(child));
    const width = Math.max(...rows.map((row) => row.children.length), 0);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.children.length < width) {
        Transforms.insertNodes(editor, emptyCell(), {
          at: [...path, rowIndex, row.children.length],
        });
        return true;
      }
    }
  }

  return false;
}

/** True when the selection spans more than one cell. */
export function isCellSelection(editor: DaEditor): boolean {
  const { selection } = editor;
  if (!selection || Range.isCollapsed(selection)) return false;

  const cells = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === ELEMENT.tableCell || n.type === ELEMENT.tableHeaderCell),
    }),
  );
  return cells.length > 1;
}
