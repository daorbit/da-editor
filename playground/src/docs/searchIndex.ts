import { API, FEATURES, HOOKS, PROPS } from './content';
import { DOC_NAV } from './nav';
import { anchorId } from './slug';

export type SearchKind = 'Page' | 'Prop' | 'Method' | 'Feature' | 'Guide';

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  detail: string;
  to: string;
}

export const SEARCH_INDEX: SearchEntry[] = [
  ...DOC_NAV.flatMap((group) =>
    group.pages.map((page) => ({
      kind: 'Page' as const,
      title: page.title,
      detail: `${group.label} · ${page.description}`,
      to: `/docs/${page.slug}`,
    })),
  ),
  ...PROPS.map((prop) => ({
    kind: 'Prop' as const,
    title: prop.name,
    detail: prop.body,
    to: `/docs/props#${anchorId('prop', prop.name)}`,
  })),
  ...API.map((entry) => ({
    kind: 'Method' as const,
    title: entry.name,
    detail: entry.body,
    to: `/docs/ref-api#${anchorId('api', entry.name)}`,
  })),
  ...FEATURES.map((feature) => ({
    kind: 'Feature' as const,
    title: feature.name,
    detail: feature.body,
    to: `/docs/features#${anchorId('feature', feature.name)}`,
  })),
  ...HOOKS.map((hook) => ({
    kind: 'Guide' as const,
    title: `${hook.label} (${hook.prop})`,
    detail: hook.blurb,
    to: `/docs/backend#${hook.id}`,
  })),
];

const MAX_RESULTS = 12;

export function searchDocs(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_INDEX.filter((entry) => entry.kind === 'Page');

  const scored = SEARCH_INDEX.flatMap((entry) => {
    const title = entry.title.toLowerCase();
    const detail = entry.detail.toLowerCase();
    const score = title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : detail.includes(q) ? 3 : -1;
    return score === -1 ? [] : [{ entry, score }];
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
}
