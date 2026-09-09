import { Editor, Node, Path, Range, Text, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import type { DaEditor } from './types';

export interface SearchMatch {
  range: Range;
  text: string;
  /** Regex capture groups for this match, when the query is a pattern. */
  groups?: string[];
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  /** Treat the query as a regular expression. Invalid patterns match nothing. */
  regex?: boolean;
  /** Restrict matching to the current selection. */
  inSelection?: boolean;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiles the query into a global `RegExp`, or `null` when a regex query is
 * malformed — the UI reads `null` as "no matches" rather than throwing.
 */
function buildPattern(query: string, options: SearchOptions): RegExp | null {
  const flags = options.caseSensitive ? 'g' : 'gi';
  const body = options.regex ? query : escapeRegex(query);
  const source = options.wholeWord ? `\\b(?:${body})\\b` : body;
  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
}

/** True when `path` falls inside `range` (used for the in-selection filter). */
function pathInRange(range: Range, path: number[]): boolean {
  const [start, end] = Range.edges(range);
  return (
    Path.compare(path, start.path) >= 0 && Path.compare(path, end.path) <= 0
  );
}
 
export function findMatches(
  editor: DaEditor,
  query: string,
  options: SearchOptions = {},
): SearchMatch[] {
  if (!query) return [];

  const pattern = buildPattern(query, options);
  if (!pattern) return [];

  const scope =
    options.inSelection && editor.selection && !Range.isCollapsed(editor.selection)
      ? editor.selection
      : null;

  const matches: SearchMatch[] = [];

  for (const [node, path] of Node.texts(editor)) {
    if (!Text.isText(node)) continue;
    if (scope && !pathInRange(scope, path)) continue;
    pattern.lastIndex = 0;

    let found: RegExpExecArray | null;
    while ((found = pattern.exec(node.text)) !== null) {
      const range: Range = {
        anchor: { path, offset: found.index },
        focus: { path, offset: found.index + found[0].length },
      };
      if (!scope || rangeWithin(scope, range)) {
        matches.push({ range, text: found[0], groups: found.slice(1) });
      }
      // A zero-length match would loop forever; step past it.
      if (found[0].length === 0) pattern.lastIndex += 1;
    }
  }

  return matches;
}

/** True when `inner` lies entirely inside `outer`. */
function rangeWithin(outer: Range, inner: Range): boolean {
  return (
    Range.includes(outer, inner.anchor) && Range.includes(outer, inner.focus)
  );
}

 
export function expandReplacement(template: string, match: SearchMatch): string {
  return template.replace(/\$(\$|&|\d{1,2})/g, (_whole, token: string) => {
    if (token === '$') return '$';
    if (token === '&') return match.text;
    const index = Number(token) - 1;
    return match.groups?.[index] ?? '';
  });
}
 
export function goToMatch(editor: DaEditor, match: SearchMatch): void {
  Transforms.select(editor, match.range);

  try {
    const domRange = ReactEditor.toDOMRange(editor, match.range);
    const container = domRange.startContainer;
    const target =
      container.nodeType === 3 ? container.parentElement : (container as HTMLElement);
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  } catch {
    // The node may not be mounted; the selection still moved.
  }
}

 
/**
 * Decoration ranges marking every match inside one text node.
 *
 * Built per node because that is the unit Slate hands to `decorate`. The active
 * match is flagged separately so it can be painted differently from the rest.
 */
export function decorateSearch(
  entry: [unknown, number[]],
  query: string,
  options: SearchOptions & { activeRange?: Range; scopeRange?: Range } = {},
): Range[] {
  const [node, path] = entry;
  if (!query || !Text.isText(node)) return [];

  const scope = options.scopeRange ?? null;
  if (scope && !pathInRange(scope, path)) return [];

  const pattern = buildPattern(query, options);
  if (!pattern) return [];
  const ranges: Range[] = [];
  let found: RegExpExecArray | null;

  while ((found = pattern.exec(node.text)) !== null) {
    const range: Range = {
      anchor: { path, offset: found.index },
      focus: { path, offset: found.index + found[0].length },
    };
    if (!scope || rangeWithin(scope, range)) {
      const active =
        options.activeRange !== undefined && Range.equals(range, options.activeRange);
      ranges.push({ ...range, searchMatch: true, searchActive: active } as Range);
    }
    if (found[0].length === 0) pattern.lastIndex += 1;
  }

  return ranges;
}

export function replaceMatch(
  editor: DaEditor,
  match: SearchMatch,
  replacement: string,
  options: SearchOptions = {},
): void {
  const text = options.regex ? expandReplacement(replacement, match) : replacement;
  Transforms.select(editor, match.range);
  Transforms.insertText(editor, text);
}


export function replaceAll(
  editor: DaEditor,
  query: string,
  replacement: string,
  options: SearchOptions = {},
): number {
  const matches = findMatches(editor, query, options);
  if (matches.length === 0) return 0;

  Editor.withoutNormalizing(editor, () => {
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      const text = options.regex
        ? expandReplacement(replacement, match)
        : replacement;
      Transforms.select(editor, match.range);
      Transforms.insertText(editor, text);
    }
  });

  return matches.length;
}
