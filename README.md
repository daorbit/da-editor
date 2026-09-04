# @da/editor

A small React rich-text editor component. No runtime dependencies beyond React.

## Install

```bash
npm install @da/editor
```

## Usage

```tsx
import { useState } from 'react';
import { Editor } from '@da/editor';
import '@da/editor/styles.css';

export function Example() {
  const [html, setHtml] = useState('<p>Hello</p>');
  return <Editor value={html} onChange={setHtml} placeholder="Write something…" />;
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | – | Controlled HTML value. |
| `defaultValue` | `string` | `''` | Uncontrolled initial HTML. |
| `onChange` | `(html: string) => void` | – | Fired on every content change. |
| `placeholder` | `string` | `'Write something…'` | Shown when empty. |
| `readOnly` | `boolean` | `false` | Disables editing and the toolbar. |
| `toolbar` | `ToolbarItem[] \| false` | all items | Toolbar buttons, or `false` to hide. |
| `minHeight` | `string` | `'220px'` | Minimum height of the editable area. |
| `className` / `style` | – | – | Applied to the wrapper. |

## Ref handle

```tsx
const ref = useRef<EditorHandle>(null);
ref.current?.getHTML();
ref.current?.getText();
ref.current?.setHTML('<p>New</p>');
ref.current?.focus();
ref.current?.exec('bold');
```

## Toolbar items

`bold`, `italic`, `underline`, `strikeThrough`, `code`, `paragraph`, `h1`, `h2`, `h3`,
`blockquote`, `bulletedList`, `numberedList`, `link`, `clear`, `undo`, `redo`.

## Styling

Styles ship as a separate CSS file. Override the CSS custom properties on `.da-editor`:

```css
.da-editor {
  --da-editor-accent: #7c3aed;
  --da-editor-radius: 12px;
}
```

## Development

```bash
npm install
npm run dev    # playground at localhost:5173
npm run build  # build dist/
```
