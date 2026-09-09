import { Element as SlateElement, Node, Text, type NodeEntry, type Range } from 'slate';
import Prism from 'prismjs';

import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-ruby.js';
import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-graphql.js';
import 'prismjs/components/prism-docker.js';

import { ELEMENT } from './types';

export interface LanguageOption {
  value: string;
  label: string;
}

/** Languages offered by the code-block picker, in menu order. */
export const LANGUAGES: LanguageOption[] = [
  { value: '', label: 'Auto' },
  { value: 'plain', label: 'Plain Text' },
  { value: 'bash', label: 'Bash' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'diff', label: 'Diff' },
  { value: 'docker', label: 'Docker' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'markup', label: 'HTML' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'jsx', label: 'JSX' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'tsx', label: 'TSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'yaml', label: 'YAML' },
];

export function detectLanguage(code: string): string {
  if (/^\s*[{[]/.test(code) && /["']\s*:/.test(code)) return 'json';
  if (/^\s*(?:import|export)\s|=>|const\s|let\s/.test(code)) {
    return /<[A-Z]\w*/.test(code) ? 'tsx' : 'typescript';
  }
  if (/^\s*(?:def|class)\s|\bprint\(/.test(code)) return 'python';
  if (/^\s*(?:#!|\$ )|\becho\b|\bapt-get\b/.test(code)) return 'bash';
  if (/<\/?[a-z][\s\S]*>/i.test(code)) return 'markup';
  if (/[.#][\w-]+\s*\{/.test(code)) return 'css';
  if (/\bSELECT\b[\s\S]*\bFROM\b/i.test(code)) return 'sql';
  return '';
}

/** Flattens Prism's token tree into `[length, type]` pairs. */
function flatten(
  tokens: Array<string | Prism.Token>,
  out: Array<{ length: number; types: string[] }> = [],
  inherited: string[] = [],
): Array<{ length: number; types: string[] }> {
  for (const token of tokens) {
    if (typeof token === 'string') {
      out.push({ length: token.length, types: inherited });
      continue;
    }

    const types = [...inherited, token.type];
    if (typeof token.content === 'string') {
      out.push({ length: token.content.length, types });
    } else if (Array.isArray(token.content)) {
      flatten(token.content, out, types);
    } else {
      flatten([token.content], out, types);
    }
  }
  return out;
}

 
/**
 * Tokenizing is the costly half of `decorateCode`, and Slate re-runs
 * `decorate` for every node on every render — every keystroke and every caret
 * move. The token list depends only on the source and the language, so cache
 * it; the cheap offset-to-range mapping still runs each call because the paths
 * warm while an edit churns only the block being typed in.
 */
type TokenList = Array<{ length: number; types: string[] }>;
const TOKEN_CACHE_MAX = 24;
const tokenCache = new Map<string, TokenList>();

function tokenizeCached(
  code: string,
  language: string,
  grammar: Prism.Grammar,
): TokenList {
  const key = language + " " + code;
  const hit = tokenCache.get(key);
  if (hit) {
    // Delete + re-set moves the entry to the end, so it is evicted last.
    tokenCache.delete(key);
    tokenCache.set(key, hit);
    return hit;
  }
  const value = flatten(Prism.tokenize(code, grammar));
  tokenCache.set(key, value);
  if (tokenCache.size > TOKEN_CACHE_MAX) {
    tokenCache.delete(tokenCache.keys().next().value as string);
  }
  return value;
}

export function decorateCode([node, path]: NodeEntry): Range[] {
  if (!SlateElement.isElement(node) || node.type !== ELEMENT.codeBlock) return [];

  const code = Node.string(node);
  if (!code) return [];

  const language =
    'lang' in node && node.lang ? node.lang : detectLanguage(code);
  if (!language || language === 'plain') return [];

  const grammar = Prism.languages[language];
  if (!grammar) return [];

  const tokens = tokenizeCached(code, language, grammar);

  const ranges: Range[] = [];
  let tokenIndex = 0;
  let tokenOffset = 0;
  let consumed = 0;

  for (const [child, childPath] of Node.texts(node)) {
    const text = (child as Text).text;
    let offset = 0;

    while (offset < text.length && tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const remaining = token.length - tokenOffset;
      const take = Math.min(remaining, text.length - offset);

      if (token.types.length > 0) {
        const decoration: Record<string, unknown> = {
          anchor: { path: [...path, ...childPath], offset },
          focus: { path: [...path, ...childPath], offset: offset + take },
        };
        for (const type of token.types) decoration[`prism-${type}`] = true;
        ranges.push(decoration as unknown as Range);
      }

      offset += take;
      tokenOffset += take;
      consumed += take;

      if (tokenOffset >= token.length) {
        tokenIndex += 1;
        tokenOffset = 0;
      }
    }

    if (consumed < code.length) {
      consumed += 1;
      if (tokenIndex < tokens.length) {
        tokenOffset += 1;
        if (tokenOffset >= tokens[tokenIndex].length) {
          tokenIndex += 1;
          tokenOffset = 0;
        }
      }
    }
  }

  return ranges;
}

 
export function highlightCodeToHtml(code: string, lang?: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const language = lang && lang !== 'plain' ? lang : detectLanguage(code);
  const grammar = language ? Prism.languages[language] : undefined;
  if (!grammar) return escaped;

  try {
    return Prism.highlight(code, grammar, language);
  } catch {
    return escaped;
  }
}

export const PRISM_TOKEN_TYPES = [
  'comment',
  'prolog',
  'doctype',
  'cdata',
  'punctuation',
  'property',
  'tag',
  'boolean',
  'number',
  'constant',
  'symbol',
  'deleted',
  'selector',
  'attr-name',
  'string',
  'char',
  'builtin',
  'inserted',
  'operator',
  'entity',
  'url',
  'variable',
  'atrule',
  'attr-value',
  'function',
  'class-name',
  'keyword',
  'regex',
  'important',
  'namespace',
  'parameter',
  'literal-property',
] as const;
