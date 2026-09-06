import { useMemo } from 'react';
import { Node } from 'slate';
import { useSlate } from 'slate-react';
import type { DaEditor } from '../core/types';

/** Reading speed used for the estimate; the common figure for prose. */
const WORDS_PER_MINUTE = 200;

export interface WordCountProps {
  /** Adds an estimated reading time beside the counts. */
  showReadingTime?: boolean;
}

export function WordCount({ showReadingTime = true }: WordCountProps) {
  const editor = useSlate() as DaEditor;

  const { words, characters } = useMemo(() => {
    const text = editor.children.map((node) => Node.string(node)).join(' ');
    const trimmed = text.trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      characters: text.length,
    };
  }, [editor.children]);

  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return (
    <div className="da-wordcount">
      <span>{words.toLocaleString()} words</span>
      <span className="da-wordcount__sep" aria-hidden="true">
        ·
      </span>
      <span>{characters.toLocaleString()} characters</span>
      {showReadingTime && words > 0 && (
        <>
          <span className="da-wordcount__sep" aria-hidden="true">
            ·
          </span>
          <span>{minutes} min read</span>
        </>
      )}
    </div>
  );
}
