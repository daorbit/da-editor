/**
 * Shared reference data for the docs pages. Kept here (not in Home) so the
 * docs route owns it and Home stays a marketing page.
 */

/** Every `DaEditor` prop, kept in step with the exported interface. */
export const PROPS: { name: string; type: string; def: string; body: string }[] = [
  { name: 'defaultValue', type: 'EditorValue', def: '—', body: 'Initial document. Track updates with onChange.' },
  { name: 'defaultHtml', type: 'string', def: '—', body: 'Initial document as HTML. Ignored when defaultValue is set.' },
  { name: 'onChange', type: '(value) => void', def: '—', body: 'Fires on every document change.' },
  { name: 'placeholder', type: 'string', def: "'Write something…'", body: 'Shown only while the document is empty.' },
  { name: 'readOnly', type: 'boolean', def: 'false', body: 'Locks the document and hides the editing chrome.' },
  { name: 'mode', type: "'editing' | 'viewing'", def: "'editing'", body: "'viewing' locks the document, like readOnly." },
  { name: 'theme', type: "'light' | 'dark' | 'system'", def: "'light'", body: "'system' follows the OS setting and updates live." },
  { name: 'onToggleTheme', type: '() => void', def: '—', body: 'Renders the theme toggle in the toolbar and fires on click.' },
  { name: 'fixedToolbar', type: 'boolean', def: 'true', body: 'The toolbar pinned above the content.' },
  { name: 'floatingToolbar', type: 'boolean', def: 'true', body: 'The toolbar that appears over a selection.' },
  { name: 'slashMenu', type: 'boolean', def: 'true', body: 'The / block menu.' },
  { name: 'emoji', type: 'boolean', def: 'true', body: 'The :name inline emoji combobox.' },
  { name: 'accent', type: "'neutral' | 'gradient'", def: "'neutral'", body: 'Accent for active affordances. gradient uses --da-accent-gradient.' },
  { name: 'autoformat', type: 'boolean', def: 'true', body: 'Markdown input rules while typing.' },
  { name: 'wordCount', type: 'boolean', def: 'false', body: 'Words, characters and reading time, in a footer bar.' },
  { name: 'mentionables', type: 'Mentionable[]', def: '—', body: 'Entries offered by the @ combobox. Omit to disable mentions.' },
  { name: 'onAskAi', type: '() => void', def: '—', body: 'Renders the Ask AI button and binds Ctrl+J.' },
  { name: 'onUpload', type: '(file, kind) => Promise<string>', def: '—', body: 'Uploads a file and returns its URL. Falls back to an object URL.' },
  { name: 'onPickMedia', type: '(kind) => Promise<Picked | null>', def: '—', body: 'Opens your own media library instead of the built-in dialog.' },
  { name: 'maxWidth', type: 'string', def: '—', body: 'Constrains the text column, like a document editor.' },
  { name: 'minHeight', type: 'string', def: "'320px'", body: "Pass '0' to fill a flex parent instead." },
  { name: 'maxHeight', type: 'string', def: '—', body: 'Caps the height; the document scrolls inside it.' },
  { name: 'autoFocus', type: 'boolean', def: 'false', body: 'Focuses the document on mount.' },
  { name: 'spellCheck', type: 'boolean', def: 'true', body: "The browser's native spell checking." },
  { name: 'className', type: 'string', def: '—', body: 'Applied to the editor root.' },
  { name: 'style', type: 'CSSProperties', def: '—', body: 'Applied to the editor root.' },
];

