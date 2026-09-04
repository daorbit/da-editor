import { Editor, Element as SlateElement, Node, Range, Transforms } from 'slate';
import { ELEMENT, type Align, type DaEditor, type ElementType, type MarkType } from './types';

export const LIST_TYPES: ElementType[] = [ELEMENT.bulletedList, ELEMENT.numberedList];

const ALIGN_TYPES: ElementType[] = [
  ELEMENT.paragraph,
  ELEMENT.h1,
  ELEMENT.h2,
  ELEMENT.h3,
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
