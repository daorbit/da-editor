/** Sidebar structure for the docs route. `slug` maps to /docs/:slug. */
export interface DocPage {
  slug: string;
  title: string;
  description: string;
}

export interface DocGroup {
  label: string;
  pages: DocPage[];
}

export const DOC_NAV: DocGroup[] = [
  {
    label: 'Getting started',
    pages: [
      { slug: 'introduction', title: 'Introduction', description: 'What the editor includes and how it is put together.' },
      { slug: 'installation', title: 'Installation', description: 'Add the package and its stylesheet to your app.' },
      { slug: 'quickstart', title: 'Quickstart', description: 'Render an editor, save its content and load it back.' },
      { slug: 'nextjs', title: 'Next.js & SSR', description: 'Use the editor in Next.js and other server-rendered apps.' },
    ],
  },
  {
    label: 'Essentials',
    pages: [
      { slug: 'content', title: 'Saving & loading content', description: 'The document format, onChange, and HTML, Markdown and JSON.' },
      { slug: 'displaying-content', title: 'Displaying saved content', description: 'Render stored documents outside the editor, in pages and emails.' },
      { slug: 'toolbars', title: 'Toolbars & menus', description: 'The fixed toolbar, floating toolbar, slash menu and contextual toolbars.' },
      { slug: 'read-only', title: 'Read-only & viewing', description: 'Show a document without letting people change it.' },
      { slug: 'layout', title: 'Sizing & layout', description: 'Heights, widths, full-page editors and flex layouts.' },
    ],
  },
  {
    label: 'Features',
    pages: [
      { slug: 'features', title: 'Feature overview', description: 'Everything the editor does, and how to reach it.' },
      { slug: 'formatting', title: 'Text formatting', description: 'Marks, colours, fonts, sizes, alignment and spacing.' },
      { slug: 'blocks', title: 'Blocks', description: 'Headings, lists, to-dos, quotes, callouts, code, columns and more.' },
      { slug: 'tables', title: 'Tables', description: 'Insert, resize, style and navigate tables.' },
      { slug: 'media', title: 'Images & media', description: 'Images, video, audio, files, embeds and uploads.' },
      { slug: 'links', title: 'Links & link cards', description: 'Add, edit and open links, and turn URLs into preview cards.' },
      { slug: 'mentions-emoji', title: 'Mentions & emoji', description: 'The @ mention and :emoji: comboboxes.' },
      { slug: 'markdown-shortcuts', title: 'Markdown shortcuts', description: 'Formatting rules that apply as you type.' },
      { slug: 'paste-import-export', title: 'Paste, import & export', description: 'Smart paste, Word and Markdown import, HTML and Markdown export.' },
      { slug: 'find-replace', title: 'Find & replace', description: 'Search the document with case, whole-word and regex options.' },
      { slug: 'spellcheck', title: 'Spell check', description: 'Dictionary-backed spelling with suggestions.' },
      { slug: 'writing-tools', title: 'Writing tools', description: 'Focus mode, typewriter mode, word count, content checks and preview.' },
    ],
  },
  {
    label: 'Reference',
    pages: [
      { slug: 'props', title: 'Props', description: 'Every prop on DaEditor, with types and defaults.' },
      { slug: 'ref-api', title: 'Ref API', description: 'Read and write the document from outside the editor.' },
      { slug: 'types', title: 'Types', description: 'The TypeScript types you will use most.' },
      { slug: 'shortcuts', title: 'Keyboard shortcuts', description: 'Every hotkey and typing trigger.' },
      { slug: 'theming', title: 'Theming', description: 'Restyle the editor with CSS custom properties.' },
    ],
  },
  {
    label: 'Guides',
    pages: [
      { slug: 'backend', title: 'Bring your own backend', description: 'Wire AI, uploads, mentions and link previews to your server.' },
      { slug: 'ai', title: 'Adding AI', description: 'Connect the Ask AI button to your own model endpoint.' },
      { slug: 'troubleshooting', title: 'Troubleshooting', description: 'Fixes for the problems people hit most often.' },
    ],
  },
];

export const DOC_PAGES: DocPage[] = DOC_NAV.flatMap((g) => g.pages);

export function findDoc(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug);
}

export function findGroup(slug: string): DocGroup | undefined {
  return DOC_NAV.find((group) => group.pages.some((page) => page.slug === slug));
}

export function adjacentDocs(slug: string): { prev?: DocPage; next?: DocPage } {
  const i = DOC_PAGES.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}