/** What each feature does and how it is reached. */
export const FEATURES: { name: string; how: string; body: string }[] = [
  { name: 'Slash menu', how: 'Type /', body: 'Grouped, filterable block inserter with a Recent band. Arrow keys move, Enter inserts, Escape closes.' },
  { name: 'Mentions', how: 'Type @', body: 'Combobox over the mentionables you pass. The editor handles matching, keyboard nav and insertion.' },
  { name: 'Emoji', how: 'Type :name', body: 'Inline combobox after two letters — :fire becomes 🔥. Toggle with the emoji prop.' },
  { name: 'Drag handle', how: 'Hover any block', body: 'A gutter grip on every block — paragraph, heading, list, callout, code, media. Drag to reorder; a line shows the drop point.' },
  { name: 'Block placeholders', how: 'Empty line', body: 'The empty block under the caret names itself — “Heading 1”, “Empty quote”, “Type / for commands”.' },
  { name: 'Find & replace', how: 'Ctrl/Cmd+F', body: 'Live match count with every hit highlighted in the document. Case toggle, replace one, replace all.' },
  { name: 'Markdown shortcuts', how: 'Type ## or - ', body: 'Input rules convert as you type. Pasting Markdown is parsed into real blocks too.' },
  { name: 'Tables', how: 'Slash menu or toolbar', body: 'Drag a column border to resize. Add and remove rows and columns from the contextual toolbar.' },
  { name: 'Images', how: 'Drop, paste or toolbar', body: 'Drag the side handles to resize, the gutter grip to reorder, and align left, centre or right.' },
  { name: 'Uploads', how: 'Drag & drop or paste', body: 'Files and screenshots route through your onUpload handler. Without one they become local object URLs.' },
  { name: 'Code blocks', how: 'Slash menu or ```', body: 'Prism highlighting across 20+ languages, with a language picker on the block.' },
  { name: 'Import', how: 'Toolbar', body: 'HTML, Markdown and .docx via Mammoth — tables, lists and callouts survive the round trip.' },
  { name: 'Export', how: 'Toolbar or ref', body: 'HTML, Markdown or Slate JSON. getHTML({ inlineStyles: true }) embeds the styling.' },
  { name: 'Word count', how: 'wordCount prop', body: 'Words, characters and an estimated reading time, in a footer bar.' },
  { name: 'Undo grouping', how: 'Ctrl+Z', body: 'Typing is grouped by word and by pause, so one undo never swallows a whole paragraph.' },
];

/** The ref handle, and the helpers worth knowing about. */
export const API: { name: string; sig: string; body: string }[] = [
  { name: 'getValue', sig: '() => EditorValue', body: 'The document as Slate JSON.' },
  { name: 'setValue', sig: '(value) => void', body: 'Replaces the document wholesale.' },
  { name: 'getHTML', sig: '(options?) => string', body: 'Serialized HTML. Pass { inlineStyles: true } to embed the styling.' },
  { name: 'getMarkdown', sig: '() => string', body: 'The document as Markdown.' },
  { name: 'getText', sig: '() => string', body: 'Plain text, for search indexing or a summary.' },
  { name: 'setHTML', sig: '(html) => void', body: 'Replaces the document from an HTML string.' },
  { name: 'focus', sig: '() => void', body: 'Moves focus into the document.' },
  { name: 'clear', sig: '() => void', body: 'Empties the document.' },
  { name: 'editor', sig: 'DaEditor', body: 'The underlying Slate editor, for your own transforms.' },
];

/** The custom properties every colour in the editor resolves through. */
export const TOKENS: [string, string][] = [
  ['--da-bg', 'Editor and menu background'],
  ['--da-fg', 'Body text'],
  ['--da-muted', 'Secondary text and carets'],
  ['--da-faint', 'Disabled text and placeholders'],
  ['--da-border', 'Hairlines and menu borders'],
  ['--da-surface', 'Insets: inputs, code blocks, slash icons'],
  ['--da-surface-hover', 'Hover fill on buttons and menu items'],
  ['--da-accent', 'Active state; neutral by default'],
  ['--da-accent-soft', 'Active background behind toolbar buttons'],
  ['--da-tb-icon', 'Toolbar and menu icons'],
  ['--da-link', 'Links in the document'],
  ['--da-selection', 'Text selection'],
  ['--da-radius', 'Corner radius for panels'],
  ['--da-font', 'UI and document font stack'],
  ['--da-mono', 'Code and monospace stack'],
];

