# da-text-editor

A React rich-text editor published to npm as `da-text-editor`. Built on Slate (`slate`, `slate-react`, `slate-history`), TypeScript, Vite. The playground and docs site live in `playground/` and deploy to Vercel.

Consumers include da-cms (`D:\personal-code\da-cms\fe`, the blog and page editor) and Quantalog. A change to the document model, the HTML output or a prop is a change for them too.

## Layout

| Path | What it holds |
|---|---|
| `src/components/DaEditor.tsx` | The all-in-one component, its props and the ref handle |
| `src/components/FixedToolbar.tsx`, `FloatingToolbar.tsx` | Toolbars. Fixed toolbar groups collapse into an overflow menu, so every group has an `inline` and a `menu` form |
| `src/components/ToolbarPrimitives.tsx` | `ToolbarButton`, `ToolbarDropdown`, `MenuItem`, `SubMenu`; reuse these for any new control |
| `src/components/FontMenu.tsx` | Font picker list shared by both toolbars |
| `src/core/types.ts` | `ELEMENT`, `MARK`, element and text types, `FontOption` |
| `src/core/withDaEditor.ts` | Editor plugin: voids, inlines, breaks, paste (`insertData`), normalisation |
| `src/core/smartPaste.ts` | Plain-text paste: URLs, raw HTML source, Markdown, code |
| `src/core/io.ts` | `parseMarkdown`, Word/HTML import, file pickers, export |
| `src/core/serialize/*` | `serializeHtml`, `deserializeHtml`, `serializeMarkdown` |
| `src/core/fonts.ts` | Font list, matching, paste normalisation, lazy Google Fonts loading |
| `src/core/transforms.ts`, `tables.ts`, `media.ts` | Editing commands, all exported |
| `src/styles/editor.css` | All editor styles, themed through `--da-*` tokens on `.da-editor` |
| `src/index.ts` | Public API. Anything a host might need is exported here |
| `playground/src/docs/` | Docs site: pages in `pages/*.tsx`, the props and API tables in `content.tsx`, navigation in `nav.ts` |

## How paste works

1. Files go to `insertFiles` (uploaded through `onUpload`).
2. `DaEditor.handlePaste` sends plain text to `smartPasteText` when there is no HTML on the clipboard, when the HTML is VS Code markup (`isCodeEditorHtml`), or when the HTML is just a rendering of source text (`isRenderedSource`, e.g. a code block on a web page or in a chat app).
3. `smartPasteText` checks, in order: bare URL, raw HTML source (`looksLikeHtml`), Markdown (`looksLikeMarkdown`), code.
4. Otherwise `withDaEditor.insertData` parses `text/html` with `parseWordHtml` → `deserializeHtml`, then falls back to HTML source, Markdown, then plain text.
5. Every HTML path runs `normalizeFonts`, which keeps a pasted font only if it matches the editor's `fonts` list.
6. Pasting inside a code block is always plain text (`isPlainTextTarget`).

A new paste format goes in `smartPaste.ts` with a detector and a test, and is listed in the README and the docs' paste table.

## Fonts

- `FONT_FAMILIES` in `core/fonts.ts` is the default list; hosts pass `fonts` to replace it. Keep existing `value` strings unchanged so saved documents still match.
- Google Fonts load lazily (`loadFonts`): when the font menu opens, when a font is picked, and for fonts in a loaded document. Never load fonts at module import or on mount for a document without them.
- `loadWebFonts={false}` must stop every font request.

## Content styling

Document blocks are styled through content tokens on `.da-editor` (`--da-content-font`, `--da-text`, `--da-heading`, `--da-radius-block`, `--da-code-*`, the callout `--da-*-soft` colours, and the `--da-tok-*` syntax colours), each with a dark value under `.da-editor[data-theme='dark']`. Use these tokens for any new block style instead of literal colours. Bold and callout-label colours apply only when the text has no colour mark of its own (`span:not([style*="color"]) strong`).

## Rules

1. No comments in code or CSS. Use clear names instead.
2. No new inline styles in components, except values that come from the document (a mark's colour, font or size, a cell background, a menu position).
3. Split new work into its own module or component, following the layout above. Reuse the toolbar primitives, `--da-*` tokens and existing helpers before writing new ones.
4. Heavy code stays out of the main bundle: load it with `import()` when first used, as `importWordFile` does with `mammoth`.
5. Every public addition is exported from `src/index.ts`, typed, and documented.
6. Don't bump the version by hand. Pushing to `main` with changes under `src/` runs `.github/workflows/publish.yml`, which bumps the patch version, publishes, and pushes a `chore: release` commit.

## When you change a feature

Update all of these in the same change:
- `README.md` (props table and the matching section)
- The docs page in `playground/src/docs/pages/*.tsx`, plus `content.tsx` for props and `reference.tsx` for exports
- Tests next to the code (`*.test.ts`, Vitest)

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Playground and docs on Vite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, once |
| `npm run build` | Library build to `dist/` |
| `npm run build:playground` | Library build, then the docs site |

The developer runs type-checks, builds and tests. Don't run them unless asked.
