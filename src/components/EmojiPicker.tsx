import { useMemo, useState } from 'react';
import { useSlate } from 'slate-react';
import { EMOJI_GROUPS, searchEmojis } from '../core/emoji';
import { insertEmoji } from '../core/transforms';
import type { DaEditor } from '../core/types';

export interface EmojiPickerProps {
  onSelect?: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const editor = useSlate() as DaEditor;
  const [query, setQuery] = useState('');

  const results = useMemo(() => (query ? searchEmojis(query) : null), [query]);

  const choose = (emoji: string) => {
    if (onSelect) onSelect(emoji);
    else insertEmoji(editor, emoji);
    onClose();
  };

  return (
    <div className="da-emoji">
      <input
        type="search"
        className="da-emoji__search"
        placeholder="Search emoji…"
        value={query}
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
          }
          if (event.key === 'Enter' && results?.length) {
            event.preventDefault();
            choose(results[0].emoji);
          }
        }}
      />

      <div className="da-emoji__scroll">
        {results ? (
          results.length ? (
            <div className="da-emoji__grid">
              {results.map((entry) => (
                <button
                  key={entry.emoji}
                  type="button"
                  className="da-emoji__item"
                  title={entry.name}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(entry.emoji)}
                >
                  {entry.emoji}
                </button>
              ))}
            </div>
          ) : (
            <p className="da-emoji__empty">No emoji found</p>
          )
        ) : (
          EMOJI_GROUPS.map((group) => (
            <section key={group.name}>
              <h4 className="da-emoji__group">{group.name}</h4>
              <div className="da-emoji__grid">
                {group.emojis.map((entry) => (
                  <button
                    key={entry.emoji}
                    type="button"
                    className="da-emoji__item"
                    title={entry.name}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(entry.emoji)}
                  >
                    {entry.emoji}
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
