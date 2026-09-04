import { Editor, Element as SlateElement, Point, Range, Transforms } from 'slate';
import { ELEMENT, type DaEditor, type ElementType } from './types';
import { LIST_TYPES, wrapLink } from './transforms';
import { normalizeTable } from './tables';

const VOID_TYPES: ElementType[] = [
  ELEMENT.divider,
  ELEMENT.image,
  ELEMENT.video,
  ELEMENT.audio,
  ELEMENT.file,
  ELEMENT.embed,
  ELEMENT.mention,
];
const INLINE_TYPES: ElementType[] = [ELEMENT.link, ELEMENT.mention];

/** Blocks that reset to a paragraph when Backspace is pressed at their start. */
const RESET_ON_BACKSPACE: ElementType[] = [
  ELEMENT.h1,
  ELEMENT.h2,
  ELEMENT.h3,
  ELEMENT.blockquote,
  ELEMENT.codeBlock,
  ELEMENT.callout,
  ELEMENT.listItem,
  ELEMENT.todoListItem,
];

/** Blocks where pressing Enter should exit into a fresh paragraph. */
const EXIT_ON_ENTER: ElementType[] = [ELEMENT.h1, ELEMENT.h2, ELEMENT.h3];

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export function withDaEditor(editor: DaEditor): DaEditor {
  const { isVoid, isInline, insertBreak, deleteBackward, insertData, normalizeNode } = editor;

  editor.isVoid = (element) => VOID_TYPES.includes(element.type) || isVoid(element);
  editor.isInline = (element) => INLINE_TYPES.includes(element.type) || isInline(element);

  editor.insertBreak = () => {
    const { selection } = editor;
    if (!selection || Range.isExpanded(selection)) {
      insertBreak();
      return;
    }

    const [entry] = Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    });
    if (!entry) {
      insertBreak();
      return;
    }

    const [block, path] = entry;
    if (!SlateElement.isElement(block)) {
      insertBreak();
      return;
    }

    const isEmpty = Editor.string(editor, path) === '';

    // Enter on an empty list item lifts out of the list instead of nesting deeper.
    if (
      isEmpty &&
      (block.type === ELEMENT.listItem || block.type === ELEMENT.todoListItem)
    ) {
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
        split: true,
      });
      Transforms.setNodes(editor, { type: ELEMENT.paragraph });
      return;
    }

    // A code block keeps Enter as a soft newline; Mod+Enter exits (handled in Editable).
    if (block.type === ELEMENT.codeBlock) {
      Transforms.insertText(editor, '\n');
      return;
    }

    insertBreak();

    // Headings should not propagate their type to the next block.
    if (EXIT_ON_ENTER.includes(block.type)) {
      Transforms.setNodes(editor, { type: ELEMENT.paragraph });
    }
    // A todo item continues as an unchecked item, never a checked one.
    if (block.type === ELEMENT.todoListItem) {
      Transforms.setNodes(editor, { checked: false });
    }
  };

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [entry] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
        mode: 'lowest',
      });

      if (entry) {
        const [block, path] = entry;
        const start = Editor.start(editor, path);

        if (
          SlateElement.isElement(block) &&
          block.type !== ELEMENT.paragraph &&
          Point.equals(selection.anchor, start)
        ) {
          if (block.indent) {
            Transforms.setNodes(editor, { indent: block.indent - 1 || undefined });
            return;
          }
          if (RESET_ON_BACKSPACE.includes(block.type)) {
            Transforms.setNodes(editor, { type: ELEMENT.paragraph });
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
              split: true,
            });
            return;
          }
        }
      }
    }

    deleteBackward(unit);
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    // Pasting a bare URL over a selection turns it into a link.
    if (text && URL_PATTERN.test(text.trim())) {
      wrapLink(editor, text.trim());
      return;
    }

    insertData(data);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (normalizeTable(editor, entry)) return;

    // A list must only contain list items; stray blocks are converted.
    if (SlateElement.isElement(node) && LIST_TYPES.includes(node.type)) {
      for (const [child, childPath] of Array.from(Editor.nodes(editor, { at: path }))) {
        if (
          SlateElement.isElement(child) &&
          childPath.length === path.length + 1 &&
          child.type !== ELEMENT.listItem &&
          child.type !== ELEMENT.todoListItem
        ) {
          Transforms.setNodes(editor, { type: ELEMENT.listItem }, { at: childPath });
          return;
        }
      }
    }

    // The document always ends with a paragraph so the caret has somewhere to go
    // after a trailing void block.
    if (Editor.isEditor(node)) {
      const last = node.children[node.children.length - 1];
      if (
        !last ||
        (SlateElement.isElement(last) && VOID_TYPES.includes(last.type))
      ) {
        Transforms.insertNodes(
          editor,
          { type: ELEMENT.paragraph, children: [{ text: '' }] },
          { at: [node.children.length] },
        );
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
}
