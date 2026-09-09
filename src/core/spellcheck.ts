import { Text, type NodeEntry, type Range } from 'slate';
 
export interface SpellEngine {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
  add?: (word: string) => void;
}

export type SpellEngineLoader = () => Promise<SpellEngine>;

export interface SpellSuggestion {
  word: string;
  suggestions: string[];
}

/** Tokens that look wrong to a dictionary but should never be flagged. */
const SKIP = /^(?:[A-Z0-9]+|\d[\w-]*|[\w.-]+@[\w.-]+)$/;
const WORD_RE = /[A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z]/g;

 
export class SpellChecker {
  private engine: SpellEngine | null = null;
  private loading: Promise<void> | null = null;
  private readonly loader: SpellEngineLoader | null;
  private readonly known = new Map<string, boolean>();
  private readonly suggestionCache = new Map<string, string[]>();
  private readonly ignored = new Set<string>();
  /** Invoked once the engine is available, so the host can re-decorate. */
  onReady: (() => void) | null = null;

  constructor(engineOrLoader?: SpellEngine | SpellEngineLoader) {
    if (typeof engineOrLoader === 'function') {
      this.loader = engineOrLoader;
    } else {
      this.loader = null;
      if (engineOrLoader) this.engine = engineOrLoader;
    }
  }

  get ready(): boolean {
    return this.engine !== null;
  }

  async load(): Promise<void> {
    if (this.engine || !this.loader) return;
    if (this.loading) return this.loading;
    this.loading = this.loader().then((engine) => {
      this.engine = engine;
      this.onReady?.();
    });
    return this.loading;
  }

  setEngine(engine: SpellEngine): void {
    this.engine = engine;
    this.known.clear();
    this.suggestionCache.clear();
    this.onReady?.();
  }

  addWord(word: string): void {
    this.ignored.add(word.toLowerCase());
    this.engine?.add?.(word);
    this.known.set(word.toLowerCase(), true);
  }

  ignoreWord(word: string): void {
    this.ignored.add(word.toLowerCase());
    this.known.set(word.toLowerCase(), true);
  }

  private isCorrect(word: string): boolean {
    if (SKIP.test(word)) return true;
    const key = word.toLowerCase();
    if (this.ignored.has(key)) return true;
    const hit = this.known.get(key);
    if (hit !== undefined) return hit;
    const ok = this.engine ? this.engine.correct(word) : true;
    this.known.set(key, ok);
    return ok;
  }

  suggest(word: string): string[] {
    const key = word.toLowerCase();
    const cached = this.suggestionCache.get(key);
    if (cached) return cached;
    const list = this.engine ? this.engine.suggest(word).slice(0, 6) : [];
    this.suggestionCache.set(key, list);
    return list;
  }

  decorate = ([node, path]: NodeEntry): Range[] => {
    if (!this.engine || !Text.isText(node)) return [];
    const text = node.text;
    if (!text) return [];

    const ranges: Range[] = [];
    for (const match of text.matchAll(WORD_RE)) {
      const word = match[0];
      if (word.length < 2 || this.isCorrect(word)) continue;
      const start = match.index ?? 0;
      ranges.push({
        anchor: { path, offset: start },
        focus: { path, offset: start + word.length },
        spellError: true,
      } as Range);
    }
    return ranges;
  };
}
