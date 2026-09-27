import { Element as SlateElement, Node, Text } from 'slate';
import { ELEMENT, type CustomElement, type EditorValue } from '../types';
import { formatDate } from './shared';

const HEADING_LEVEL: Partial<Record<string, number>> = {
  [ELEMENT.h1]: 1,
  [ELEMENT.h2]: 2,
  [ELEMENT.h3]: 3,
  [ELEMENT.h4]: 4,
  [ELEMENT.h5]: 5,
  [ELEMENT.h6]: 6,
};

function serializeLeaf(node: Text): string {
  let text = node.text;
  if (text === '') return '';
  if (node.code) text = `\`${text}\``;
  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.underline) text = `__${text}__`;
  if (node.strikethrough) text = `~~${text}~~`;
  return text;
}

function url(element: CustomElement): string {
  return 'url' in element && typeof element.url === 'string' ? element.url : '';
}

function serializeInline(node: Node): string {
  if (Text.isText(node)) return serializeLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const inner = node.children.map(serializeInline).join('');
  switch (node.type) {
    case ELEMENT.link:
      return `[${inner}](${url(node)})`;
    case ELEMENT.mention:
      return 'name' in node ? `@${node.name}` : '';
    case ELEMENT.date:
      return node.date ? formatDate(node.date) : '';
    case ELEMENT.inlineEquation:
      return node.formula ? `$${node.formula}$` : '';
    case ELEMENT.footnote:
      return '';
    default:
      return inner;
  }
}

function inlineOf(element: CustomElement): string {
  return element.children.map(serializeInline).join('');
}

function listItems(list: CustomElement, ordered: boolean): string {
  return list.children
    .filter((child): child is CustomElement => SlateElement.isElement(child))
    .map((item, index) => {
      const pad = '  '.repeat(item.indent ?? 0);
      if (item.type === ELEMENT.todoListItem) {
        return `${pad}- [${'checked' in item && item.checked ? 'x' : ' '}] ${inlineOf(item)}`;
      }
      return `${pad}${ordered ? `${index + 1}.` : '-'} ${inlineOf(item)}`;
    })
    .join('\n');
}

function tableCell(cell: Node): string {
  if (!SlateElement.isElement(cell)) return '';
  const text = cell.children
    .map((child) => (SlateElement.isElement(child) ? inlineOf(child) : serializeInline(child)))
    .join(' ');
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function table(element: CustomElement): string {
  const rows = element.children.filter((child): child is CustomElement => SlateElement.isElement(child));
  if (rows.length === 0) return '';

  const lines = rows.map((row) => `| ${row.children.map(tableCell).join(' | ')} |`);
  const columns = rows[0].children.length;
  lines.splice(1, 0, `| ${Array.from({ length: columns }, () => '---').join(' | ')} |`);
  return lines.join('\n');
}

function quote(text: string): string {
  return text
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function serializeBlock(node: Node): string {
  if (Text.isText(node)) return serializeLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const level = HEADING_LEVEL[node.type];
  if (level) return `${'#'.repeat(level)} ${inlineOf(node)}`;

  switch (node.type) {
    case ELEMENT.blockquote:
    case ELEMENT.callout:
      return quote(inlineOf(node));
    case ELEMENT.codeBlock: {
      const lang = 'lang' in node && node.lang ? node.lang : '';
      return `\`\`\`${lang}\n${Node.string(node)}\n\`\`\``;
    }
    case ELEMENT.bulletedList:
      return listItems(node, false);
    case ELEMENT.numberedList:
      return listItems(node, true);
    case ELEMENT.listItem:
      return `- ${inlineOf(node)}`;
    case ELEMENT.todoListItem:
      return `- [${'checked' in node && node.checked ? 'x' : ' '}] ${inlineOf(node)}`;
    case ELEMENT.divider:
      return '---';
    case ELEMENT.image: {
      const caption = 'caption' in node && node.caption ? node.caption : '';
      return `![${caption}](${url(node)})`;
    }
    case ELEMENT.video:
    case ELEMENT.audio:
    case ELEMENT.embed:
    case ELEMENT.file:
    case ELEMENT.linkCard: {
      const name = 'name' in node && node.name ? node.name : url(node);
      return url(node) ? `[${name}](${url(node)})` : '';
    }
    case ELEMENT.table:
      return table(node);
    case ELEMENT.equation:
      return node.formula ? `$$\n${node.formula}\n$$` : '';
    case ELEMENT.tableOfContents:
      return '';
    case ELEMENT.columns:
    case ELEMENT.column:
      return node.children.map(serializeBlock).filter(Boolean).join('\n\n');
    default:
      return inlineOf(node);
  }
}

export function serializeMarkdown(value: EditorValue): string {
  return value
    .map(serializeBlock)
    .filter((block) => block.trim() !== '')
    .join('\n\n')
    .trim();
}
