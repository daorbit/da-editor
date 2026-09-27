export const AI_TASK_PLACEHOLDER =
  'Add a blog post editor page that loads a post by id, autosaves it to /api/posts/:id and uploads images to /api/upload.';

export function buildAiPrompt(docsUrl: string, task: string): string {
  return `You are integrating the React rich text editor "da-text-editor" (npm) into my project. Use these facts exactly and do not invent props or APIs.

## Install
- npm install da-text-editor (peer dependencies: react and react-dom 18 or 19).
- Import the stylesheet once at the app root: import 'da-text-editor/styles.css';

## Render
- import { DaEditor, type EditorValue, type DaEditorHandle } from 'da-text-editor';
- <DaEditor defaultValue={savedJson} onChange={(value) => save(value)} />
- defaultValue (JSON) and defaultHtml (HTML string) are read only on mount. To replace content later, change the component's key or use a ref: ref.current.setValue(value), setHTML(html) or clear(). Never call these inside onChange.
- The editor needs a browser. In Next.js, put it in a 'use client' component and load that with next/dynamic and { ssr: false }.

## Saving and loading
- onChange(value: EditorValue) fires on content changes only (not selection). Debounce it before saving. Store the JSON.
- HTML: serializeHtml(value) or ref.current.getHTML(). Use { inlineStyles: true } for web pages and { inlineStyles: 'static' } for email or PDF.
- Markdown: serializeMarkdown(value) or ref.current.getMarkdown(). parseMarkdown(markdown) returns an EditorValue.
- Plain text: ref.current.getText().

## Integrations (props; the editor never makes network requests itself)
- onUpload: (file: File, kind: 'image' | 'video' | 'audio' | 'file' | 'embed') => Promise<string>. Upload to my storage and resolve the public URL. Without it, files become temporary blob: URLs.
- mentionables: { id: string; name: string; detail?: string; avatar?: string }[] enables @mentions.
- onFetchLinkMeta: (url: string) => Promise<{ title?, description?, image?, siteName? } | null>. Call my own server endpoint; browsers cannot read other sites' metadata.
- onAskAi: () => void adds an Ask AI button and Mod+J. Read with ref.current.getText(); write back with ref.current.editor.insertText(text) or ref.current.editor.insertFragment(parseMarkdown(markdown)). Call the model from my server, never the browser.
- spellCheckEngine: an object with correct(word) and suggest(word), or a function returning a Promise of one (for example nspell).
- onPickMedia: (kind) => Promise<{ url: string; name?: string } | null> opens my own media library instead of the built-in dialog.

## Common props
- theme: 'light' | 'dark' | 'system'. readOnly or mode: 'viewing' to lock the document. placeholder.
- minHeight (default '320px'; '0' fills a flex parent), maxHeight, maxWidth, className, style.
- On by default: fixedToolbar, floatingToolbar, slashMenu, emoji, autoformat, smartPaste, spellCheck, toasts.
- Off by default: wordCount, preview, lintPanel, autoFocus, defaultFocusMode, defaultTypewriter.
- toolbarLeading: ReactNode at the start of the toolbar. onClearAll={false} hides the Clear document button.

## Styling
- Override CSS variables on .da-editor, for example --da-font, --da-link, --da-radius, --da-selection.
- Dark theme overrides go on .da-editor[data-theme='dark'].

Full documentation: ${docsUrl}

## My task
${task.trim() || AI_TASK_PLACEHOLDER}

First look at my project's framework, routing, data fetching and styling conventions, then implement this in the same style, with TypeScript types.`;
}
