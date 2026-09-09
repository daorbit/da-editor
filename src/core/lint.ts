import { Editor, Element as SlateElement, Node, Path, Transforms } from 'slate';
import { ELEMENT, type DaEditor, type EditorValue } from './types';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  id: string;
  rule: string;
  severity: LintSeverity;
  message: string;
  path: Path;
  /** Applied when the issue offers a one-click fix. */
  fix?: (editor: DaEditor) => void;
}

const HEADINGS: Record<string, number> = {
  [ELEMENT.h1]: 1,
  [ELEMENT.h2]: 2,
  [ELEMENT.h3]: 3,
  [ELEMENT.h4]: 4,
  [ELEMENT.h5]: 5,
  [ELEMENT.h6]: 6,
};

const HEADING_BY_LEVEL = [
  ELEMENT.h1,
  ELEMENT.h2,
  ELEMENT.h3,
  ELEMENT.h4,
  ELEMENT.h5,
  ELEMENT.h6,
] as const;

const LONG_PARAGRAPH = 700;
const UNSAFE_HREF = /^\s*(javascript|data|vbscript):/i;

function textOf(node: Node): string {
  return Node.string(node).trim();
}

export interface LintOptions {
  /** Rule ids to skip. */
  disabled?: string[];
}

/**
 * Passive document checks — accessibility and consistency problems a writer
 * usually cannot see. Pure over the value; no editor mutation until a fix runs.
 */
export function lintDocument(
  value: EditorValue,
  options: LintOptions = {},
): LintIssue[] {
  const off = new Set(options.disabled ?? []);
  const issues: LintIssue[] = [];
  const add = (issue: LintIssue) => {
    if (!off.has(issue.rule)) issues.push(issue);
  };

  const headingText = new Map<string, number>();
  let lastHeadingLevel = 0;
  let hasH1 = false;

  value.forEach((node, index) => {
    if (!SlateElement.isElement(node)) return;
    const path: Path = [index];
    const type = node.type;

    const level = HEADINGS[type];
    if (level) {
      if (level === 1) hasH1 = true;
      if (lastHeadingLevel && level > lastHeadingLevel + 1) {
        const target = HEADING_BY_LEVEL[lastHeadingLevel];
        add({
          id: `heading-skip-${index}`,
          rule: 'heading-skip',
          severity: 'warning',
          message: `Heading jumps from H${lastHeadingLevel} to H${level}. Use H${lastHeadingLevel + 1}.`,
          path,
          fix: (editor) => Transforms.setNodes(editor, { type: target }, { at: path }),
        });
      }
      lastHeadingLevel = level;

      const label = textOf(node).toLowerCase();
      if (label) {
        const seen = headingText.get(label) ?? 0;
        headingText.set(label, seen + 1);
        if (seen === 1) {
          add({
            id: `heading-dupe-${index}`,
            rule: 'duplicate-heading',
            severity: 'info',
            message: `Duplicate heading "${textOf(node)}" — anchors and the table of contents will collide.`,
            path,
          });
        }
      }
    }

    if (type === ELEMENT.image) {
      const caption = 'caption' in node ? String(node.caption ?? '') : '';
      if (!caption.trim()) {
        add({
          id: `img-alt-${index}`,
          rule: 'image-alt',
          severity: 'error',
          message: 'Image has no alt text. Add a caption so screen readers can describe it.',
          path,
        });
      }
      const url = 'url' in node ? String(node.url ?? '') : '';
      if (!url.trim()) {
        add({
          id: `img-src-${index}`,
          rule: 'image-src',
          severity: 'error',
          message: 'Image has no source.',
          path,
        });
      }
    }

    if (type === ELEMENT.paragraph && textOf(node).length > LONG_PARAGRAPH) {
      add({
        id: `long-para-${index}`,
        rule: 'long-paragraph',
        severity: 'info',
        message: `Paragraph is ${textOf(node).length} characters. Consider splitting it.`,
        path,
      });
    }

    if (
      index < value.length - 1 &&
      textOf(node) === '' &&
      (type === ELEMENT.paragraph || HEADINGS[type]) &&
      node.children.length === 1
    ) {
      add({
        id: `empty-block-${index}`,
        rule: 'empty-block',
        severity: 'info',
        message: 'Empty block in the middle of the document.',
        path,
        fix: (editor) => Transforms.removeNodes(editor, { at: path }),
      });
    }

    for (const [child, childPath] of Node.descendants(node)) {
      if (!SlateElement.isElement(child) || child.type !== ELEMENT.link) continue;
      const href = 'url' in child ? String(child.url ?? '') : '';
      const full: Path = [...path, ...childPath];
      if (!href.trim() || href === '#') {
        add({
          id: `link-empty-${full.join('.')}`,
          rule: 'empty-link',
          severity: 'warning',
          message: 'Link has no destination.',
          path: full,
        });
      } else if (UNSAFE_HREF.test(href)) {
        add({
          id: `link-unsafe-${full.join('.')}`,
          rule: 'unsafe-link',
          severity: 'error',
          message: `Link uses an unsafe "${href.split(':')[0]}:" scheme; it will be stripped on save.`,
          path: full,
        });
      }
    }
  });

  if (!hasH1 && value.length > 3) {
    add({
      id: 'no-h1',
      rule: 'missing-h1',
      severity: 'info',
      message: 'Document has no H1. Add one so it has a clear title.',
      path: [0],
    });
  }

  for (let i = value.length - 1; i >= 0; i -= 1) {
    const node = value[i];
    if (!SlateElement.isElement(node)) break;
    if (node.type !== ELEMENT.paragraph || textOf(node) !== '') break;
    if (i === 0) break;
    add({
      id: `trailing-empty-${i}`,
      rule: 'trailing-empty',
      severity: 'info',
      message: 'Trailing empty paragraph.',
      path: [i],
      fix: (editor) => Transforms.removeNodes(editor, { at: [i] }),
    });
  }

  return issues;
}

/** Selects and scrolls to the node an issue points at. */
export function revealIssue(editor: DaEditor, issue: LintIssue): void {
  try {
    const at = Editor.start(editor, issue.path);
    Transforms.select(editor, at);
  } catch {
    /* node gone */
  }
}