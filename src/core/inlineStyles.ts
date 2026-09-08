/**
 * Style values mirroring the editor's own stylesheet, for emitting HTML that
 * renders the same outside the editor — a CMS preview, a published page, an
 * email — where `da-*` classes and CSS custom properties do not exist.
 *
 * Kept as literal values rather than `var(--da-*)` or `color-mix()` on purpose:
 * the point is output that survives with no stylesheet and no modern CSS
 * support at all. When the editor's tokens change, these change with them.
 *
 * The editor is the reference: what the writer sees on the canvas is what the
 * published page has to render. Sizes the stylesheet expresses in `em` are
 * resolved here against `.da-editor`'s own 15px root — an exported fragment
 * inherits the host page's font size, so a relative value would drift.
 */
const ROOT_FONT_SIZE = 15;

/** An `em` value from the stylesheet, in px against the editor's own root. */
const em = (value: number) => `${+(value * ROOT_FONT_SIZE).toFixed(2)}px`;

const FG = '#1f2328';
const MUTED = '#6b7280';
const FAINT = '#9ca3af';
const BORDER = '#e4e6ea';
const BORDER_STRONG = '#d0d4da';
const SURFACE = '#f7f8fa';
const ACCENT = '#3b5bfd';
const ACCENT_SOFT = '#eaeeff';
/** `--da-radius-sm` from the stylesheet. */
const RADIUS_SM = '6px';
// Single-quoted family names: these values live inside a double-quoted
// `style` attribute, and a double quote here would terminate it early.
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace";

/** Pre-resolved equivalents of the stylesheet's `color-mix()` callout tints. */
const CALLOUT_VARIANTS: Record<string, { border: string; background: string }> = {
  info: { border: '#c2cdfe', background: ACCENT_SOFT },
  warning: { border: '#f8d48b', background: '#fef6e7' },
  success: { border: '#8ee0c4', background: '#e7f8f2' },
  danger: { border: '#f8b4b4', background: '#fdecec' },
};

export const INLINE_STYLES: Record<string, string> = {
  p: `margin:0 0 2px;padding:3px 0;line-height:1.65;font-family:${FONT};color:${FG}`,
  h1: `margin:24px 0 0;padding:3px 0;font-size:${em(1.85)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${FG}`,
  h2: `margin:20px 0 0;padding:3px 0;font-size:${em(1.45)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${FG}`,
  h3: `margin:16px 0 0;padding:3px 0;font-size:${em(1.2)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${FG}`,
  h4: `margin:14px 0 0;padding:3px 0;font-size:${em(1.08)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${FG}`,
  h5: `margin:12px 0 0;padding:3px 0;font-size:${em(1)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${FG}`,
  h6: `margin:12px 0 0;padding:3px 0;font-size:${em(0.92)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;font-family:${FONT};color:${MUTED}`,
  time: `color:${ACCENT}`,
  blockquote: `margin:6px 0;padding:2px 0 2px 14px;border-left:3px solid ${BORDER_STRONG};color:${MUTED};font-family:${FONT}`,
  pre: `margin:8px 0;padding:12px 14px;border:1px solid ${BORDER};border-radius:${RADIUS_SM};background:${SURFACE};overflow-x:auto`,
  code: `font-family:${MONO};font-size:${em(0.86)};line-height:1.6;color:${FG}`,
  inlineCode: `padding:1px 5px;border:1px solid ${BORDER};border-radius:4px;background:${SURFACE};color:#d6336c;font-family:${MONO};font-size:0.87em`,
  kbd: `padding:1px 6px;border:1px solid ${BORDER_STRONG};border-bottom-width:2px;border-radius:4px;background:${SURFACE};font-family:${MONO};font-size:0.82em`,
  ul: `margin:2px 0;padding-left:26px;font-family:${FONT};color:${FG}`,
  ol: `margin:2px 0;padding-left:26px;font-family:${FONT};color:${FG}`,
  li: 'padding:2px 0;line-height:1.65',
  // `.da-hr-wrap`'s 6px of padding, folded into the rule's own margin.
  hr: `margin:6px 0;border:none;border-top:1px solid ${BORDER_STRONG}`,
  table: `border-collapse:collapse;table-layout:fixed;width:100%;margin:10px 0;font-family:${FONT};color:${FG}`,
  td: `min-width:60px;padding:7px 10px;border:1px solid ${BORDER_STRONG};vertical-align:top;text-align:left`,
  th: `min-width:60px;padding:7px 10px;border:1px solid ${BORDER_STRONG};background:${SURFACE};vertical-align:top;text-align:left;font-weight:600`,
  // `.da-image-wrap`'s 10px margin, folded in: the wrapper is an editing
  // container and is not serialized.
  figure: 'margin:10px 0;display:inline-block;max-width:100%',
  img: 'max-width:100%;height:auto;display:block',
  figcaption: `margin-top:6px;color:${MUTED};font-size:0.85em;text-align:center;font-family:${FONT}`,
  mention: `display:inline-block;padding:1px 6px;border-radius:4px;background:${ACCENT_SOFT};color:${ACCENT};font-size:0.94em;font-weight:500;white-space:nowrap`,
  todo: `display:flex;gap:8px;align-items:flex-start;padding:3px 0;font-family:${FONT};color:${FG}`,
  todoChecked: `display:flex;gap:8px;align-items:flex-start;padding:3px 0;font-family:${FONT};color:${FAINT};text-decoration:line-through`,
  link: `color:${ACCENT};text-decoration:underline`,
  details: `padding:3px 0;font-family:${FONT};color:${FG}`,
  summary: 'cursor:pointer;font-weight:550',
  video: 'max-width:100%;border-radius:8px;display:block;margin:16px 0',
  audio: 'width:100%;margin:12px 0',
  embed: 'position:relative;margin:16px 0',
  iframe: `width:100%;aspect-ratio:16/9;border:1px solid ${BORDER};border-radius:8px`,
  columns: 'display:flex;gap:16px;margin:10px 0',
  // The stylesheet's dashed outline and its padding mark the drop target while
  // editing; only the layout itself belongs in the output.
  column: 'flex:1;min-width:0',
  calloutIcon: 'flex:none;line-height:1.5;font-size:16px',
  calloutBody: 'flex:1;min-width:0',
  file: `display:inline-flex;gap:10px;align-items:center;padding:10px 14px;border:1px solid ${BORDER};border-radius:${RADIUS_SM};background:${SURFACE};color:${FG};text-decoration:none;font-family:${FONT}`,
  footnote: `color:${ACCENT};cursor:help`,
  equation: `margin:14px 0;padding:12px;border-radius:8px;background:${SURFACE};font-family:${MONO};text-align:center`,
  inlineEquation: `padding:1px 4px;border-radius:4px;background:${SURFACE};font-family:${MONO}`,
};

export function calloutStyle(variant: string): string {
  const tint = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
  return `display:flex;gap:10px;margin:8px 0;padding:12px 14px;border:1px solid ${tint.border};border-radius:${RADIUS_SM};background:${tint.background};font-family:${FONT};color:${FG}`;
}
