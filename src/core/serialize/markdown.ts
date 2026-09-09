import { Element as SlateElement, Node, Text } from 'slate';
import { ELEMENT, type EditorValue } from '../types';

function serializeMarkdownLeaf(node: Text): string {
  let text = node.text;
  if (text === '') return '';
  if (node.code) text = `\`${text}\``;
  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.strikethrough) text = `~~${text}~~`;
  return text;
}

function serializeMarkdownNode(node: Node, depth = 0, index = 0): string {
  if (Text.isText(node)) return serializeMarkdownLeaf(node);
  if (!SlateElement.isElement(node)) return '';

  const inner = node.children
    .map((child, i) => serializeMarkdownNode(child, depth + 1, i))
    .join('');

  switch (node.type) {
    case ELEMENT.h1:
      return `# ${inner}\n\n`;
    case ELEMENT.h2:
      return `## ${inner}\n\n`;
    case ELEMENT.h3:
      return `### ${inner}\n\n`;
    case ELEMENT.blockquote:
      return `> ${inner}\n\n`;
    case ELEMENT.codeBlock: {
      const lang = 'lang' in node && node.lang ? node.lang : '';
      return `\`\`\`${lang}\n${Node.string(node)}\n\`\`\`\n\n`;
    }
    case ELEMENT.bulletedList:
    case ELEMENT.numberedList:
      return `${inner}\n`;
    case ELEMENT.listItem: {
      return `- ${inner}\n`;
    }
    case ELEMENT.todoListItem: {
      const checked = 'checked' in node && node.checked ? 'x' : ' ';
      return `- [${checked}] ${inner}\n`;
    }
    case ELEMENT.divider:
      return `---\n\n`;
    case ELEMENT.image: {
      const url = 'url' in node ? node.url : '';
      const caption = 'caption' in node && node.caption ? node.caption : '';
      return `![${caption}](${url})\n\n`;
    }
    case ELEMENT.link: {
      const url = 'url' in node ? node.url : '';
      return `[${inner}](${url})`;
    }
    case ELEMENT.callout:
      return `> ${inner}\n\n`;
    default:
      return index >= 0 && depth > 0 ? `${inner}\n\n` : `${inner}\n\n`;
  }
}

export function serializeMarkdown(value: EditorValue): string {
  return value
    .map((node, i) => serializeMarkdownNode(node, 0, i))
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
