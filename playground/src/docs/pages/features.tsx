import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Callout,
  DataTable,
  DocCards,
  DocCode,
  DocH2,
  DocH3,
  DocLead,
  FeaturesTable,
  Inline,
  List,
} from '../primitives';

export const FEATURE_PAGES: Record<string, () => ReactNode> = {
  features: () => (
    <>
      <DocLead>
        Almost everything is on by default. A few features are opt-in, because they need
        something from you, such as a dictionary or an upload endpoint.
      </DocLead>

      <DocH2>Opt-in features</DocH2>
      <DataTable
        head={['Feature', 'Turn it on with']}
        rows={[
          ['Mentions', <Inline>mentionables</Inline>],
          ['Real uploads', <Inline>onUpload</Inline>],
          ['Ask AI', <Inline>onAskAi</Inline>],
          ['Link preview cards', <Inline>onFetchLinkMeta</Inline>],
          ['Spell check with suggestions', <Inline>spellCheckEngine</Inline>],
          ['Content checks panel', <Inline>lintPanel</Inline>],
          ['Device preview', <Inline>preview</Inline>],
          ['Word count', <Inline>wordCount</Inline>],
          ['Theme toggle in the toolbar', <Inline>onToggleTheme</Inline>],
        ]}
      />

      <DocH2>All features</DocH2>
      <FeaturesTable />

      <DocH2>Feature guides</DocH2>
      <DocCards
        slugs={[
          'formatting',
          'blocks',
          'tables',
          'media',
          'links',
          'mentions-emoji',
          'markdown-shortcuts',
          'paste-import-export',
          'find-replace',
          'spellcheck',
          'writing-tools',
          'ai',
        ]}
      />
    </>
  ),

  formatting: () => (
    <>
      <DocLead>
        Format text from the fixed toolbar, the floating toolbar that appears over a
        selection, keyboard shortcuts or Markdown shortcuts.
      </DocLead>

      <DocH2>Marks</DocH2>
      <DataTable
        head={['Mark', 'Shortcut', 'Markdown shortcut']}
        rows={[
          ['Bold', <Inline>Mod + B</Inline>, <Inline>**text**</Inline>],
          ['Italic', <Inline>Mod + I</Inline>, <Inline>*text*</Inline>],
          ['Underline', <Inline>Mod + U</Inline>, <Inline>__text__</Inline>],
          ['Strikethrough', <Inline>Mod + Shift + X</Inline>, <Inline>~~text~~</Inline>],
          ['Inline code', <Inline>Mod + E</Inline>, <Inline>`text`</Inline>],
          ['Keyboard input', 'More menu', '—'],
          ['Superscript', 'More menu', '—'],
          ['Subscript', 'More menu', '—'],
        ]}
      />
      <p>
        <Inline>Mod</Inline> is Ctrl on Windows and Linux and Cmd on macOS.{' '}
        <Inline>Mod + \</Inline> clears every mark from the selection.
      </p>

      <DocH2>Colours and highlight</DocH2>
      <p>
        The fixed toolbar has three colour menus: <strong>Text colour</strong>,{' '}
        <strong>Background colour</strong> and <strong>Highlight</strong>. Each offers
        preset swatches and a custom picker that accepts any hex value. The floating
        toolbar has the highlight presets.
      </p>

      <DocH2>Font size and family</DocH2>
      <List>
        <li>
          <strong>Size</strong>: use the − and + stepper or type a value. Steps follow 12,
          14, 16, 18, 20, 24, 30, 36, 48, 60 and 72px; typed values are kept between 8
          and 144px. The document default is 15px.
        </li>
        <li>
          <strong>Family</strong>: Default, Sans serif, Serif, Monospace and Inter.
          Load Inter on your page yourself if you want it to render as Inter.
        </li>
      </List>

      <DocH2>Alignment, spacing and indent</DocH2>
      <List>
        <li>
          <strong>Alignment</strong>: left, centre, right or justify, for paragraphs,
          headings, quotes and media.
        </li>
        <li>
          <strong>Line height</strong>: 1, 1.15, 1.5, 1.75 or 2, per block. The default
          is 1.65.
        </li>
        <li>
          <strong>Indent</strong>: Tab and Shift+Tab, or the toolbar buttons, move a
          block in and out by 24px, up to eight levels.
        </li>
      </List>

      <DocH2>Formatting from code</DocH2>
      <p>
        Every toolbar action is also an exported function that takes the editor from
        the ref:
      </p>
      <DocCode title="Toolbar.tsx">{`import { setAlign, setMark, toggleMark } from 'da-text-editor';

const editor = ref.current!.editor;

toggleMark(editor, 'bold');
setMark(editor, 'color', '#2563eb');
setAlign(editor, 'center');`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['blocks', 'markdown-shortcuts']} />
    </>
  ),

  blocks: () => (
    <>
      <DocLead>
        Insert any block from the slash menu, the toolbar's Insert menu, a Markdown
        shortcut, or turn an existing block into another type.
      </DocLead>

      <DataTable
        head={['Block', 'Markdown shortcut', 'Notes']}
        rows={[
          ['Heading 1–6', <><Inline>#</Inline> to <Inline>###</Inline> + space</>, 'Enter at the end of a heading starts a paragraph.'],
          ['Bulleted list', <><Inline>-</Inline>, <Inline>*</Inline> or <Inline>+</Inline> + space</>, 'Markers: disc, circle or square.'],
          ['Numbered list', <><Inline>1.</Inline> or <Inline>1)</Inline> + space</>, 'Decimal, alphabetic or Roman numbering.'],
          ['To-do list', <><Inline>[]</Inline> + space</>, 'Click the checkbox to tick it.'],
          ['Toggle list', '—', 'A block that collapses and expands.'],
          ['Quote', <><Inline>&gt;</Inline> + space</>, ''],
          ['Callout', '—', 'A highlighted note with an icon.'],
          ['Code block', <><Inline>```</Inline> + space</>, 'Syntax highlighting with a language picker.'],
          ['Divider', <><Inline>---</Inline> + space</>, ''],
          ['Columns', '—', 'Three side-by-side columns.'],
          ['Table of contents', '—', 'Built from the headings; updates as you write.'],
          ['Equation', '—', 'A block of LaTeX source.'],
        ]}
      />

      <DocH2>Editing behaviour</DocH2>
      <List>
        <li>Enter on an empty list item leaves the list.</li>
        <li>
          Backspace at the start of a heading, quote, callout, code block or list item
          turns it back into a paragraph. If the block is indented, it outdents first.
        </li>
        <li>Shift+Enter behaves like Enter.</li>
        <li>
          Hover any block to show its grip on the left, then drag it to a new position.
          A line marks where it will land.
        </li>
        <li>An empty block under the caret shows a hint, such as “Heading 1” or “To-do”.</li>
      </List>

      <DocH2>Code blocks</DocH2>
      <List>
        <li>
          Highlighting for Bash, C, C++, C#, CSS, Diff, Docker, Go, GraphQL, HTML, Java,
          JavaScript, JSON, JSX, Markdown, PHP, Python, Ruby, Rust, SQL, TSX, TypeScript
          and YAML. <strong>Auto</strong> detects the language.
        </li>
        <li>The language button on the block opens a searchable list.</li>
        <li>The copy button copies the code to the clipboard.</li>
        <li>Enter adds a new line inside the block. Mod+Enter leaves it.</li>
        <li>Pasting into a code block always inserts plain text.</li>
      </List>

      <DocH2>Callouts</DocH2>
      <p>
        A callout is a highlighted note with a 💡 icon. Its colour comes from a{' '}
        <Inline>variant</Inline> and its icon from <Inline>emoji</Inline>; set them in
        the document data:
      </p>
      <DocCode title="document.json">{`{
  "type": "callout",
  "variant": "warning",
  "emoji": "⚠️",
  "children": [{ "text": "Back up your data first." }]
}`}</DocCode>
      <p>
        Variants are <Inline>info</Inline> (default), <Inline>warning</Inline>,{' '}
        <Inline>success</Inline> and <Inline>danger</Inline>.
      </p>

      <DocH2>Inline elements</DocH2>
      <DataTable
        head={['Element', 'Insert from', 'Behaviour']}
        rows={[
          ['Date', 'Slash menu or Insert menu', 'A chip showing today’s date. Click it to pick another date.'],
          ['Footnote', 'Slash menu or Insert menu', 'A superscript marker. Click to write the note; hover to read it.'],
          ['Inline equation', 'Insert menu', 'Inline LaTeX source. Click to edit.'],
          ['Mention', <><Inline>@</Inline></>, <>See <Link to="/docs/mentions-emoji">Mentions</Link>.</>],
        ]}
      />
      <Callout type="note" title="Equations show their source">
        Equations store and display LaTeX source text. They are not typeset. If you need
        rendered maths, render the <Inline>formula</Inline> field with a library such as
        KaTeX when you display the document.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['tables', 'media']} />
    </>
  ),

  tables: () => (
    <>
      <DocLead>
        Tables support header rows, resizable columns, cell colours and borders, and
        full keyboard navigation.
      </DocLead>

      <DocH2>Inserting a table</DocH2>
      <p>
        Choose <strong>Table</strong> from the slash menu, or{' '}
        <strong>Table → Insert 3 × 3 table</strong> in the fixed toolbar. New tables
        start with a header row and the caret in the first cell.
      </p>

      <DocH2>Keyboard</DocH2>
      <DataTable
        head={['Key', 'Action']}
        rows={[
          [<Inline>Tab</Inline>, 'Next cell. In the last cell, adds a new row.'],
          [<Inline>Shift + Tab</Inline>, 'Previous cell.'],
          [<Inline>Enter</Inline>, 'New line inside the cell.'],
        ]}
      />

      <DocH2>Editing the structure</DocH2>
      <p>
        With the caret in a table, the table toolbar offers: insert row above or below,
        delete row, insert column left or right, delete column, and delete table. The
        fixed toolbar's Table menu also toggles the header row.
      </p>
      <p>Deleting the last row or column removes the whole table.</p>

      <DocH2>Column widths</DocH2>
      <p>
        Drag the border between two columns to resize them. Columns have a minimum width
        of 48px. Widths are saved in the table's <Inline>columnWidths</Inline>, and wide
        tables scroll horizontally on small screens.
      </p>

      <DocH2>Cell colours and borders</DocH2>
      <List>
        <li>
          <strong>Cell background</strong> fills the selected cells with a colour.
        </li>
        <li>
          <strong>Borders</strong> toggles each side, or applies a preset: all, none or
          outside only.
        </li>
      </List>
      <p>Select across several cells to style them all at once.</p>

      <DocH2>Tables from code</DocH2>
      <DocCode title="Insert.tsx">{`import { insertTable, insertRow, toggleHeaderRow } from 'da-text-editor';

const editor = ref.current!.editor;

insertTable(editor, 4, 3);      // 4 rows, 3 columns, with a header row
insertRow(editor, 'below');
toggleHeaderRow(editor);`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['media', 'paste-import-export']} />
    </>
  ),

  media: () => (
    <>
      <DocLead>
        Add images, video, audio, file attachments and embeds by uploading, pasting,
        dragging or linking.
      </DocLead>

      <DocH2>Ways to add media</DocH2>
      <List>
        <li>The <strong>Media</strong> menu in the fixed toolbar, or the slash menu.</li>
        <li>Drag files from your desktop onto the editor.</li>
        <li>Paste a file or a screenshot.</li>
        <li>
          Paste an image URL, or a YouTube or Vimeo link, on its own line. See{' '}
          <Link to="/docs/paste-import-export">smart paste</Link>.
        </li>
      </List>
      <p>
        Dropped and pasted files are added in order. Images, video and audio are
        detected from the file type; anything else becomes a file attachment with its
        name.
      </p>

      <DocH2>Uploading files</DocH2>
      <p>
        <Inline>onUpload</Inline> receives each file and its kind, and resolves to the
        URL to insert:
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor
  onUpload={async (file, kind) => {
    const body = new FormData();
    body.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body });
    if (!res.ok) throw new Error('Upload failed');

    const { url } = await res.json();
    return url;
  }}
/>`}</DocCode>
      <Callout type="warning" title="Set onUpload in production">
        Without <Inline>onUpload</Inline>, files become temporary{' '}
        <Inline>blob:</Inline> URLs. They display during the session but stop working
        after a reload, and are meaningless to anyone else.
      </Callout>
      <p>
        In the media dialog, a rejected promise shows its error message to the user.
        For dropped or pasted files, a failed upload is skipped and the rest continue.
      </p>

      <DocH2>Using your own media library</DocH2>
      <p>
        The built-in dialog offers “Choose from your device” and a URL field. To open
        your own asset picker instead, pass <Inline>onPickMedia</Inline>:
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor
  onPickMedia={async (kind) => {
    const asset = await openAssetLibrary({ type: kind });
    return asset ? { url: asset.url, name: asset.filename } : null;
  }}
/>`}</DocCode>
      <p>Resolve <Inline>null</Inline> when the user cancels.</p>

      <DocH2>Working with images</DocH2>
      <p>Select an image to show the media toolbar:</p>
      <List>
        <li><strong>Resize</strong> by dragging the handles on either side.</li>
        <li><strong>Align</strong> left, centre or right.</li>
        <li><strong>Caption</strong>: also used as the image's alt text.</li>
        <li><strong>Replace</strong> the image URL.</li>
        <li>
          <strong>Style</strong>: corners (none to full), border (none, thin, bold),
          shadow (none, soft, deep) and crop to 1:1, 4:3, 16:9 or 3:1 with fill or
          contain.
        </li>
        <li><strong>Delete</strong> the image.</li>
      </List>
      <Callout type="tip" title="Accessibility">
        Add a caption to every meaningful image. Screen readers use it as the
        description, and the content checks panel flags images without one.
      </Callout>

      <DocH2>Embeds</DocH2>
      <p>
        YouTube and Vimeo share links are converted to their embed URLs automatically.
        Any other URL added as an embed is loaded in an iframe, so it must allow being
        framed.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['backend', 'links']} />
    </>
  ),

  links: () => (
    <>
      <DocLead>
        Add links from the toolbar or keyboard, edit them in place, and optionally turn
        pasted URLs into rich preview cards.
      </DocLead>

      <DocH2>Adding a link</DocH2>
      <List>
        <li>
          Select text and press <Inline>Mod + K</Inline>, or use the link button in
          either toolbar. Type the URL and press Enter.
        </li>
        <li>Select text and paste a URL to link it.</li>
        <li>With nothing selected, pasting a URL inserts it as a link.</li>
      </List>
      <p>
        Typed addresses are completed for you: <Inline>example.com</Inline> becomes{' '}
        <Inline>https://example.com</Inline>, and an email address becomes a{' '}
        <Inline>mailto:</Inline> link.
      </p>

      <DocH2>Editing and opening links</DocH2>
      <p>
        Put the caret inside a link to show the link toolbar. It shows the address and
        lets you edit it, copy it, or remove the link while keeping the text.
      </p>
      <p>
        Plain clicks place the caret, so links do not navigate away while you edit.
        Hold <Inline>Ctrl</Inline> or <Inline>Cmd</Inline> and click to open a link in a
        new tab.
      </p>

      <DocH2>Link preview cards</DocH2>
      <p>
        With <Inline>onFetchLinkMeta</Inline> set, a bare URL pasted on its own becomes
        a card with a title, description, site name and thumbnail. The card shows a
        loading shimmer until your function resolves.
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor
  onFetchLinkMeta={async (url) => {
    const res = await fetch('/api/unfurl?url=' + encodeURIComponent(url));
    if (!res.ok) return null;
    return res.json(); // { title, description, image, siteName }
  }}
/>`}</DocCode>
      <Callout type="note" title="Fetch metadata on your server">
        Browsers cannot read another site's open-graph tags because of CORS, so fetch
        the page from your own endpoint. If your function returns null or fails, the
        card shows the URL and host name.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['mentions-emoji', 'paste-import-export']} />
    </>
  ),

  'mentions-emoji': () => (
    <>
      <DocLead>
        Type <Inline>@</Inline> to mention someone from a list you provide, or{' '}
        <Inline>:</Inline> followed by a name to insert an emoji.
      </DocLead>

      <DocH2>Mentions</DocH2>
      <p>
        Pass the people who can be mentioned. The combobox filters by name and detail
        as the user types, and shows up to eight matches.
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor
  mentionables={[
    { id: 'u_1', name: 'Alice Chen', detail: 'alice@example.com' },
    { id: 'u_2', name: 'Bob Martin', avatar: '/avatars/bob.png' },
  ]}
/>`}</DocCode>
      <DataTable
        head={['Field', 'Required', 'Used for']}
        rows={[
          [<Inline>id</Inline>, 'Yes', 'Stored on the mention, so you can notify or link the person.'],
          [<Inline>name</Inline>, 'Yes', 'The visible label and the text the search matches.'],
          [<Inline>detail</Inline>, 'No', 'A second line in the menu, such as an email. Also searchable.'],
          [<Inline>avatar</Inline>, 'No', 'An image URL. Without it, the first letter is shown.'],
        ]}
      />
      <p>
        The menu opens after a space or at the start of a line, so email addresses do
        not trigger it. Mentions are stored as{' '}
        <Inline>{'{ type: \'mention\', id, name }'}</Inline>, so you can find them in the
        saved document:
      </p>
      <DocCode title="notify.ts">{`import type { EditorValue } from 'da-text-editor';

function mentionedIds(nodes: EditorValue, ids = new Set<string>()): string[] {
  for (const node of nodes) {
    if ('type' in node && node.type === 'mention' && 'id' in node) ids.add(node.id);
    if ('children' in node) mentionedIds(node.children, ids);
  }
  return [...ids];
}`}</DocCode>
      <Callout type="tip" title="Large teams">
        <Inline>mentionables</Inline> is filtered in the browser. For thousands of
        people, pass a relevant subset, such as the members of the current project.
      </Callout>

      <DocH2>Emoji</DocH2>
      <p>
        Type a colon followed by at least two letters, such as <Inline>:fire</Inline>,
        and pick from the list. The fixed toolbar also has an emoji picker with
        categories and search. Turn the colon shortcut off with{' '}
        <Inline>emoji={'{false}'}</Inline>.
      </p>

      <DocH2>Using the menus</DocH2>
      <DataTable
        head={['Key', 'Action']}
        rows={[
          [<Inline>↑ / ↓</Inline>, 'Move through the list'],
          [<Inline>Enter</Inline>, 'Insert the highlighted item'],
          [<Inline>Tab</Inline>, 'Insert the highlighted item'],
          [<Inline>Esc</Inline>, 'Close the menu and keep the typed text'],
        ]}
      />
      <p>Neither menu opens inside code blocks or inline code.</p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['markdown-shortcuts', 'shortcuts']} />
    </>
  ),

  'markdown-shortcuts': () => (
    <>
      <DocLead>
        Write in Markdown and the editor formats as you type. Turn this off with{' '}
        <Inline>autoformat={'{false}'}</Inline>.
      </DocLead>

      <DocH2>Block shortcuts</DocH2>
      <p>Type these at the start of a line, followed by a space:</p>
      <DataTable
        head={['Type', 'To get']}
        rows={[
          [<Inline>#</Inline>, 'Heading 1'],
          [<Inline>##</Inline>, 'Heading 2'],
          [<Inline>###</Inline>, 'Heading 3'],
          [<><Inline>-</Inline> <Inline>*</Inline> <Inline>+</Inline></>, 'Bulleted list'],
          [<><Inline>1.</Inline> <Inline>1)</Inline></>, 'Numbered list'],
          [<><Inline>[]</Inline> <Inline>[ ]</Inline></>, 'To-do list'],
          [<Inline>&gt;</Inline>, 'Quote'],
          [<Inline>```</Inline>, 'Code block'],
          [<><Inline>---</Inline> <Inline>***</Inline></>, 'Divider'],
        ]}
      />

      <DocH2>Inline shortcuts</DocH2>
      <p>Wrap text and the mark applies as soon as you type the closing characters:</p>
      <DataTable
        head={['Type', 'To get']}
        rows={[
          [<Inline>**bold**</Inline>, 'Bold'],
          [<Inline>***both***</Inline>, 'Bold'],
          [<Inline>*italic*</Inline>, 'Italic'],
          [<Inline>_italic_</Inline>, 'Italic'],
          [<Inline>__underline__</Inline>, 'Underline'],
          [<Inline>~~strike~~</Inline>, 'Strikethrough'],
          [<Inline>`code`</Inline>, 'Inline code'],
        ]}
      />

      <DocH2>Typography</DocH2>
      <DataTable
        head={['Type', 'To get']}
        rows={[
          [<Inline>--</Inline>, '— (em dash)'],
          [<Inline>...</Inline>, '… (ellipsis)'],
          [<Inline>-&gt;</Inline>, '→'],
          [<Inline>&lt;-</Inline>, '←'],
          [<Inline>(c)</Inline>, '©'],
          [<Inline>(r)</Inline>, '®'],
          [<Inline>(tm)</Inline>, '™'],
          [<Inline>!=</Inline>, '≠'],
          [<Inline>+-</Inline>, '±'],
        ]}
      />

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['paste-import-export', 'shortcuts']} />
    </>
  ),

  'paste-import-export': () => (
    <>
      <DocLead>
        Paste from anywhere, import Word, HTML or Markdown files, and export HTML or
        Markdown.
      </DocLead>

      <DocH2>Pasting</DocH2>
      <DataTable
        head={['You paste', 'You get']}
        rows={[
          ['Content copied from this editor', 'An exact copy, including media, tables and settings.'],
          ['Rich text from Word, Google Docs or a web page', 'Headings, lists, tables, links and marks mapped to editor blocks.'],
          ['Markdown text', 'Real headings, lists, tables, quotes and code blocks.'],
          ['Multi-line code copied from an IDE such as VS Code', 'A code block with the language detected.'],
          ['A bare image URL', 'An image.'],
          ['A YouTube or Vimeo link', 'A video embed.'],
          ['Any other bare URL', 'A link, or a preview card with onFetchLinkMeta.'],
          ['A URL over selected text', 'The selected text becomes a link.'],
          ['Files or screenshots', 'Uploaded through onUpload and inserted.'],
          ['Anything, into a code block', 'Plain text, exactly as copied.'],
        ]}
      />
      <p>
        Turn off the Markdown, code and URL conversions with{' '}
        <Inline>smartPaste={'{false}'}</Inline>. Very large HTML (over about 500 KB) is
        pasted as plain text so the page stays responsive.
      </p>
      <p>
        Copying from the editor puts clean HTML and plain text on the clipboard, so
        pasting into other apps keeps headings, lists and formatting without any
        editor controls.
      </p>

      <DocH2>Importing files</DocH2>
      <p>
        The fixed toolbar's <strong>Import</strong> menu opens a file picker:
      </p>
      <DataTable
        head={['Option', 'Accepts']}
        rows={[
          ['Import from Word', '.docx, and .htm or .html saved from Word. Legacy .doc files are not supported.'],
          ['Import from HTML', '.html and .htm'],
          ['Import from Markdown', '.md, .markdown and .txt'],
        ]}
      />
      <Callout type="warning" title="Import replaces the document">
        Importing replaces the whole document and clears the undo history. The Word
        converter is loaded only when you first import a .docx file.
      </Callout>

      <DocH2>Exporting</DocH2>
      <p>
        <strong>Export</strong> in the fixed toolbar downloads{' '}
        <Inline>document.html</Inline> or <Inline>document.md</Inline>. From code:
      </p>
      <DocCode title="Export.tsx">{`const html = ref.current?.getHTML();
const markdown = ref.current?.getMarkdown();
const json = ref.current?.getValue();`}</DocCode>

      <DocH3>What Markdown keeps</DocH3>
      <p>
        Markdown export keeps headings H1–H6, bold, italic, underline (as{' '}
        <Inline>__text__</Inline>), strikethrough, inline code, links, bulleted,
        numbered and to-do lists, quotes, code blocks with their language, dividers,
        images, and tables as GitHub-flavoured tables.
      </p>
      <p>
        Markdown has no syntax for colours, font sizes, alignment, columns or image
        styles, so those are dropped. Callouts become quotes, and media other than
        images becomes links. Keep the JSON if you need everything.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['content', 'displaying-content']} />
    </>
  ),

  'find-replace': () => (
    <>
      <DocLead>
        Press <Inline>Mod + F</Inline> to search the document. Every match is
        highlighted, with the current one marked separately.
      </DocLead>

      <DocH2>Options</DocH2>
      <DataTable
        head={['Option', 'Effect']}
        rows={[
          ['Match case', 'Only matches with the same capitalisation.'],
          ['Whole word', 'Skips matches inside longer words.'],
          ['Regular expression', 'Treats the query as a JavaScript regular expression.'],
          ['In selection', 'Searches only inside the text that was selected.'],
        ]}
      />

      <DocH2>Replacing</DocH2>
      <p>Replace the current match, or every match at once.</p>
      <p>With regular expressions on, the replacement text understands these tokens:</p>
      <DataTable
        head={['Token', 'Inserts']}
        rows={[
          [<Inline>$1</Inline>, 'The first capture group, and so on up to $99'],
          [<Inline>$&amp;</Inline>, 'The whole match'],
          [<Inline>$$</Inline>, 'A literal $'],
        ]}
      />
      <DocCode title="Example">{`Find:     (\\w+)@example\\.com
Replace:  $1@example.org`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['spellcheck', 'shortcuts']} />
    </>
  ),

  spellcheck: () => (
    <>
      <DocLead>
        The browser's own spell checking is on by default. For consistent underlines
        with suggestions in every browser, plug in a dictionary engine.
      </DocLead>

      <DocH2>Browser spell checking</DocH2>
      <p>
        <Inline>spellCheck</Inline> (default <Inline>true</Inline>) enables the
        browser's native checking, along with autocorrect and auto-capitalisation on
        mobile. Set it to <Inline>false</Inline> to turn all three off.
      </p>

      <DocH2>Dictionary spell checking</DocH2>
      <p>
        Pass <Inline>spellCheckEngine</Inline> to get wavy underlines and a
        click-to-fix menu with suggestions, Ignore and Add to dictionary. No dictionary
        is bundled, which keeps the package small; bring one that suits your language.
      </p>
      <DocCode title="Editor.tsx">{`import nspell from 'nspell';

async function loadEnglish() {
  const [aff, dic] = await Promise.all([
    fetch('/dictionaries/en.aff').then((r) => r.text()),
    fetch('/dictionaries/en.dic').then((r) => r.text()),
  ]);
  return nspell(aff, dic);
}

<DaEditor spellCheckEngine={loadEnglish} />`}</DocCode>
      <p>
        Pass a function, as above, to load the dictionary lazily after the editor
        appears. You can also pass a ready engine object.
      </p>

      <DocH2>Engine interface</DocH2>
      <DocCode title="types.ts">{`interface SpellEngine {
  correct(word: string): boolean;
  suggest(word: string): string[];
  add?(word: string): void; // called by "Add to dictionary"
}`}</DocCode>
      <p>
        nspell and typo-js fit this shape. To use a remote service, wrap it in an object
        with these methods.
      </p>

      <DocH2>What is checked</DocH2>
      <List>
        <li>Words of two letters or more.</li>
        <li>Skipped: all-caps words and acronyms, words starting with a number, and email addresses.</li>
        <li>Ignore and Add to dictionary last for the current session.</li>
      </List>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['writing-tools', 'backend']} />
    </>
  ),

  'writing-tools': () => (
    <>
      <DocLead>
        Tools for writers and editors: distraction-free modes, counts, automatic content
        checks and a device preview.
      </DocLead>

      <DocH2>Focus mode</DocH2>
      <p>
        Dims every block except the one you are writing in. Toggle it with{' '}
        <Inline>Mod + Alt + F</Inline> or the toolbar, start with it on using{' '}
        <Inline>defaultFocusMode</Inline>, or control it with{' '}
        <Inline>ref.current.setFocusMode(true)</Inline>.
      </p>

      <DocH2>Typewriter mode</DocH2>
      <p>
        Keeps the line you are writing vertically centred as you type. Toggle it with{' '}
        <Inline>Mod + Alt + T</Inline>, start with <Inline>defaultTypewriter</Inline>,
        or call <Inline>ref.current.setTypewriter(true)</Inline>.
      </p>

      <DocH2>Word count</DocH2>
      <p>
        <Inline>wordCount</Inline> adds a footer with words, characters and an estimated
        reading time at 200 words per minute.
      </p>

      <DocH2>Content checks</DocH2>
      <p>
        <Inline>lintPanel</Inline> adds a toolbar button that opens a panel listing
        problems in the document. Click an issue to jump to it; some have a one-click
        fix.
      </p>
      <DataTable
        head={['Check', 'Flags', 'Fix']}
        rows={[
          ['heading-skip', 'A heading more than one level below the previous one', 'Yes'],
          ['duplicate-heading', 'Two headings with the same text', '—'],
          ['missing-h1', 'A document without a Heading 1', '—'],
          ['image-alt', 'An image with no caption (alt text)', '—'],
          ['image-src', 'An image with no source', '—'],
          ['long-paragraph', 'A paragraph over 700 characters', '—'],
          ['empty-block', 'An empty block in the middle of the document', 'Yes'],
          ['trailing-empty', 'Empty paragraphs at the end', 'Yes'],
          ['empty-link', 'A link with no destination', '—'],
          ['unsafe-link', 'A javascript:, data: or vbscript: link', '—'],
        ]}
      />
      <p>
        The checks are also exported, so you can run them before publishing, for
        example to block a save that has errors:
      </p>
      <DocCode title="publish.ts">{`import { lintDocument } from 'da-text-editor';

const issues = lintDocument(value, { disabled: ['long-paragraph'] });
const errors = issues.filter((issue) => issue.severity === 'error');`}</DocCode>

      <DocH2>Device preview</DocH2>
      <p>
        <Inline>preview</Inline> adds a toolbar button that opens a live preview beside
        the editor, framed as a desktop, tablet or phone. Drag the divider, or focus it
        and use the arrow keys, to resize the split.
      </p>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['props', 'shortcuts']} />
    </>
  ),
};
