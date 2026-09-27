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
      { slug: 'quickstart', title: 'Quickstart', description: 'Render an editor, track changes and read the content out.' },
    ],
  },
  {
    label: 'Reference',
    pages: [
      { slug: 'props', title: 'Props', description: 'Every prop on DaEditor, with types and defaults.' },
      { slug: 'ref-api', title: 'Ref API', description: 'Read and write the document from outside the editor.' },
      { slug: 'features', title: 'Features', description: 'Everything the editor does, and how to reach it.' },
      { slug: 'shortcuts', title: 'Keyboard shortcuts', description: 'Every hotkey and typing trigger.' },
      { slug: 'theming', title: 'Theming', description: 'Restyle the editor with CSS custom properties.' },
    ],
  },
  {
    label: 'Guides',
    pages: [
      {
        slug: 'backend',
        title: 'Bring your own backend',
        description: 'Wire AI, uploads, mentions and link previews to your server.',
      },
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
