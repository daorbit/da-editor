import { Element as SlateElement, Node, Text, type NodeEntry, type Range } from 'slate';
import Prism from 'prismjs';

// Grammars are imported for their side effects, which register them on Prism.
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

/** Very small heuristic used when a code block has no language set. */
function detectLanguage(code: string): string {
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
 * Slate `decorate` function that adds Prism token ranges to code blocks.
 * The whole block is tokenized at once so multi-line constructs (block
 * comments, template literals) highlight correctly.
 */
export function decorateCode([node, path]: NodeEntry): Range[] {
  if (!SlateElement.isElement(node) || node.type !== ELEMENT.codeBlock) return [];

  const code = Node.string(node);
  if (!code) return [];

  const language =
    'lang' in node && node.lang ? node.lang : detectLanguage(code);
  if (!language || language === 'plain') return [];

  const grammar = Prism.languages[language];
  if (!grammar) return [];

  const tokens = flatten(Prism.tokenize(code, grammar));

  // Walk the block's text nodes, mapping token offsets onto each one.
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

    // Text nodes are separated by newlines in the joined source.
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

/** Token class names a leaf may carry, used by the renderer. */
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
