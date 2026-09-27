import type { EditorValue } from '../../src';

const today = new Date().toISOString();

const cell = (text: string, header = false) => ({
  type: header ? ('th' as const) : ('td' as const),
  children: [{ type: 'p' as const, children: [{ text }] }],
});

export const DEMO_CONTENT: EditorValue = [
  { type: 'h1', children: [{ text: 'Atlas 2.0 launch brief' }] },
  {
    type: 'p',
    children: [
      { text: 'Owner ' },
      { type: 'mention', id: '1', name: 'Alice Chen', children: [{ text: '' }] },
      { text: '  ·  Updated ' },
      { type: 'date', date: today, children: [{ text: '' }] },
      { text: '  ·  Status: ' },
      { text: 'In review', bold: true },
    ],
  },
  {
    type: 'callout',
    variant: 'info',
    emoji: '📌',
    children: [
      {
        text: 'Atlas 2.0 replaces the legacy dashboard with a faster, keyboard-first workspace. This brief covers goals, scope, timeline and the decisions still open. Mention the owner of a section if you have questions.',
      },
    ],
  },

  { type: 'h2', children: [{ text: 'Goals' }] },
  {
    type: 'p',
    children: [
      { text: 'Customers told us the current dashboard is ' },
      { text: 'slow to load', bold: true },
      { text: ' and hard to navigate without a mouse. Our research, summarised in the ' },
      { type: 'a', url: 'https://example.com/research', children: [{ text: 'Q2 usability report' }] },
      { text: ', points to three outcomes for this release:' },
    ],
  },
  {
    type: 'ol',
    children: [
      { type: 'li', children: [{ text: 'Cut the time to first interaction from 3.2s to under 1s.' }] },
      { type: 'li', children: [{ text: 'Make every core action reachable from the keyboard.' }] },
      { type: 'li', children: [{ text: 'Move 80% of active workspaces to Atlas 2.0 within 60 days.' }] },
    ],
  },

  { type: 'h2', children: [{ text: 'Scope' }] },
  { type: 'h3', children: [{ text: 'In scope' }] },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'New navigation with a command palette' }] },
      { type: 'li', children: [{ text: 'Saved views and shareable filters' }] },
      { type: 'li', children: [{ text: 'An opt-in migration path for existing workspaces' }] },
    ],
  },
  { type: 'h3', children: [{ text: 'Out of scope' }] },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Mobile apps, planned for the following quarter' }] },
      { type: 'li', children: [{ text: 'Changes to billing and plans' }] },
    ],
  },

  { type: 'h2', children: [{ text: 'Timeline' }] },
  {
    type: 'table',
    columnWidths: [220, 160, 140, 140],
    children: [
      { type: 'tr', children: [cell('Milestone', true), cell('Owner', true), cell('Target', true), cell('Status', true)] },
      { type: 'tr', children: [cell('Design sign-off'), cell('Priya Sharma'), cell('Week 1'), cell('Done')] },
      { type: 'tr', children: [cell('Private beta'), cell('Bob Martin'), cell('Week 4'), cell('In progress')] },
      { type: 'tr', children: [cell('Public launch'), cell('Alice Chen'), cell('Week 8'), cell('Not started')] },
    ],
  },

  { type: 'h2', children: [{ text: 'Launch checklist' }] },
  { type: 'todo_li', checked: true, children: [{ text: 'Finalise pricing page copy' }] },
  { type: 'todo_li', checked: true, children: [{ text: 'Load test the new API at 3× peak traffic' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Record the product walkthrough video' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Brief the support team on migration questions' }] },

  { type: 'h2', children: [{ text: 'API changes' }] },
  {
    type: 'p',
    children: [
      { text: 'Views are now first-class objects. Existing ' },
      { text: 'filter', code: true },
      { text: ' query parameters keep working and are converted on read.' },
    ],
  },
  {
    type: 'code_block',
    lang: 'typescript',
    children: [
      {
        text: `interface SavedView {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  sharedWith: 'me' | 'team' | 'workspace';
}

export async function createView(view: Omit<SavedView, 'id'>): Promise<SavedView> {
  const res = await fetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(view),
  });
  if (!res.ok) throw new Error('Could not save the view');
  return res.json();
}`,
      },
    ],
  },

  { type: 'h2', children: [{ text: 'What customers said' }] },
  {
    type: 'blockquote',
    children: [
      {
        text: 'The beta is the first time I have run my whole morning review without touching the mouse.',
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Beta participant, operations lead at a 40-person logistics team', italic: true },
    ],
  },
  {
    type: 'img',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    caption: 'Cover image for the launch announcement.',
    children: [{ text: '' }],
  },

  { type: 'h2', children: [{ text: 'Open questions' }] },
  {
    type: 'callout',
    variant: 'warning',
    emoji: '⚠️',
    children: [
      { text: 'Should existing workspaces migrate automatically, or should admins opt in? ' },
      { text: 'Decision needed before the private beta.', highlight: '#fde68a' },
    ],
  },
  {
    type: 'toggle',
    open: false,
    children: [{ text: 'Appendix: interview notes and raw survey data' }],
  },

  { type: 'p', children: [{ text: '' }] },
];

export const HERO_CONTENT: EditorValue = [
  { type: 'h1', children: [{ text: 'Release notes: version 2.4' }] },
  {
    type: 'p',
    children: [
      { text: 'Shipped ' },
      { type: 'date', date: today, children: [{ text: '' }] },
      { text: ' by ' },
      { type: 'mention', id: '1', name: 'Alice Chen', children: [{ text: '' }] },
      { text: '. This release focuses on ' },
      { text: 'speed', bold: true },
      { text: ' and a calmer writing experience.' },
    ],
  },
  { type: 'h3', children: [{ text: 'What’s new' }] },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: 'Tables resize column by column' }] },
      { type: 'li', children: [{ text: 'Pasting from Google Docs keeps headings and lists' }] },
      { type: 'li', children: [{ text: 'Dark mode follows your system setting' }] },
    ],
  },
  { type: 'h3', children: [{ text: 'Before the next release' }] },
  { type: 'todo_li', checked: true, children: [{ text: 'Update the migration guide' }] },
  { type: 'todo_li', checked: false, children: [{ text: 'Record the walkthrough video' }] },
  {
    type: 'blockquote',
    children: [{ text: 'Small details, done well, add up to software people trust.' }],
  },
  { type: 'p', children: [{ text: '' }] },
];
