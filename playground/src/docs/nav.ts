/** Sidebar structure for the docs route. `slug` maps to /docs/:slug. */
export interface DocPage {
  slug: string;
  title: string;
}

export interface DocGroup {
  label: string;
  pages: DocPage[];
}

export const DOC_NAV: DocGroup[] = [
  {
    label: 'Getting started',
    pages: [
      { slug: 'introduction', title: 'Introduction' },
      { slug: 'installation', title: 'Installation' },
      { slug: 'quickstart', title: 'Quickstart' },
    ],
  },
  {
    label: 'Reference',
    pages: [
      { slug: 'props', title: 'Props' },
      { slug: 'ref-api', title: 'Ref API' },
      { slug: 'features', title: 'Features' },
      { slug: 'shortcuts', title: 'Keyboard shortcuts' },
      { slug: 'theming', title: 'Theming' },
    ],
  },
  {
    label: 'Guides',
    pages: [{ slug: 'backend', title: 'Bring your own backend' }],
  },
];

export const DOC_PAGES: DocPage[] = DOC_NAV.flatMap((g) => g.pages);

export function findDoc(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug);
}

export function adjacentDocs(slug: string): { prev?: DocPage; next?: DocPage } {
  const i = DOC_PAGES.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}
