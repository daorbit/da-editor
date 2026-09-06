import { Editor, Node, Range, Text, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import type { DaEditor } from './types';

export interface SearchMatch {
  range: Range;
  text: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(query: string, options: SearchOptions): RegExp {
  const escaped = escapeRegex(query);
  const source = options.wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(source, options.caseSensitive ? 'g' : 'gi');
}
 
export function findMatches(
  editor: DaEditor,
  query: string,
  options: SearchOptions = {},
): SearchMatch[] {
  if (!query) return [];

  const pattern = buildPattern(query, options);
  const matches: SearchMatch[] = [];

  for (const [node, path] of Node.texts(editor)) {
    if (!Text.isText(node)) continue;
    pattern.lastIndex = 0;

    let found: RegExpExecArray | null;
    while ((found = pattern.exec(node.text)) !== null) {
      matches.push({
        range: {
          anchor: { path, offset: found.index },
          focus: { path, offset: found.index + found[0].length },
        },
        text: found[0],
      });
      // A zero-length match would loop forever; step past it.
      if (found[0].length === 0) pattern.lastIndex += 1;
    }
  }

  return matches;
}

/**
 * Selects a match and brings it into view.
 *
 * `Transforms.select` only moves the selection. The browser scrolls to a caret
 * it places itself, not to one set programmatically, so the match has to be
 * scrolled to explicitly through its DOM node.
 */
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
  options: SearchOptions & { activeRange?: Range } = {},
): Range[] {
  const [node, path] = entry;
  if (!query || !Text.isText(node)) return [];

  const pattern = buildPattern(query, options);
  const ranges: Range[] = [];
  let found: RegExpExecArray | null;

  while ((found = pattern.exec(node.text)) !== null) {
    const range: Range = {
      anchor: { path, offset: found.index },
      focus: { path, offset: found.index + found[0].length },
    };
    const active =
      options.activeRange !== undefined && Range.equals(range, options.activeRange);
    ranges.push({ ...range, searchMatch: true, searchActive: active } as Range);
    if (found[0].length === 0) pattern.lastIndex += 1;
  }

  return ranges;
}

export function replaceMatch(editor: DaEditor, match: SearchMatch, replacement: string): void {
  Transforms.select(editor, match.range);
  Transforms.insertText(editor, replacement);
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
      Transforms.select(editor, matches[index].range);
      Transforms.insertText(editor, replacement);
    }
  });

  return matches.length;
}
