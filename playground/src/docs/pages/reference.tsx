import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiTable,
  Callout,
  DataTable,
  DocCode,
  DocH2,
  DocLead,
  Inline,
  PropsTable,
  ShortcutsTable,
  TokensList,
} from '../primitives';

export const REFERENCE_PAGES: Record<string, () => ReactNode> = {
  props: () => (
    <>
      <DocLead>
        Every prop on <Inline>&lt;DaEditor /&gt;</Inline>. All are optional. Search the
        docs with <Inline>Ctrl + K</Inline> to jump straight to one.
      </DocLead>
      <DocH2>All props</DocH2>
      <PropsTable />
      <p>
        <Inline>DaEditor</Inline> also accepts a <Inline>ref</Inline>; see the{' '}
        <Link to="/docs/ref-api">Ref API</Link>.
      </p>
    </>
  ),

  'ref-api': () => (
    <>
      <DocLead>
        A ref gives you methods to read and change the document from outside the
        editor, such as from a Save button.
      </DocLead>

      <DocH2>Attach a ref</DocH2>
      <DocCode title="Editor.tsx">{`import { useRef } from 'react';
import { DaEditor, type DaEditorHandle } from 'da-text-editor';

export function Editor() {
  const ref = useRef<DaEditorHandle>(null);

  const publish = () => {
    const html = ref.current?.getHTML({ inlineStyles: true });
    // send html to your server
  };

  return (
    <>
      <DaEditor ref={ref} />
      <button onClick={publish}>Publish</button>
    </>
  );
}`}</DocCode>

      <DocH2>Methods</DocH2>
      <ApiTable />

      <Callout type="warning" title="Replacing the document">
        <Inline>setValue</Inline>, <Inline>setHTML</Inline> and <Inline>clear</Inline>{' '}
        reset the undo history and call <Inline>onChange</Inline>.
      </Callout>

      <DocH2>Using the Slate editor</DocH2>
      <p>
        <Inline>ref.current.editor</Inline> is the underlying Slate editor. Pass it to
        the exported helpers to build your own controls:
      </p>
      <DataTable
        head={['Area', 'Helpers']}
        rows={[
          ['Marks', <><Inline>toggleMark</Inline> <Inline>setMark</Inline> <Inline>isMarkActive</Inline> <Inline>clearMarks</Inline></>],
          ['Blocks', <><Inline>replaceBlock</Inline> <Inline>toggleBlock</Inline> <Inline>getBlockType</Inline> <Inline>setAlign</Inline> <Inline>indent</Inline></>],
          ['Links', <><Inline>wrapLink</Inline> <Inline>unwrapLink</Inline> <Inline>isLinkActive</Inline></>],
          ['Tables', <><Inline>insertTable</Inline> <Inline>insertRow</Inline> <Inline>insertColumn</Inline> <Inline>deleteRow</Inline> <Inline>deleteColumn</Inline> <Inline>toggleHeaderRow</Inline></>],
          ['Media', <><Inline>insertMedia</Inline> <Inline>insertFiles</Inline> <Inline>insertImage</Inline></>],
          ['Inline', <><Inline>insertMention</Inline> <Inline>insertEmoji</Inline> <Inline>insertDivider</Inline></>],
          ['Content', <><Inline>serializeHtml</Inline> <Inline>serializeMarkdown</Inline> <Inline>deserializeHtml</Inline> <Inline>parseMarkdown</Inline></>],
        ]}
      />
      <DocCode title="SaveShortcut.tsx">{`import { replaceBlock, toggleMark } from 'da-text-editor';

const editor = ref.current!.editor;
toggleMark(editor, 'bold');
replaceBlock(editor, 'h2');`}</DocCode>
    </>
  ),

  types: () => (
    <>
      <DocLead>
        Every type is exported from <Inline>da-text-editor</Inline>. These are the ones
        you will use most.
      </DocLead>

      <DocH2>Content</DocH2>
      <DocCode title="types.ts">{`// The whole document: an array of blocks
type EditorValue = Descendant[];

// Options for getHTML and serializeHtml
interface SerializeHtmlOptions {
  inlineStyles?: boolean | 'static';
}`}</DocCode>
      <p>
        Node types are available as constants, so you do not need to hard-code strings:
      </p>
      <DocCode title="types.ts">{`import { ELEMENT, MARK } from 'da-text-editor';

ELEMENT.h1          // 'h1'
ELEMENT.codeBlock   // 'code_block'
ELEMENT.table       // 'table'
MARK.bold           // 'bold'
MARK.highlight      // 'highlight'`}</DocCode>
      <DataTable
        head={['Group', 'ELEMENT keys']}
        rows={[
          ['Text', 'paragraph, h1–h6, blockquote, callout, codeBlock'],
          ['Lists', 'bulletedList, numberedList, listItem, todoListItem, toggleList'],
          ['Layout', 'divider, columns, column, tableOfContents'],
          ['Tables', 'table, tableRow, tableCell, tableHeaderCell'],
          ['Media', 'image, video, audio, file, embed, linkCard'],
          ['Inline', 'link, mention, date, footnote, inlineEquation'],
          ['Other', 'equation'],
        ]}
      />
      <p>
        Marks are <Inline>bold</Inline>, <Inline>italic</Inline>,{' '}
        <Inline>underline</Inline>, <Inline>strikethrough</Inline>, <Inline>code</Inline>,{' '}
        <Inline>subscript</Inline>, <Inline>superscript</Inline> and <Inline>kbd</Inline>{' '}
        (true when set), plus <Inline>color</Inline>, <Inline>backgroundColor</Inline>,{' '}
        <Inline>highlight</Inline>, <Inline>fontSize</Inline>, <Inline>fontFamily</Inline>{' '}
        and <Inline>comment</Inline> (which hold a value).
      </p>

      <DocH2>Handlers</DocH2>
      <DocCode title="types.ts">{`type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'embed';

// onUpload: resolve to the URL of the stored file
type UploadHandler = (file: File, kind: MediaKind) => Promise<string>;

// onFetchLinkMeta: resolve to metadata, or null
type FetchLinkMeta = (url: string) => Promise<LinkMeta | null>;

interface LinkMeta {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// mentionables
interface Mentionable {
  id: string;
  name: string;
  detail?: string;
  avatar?: string;
}

// spellCheckEngine
interface SpellEngine {
  correct(word: string): boolean;
  suggest(word: string): string[];
  add?(word: string): void;
}
type SpellEngineLoader = () => Promise<SpellEngine>;`}</DocCode>

      <DocH2>Display</DocH2>
      <DocCode title="types.ts">{`type Theme = 'light' | 'dark' | 'system';
type EditorMode = 'editing' | 'suggesting' | 'viewing'; // 'suggesting' currently behaves like 'editing'
type Align = 'left' | 'center' | 'right' | 'justify';`}</DocCode>

      <DocH2>Component</DocH2>
      <DocCode title="types.ts">{`import type { DaEditorProps, DaEditorHandle } from 'da-text-editor';`}</DocCode>
      <p>
        <Inline>DaEditorProps</Inline> is documented on the{' '}
        <Link to="/docs/props">Props</Link> page and <Inline>DaEditorHandle</Inline> on
        the <Link to="/docs/ref-api">Ref API</Link> page.
      </p>
    </>
  ),

  shortcuts: () => (
    <>
      <DocLead>
        <Inline>Mod</Inline> is <Inline>Ctrl</Inline> on Windows and Linux and{' '}
        <Inline>Cmd</Inline> on macOS. Triggers fire while typing; the rest work
        whenever the document has focus.
      </DocLead>
      <ShortcutsTable />
    </>
  ),

  theming: () => (
    <>
      <DocLead>
        Every colour, radius and font resolves through a CSS custom property on{' '}
        <Inline>.da-editor</Inline>. Override them in your own stylesheet; there is no
        theme object and no build step.
      </DocLead>

      <DocH2>Light, dark and system</DocH2>
      <DocCode title="Editor.tsx">{`<DaEditor theme="light" />   // default
<DaEditor theme="dark" />
<DaEditor theme="system" />  // follows the OS and updates live`}</DocCode>
      <p>
        To show a toggle in the toolbar, pass <Inline>onToggleTheme</Inline> and switch
        the <Inline>theme</Inline> prop yourself:
      </p>
      <DocCode title="Editor.tsx">{`const [dark, setDark] = useState(false);

<DaEditor
  theme={dark ? 'dark' : 'light'}
  onToggleTheme={() => setDark((value) => !value)}
/>`}</DocCode>

      <DocH2>Overriding tokens</DocH2>
      <DocCode title="theme.css" language="css">{`.da-editor {
  --da-font: "Inter", system-ui, sans-serif;
  --da-link: #7c3aed;
  --da-selection: rgba(124, 58, 237, 0.18);
  --da-radius: 14px;
}

.da-editor[data-theme='dark'] {
  --da-bg: #0b0b10;
  --da-link: #a78bfa;
}`}</DocCode>
      <Callout type="tip" title="Dark theme overrides">
        The dark palette is set on <Inline>.da-editor[data-theme='dark']</Inline>. Target
        the same selector to change dark colours without affecting light ones.
      </Callout>

      <DocH2>Token reference</DocH2>
      <TokensList />

      <DocH2>Gradient accent</DocH2>
      <p>
        <Inline>accent="gradient"</Inline> switches active toolbar buttons, slash menu
        icons, the focus ring and the drop indicator to a gradient:
      </p>
      <DocCode title="Editor.tsx">{`<DaEditor accent="gradient" />`}</DocCode>
      <DocCode title="theme.css" language="css">{`.da-editor {
  --da-accent-gradient: linear-gradient(120deg, #6d5efc, #ff8a5c);
}`}</DocCode>

      <DocH2>Styling individual parts</DocH2>
      <p>
        Every part of the editor has a stable <Inline>da-</Inline> class, such as{' '}
        <Inline>.da-tb--fixed</Inline> for the toolbar, <Inline>.da-editor__content</Inline>{' '}
        for the document and <Inline>.da-h1</Inline> for headings. Pass{' '}
        <Inline>className</Inline> to scope your overrides to one editor.
      </p>
    </>
  ),
};