export const INSTALL = 'npm install da-text-editor';

export const USAGE = `import { DaEditor } from 'da-text-editor';
import 'da-text-editor/styles.css';

export function Editor() {
  return (
    <DaEditor
      theme="system"
      mentionables={people}
      onChange={(value) => save(value)}
    />
  );
}`;

/* The three integration points people actually ask about. Each is a hook the
   editor calls — it never talks to a network itself. */
export const HOOKS = [
  {
    id: 'ai',
    label: 'Ask AI',
    prop: 'onAskAi',
    blurb:
      'Renders the Ask AI button and binds Ctrl+J. You read the document off the ref, call your own endpoint, and write the answer back. Nothing is sent anywhere by the editor.',
    code: `const ref = useRef<DaEditorHandle>(null);

async function askAi() {
  const editor = ref.current;
  if (!editor) return;

  const prompt =
    window.getSelection()?.toString() || editor.getText();

  const res = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  editor.setHTML((await res.json()).html);
}

<DaEditor ref={ref} onAskAi={askAi} />`,
  },
  {
    id: 'upload',
    label: 'Uploads',
    prop: 'onUpload',
    blurb:
      'Return a URL and the editor inserts it. Without this, media embeds as base64 data URLs — fine for a demo, heavy for real documents.',
    code: `<DaEditor
  onUpload={async (file, kind) => {
    const body = new FormData();
    body.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body,
    });

    const { url } = await res.json();
    return url; // becomes the media src
  }}
/>`,
  },
  {
    id: 'mentions',
    label: 'Mentions',
    prop: 'mentionables',
    blurb:
      'Pass a list and @ opens a combobox over it. Matching, keyboard navigation and insertion are handled for you.',
    code: `<DaEditor
  mentionables={[
    {
      id: '1',
      name: 'Alice Chen',
      detail: 'alice@example.com',
    },
    {
      id: '2',
      name: 'Bob Martin',
      avatar: '/bob.jpg',
    },
  ]}
/>`,
  },
] as const;

/** Keyboard shortcuts, grouped. `Mod` is Ctrl on Windows/Linux, Cmd on macOS. */
export const SHORTCUTS: { group: string; rows: [string, string][] }[] = [
  {
    group: 'Marks',
    rows: [
      ['Mod + B', 'Bold'],
      ['Mod + I', 'Italic'],
      ['Mod + U', 'Underline'],
      ['Mod + Shift + X', 'Strikethrough'],
      ['Mod + E', 'Inline code'],
      ['Mod + \\', 'Clear all marks'],
    ],
  },
  {
    group: 'Blocks',
    rows: [
      ['Mod + Alt + 0', 'Turn into paragraph'],
      ['Mod + Alt + 1', 'Turn into Heading 1'],
      ['Mod + Alt + 2', 'Turn into Heading 2'],
      ['Mod + Alt + 3', 'Turn into Heading 3'],
      ['Mod + Shift + .', 'Turn into quote'],
      ['Mod + Shift + 7', 'Numbered list'],
      ['Mod + Shift + 8', 'Bulleted list'],
      ['Mod + Shift + 9', 'To-do list'],
      ['Tab / Shift + Tab', 'Indent / outdent (or move between table cells)'],
      ['Mod + Enter', 'Exit a code block'],
    ],
  },
  {
    group: 'Tools',
    rows: [
      ['Mod + F', 'Find & replace'],
      ['Mod + K', 'Add or edit a link'],
      ['Mod + J', 'Ask AI (when onAskAi is set)'],
      ['Mod + Z', 'Undo'],
      ['Mod + Shift + Z', 'Redo'],
    ],
  },
  {
    group: 'Triggers',
    rows: [
      ['/', 'Block menu on an empty line'],
      ['@', 'Mention combobox (needs mentionables)'],
      [':name', 'Emoji combobox — two or more letters (needs emoji)'],
      ['## , - , > , ```', 'Markdown shortcuts while typing (needs autoformat)'],
    ],
  },
];
