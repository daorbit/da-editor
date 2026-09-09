declare module '*?raw' {
  const content: string;
  export default content;
}

declare module 'nspell' {
  interface NSpell {
    correct(word: string): boolean;
    suggest(word: string): string[];
    add(word: string): NSpell;
    remove(word: string): NSpell;
    spell(word: string): { correct: boolean; forbidden: boolean; warn: boolean };
  }
  function nspell(aff: string | Buffer, dic?: string | Buffer): NSpell;
  export default nspell;
}
