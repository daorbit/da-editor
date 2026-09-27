import type { ReactNode } from 'react';
import { ESSENTIALS_PAGES } from './pages/essentials';
import { FEATURE_PAGES } from './pages/features';
import { GETTING_STARTED_PAGES } from './pages/gettingStarted';
import { GUIDE_PAGES } from './pages/guides';
import { REFERENCE_PAGES } from './pages/reference';

/** slug -> rendered page body. Titles and order come from nav.ts. */
export const DOC_BODIES: Record<string, () => ReactNode> = {
  ...GETTING_STARTED_PAGES,
  ...ESSENTIALS_PAGES,
  ...FEATURE_PAGES,
  ...REFERENCE_PAGES,
  ...GUIDE_PAGES,
};
