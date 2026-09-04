# @da/editor

A professional React rich-text editor. One install, no peer dependencies to add — Slate and the icon set are bundled in.

```bash
npm install @da/editor
```

```tsx
import { DaEditor } from '@da/editor';
import '@da/editor/styles.css';

export function Example() {
  return <DaEditor theme="system" onChange={(value) => console.log(value)} />;
}
```

## Features

**Marks** — bold, italic, underline, strikethrough, inline code, subscript, superscript, keyboard key, text color, highlight.

**Blocks** — paragraph, H1–H3, quote, code block, bulleted / numbered / to-do lists, callouts (info, warning, success, danger), dividers, images, links.

**Editing** — Markdown input rules, `/` block menu, floating selection toolbar, fixed toolbar, link popover, alignment, indent / outdent, undo & redo, smart text substitution.

**Output** — HTML, Markdown, and Slate JSON.

**Theming** — light, dark, or follow the OS.

### Markdown shortcuts

| Type | Result |
| --- | --- |
| `# ` `## ` `### ` | Headings |
| `> ` | Quote |
| `- ` `* ` `+ ` | Bulleted list |
| `1. ` `1) ` | Numbered list |
| `[] ` `[ ] ` | To-do item |
| ` ``` ` | Code block |
| `---` `***` | Divider |
| `**bold**` `*italic*` `__underline__` `~~strike~~` `` `code` `` | Inline marks |
| `--` `...` `->` `<-` `(c)` `(tm)` | — … → ← © ™ |

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + B / I / U / E` | Bold, italic, underline, inline code |
| `Ctrl/Cmd + Shift + X` | Strikethrough |
| `Ctrl/Cmd + Alt + 0–3` | Paragraph, H1, H2, H3 |
| `Ctrl/Cmd + Shift + 7 / 8 / 9` | Numbered, bulleted, to-do list |
| `Ctrl/Cmd + Shift + .` | Quote |
| `Ctrl/Cmd + K` | Link |
| `Ctrl/Cmd + J` | Ask AI |
| `Ctrl/Cmd + \` | Clear formatting |
| `Tab` / `Shift + Tab` | Indent / outdent |
| `Ctrl/Cmd + Enter` | Exit a code block |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValue` | `EditorValue` | – | Initial document. |
| `defaultHtml` | `string` | – | Initial document as HTML; ignored when `defaultValue` is set. |
| `onChange` | `(value: EditorValue) => void` | – | Fires on content changes only, not selection changes. |
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | `'system'` follows the OS and updates live. |
| `placeholder` | `string` | `"Write something…"` | Shown while the document is empty. |
| `readOnly` | `boolean` | `false` | Hides all editing UI. |
| `fixedToolbar` | `boolean` | `true` | Toolbar pinned above the content. |
| `floatingToolbar` | `boolean` | `true` | Toolbar over the current selection. |
| `slashMenu` | `boolean` | `true` | The `/` block menu. |
| `autoformat` | `boolean` | `true` | Markdown input rules. |
| `onAskAi` | `() => void` | – | When set, renders the Ask AI affordances. |
| `onComment` | `() => void` | – | When set, renders the comment button. |
| `minHeight` / `maxHeight` | `string` | `'320px'` / – | Editable area height. `maxHeight` makes it scroll. |
| `maxWidth` | `string` | – | Constrains the text column. |
| `autoFocus` | `boolean` | `false` | Focus on mount. |
| `spellCheck` | `boolean` | `true` | Browser spellcheck. |
| `className` / `style` | – | – | Applied to the wrapper. |

## Ref handle

```tsx
const ref = useRef<DaEditorHandle>(null);

ref.current?.getHTML();
ref.current?.getMarkdown();
ref.current?.getValue();   // Slate JSON
ref.current?.getText();
ref.current?.setHTML('<p>Hello</p>');
ref.current?.setValue(nodes);
ref.current?.focus();
ref.current?.clear();
ref.current?.editor;       // the underlying Slate editor
```

## Theming

Colors are CSS custom properties on `.da-editor`, so overriding a few tokens restyles the whole editor in both themes:

```css
.da-editor {
  --da-accent: #7c3aed;
  --da-radius: 14px;
  --da-font: 'Inter', system-ui, sans-serif;
}
```

Full token list: `--da-bg`, `--da-fg`, `--da-muted`, `--da-faint`, `--da-border`,
`--da-border-strong`, `--da-surface`, `--da-surface-hover`, `--da-accent`,
`--da-accent-fg`, `--da-accent-soft`, `--da-selection`, `--da-shadow`,
`--da-radius`, `--da-radius-sm`, `--da-font`, `--da-mono`.

## Composing your own editor

Every part is exported, so you can drop `DaEditor` and assemble the pieces yourself:

```tsx
import {
  withDaEditor, ElementRenderer, LeafRenderer,
  FixedToolbar, FloatingToolbar, SlashMenu, LinkPopover,
  toggleMark, replaceBlock, serializeMarkdown,
} from '@da/editor';
```

Icons are exported too (`BoldIcon`, `SparklesIcon`, `DragHandleIcon`, …) as plain
SVG components taking a `size` prop.

## Ask AI

`onAskAi` is a hook, not an implementation — the editor renders the Ask AI button
in both toolbars and the slash menu, and calls your handler. Wire it to whatever
endpoint you use; nothing is sent anywhere by default.

## Development

```bash
npm install
npm run dev        # playground
npm run build      # dist/
npm run typecheck
```

## License

MIT
