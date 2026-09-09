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
  { name: 'spellCheck', type: 'boolean', def: 'true', body: "The browser's native spell checking on the editable." },
  { name: 'spellCheckEngine', type: 'SpellEngine | SpellEngineLoader', def: '—', body: 'A dictionary engine (nspell, typo-js, …) or a loader for one. Turns on wavy underlines and a click-to-fix menu. No dictionary is bundled.' },
  { name: 'preview', type: 'boolean', def: 'false', body: 'Adds a device-framed live preview pane, opened from the toolbar.' },
  { name: 'toasts', type: 'boolean', def: 'true', body: 'The built-in top-centre toast for copy / cut / paste. Follows the resolved theme.' },
  { name: 'smartPaste', type: 'boolean', def: 'true', body: 'A pasted bare URL, Markdown block or code snippet is inserted as the matching content, not plain text.' },
  { name: 'onFetchLinkMeta', type: '(url) => Promise<LinkMeta | null>', def: '—', body: 'When set, a pasted bare URL becomes a rich preview card and this fills its title, description and image.' },
  { name: 'lintPanel', type: 'boolean', def: 'false', body: 'Enables the content-checks panel (heading skips, missing alt text, empty blocks, unsafe links, …) and its toolbar toggle.' },
  { name: 'defaultFocusMode', type: 'boolean', def: 'false', body: 'Start in focus mode: every block but the caret’s is dimmed. Toggle with Ctrl+Alt+F.' },
  { name: 'defaultTypewriter', type: 'boolean', def: 'false', body: 'Start in typewriter mode: the caret line stays vertically centred. Toggle with Ctrl+Alt+T.' },
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
  { name: 'Find & replace', how: 'Ctrl/Cmd+F', body: 'Live match count with every hit highlighted. Case, whole-word, regular-expression and find-in-selection toggles. Regex replace supports $1, $2 back-references.' },
  { name: 'Smart paste', how: 'Paste plain text', body: 'A bare URL becomes a link, embed or image; a Markdown block becomes real headings and lists; an indented code snippet becomes a code block with a detected language. smartPaste prop.' },
  { name: 'Link preview cards', how: 'Paste a URL', body: 'With onFetchLinkMeta set, a pasted URL renders as a card with title, description and thumbnail. Shows a shimmer while the fetch is in flight.' },
  { name: 'Spell check', how: 'spellCheckEngine prop', body: 'Wavy underlines from a host-supplied dictionary. Click a word for suggestions, Ignore, or Add to dictionary. No dictionary is bundled — pass nspell, typo-js or a service.' },
  { name: 'Content checks', how: 'lintPanel prop + toolbar', body: 'A side panel flagging heading-level skips, images with no alt text, empty and trailing blocks, duplicate headings and unsafe links. One-click fixes where possible.' },
  { name: 'Focus & typewriter mode', how: 'Ctrl+Alt+F / Ctrl+Alt+T', body: 'Focus mode dims every block but the current one. Typewriter mode keeps the caret line centred as you write. Toolbar buttons and defaultFocusMode / defaultTypewriter props.' },
  { name: 'Markdown shortcuts', how: 'Type ## or - ', body: 'Input rules convert as you type. Pasting Markdown is parsed into real blocks too.' },
  { name: 'Tables', how: 'Slash menu or toolbar', body: 'Drag a column border to resize; add and remove rows and columns from the contextual toolbar. Wide tables scroll horizontally on small screens.' },
  { name: 'Images', how: 'Drop, paste or toolbar', body: 'Resize with the side handles, reorder with the gutter grip, align left / centre / right, and in the Style panel set corner radius, border, shadow and an aspect-ratio crop.' },
  { name: 'Uploads', how: 'Drag & drop or paste', body: 'Files and screenshots route through your onUpload handler. Without one they become local object URLs.' },
  { name: 'Code blocks', how: 'Slash menu or ```', body: 'Prism highlighting across 20+ languages, with a language picker on the block. Colours are baked into the serialized HTML too.' },
  { name: 'Import', how: 'Toolbar', body: 'HTML, Markdown and .docx via Mammoth — tables, lists and callouts survive the round trip.' },
  { name: 'Export', how: 'Toolbar or ref', body: "HTML, Markdown or Slate JSON. getHTML({ inlineStyles: true }) inlines structure but leaves colour to the host page; 'static' also bakes the light theme, for email and PDF." },
  { name: 'Preview', how: 'preview prop + toolbar', body: 'A device-framed live preview (desktop / tablet / mobile) rendered from the inline-styled HTML.' },
  { name: 'Copy / paste toast', how: 'Any copy or paste', body: 'A subtle top-centre confirmation. On by default; turn off with toasts={false}.' },
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
  { name: 'setFocusMode', sig: '(on: boolean) => void', body: 'Toggles focus mode from outside the toolbar.' },
  { name: 'setTypewriter', sig: '(on: boolean) => void', body: 'Toggles typewriter mode from outside the toolbar.' },
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
  {
    id: 'link-meta',
    label: 'Link preview cards',
    prop: 'onFetchLinkMeta',
    blurb:
      'A pasted bare URL becomes a rich card. Return open-graph metadata and the editor fills the title, description and thumbnail; a null result falls back to a plain link. Fetch through your own proxy — browsers cannot read cross-origin OG tags directly.',
    code: `<DaEditor
  onFetchLinkMeta={async (url) => {
    const res = await fetch(
      '/api/link-meta?url=' + encodeURIComponent(url),
    );
    if (!res.ok) return null;
    return res.json(); // { title, description, image, siteName }
  }}
/>`,
  },
  {
    id: 'spell',
    label: 'Spell check',
    prop: 'spellCheckEngine',
    blurb:
      'The editor bundles no dictionary. Pass a spelling engine — anything with correct(word) and suggest(word) — or a function that loads one. nspell with a Hunspell dictionary is the common choice; typo-js or a remote service work too.',
    code: `import nspell from 'nspell';
import aff from 'dictionary-en/index.aff?raw';
import dic from 'dictionary-en/index.dic?raw';

<DaEditor
  spellCheckEngine={() =>
    Promise.resolve(nspell(aff, dic))
  }
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
      ['Mod + Alt + F', 'Toggle focus mode'],
      ['Mod + Alt + T', 'Toggle typewriter mode'],
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
      ['Paste a URL', 'Link, embed, image or preview card (needs smartPaste)'],
      ['Paste Markdown / code', 'Parsed into real blocks (needs smartPaste)'],
    ],
  },
];
