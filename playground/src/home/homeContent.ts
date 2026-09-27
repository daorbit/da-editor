import {
  AlignCenter,
  AtSign,
  Braces,
  Calendar,
  ClipboardPaste,
  CodeXml,
  Columns3,
  FileDown,
  FileText,
  Focus,
  Globe,
  GripVertical,
  Hash,
  Heading,
  Image,
  Link2,
  List,
  ListCollapse,
  ListTodo,
  ListTree,
  MessageSquareQuote,
  Moon,
  Music,
  Paperclip,
  Search,
  Sigma,
  Smile,
  SpellCheck,
  Superscript,
  Table,
  TextCursorInput,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { Mentionable } from '../../../src';
import { INSTALL } from '../docs/content';

export const GITHUB_URL = 'https://github.com/daorbit/da-editor';
export const NPM_URL = 'https://www.npmjs.com/package/da-text-editor';
export const ISSUES_URL = 'https://github.com/daorbit/da-editor/issues';
export const FEEDBACK_FORM_SRC = 'https://forms.daorbit.in/form/6aa79a65eafa25640d94f63c/view';

export const MENTIONABLES: Mentionable[] = [
  { id: '1', name: 'Alice Chen', detail: 'alice@example.com' },
  { id: '2', name: 'Bob Martin', detail: 'bob@example.com' },
  { id: '3', name: 'Priya Sharma', detail: 'priya@example.com' },
];

export const INSTALL_COMMANDS = [
  { id: 'npm', label: 'npm', code: INSTALL },
  { id: 'pnpm', label: 'pnpm', code: 'pnpm add da-text-editor' },
  { id: 'yarn', label: 'yarn', code: 'yarn add da-text-editor' },
];

export const STACK = ['React 18 & 19', 'TypeScript', 'Slate', 'Prism', 'MIT licensed', '81 KB gzipped'];

export const STATS = [
  { value: '35', label: 'Block & inline types' },
  { value: '14', label: 'Text marks' },
  { value: '20+', label: 'Code languages' },
  { value: '0', label: 'Plugins to wire up' },
];

export const FEATURE_PILLS: { icon: LucideIcon; label: string }[] = [
  { icon: Heading, label: 'Headings' },
  { icon: List, label: 'Lists' },
  { icon: ListTodo, label: 'To-dos' },
  { icon: ListCollapse, label: 'Toggle lists' },
  { icon: Table, label: 'Tables' },
  { icon: CodeXml, label: 'Code blocks' },
  { icon: MessageSquareQuote, label: 'Callouts' },
  { icon: Columns3, label: 'Columns' },
  { icon: Image, label: 'Images' },
  { icon: Video, label: 'Video' },
  { icon: Music, label: 'Audio' },
  { icon: Globe, label: 'Embeds' },
  { icon: Paperclip, label: 'Attachments' },
  { icon: AtSign, label: 'Mentions' },
  { icon: Smile, label: 'Emoji' },
  { icon: Calendar, label: 'Dates' },
  { icon: Sigma, label: 'Equations' },
  { icon: Superscript, label: 'Footnotes' },
  { icon: ListTree, label: 'Table of contents' },
  { icon: Link2, label: 'Link cards' },
  { icon: Search, label: 'Find & replace' },
  { icon: Hash, label: 'Markdown shortcuts' },
  { icon: ClipboardPaste, label: 'Smart paste' },
  { icon: FileText, label: 'Word import' },
  { icon: FileDown, label: 'HTML & Markdown export' },
  { icon: SpellCheck, label: 'Spellcheck' },
  { icon: Focus, label: 'Focus mode' },
  { icon: TextCursorInput, label: 'Typewriter mode' },
  { icon: GripVertical, label: 'Drag to reorder' },
  { icon: AlignCenter, label: 'Alignment' },
  { icon: Moon, label: 'Dark mode' },
  { icon: Braces, label: 'JSON document model' },
];

export interface Benefit {
  title: string;
  body: string;
  code: string;
  file: string;
  language: 'tsx' | 'css';
  href: string;
}

export const BENEFITS: Benefit[] = [
  {
    title: 'Everything is on by default',
    body: 'Toolbars, menus, tables and media work on the first render. Switch off what you do not need with a prop.',
    code: `<DaEditor
  fixedToolbar
  floatingToolbar
  slashMenu={false}
  wordCount
/>`,
    file: 'App.tsx',
    language: 'tsx',
    href: '/docs/props',
  },
  {
    title: 'Your backend, your handlers',
    body: 'Uploads, AI and link previews are functions you pass. The editor never makes a network request of its own.',
    code: `<DaEditor
  onUpload={(file) => upload(file)}
  onAskAi={() => openAssistant()}
  onFetchLinkMeta={(url) => unfurl(url)}
/>`,
    file: 'App.tsx',
    language: 'tsx',
    href: '/docs/backend',
  },
  {
    title: 'Styled with CSS variables',
    body: 'Every colour, radius and font resolves through a custom property. Restyle it without a build step or !important.',
    code: `.da-editor {
  --da-accent: #6d5efc;
  --da-radius: 14px;
  --da-font: "Inter", sans-serif;
}`,
    file: 'theme.css',
    language: 'css',
    href: '/docs/theming',
  },
];

export type MenuKind = 'floating' | 'slash' | 'fixed';

export interface MenuTab {
  id: MenuKind;
  label: string;
  title: string;
  body: string;
  code: string;
}

export const MENU_TABS: MenuTab[] = [
  {
    id: 'floating',
    label: 'Floating toolbar',
    title: 'Formatting where the selection is',
    body: 'Select text and a compact toolbar appears above it with marks, block types, font size, highlight and links.',
    code: `<DaEditor floatingToolbar />`,
  },
  {
    id: 'slash',
    label: 'Slash menu',
    title: 'Insert any block from the keyboard',
    body: 'Type / for a grouped, filterable list of blocks. Arrow keys move, Enter inserts, Escape closes.',
    code: `<DaEditor slashMenu mentionables={people} />`,
  },
  {
    id: 'fixed',
    label: 'Fixed toolbar',
    title: 'A full toolbar pinned above the page',
    body: 'Every command in one bar, with a slot for your own controls through toolbarLeading.',
    code: `<DaEditor
  fixedToolbar
  toolbarLeading={<SaveButton />}
/>`,
  },
];

export const DEV_CALLOUTS = [
  {
    title: 'Built for React',
    body: 'A single component with a ref API: getHTML, getMarkdown, setValue, focus and more.',
  },
  {
    title: 'Written in TypeScript',
    body: 'Typed props, typed handlers and a typed document model you can store as JSON.',
  },
  {
    title: 'Powered by Slate',
    body: 'A proven document model underneath, with normalisation, history and undo grouping.',
  },
];

export const FAQS = [
  {
    question: 'Is da-text-editor free to use?',
    answer: 'Yes. It is open source under the MIT licence, free for personal and commercial projects.',
  },
  {
    question: 'Which React versions does it support?',
    answer: 'React 18 and React 19. React and React DOM are the only peer dependencies; Slate and everything else ship with the package.',
  },
  {
    question: 'Does the editor upload files or call an AI service itself?',
    answer: 'No. Uploads, AI and link previews go through handlers you pass, such as onUpload and onAskAi, so your data only goes where you send it.',
  },
  {
    question: 'How do I get the content out?',
    answer: 'Listen to onChange for the JSON document, or call getHTML, getMarkdown or getText on the ref. setHTML and setValue load content back in.',
  },
  {
    question: 'Can I match it to my design system?',
    answer: 'Yes. Colours, radii and fonts are CSS custom properties, and theme accepts light, dark or system.',
  },
];
