import { Editor, Element as SlateElement, Node, Range, Transforms } from 'slate';
import { ELEMENT, type Align, type DaEditor, type ElementType, type MarkType } from './types';

export const LIST_TYPES: ElementType[] = [ELEMENT.bulletedList, ELEMENT.numberedList];

const ALIGN_TYPES: ElementType[] = [
  ELEMENT.paragraph,
  ELEMENT.h1,
  ELEMENT.h2,
  ELEMENT.h3,
  ELEMENT.h4,
  ELEMENT.h5,
  ELEMENT.h6,
  ELEMENT.blockquote,
];

/* ---------------------------------------------------------------- marks -- */

export function isMarkActive(editor: DaEditor, mark: MarkType): boolean {
  const marks = Editor.marks(editor);
  return marks ? Boolean(marks[mark]) : false;
}

export function toggleMark(editor: DaEditor, mark: MarkType, value: unknown = true): void {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, value);
  }
}

export function setMark(editor: DaEditor, mark: MarkType, value: unknown): void {
  if (value === null || value === undefined || value === false) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, value);
  }
}

export function getMarkValue(editor: DaEditor, mark: MarkType): unknown {
  return Editor.marks(editor)?.[mark];
}

export function clearMarks(editor: DaEditor): void {
  const marks = Editor.marks(editor);
  if (!marks) return;
  for (const key of Object.keys(marks)) {
    Editor.removeMark(editor, key as MarkType);
  }
}

/* --------------------------------------------------------------- blocks -- */

export function isBlockActive(
  editor: DaEditor,
  type: ElementType,
  blockKey: 'type' | 'align' = 'type',
): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockKey as 'type'] === type,
    }),
  );
  return Boolean(match);
}

/** The element type of the block containing the selection. */
export function getBlockType(editor: DaEditor): ElementType | null {
  const { selection } = editor;
  if (!selection) return null;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    }),
  );
  if (!match) return null;
  const [node] = match;
  return SlateElement.isElement(node) ? node.type : null;
}

export function toggleBlock(editor: DaEditor, type: ElementType): void {
  const isList = LIST_TYPES.includes(type);
  const isActive = isBlockActive(editor, type);

  // Lift out of any existing list wrapper before applying the new type.
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  });

  const nextType: ElementType = isActive
    ? ELEMENT.paragraph
    : isList
      ? ELEMENT.listItem
      : type;

  Transforms.setNodes(editor, { type: nextType });

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, { type, children: [] });
  }
}

export function setAlign(editor: DaEditor, align: Align): void {
  Transforms.setNodes(
    editor,
    { align },
    {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && ALIGN_TYPES.includes(n.type),
    },
  );
}

export function getAlign(editor: DaEditor): Align {
  const { selection } = editor;
  if (!selection) return 'left';
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
      mode: 'lowest',
    }),
  );
  const node = match?.[0];
  return SlateElement.isElement(node) && node.align ? node.align : 'left';
}

const MAX_INDENT = 8;

export function indent(editor: DaEditor, delta: 1 | -1): void {
  const { selection } = editor;
  if (!selection) return;

  for (const [node, path] of Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  })) {
    if (!SlateElement.isElement(node)) continue;
    const next = Math.min(MAX_INDENT, Math.max(0, (node.indent ?? 0) + delta));
    Transforms.setNodes(editor, { indent: next || undefined }, { at: path });
  }
}

/* --------------------------------------------------------------- inline -- */

export function isLinkActive(editor: DaEditor): boolean {
  return isBlockActive(editor, ELEMENT.link);
}

export function unwrapLink(editor: DaEditor): void {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === ELEMENT.link,
  });
}

export function wrapLink(editor: DaEditor, url: string): void {
  if (isLinkActive(editor)) unwrapLink(editor);

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  if (isCollapsed) {
    Transforms.insertNodes(editor, {
      type: ELEMENT.link,
      url,
      children: [{ text: url }],
    });
  } else {
    Transforms.wrapNodes(
      editor,
      { type: ELEMENT.link, url, children: [] },
      { split: true },
    );
    Transforms.collapse(editor, { edge: 'end' });
  }
}

/* ---------------------------------------------------------------- voids -- */

