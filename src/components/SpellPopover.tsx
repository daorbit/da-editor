import { useEffect, useRef, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import type { DaEditor } from '../core/types';
import type { SpellChecker } from '../core/spellcheck';

export interface SpellPopoverProps {
  checker: SpellChecker;
}

interface Target {
  word: string;
  range: Range;
  rect: { top: number; left: number };
}

 
export function SpellPopover({ checker }: SpellPopoverProps) {
  const editor = useSlateStatic() as DaEditor;
  const [target, setTarget] = useState<Target | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editorEl = (() => {
      try {
        return ReactEditor.toDOMNode(editor, editor);
      } catch {
        return null;
      }
    })();
    if (!editorEl) return;

    const onClick = (event: MouseEvent) => {
      const node = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-spell-error]',
      );
      if (!node) {
        setTarget(null);
        return;
      }
      try {
        const textNode = node.firstChild ?? node;
        const point = ReactEditor.toSlatePoint(
          editor,
          [textNode, 0],
          { exactMatch: false, suppressThrow: true },
        );
        if (!point) return;
        const wordRange = wordAt(editor, point);
        if (!wordRange) return;
        const word = Editor.string(editor, wordRange);
        const domRect = node.getBoundingClientRect();
        const base = editorEl.getBoundingClientRect();
        setTarget({
          word,
          range: wordRange,
          rect: {
            top: domRect.bottom - base.top + 4,
            left: domRect.left - base.left,
          },
        });
      } catch {
        setTarget(null);
      }
    };

    const onOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // The word-click handler runs on the same event and re-opens if valid.
        if (!(event.target as HTMLElement | null)?.closest('[data-spell-error]')) {
          setTarget(null);
        }
      }
    };

    editorEl.addEventListener('click', onClick);
    document.addEventListener('mousedown', onOutside);
    return () => {
      editorEl.removeEventListener('click', onClick);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [editor]);

  if (!target) return null;

  const suggestions = checker.suggest(target.word);

  const replace = (word: string) => {
    Transforms.select(editor, target.range);
    Transforms.insertText(editor, word);
    setTarget(null);
    ReactEditor.focus(editor);
  };

  return (
    <div
      ref={ref}
      className="da-spell-pop"
      style={{ top: target.rect.top, left: target.rect.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {suggestions.length > 0 ? (
        suggestions.map((word) => (
          <button
            key={word}
            type="button"
            className="da-spell-pop__item"
            onClick={() => replace(word)}
          >
            {word}
          </button>
        ))
      ) : (
        <span className="da-spell-pop__empty">No suggestions</span>
      )}
      <div className="da-spell-pop__sep" />
      <button
        type="button"
        className="da-spell-pop__item da-spell-pop__item--muted"
        onClick={() => {
          checker.ignoreWord(target.word);
          setTarget(null);
          bump(editor);
        }}
      >
        Ignore
      </button>
      <button
        type="button"
        className="da-spell-pop__item da-spell-pop__item--muted"
        onClick={() => {
          checker.addWord(target.word);
          setTarget(null);
          bump(editor);
        }}
      >
        Add to dictionary
      </button>
    </div>
  );
}

/** Expands a point to the word it sits inside. */
function wordAt(editor: DaEditor, point: { path: number[]; offset: number }): Range | null {
  const before = Editor.before(editor, point, { unit: 'word' });
  const after = Editor.after(editor, point, { unit: 'word' });
  const start = before ?? point;
  const end = after ?? point;
  if (Editor.string(editor, { anchor: start, focus: end }).trim() === '') return null;
  return { anchor: start, focus: end };
}

/** Nudges the editor so decorations re-run after an ignore / add. */
function bump(editor: DaEditor): void {
  Transforms.setNodes(editor, {}, { at: editor.selection ?? [0] });
}
