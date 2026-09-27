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
  Inline,
  List,
} from '../primitives';

export const ESSENTIALS_PAGES: Record<string, () => ReactNode> = {
  content: () => (
    <>
      <DocLead>
        The editor's document is a JSON array of blocks. Store that JSON for a lossless
        round trip, and convert to HTML or Markdown whenever you need to.
      </DocLead>

      <DocH2>Choosing a format</DocH2>
      <DataTable
        head={['Format', 'Read it with', 'Load it with', 'Best for']}
        rows={[
          [
            'JSON (EditorValue)',
            <Inline>onChange</Inline>,
            <Inline>defaultValue</Inline>,
            'Storage. Lossless: every block, mark and setting survives.',
          ],
          [
            'HTML',
            <Inline>getHTML()</Inline>,
            <Inline>defaultHtml</Inline>,
            'Rendering on pages and in emails, search indexing, migrating from other editors.',
          ],
          [
            'Markdown',
            <Inline>getMarkdown()</Inline>,
            <Inline>parseMarkdown()</Inline>,
            'Git-based content, READMEs and LLM prompts. Some styling is dropped.',
          ],
        ]}
      />
      <Callout type="tip" title="Recommended">
        Save the JSON, and generate HTML from it when you render. JSON keeps things that
        HTML and Markdown cannot represent exactly, such as column widths and image
        styles.
      </Callout>

      <DocH2>The document format</DocH2>
      <p>
        An <Inline>EditorValue</Inline> is an array of block nodes. Each block has a{' '}
        <Inline>type</Inline> and <Inline>children</Inline>; text leaves carry their
        marks as flags.
      </p>
      <DocCode title="document.json" language="tsx">{`[
  { "type": "h1", "children": [{ "text": "Release notes" }] },
  {
    "type": "p",
    "children": [
      { "text": "Version 2 is " },
      { "text": "faster", "bold": true },
      { "text": "." }
    ]
  },
  {
    "type": "ul",
    "children": [
      { "type": "li", "children": [{ "text": "New tables" }] },
      { "type": "li", "children": [{ "text": "Dark mode" }] }
    ]
  }
]`}</DocCode>
      <p>
        Every node type is listed on the <Link to="/docs/types">Types</Link> page, and
        exported as the <Inline>ELEMENT</Inline> and <Inline>MARK</Inline> constants.
      </p>

      <DocH2>Saving with onChange</DocH2>
      <p>
        <Inline>onChange</Inline> receives the full document every time the content
        changes. Moving the caret or selecting text does not call it.
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor onChange={(value) => saveDraft(value)} />`}</DocCode>
      <p>
        To store HTML or Markdown as well, convert the value with the exported
        serializers.
      </p>
      <DocCode title="Editor.tsx">{`import { serializeHtml, serializeMarkdown } from 'da-text-editor';

<DaEditor
  onChange={(value) => {
    saveDraft({
      json: value,
      html: serializeHtml(value),
      markdown: serializeMarkdown(value),
    });
  }}
/>`}</DocCode>

      <DocH2>Loading content</DocH2>
      <DocH3>From JSON</DocH3>
      <DocCode title="Editor.tsx">{`<DaEditor defaultValue={savedValue} />`}</DocCode>
      <DocH3>From HTML</DocH3>
      <DocCode title="Editor.tsx">{`<DaEditor defaultHtml={savedHtml} />`}</DocCode>
      <p>
        HTML from other editors, CMSs and Google Docs is mapped onto the closest
        blocks and marks. Unsafe URLs such as <Inline>javascript:</Inline> are dropped
        while parsing.
      </p>
      <DocH3>From Markdown</DocH3>
      <DocCode title="Editor.tsx">{`import { DaEditor, parseMarkdown } from 'da-text-editor';

<DaEditor defaultValue={parseMarkdown(markdownSource)} />`}</DocCode>

      <DocH2>Replacing content later</DocH2>
      <p>
        <Inline>defaultValue</Inline> and <Inline>defaultHtml</Inline> are read once, on
        mount. To swap the document of an editor that is already on screen, use the
        ref:
      </p>
      <DocCode title="Editor.tsx">{`const ref = useRef<DaEditorHandle>(null);

// Load a different document
ref.current?.setValue(nextDocument);

// Or from HTML
ref.current?.setHTML('<p>Fresh start</p>');

// Or empty it
ref.current?.clear();`}</DocCode>
      <Callout type="warning" title="Replacing resets undo history">
        <Inline>setValue</Inline>, <Inline>setHTML</Inline> and <Inline>clear</Inline>{' '}
        replace the whole document, clear the undo history and call{' '}
        <Inline>onChange</Inline>. Do not call them from inside{' '}
        <Inline>onChange</Inline>, or you will create a loop.
      </Callout>

      <DocH2>Checking for an empty document</DocH2>
      <DocCode title="Editor.tsx">{`const isEmpty = !ref.current?.getText().trim();`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['displaying-content', 'paste-import-export', 'ref-api']} />
    </>
  ),

  'displaying-content': () => (
    <>
      <DocLead>
        There are three ways to show a saved document outside the editing screen. Pick
        the one that matches where it will be displayed.
      </DocLead>

      <DataTable
        head={['Where', 'Use', 'Why']}
        rows={[
          ['Your React app', 'A read-only DaEditor', 'Identical to the editor, including code highlighting and toggles.'],
          ['Any web page', <Inline>getHTML({'{ inlineStyles: true }'})</Inline>, 'Self-contained markup that picks up your page’s colours and fonts.'],
          ['Email and PDF', <Inline>getHTML({'{ inlineStyles: \'static\' }'})</Inline>, 'Fixed light-theme colours baked in, for clients that ignore stylesheets.'],
        ]}
      />

      <DocH2>In your React app</DocH2>
      <p>
        A read-only editor renders the document exactly as it was written, with no
        toolbars or menus:
      </p>
      <DocCode title="Article.tsx">{`<DaEditor readOnly defaultValue={doc} minHeight="0" />`}</DocCode>

      <DocH2>On any web page</DocH2>
      <p>
        <Inline>inlineStyles: true</Inline> writes the layout styles onto each element,
        so the HTML renders correctly without the editor's stylesheet. Colours are left
        to your page, so it works on light and dark sites.
      </p>
      <DocCode title="render.ts">{`import { serializeHtml } from 'da-text-editor';

const html = serializeHtml(doc, { inlineStyles: true });`}</DocCode>
      <p>
        Without the option, the HTML uses the editor's <Inline>da-</Inline> classes
        instead, and needs <Inline>da-text-editor/styles.css</Inline> on the page.
      </p>

      <DocH2>In emails and PDFs</DocH2>
      <p>
        <Inline>'static'</Inline> also bakes in the light-theme colours, backgrounds and
        borders, because many email clients strip <Inline>&lt;style&gt;</Inline> tags
        and CSS variables.
      </p>
      <DocCode title="email.ts">{`const html = serializeHtml(doc, { inlineStyles: 'static' });`}</DocCode>

      <DocH2>Security</DocH2>
      <p>
        The serializer escapes all text and drops <Inline>javascript:</Inline>,{' '}
        <Inline>data:</Inline>, <Inline>vbscript:</Inline> and <Inline>file:</Inline>{' '}
        URLs. That protects documents the editor produced.
      </p>
      <Callout type="warning" title="Sanitize HTML you receive">
        If your server accepts HTML from the browser, a user can send any markup they
        like. Store JSON and render HTML on the server, or sanitize incoming HTML with a
        library such as DOMPurify before you store or display it.
      </Callout>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['read-only', 'theming']} />
    </>
  ),

  toolbars: () => (
    <>
      <DocLead>
        The editor has three formatting surfaces and three contextual toolbars. All of
        them are on by default; switch any off with a prop.
      </DocLead>

      <DataTable
        head={['Surface', 'Appears', 'Prop']}
        rows={[
          ['Fixed toolbar', 'Pinned above the document', <Inline>fixedToolbar</Inline>],
          ['Floating toolbar', 'Over a text selection', <Inline>floatingToolbar</Inline>],
          ['Slash menu', <>After typing <Inline>/</Inline></>, <Inline>slashMenu</Inline>],
          ['Table toolbar', 'When the caret is in a table', 'Always on'],
          ['Media toolbar', 'When an image, video, audio, file or embed is selected', 'Always on'],
          ['Link toolbar', 'When the caret is inside a link', 'Always on'],
        ]}
      />

      <DocH2>Fixed toolbar</DocH2>
      <p>It holds every command, grouped left to right:</p>
      <List>
        <li>Undo and redo, block type, font size and font family</li>
        <li>Bold, italic, underline, strikethrough, inline code and more marks</li>
        <li>Text colour, background colour and highlight, with a custom colour picker</li>
        <li>Alignment, line height, lists, indent and outdent</li>
        <li>Link, table, media, emoji and an Insert menu for every block</li>
        <li>Import and export, focus and typewriter modes, and optional extras</li>
      </List>
      <p>
        On narrow screens, groups that do not fit move into a <strong>More</strong>{' '}
        menu, so the toolbar never wraps.
      </p>
      <p>Some buttons only appear when you enable the matching feature:</p>
      <DataTable
        head={['Button', 'Shown when']}
        rows={[
          ['Ask AI', <Inline>onAskAi</Inline>],
          ['Theme toggle', <Inline>onToggleTheme</Inline>],
          ['Preview', <Inline>preview</Inline>],
          ['Content checks', <Inline>lintPanel</Inline>],
          ['Clear document', <>Unless <Inline>onClearAll={'{false}'}</Inline></>],
        ]}
      />

      <DocH3>Adding your own controls</DocH3>
      <p>
        <Inline>toolbarLeading</Inline> renders any element at the start of the
        toolbar, such as a back button or a document title.
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor
  toolbarLeading={
    <button type="button" onClick={() => router.back()}>
      Back
    </button>
  }
/>`}</DocCode>
      <Callout type="tip">
        Use <Inline>onMouseDown={'{(e) => e.preventDefault()}'}</Inline> on your own
        toolbar buttons so clicking them does not take the selection away from the
        document.
      </Callout>

      <DocH3>The Clear document button</DocH3>
      <DocCode title="Editor.tsx">{`// Default: shown, asks for confirmation first
<DaEditor />

// Your own confirmation flow
<DaEditor onClearAll={() => openMyConfirmDialog()} />

// Hidden
<DaEditor onClearAll={false} />`}</DocCode>

      <DocH2>Floating toolbar</DocH2>
      <p>
        Select text and a compact toolbar appears above it once you release the mouse.
        It offers Turn into, font size, the main marks, highlight, link, and a More
        menu with keyboard input, superscript, subscript and Clear formatting. It also
        shows Ask AI when <Inline>onAskAi</Inline> is set.
      </p>

      <DocH2>Slash menu</DocH2>
      <p>
        Type <Inline>/</Inline> at the start of a line or after a space to open a
        filterable list of blocks. Keep typing to filter, use the arrow keys to move,
        and Enter or Tab to insert. Escape closes it. Blocks you have used recently in
        the session are listed first.
      </p>
      <p>
        It includes text blocks, lists, tables, toggles, columns, a table of contents,
        equations, dates and footnotes. The image, video, audio and file items open
        your <Inline>onPickMedia</Inline> picker if you set one, or the built-in media
        dialog. Ask AI appears when <Inline>onAskAi</Inline> is set. The menu does not
        open inside code blocks.
      </p>

      <DocH2>Contextual toolbars</DocH2>
      <List>
        <li>
          <strong>Table toolbar</strong>: insert and delete rows and columns, cell
          background, borders and delete table. See{' '}
          <Link to="/docs/tables">Tables</Link>.
        </li>
        <li>
          <strong>Media toolbar</strong>: replace, caption, align, style and delete.
          See <Link to="/docs/media">Images &amp; media</Link>.
        </li>
        <li>
          <strong>Link toolbar</strong>: open, edit, copy and remove the link. See{' '}
          <Link to="/docs/links">Links</Link>.
        </li>
      </List>

      <DocH2>A minimal editor</DocH2>
      <p>For a comment box or chat input, switch the chrome off:</p>
      <DocCode title="CommentBox.tsx">{`<DaEditor
  fixedToolbar={false}
  slashMenu={false}
  onClearAll={false}
  minHeight="80px"
  placeholder="Write a comment…"
/>`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['formatting', 'shortcuts']} />
    </>
  ),

  'read-only': () => (
    <>
      <DocLead>
        Lock the document to show it without letting anyone change it. Toolbars, menus
        and drag handles are hidden.
      </DocLead>

      <DocH2>readOnly</DocH2>
      <DocCode title="Article.tsx">{`<DaEditor readOnly defaultValue={doc} />`}</DocCode>

      <DocH2>Viewing mode</DocH2>
      <p>
        <Inline>mode="viewing"</Inline> locks the document in exactly the same way. It
        reads better when you offer an Editing / Viewing switch:
      </p>
      <DocCode title="Document.tsx">{`const [mode, setMode] = useState<'editing' | 'viewing'>('editing');

<>
  <button onClick={() => setMode(mode === 'editing' ? 'viewing' : 'editing')}>
    {mode === 'editing' ? 'View' : 'Edit'}
  </button>
  <DaEditor mode={mode} defaultValue={doc} />
</>`}</DocCode>
      <p>
        Switching mode keeps the document, the scroll position and the undo history.
        The root element gets a <Inline>data-mode</Inline> attribute and, when locked,
        the <Inline>da-editor--readonly</Inline> class, for your own styling.
      </p>

      <DocH2>What still works when locked</DocH2>
      <List>
        <li>Selecting and copying text</li>
        <li>Opening links with Ctrl or Cmd + click</li>
        <li>Expanding and collapsing toggle lists</li>
        <li>To-do checkboxes are shown but cannot be ticked</li>
        <li>Scrolling and horizontal scrolling of wide tables</li>
      </List>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['displaying-content', 'layout']} />
    </>
  ),

  layout: () => (
    <>
      <DocLead>
        By default the editor is at least 320px tall and grows with its content. These
        props change that.
      </DocLead>

      <DataTable
        head={['Prop', 'Default', 'Effect']}
        rows={[
          [<Inline>minHeight</Inline>, <Inline>'320px'</Inline>, "Minimum height. '0' lets a flex parent decide the height."],
          [<Inline>maxHeight</Inline>, 'none', 'Caps the height; the document scrolls inside, with the toolbar staying put.'],
          [<Inline>maxWidth</Inline>, 'none', 'Limits the width of the text column, like a document editor.'],
          [<Inline>className</Inline>, 'none', 'Added to the root element.'],
          [<Inline>style</Inline>, 'none', 'Applied to the root element.'],
        ]}
      />

      <DocH2>A fixed-height editor</DocH2>
      <DocCode title="Editor.tsx">{`<DaEditor minHeight="240px" maxHeight="480px" />`}</DocCode>

      <DocH2>A full-page editor</DocH2>
      <p>
        Give the parent a height, make it a flex column, and pass{' '}
        <Inline>minHeight="0"</Inline> so the editor fills the space and scrolls
        internally:
      </p>
      <DocCode title="EditorPage.tsx">{`<div className="editor-page">
  <DaEditor className="editor-fill" minHeight="0" maxWidth="820px" />
</div>`}</DocCode>
      <DocCode title="editor-page.css" language="css">{`.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.editor-fill {
  flex: 1;
  min-height: 0;
}`}</DocCode>

      <DocH2>Removing the border</DocH2>
      <p>
        The root has a 1px border. To embed the editor flush inside your own card,
        remove it with a class:
      </p>
      <DocCode title="editor.css" language="css">{`.editor-flush {
  border: none;
  border-radius: 0;
}`}</DocCode>

      <DocH2>Next steps</DocH2>
      <DocCards slugs={['theming', 'toolbars']} />
    </>
  ),
};
