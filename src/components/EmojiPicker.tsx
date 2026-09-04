import { EmojiPicker as Frimousse } from 'frimousse';
import { useSlate } from 'slate-react';
import { SearchIcon } from '../icons';
import { insertEmoji } from '../core/transforms';
import type { DaEditor } from '../core/types';

/** Grid width. Kept in sync with `--da-emoji-size` in the stylesheet. */
const COLUMNS = 8;

export interface EmojiPickerProps {
  onSelect?: (emoji: string) => void;
  onClose: () => void;
}

/**
 * Built on frimousse: a headless, zero-dependency picker that streams the
 * emojibase dataset, so no emoji table ships inside this package.
 */
export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const editor = useSlate() as DaEditor;

  const choose = (emoji: string) => {
    if (onSelect) onSelect(emoji);
    else insertEmoji(editor, emoji);
    onClose();
  };

  return (
    <Frimousse.Root
      className="da-emoji"
      columns={COLUMNS}
      onEmojiSelect={({ emoji }) => choose(emoji)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="da-emoji__header">
        <div className="da-emoji__search-wrap">
          <SearchIcon size={14} className="da-emoji__search-icon" />
          <Frimousse.Search className="da-emoji__search" placeholder="Search all emoji" />
        </div>
        <Frimousse.SkinToneSelector className="da-emoji__skin" />
      </div>

      <Frimousse.Viewport className="da-emoji__viewport">
        <Frimousse.Loading className="da-emoji__state">Loading emoji…</Frimousse.Loading>
        <Frimousse.Empty className="da-emoji__state">No emoji found</Frimousse.Empty>
        <Frimousse.List
          className="da-emoji__list"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div className="da-emoji__group" {...props}>
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div className="da-emoji__row" {...props}>
                {children}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button type="button" className="da-emoji__item" title={emoji.label} {...props}>
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </Frimousse.Viewport>
    </Frimousse.Root>
  );
}
