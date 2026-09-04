import { Editor, Element as SlateElement, Point, Range, Transforms } from 'slate';
import { ELEMENT, MARK, type DaEditor, type ElementType, type MarkType } from './types';
import { insertDivider, toggleBlock } from './transforms';

interface BlockRule {
  /** Text before the caret that triggers the rule, minus the trigger character. */
  match: string;
  type: ElementType;
}

/**
 * Markdown block shortcuts, applied when Space is pressed. Each feature owns its
 * shorthand, mirroring how the block reads in Markdown.
 */
const BLOCK_RULES: BlockRule[] = [
  { match: '#', type: ELEMENT.h1 },
  { match: '##', type: ELEMENT.h2 },
  { match: '###', type: ELEMENT.h3 },
  { match: '>', type: ELEMENT.blockquote },
  { match: '-', type: ELEMENT.bulletedList },
  { match: '*', type: ELEMENT.bulletedList },
  { match: '+', type: ELEMENT.bulletedList },
  { match: '1.', type: ELEMENT.numberedList },
  { match: '1)', type: ELEMENT.numberedList },
  { match: '[]', type: ELEMENT.todoListItem },
  { match: '[ ]', type: ELEMENT.todoListItem },
  { match: '```', type: ELEMENT.codeBlock },
  { match: '---', type: ELEMENT.divider },
  { match: '***', type: ELEMENT.divider },
];

interface MarkRule {
  /** Wrapping delimiter, e.g. `**` for bold. */
  delimiter: string;
  mark: MarkType;
}

/** Inline shortcuts, applied as soon as the closing delimiter is typed. */
const MARK_RULES: MarkRule[] = [
  { delimiter: '***', mark: MARK.bold },
  { delimiter: '**', mark: MARK.bold },
  { delimiter: '__', mark: MARK.underline },
  { delimiter: '~~', mark: MARK.strikethrough },
  { delimiter: '`', mark: MARK.code },
  { delimiter: '*', mark: MARK.italic },
  { delimiter: '_', mark: MARK.italic },
];

/** Plain-text substitutions applied while typing. */
const TEXT_RULES: Array<[RegExp, string]> = [
  [/--$/, '—'],
  [/\.\.\.$/, '…'],
  [/<-$/, '←'],
  [/->$/, '→'],
  [/\(c\)$/i, '©'],
  [/\(r\)$/i, '®'],
  [/\(tm\)$/i, '™'],
  [/!=$/, '≠'],
  [/\+-$/, '±'],
];

function getBlockStart(editor: DaEditor): Point | null {
  const [entry] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });
  return entry ? Editor.start(editor, entry[1]) : null;
}

/** Text from the start of the current block up to the caret. */
function textBeforeCaret(editor: DaEditor): { text: string; start: Point } | null {
  const { selection } = editor;
  if (!selection || Range.isExpanded(selection)) return null;
  const start = getBlockStart(editor);
  if (!start) return null;
  const range = { anchor: start, focus: selection.anchor };
  return { text: Editor.string(editor, range), start };
}

/**
 * Applies a Markdown block shortcut on Space.
 * Returns true when a rule fired and the space should be swallowed.
 */
export function autoformatBlock(editor: DaEditor): boolean {
  const before = textBeforeCaret(editor);
  if (!before) return false;

  const { text, start } = before;
  const rule = BLOCK_RULES.find((r) => r.match === text);
  if (!rule) return false;

  // A code block shortcut only makes sense on an otherwise empty block.
  const { selection } = editor;
  if (!selection) return false;

  Transforms.delete(editor, { at: { anchor: start, focus: selection.anchor } });

  if (rule.type === ELEMENT.divider) {
    insertDivider(editor);
    return true;
  }
  if (rule.type === ELEMENT.bulletedList || rule.type === ELEMENT.numberedList) {
    toggleBlock(editor, rule.type);
    return true;
  }
  if (rule.type === ELEMENT.todoListItem) {
    Transforms.setNodes(editor, { type: ELEMENT.todoListItem, checked: false });
    return true;
  }

  Transforms.setNodes(editor, { type: rule.type });
  return true;
}

/**
 * Applies an inline Markdown mark once its closing delimiter is typed.
 * Returns true when a rule fired and the character should be swallowed.
 */
export function autoformatMark(editor: DaEditor, char: string): boolean {
  const before = textBeforeCaret(editor);
  if (!before) return false;

  const { text, start } = before;
  const { selection } = editor;
  if (!selection) return false;

  for (const { delimiter, mark } of MARK_RULES) {
    if (!delimiter.endsWith(char)) continue;

    // The typed character completes the closing delimiter.
    const closing = delimiter.slice(0, -1);
    if (!text.endsWith(closing)) continue;

    const body = text.slice(0, text.length - closing.length);
    const openIndex = body.lastIndexOf(delimiter);
    if (openIndex === -1) continue;

    const content = body.slice(openIndex + delimiter.length);
    if (content.length === 0) continue;

    const offsetToPoint = (offset: number): Point => ({
      path: start.path,
      offset: start.offset + offset,
    });

    // Remove the closing delimiter fragment already in the document, then the
    // opening one, then mark what is left between them.
    Transforms.delete(editor, {
      at: {
        anchor: offsetToPoint(openIndex + delimiter.length + content.length),
        focus: selection.anchor,
      },
    });
    Transforms.delete(editor, {
      at: {
        anchor: offsetToPoint(openIndex),
        focus: offsetToPoint(openIndex + delimiter.length),
      },
    });

    Transforms.select(editor, {
      anchor: offsetToPoint(openIndex),
      focus: offsetToPoint(openIndex + content.length),
    });
    Editor.addMark(editor, mark, true);
    Transforms.collapse(editor, { edge: 'end' });
    Editor.removeMark(editor, mark);
    return true;
  }

  return false;
}

/**
 * Applies a plain-text substitution (em dash, arrows, symbols).
 * Returns true when a rule fired and the character should be swallowed.
 */
export function autoformatText(editor: DaEditor, char: string): boolean {
  const before = textBeforeCaret(editor);
  if (!before) return false;

  const candidate = before.text + char;
  const { start } = before;
  const { selection } = editor;
  if (!selection) return false;

  for (const [pattern, replacement] of TEXT_RULES) {
    const match = candidate.match(pattern);
    if (!match) continue;

    const matched = match[0];
    // The final character is not in the document yet, so delete one less.
    const consumed = matched.length - 1;
    if (consumed > 0) {
      Transforms.delete(editor, {
        at: {
          anchor: { path: start.path, offset: selection.anchor.offset - consumed },
          focus: selection.anchor,
        },
      });
    }
    Transforms.insertText(editor, replacement);
    return true;
  }

  return false;
}
