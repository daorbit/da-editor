/**
 * Style values mirroring the editor's own stylesheet, for emitting HTML that
 * renders the same outside the editor — a CMS preview, a published page, an
 * email — where `da-*` classes and CSS custom properties do not exist.
 *
 * Kept as literal values rather than `var(--da-*)` or `color-mix()` on purpose:
 * the point is output that survives with no stylesheet and no modern CSS
 * support at all. When the editor's tokens change, these change with them.
 */

const FG = '#1f2328';
const MUTED = '#6b7280';
const BORDER = '#e4e6ea';
const BORDER_STRONG = '#d0d4da';
const SURFACE = '#f7f8fa';
const ACCENT = '#3b5bfd';
const ACCENT_SOFT = '#eaeeff';
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
  p: `margin:0 0 12px;line-height:1.7;font-family:${FONT};color:${FG}`,
  h1: `margin:24px 0 12px;font-size:30px;font-weight:680;line-height:1.2;letter-spacing:-0.02em;font-family:${FONT};color:${FG}`,
  h2: `margin:22px 0 10px;font-size:23px;font-weight:660;line-height:1.25;letter-spacing:-0.018em;font-family:${FONT};color:${FG}`,
  h3: `margin:20px 0 8px;font-size:19px;font-weight:640;line-height:1.3;letter-spacing:-0.015em;font-family:${FONT};color:${FG}`,
  h4: `margin:18px 0 7px;font-size:17px;font-weight:640;line-height:1.35;font-family:${FONT};color:${FG}`,
  h5: `margin:16px 0 6px;font-size:15px;font-weight:640;line-height:1.4;font-family:${FONT};color:${FG}`,
  h6: `margin:16px 0 6px;font-size:13.5px;font-weight:640;line-height:1.4;letter-spacing:0.01em;font-family:${FONT};color:${MUTED}`,
  time: `color:${ACCENT}`,
  blockquote: `margin:14px 0;padding:2px 0 2px 16px;border-left:3px solid ${BORDER_STRONG};color:${MUTED};font-family:${FONT}`,
  pre: `margin:14px 0;padding:14px 16px;border:1px solid ${BORDER};border-radius:8px;background:${SURFACE};overflow-x:auto`,
  code: `font-family:${MONO};font-size:13px;line-height:1.6;color:${FG}`,
  inlineCode: `padding:2px 5px;border-radius:4px;background:${SURFACE};font-family:${MONO};font-size:0.9em`,
  ul: `margin:12px 0;padding-left:26px;font-family:${FONT};color:${FG}`,
  ol: `margin:12px 0;padding-left:26px;font-family:${FONT};color:${FG}`,
  li: 'margin:4px 0;line-height:1.7',
  hr: `margin:24px 0;border:none;border-top:1px solid ${BORDER}`,
  table: `border-collapse:collapse;width:100%;margin:14px 0;font-family:${FONT};color:${FG}`,
  td: `min-width:60px;padding:7px 10px;border:1px solid ${BORDER_STRONG};vertical-align:top;text-align:left`,
  th: `min-width:60px;padding:7px 10px;border:1px solid ${BORDER_STRONG};background:${SURFACE};vertical-align:top;text-align:left;font-weight:600`,
  figure: 'margin:16px 0',
  img: 'max-width:100%;height:auto;border-radius:8px;display:block',
  figcaption: `margin-top:7px;color:${MUTED};font-size:13px;text-align:center;font-family:${FONT}`,
  mention: `padding:1px 5px;border-radius:4px;background:${ACCENT_SOFT};color:${ACCENT};font-weight:500`,
  todo: `display:flex;gap:9px;align-items:flex-start;margin:5px 0;font-family:${FONT};color:${FG}`,
  todoChecked: `display:flex;gap:9px;align-items:flex-start;margin:5px 0;font-family:${FONT};color:${MUTED};text-decoration:line-through`,
  link: `color:${ACCENT};text-decoration:underline`,
  details: `margin:12px 0;padding:10px 12px;border:1px solid ${BORDER};border-radius:8px;font-family:${FONT};color:${FG}`,
  summary: 'cursor:pointer;font-weight:550',
  video: 'max-width:100%;border-radius:8px;display:block;margin:16px 0',
  audio: 'width:100%;margin:12px 0',
  embed: 'position:relative;margin:16px 0',
  iframe: `width:100%;aspect-ratio:16/9;border:1px solid ${BORDER};border-radius:8px`,
  columns: 'display:flex;gap:20px;margin:14px 0',
  column: 'flex:1;min-width:0',
  calloutIcon: 'flex:none;line-height:1.5;font-size:16px',
  calloutBody: 'flex:1;min-width:0',
  file: `display:inline-flex;gap:8px;align-items:center;padding:9px 12px;border:1px solid ${BORDER};border-radius:8px;color:${FG};text-decoration:none;font-family:${FONT}`,
  footnote: `color:${ACCENT};cursor:help`,
  equation: `margin:14px 0;padding:12px;border-radius:8px;background:${SURFACE};font-family:${MONO};text-align:center`,
  inlineEquation: `padding:1px 4px;border-radius:4px;background:${SURFACE};font-family:${MONO}`,
};

export function calloutStyle(variant: string): string {
  const tint = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
  return `display:flex;gap:10px;margin:14px 0;padding:12px 14px;border:1px solid ${tint.border};border-radius:8px;background:${tint.background};font-family:${FONT};color:${FG}`;
}
