import type { SpellEngine } from '../../src';

/**
 * Loads a browser-safe English spelling engine for the playground: `nspell`
 * (pure JS) fed the raw Hunspell `.aff` / `.dic` that ship with
 * `dictionary-en-us`, imported as text so their Node `fs` loaders never run.
 */
export async function loadSpellEngine(): Promise<SpellEngine> {
  const [{ default: nspell }, aff, dic] = await Promise.all([
    import('nspell'),
    import('dictionary-en-us/index.aff?raw').then((m) => m.default),
    import('dictionary-en-us/index.dic?raw').then((m) => m.default),
  ]);
  return nspell(aff, dic) as unknown as SpellEngine;
}