export function insertDivider(editor: DaEditor): void {
  Transforms.insertNodes(editor, { type: ELEMENT.divider, children: [{ text: '' }] });
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

export function insertImage(editor: DaEditor, url: string): void {
  Transforms.insertNodes(editor, { type: ELEMENT.image, url, children: [{ text: '' }] });
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

/* --------------------------------------------------------------- blocks -- */

/** Replaces the current (empty) block with a fresh block of `type`. */
export function replaceBlock(editor: DaEditor, type: ElementType): void {
  if (LIST_TYPES.includes(type)) {
    toggleBlock(editor, type);
    return;
  }
  if (type === ELEMENT.divider) {
    insertDivider(editor);
    return;
  }
  Transforms.setNodes(editor, { type });
}

/* ---------------------------------------------------------- list styles -- */

export const BULLET_STYLES = [
  { value: 'disc', label: 'Default', glyph: '●' },
  { value: 'circle', label: 'Circle', glyph: '○' },
  { value: 'square', label: 'Square', glyph: '■' },
] as const;

export const NUMBER_STYLES = [
  { value: 'decimal', label: 'Decimal (1, 2, 3)' },
  { value: 'lower-alpha', label: 'Lower Alpha (a, b, c)' },
  { value: 'upper-alpha', label: 'Upper Alpha (A, B, C)' },
  { value: 'lower-roman', label: 'Lower Roman (i, ii, iii)' },
  { value: 'upper-roman', label: 'Upper Roman (I, II, III)' },
] as const;

/** Applies a marker style to the list wrapping the selection. */
export function setListStyle(editor: DaEditor, listStyle: string): void {
  Transforms.setNodes(
    editor,
    { listStyle } as Partial<SlateElement>,
    {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    },
  );
}

export function getListStyle(editor: DaEditor): string | null {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    }),
  );
  const node = match?.[0];
  return SlateElement.isElement(node) && node.listStyle ? node.listStyle : null;
}

/* -------------------------------------------------------------- columns -- */

/** Inserts a row of equal-width columns, each holding an empty paragraph. */
export function insertColumns(editor: DaEditor, count = 3): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.columns,
    children: Array.from({ length: count }, () => ({
      type: ELEMENT.column,
      children: [{ type: ELEMENT.paragraph, children: [{ text: '' }] }],
    })),
  } as SlateElement);
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

/* ------------------------------------------------------ advanced blocks -- */

/** Inserts a table-of-contents placeholder, rendered from the headings. */
export function insertTableOfContents(editor: DaEditor): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.tableOfContents,
    children: [{ text: '' }],
  } as SlateElement);
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

export function insertEquation(editor: DaEditor, formula = ''): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.equation,
    formula,
    children: [{ text: '' }],
  } as SlateElement);
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

export function insertInlineEquation(editor: DaEditor, formula = ''): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.inlineEquation,
    formula,
    children: [{ text: '' }],
  } as SlateElement);
  Transforms.move(editor);
}

export function insertDate(editor: DaEditor, date = new Date()): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.date,
    date: date.toISOString(),
    children: [{ text: '' }],
  } as SlateElement);
  Transforms.move(editor);
  Transforms.insertText(editor, ' ');
}

export function insertFootnote(editor: DaEditor, note = ''): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.footnote,
    note,
    children: [{ text: '' }],
  } as SlateElement);
  Transforms.move(editor);
}

/* ----------------------------------------------------------- typography -- */

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];

export const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Sans serif', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: 'ui-monospace, Menlo, monospace' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
];

export const LINE_HEIGHTS = [1, 1.15, 1.5, 1.75, 2];

/** The editor's base font-size (`.da-editor` in the stylesheet), used when
 *  no explicit `fontSize` mark and no DOM measurement is available. */
export const DEFAULT_FONT_SIZE = 15;

/** The `fontSize` mark on the current selection, or `null` when unset — a
 *  heading's larger size, for instance, comes from CSS, not a mark. */
export function getFontSize(editor: DaEditor): number | null {
  const value = Editor.marks(editor)?.fontSize;
  return typeof value === 'number' ? value : null;
}

export function setFontSize(editor: DaEditor, size: number): void {
  const clamped = Math.min(144, Math.max(8, Math.round(size)));
  if (clamped === DEFAULT_FONT_SIZE) {
    Editor.removeMark(editor, 'fontSize');
    return;
  }
  Editor.addMark(editor, 'fontSize', clamped);
}

/** Steps the font size to the next or previous value in `FONT_SIZES`. */
export function stepFontSize(editor: DaEditor, delta: 1 | -1): void {
  setFontSize(editor, (getFontSize(editor) ?? DEFAULT_FONT_SIZE) + delta * 2);
}

export function setLineHeight(editor: DaEditor, lineHeight: number): void {
  Transforms.setNodes(
    editor,
    { lineHeight },
    {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
    },
  );
}

export function getLineHeight(editor: DaEditor): number {
  const { selection } = editor;
  if (!selection) return 1.65;
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
      mode: 'lowest',
    }),
  );
  const node = match?.[0];
  return SlateElement.isElement(node) && node.lineHeight ? node.lineHeight : 1.65;
}

/* -------------------------------------------------------------- mention -- */

export function insertMention(editor: DaEditor, id: string, name: string): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT.mention,
    id,
    name,
    children: [{ text: '' }],
  });
  Transforms.move(editor);
  // A trailing space keeps typing natural after the chip.
  Transforms.insertText(editor, ' ');
}

export function insertEmoji(editor: DaEditor, emoji: string): void {
  Transforms.insertText(editor, emoji);
}

export function isEditorEmpty(editor: DaEditor): boolean {
  const { children } = editor;
  if (children.length !== 1) return false;
  const [first] = children;
  return (
    SlateElement.isElement(first) &&
    first.type === ELEMENT.paragraph &&
    Node.string(first) === ''
  );
}
