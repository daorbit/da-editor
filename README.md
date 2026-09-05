# da-text-editor

A professional React rich-text editor. Slate and the icon set are bundled in — React is the only peer dependency.

```bash
npm install da-text-editor
```

Requires `react` and `react-dom` 18 or 19.

```tsx
import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

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
| `onAskAi` | `() => void` | – | When set, renders the Ask AI affordances and binds `Ctrl/Cmd + J`. |
| `onComment` | `() => void` | – | When set, renders the comment button. |
| `mentionables` | `Mentionable[]` | – | Enables the `@` combobox over your own data. |
| `onUpload` | `(file, kind) => Promise<string>` | – | Store media yourself and return its URL. Without it, files embed as data URLs. |
| `onToggleTheme` | `() => void` | – | When set, renders the theme toggle in the toolbar. |
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
} from 'da-text-editor';
```

Icons are exported too (`BoldIcon`, `SparklesIcon`, `DragHandleIcon`, …) as plain
SVG components taking a `size` prop.

## Ask AI

`onAskAi` is a hook, not an implementation. Pass it and the editor renders the
Ask AI button in both toolbars and wires up `Ctrl/Cmd + J`; leave it off and none
of that UI appears. Nothing is ever sent anywhere by the editor itself — you own
the request, the endpoint and the key.

The handler takes no arguments, so read the document through the ref and write
the result back the same way:

```tsx
const ref = useRef<DaEditorHandle>(null);

async function askAi() {
  const editor = ref.current;
  if (!editor) return;

  // Whatever the user has selected, or the whole document if nothing is.
  const prompt = window.getSelection()?.toString() || editor.getText();

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const { html } = await res.json();

  editor.setHTML(html);
}

<DaEditor ref={ref} onAskAi={askAi} />;
```

`setHTML` replaces the whole document. To insert at the cursor instead, reach
for the underlying Slate editor, exposed on the same ref. Slate is a dependency
of this package, so import its transforms directly:

```tsx
import { Transforms } from 'slate';

// ref.current.editor is the live Slate editor
Transforms.insertText(ref.current.editor, completion);
```

For streaming, call `insertText` per chunk as it arrives.

Keep your API key on the server. The editor runs in the browser, so a key passed
to a client-side call is readable by anyone using the page.

## Images and uploads

Without `onUpload`, images are embedded as base64 data URLs — fine for a demo,
heavy for real documents. Pass a handler to store the file yourself and return
its URL:

```tsx
<DaEditor
  onUpload={async (file, kind) => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body });
    const { url } = await res.json();
    return url; // becomes the src of the inserted media
  }}
/>
```

`kind` is one of `'image' | 'video' | 'audio' | 'file' | 'embed'`, so a single
handler can route by type. Throwing rejects the insertion.

## Mentions

Pass `mentionables` and typing `@` opens a combobox over your data. Matching,
keyboard navigation and insertion are handled for you:

```tsx
<DaEditor
  mentionables={[
    { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
    { id: '2', name: 'Bob Martin', detail: 'bob@example.com', avatar: '/bob.jpg' },
  ]}
/>
```

Only `id` and `name` are required. `detail` renders as a second line and
`avatar` as an image. For a large or remote directory, hold the list in state
and refetch as the user types.

## Getting content out

```tsx
ref.current?.getHTML();      // serialized HTML
ref.current?.getMarkdown();  // Markdown
ref.current?.getValue();     // Slate JSON, for storing structure
ref.current?.getText();      // plain text
```

`onChange` fires on content changes only — not selection changes — so it is safe
to persist from directly.

## Development

```bash
npm install
npm run dev        # playground
npm run build      # dist/
npm run typecheck
```

## License

MIT
