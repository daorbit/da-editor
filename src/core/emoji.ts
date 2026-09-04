export interface EmojiEntry {
  emoji: string;
  name: string;
  keywords: string[];
}

export interface EmojiGroup {
  name: string;
  emojis: EmojiEntry[];
}

const e = (emoji: string, name: string, ...keywords: string[]): EmojiEntry => ({
  emoji,
  name,
  keywords,
});

/**
 * A curated set rather than the full Unicode table — enough to be useful in a
 * document editor while keeping the bundle small.
 */
export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    name: 'Smileys',
    emojis: [
      e('😀', 'grinning', 'smile', 'happy'),
      e('😃', 'smiley', 'happy', 'joy'),
      e('😄', 'smile', 'happy', 'laugh'),
      e('😁', 'grin', 'happy'),
      e('😆', 'laughing', 'lol', 'haha'),
      e('😅', 'sweat smile', 'relief'),
      e('🤣', 'rofl', 'lol', 'laugh'),
      e('😂', 'joy', 'tears', 'lol'),
      e('🙂', 'slight smile'),
      e('😉', 'wink'),
      e('😊', 'blush', 'happy'),
      e('😍', 'heart eyes', 'love'),
      e('🥰', 'smiling hearts', 'love'),
      e('😘', 'kiss', 'love'),
      e('😎', 'sunglasses', 'cool'),
      e('🤩', 'star struck', 'wow'),
      e('🤔', 'thinking', 'hmm'),
      e('🤨', 'raised eyebrow', 'skeptical'),
      e('😐', 'neutral'),
      e('🙄', 'eye roll'),
      e('😴', 'sleeping', 'zzz'),
      e('🤯', 'mind blown', 'shocked'),
      e('😭', 'sob', 'cry', 'sad'),
      e('😱', 'scream', 'shock'),
      e('🥳', 'partying', 'celebrate'),
      e('😇', 'innocent', 'angel'),
      e('🤗', 'hug'),
      e('🤝', 'handshake', 'deal'),
    ],
  },
  {
    name: 'Gestures',
    emojis: [
      e('👍', 'thumbs up', 'yes', 'approve', 'like'),
      e('👎', 'thumbs down', 'no', 'dislike'),
      e('👌', 'ok hand', 'perfect'),
      e('✌️', 'victory', 'peace'),
      e('🤞', 'fingers crossed', 'luck'),
      e('👏', 'clap', 'applause'),
      e('🙌', 'raised hands', 'celebrate'),
      e('🙏', 'pray', 'thanks', 'please'),
      e('💪', 'muscle', 'strong'),
      e('👋', 'wave', 'hello', 'hi', 'bye'),
      e('✋', 'raised hand', 'stop'),
      e('👉', 'point right'),
      e('👈', 'point left'),
      e('☝️', 'point up'),
      e('✍️', 'writing', 'write'),
    ],
  },
  {
    name: 'Objects',
    emojis: [
      e('💡', 'bulb', 'idea', 'tip'),
      e('📌', 'pin', 'pinned'),
      e('📎', 'paperclip', 'attach'),
      e('📝', 'memo', 'note', 'write'),
      e('📄', 'page', 'document', 'file'),
      e('📁', 'folder', 'directory'),
      e('📊', 'bar chart', 'graph', 'data'),
      e('📈', 'chart up', 'growth', 'trend'),
      e('📉', 'chart down', 'decline'),
      e('🔍', 'search', 'magnify', 'find'),
      e('🔒', 'lock', 'secure', 'private'),
      e('🔑', 'key', 'access'),
      e('⚙️', 'gear', 'settings', 'config'),
      e('🔧', 'wrench', 'tool', 'fix'),
      e('🐛', 'bug', 'error', 'issue'),
      e('💻', 'laptop', 'computer', 'code'),
      e('📱', 'phone', 'mobile'),
      e('⏰', 'alarm', 'time', 'clock'),
      e('📅', 'calendar', 'date', 'schedule'),
      e('💰', 'money', 'cash'),
      e('🎁', 'gift', 'present'),
      e('📦', 'package', 'box', 'ship'),
    ],
  },
  {
    name: 'Symbols',
    emojis: [
      e('✅', 'check', 'done', 'yes', 'complete'),
      e('❌', 'cross', 'no', 'fail', 'wrong'),
      e('⚠️', 'warning', 'caution', 'alert'),
      e('❓', 'question', 'help'),
      e('❗', 'exclamation', 'important'),
      e('⭐', 'star', 'favorite'),
      e('🔥', 'fire', 'hot', 'lit'),
      e('✨', 'sparkles', 'magic', 'new'),
      e('🎉', 'tada', 'celebrate', 'party'),
      e('🚀', 'rocket', 'launch', 'ship', 'fast'),
      e('💯', 'hundred', 'perfect'),
      e('❤️', 'heart', 'love', 'red'),
      e('💔', 'broken heart'),
      e('🔴', 'red circle', 'stop'),
      e('🟢', 'green circle', 'go', 'ok'),
      e('🟡', 'yellow circle', 'pending'),
      e('🔵', 'blue circle'),
      e('➡️', 'arrow right', 'next'),
      e('⬅️', 'arrow left', 'back'),
      e('🔁', 'repeat', 'loop'),
    ],
  },
  {
    name: 'Nature',
    emojis: [
      e('🌍', 'earth', 'globe', 'world'),
      e('☀️', 'sun', 'sunny'),
      e('🌙', 'moon', 'night'),
      e('⛅', 'cloud', 'partly cloudy'),
      e('🌧️', 'rain', 'rainy'),
      e('❄️', 'snowflake', 'cold', 'snow'),
      e('🌱', 'seedling', 'plant', 'grow'),
      e('🌳', 'tree'),
      e('🌸', 'blossom', 'flower', 'spring'),
      e('🍀', 'clover', 'luck'),
      e('🐶', 'dog', 'puppy'),
      e('🐱', 'cat', 'kitten'),
      e('☕', 'coffee', 'cafe'),
      e('🍕', 'pizza', 'food'),
      e('🍎', 'apple', 'fruit'),
    ],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((group) => group.emojis);

export function searchEmojis(query: string): EmojiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_EMOJIS.filter(
    (entry) =>
      entry.name.includes(q) || entry.keywords.some((keyword) => keyword.startsWith(q)),
  ).slice(0, 24);
}
