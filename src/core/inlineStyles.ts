
const ROOT_FONT_SIZE = 15;

/** An `em` value from the stylesheet, in px against the editor's own root. */
const em = (value: number) => `${+(value * ROOT_FONT_SIZE).toFixed(2)}px`;

const FG = '#1f2328';
const TEXT = '#3a4252';
const HEADING = '#111622';
const MUTED = '#6b7280';
const FAINT = '#9ca3af';
const BORDER = '#e4e6ea';
const BORDER_STRONG = '#d0d4da';
const SURFACE = '#f7f8fa';
const ACCENT = '#3b5bfd';
const ACCENT_SOFT = '#eaeeff';
const CODE_BG = '#f3f5f9';
const CODE_HEAD = '#e9edf4';
const CODE_FG = '#1d2433';
/** `--da-radius-sm` from the stylesheet. */
const RADIUS_SM = '6px';
/** `--da-radius-block` from the stylesheet. */
const RADIUS_BLOCK = '12px';
// Single-quoted family names: these values live inside a double-quoted
// `style` attribute, and a double quote here would terminate it early.
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace";

/** Pre-resolved equivalents of the stylesheet's `color-mix()` callout tints. */
const CALLOUT_VARIANTS: Record<string, { border: string; background: string }> = {
  info: { border: BORDER, background: '#ffffff' },
  warning: { border: 'transparent', background: '#fff5e8' },
  success: { border: 'transparent', background: '#e9f8f1' },
  danger: { border: 'transparent', background: '#fef0ee' },
};

 
const CALLOUT_WASH: Record<string, { border: string; background: string }> = {
  info: { border: 'rgba(128,128,128,0.28)', background: 'transparent' },
  warning: { border: 'transparent', background: 'rgba(217,119,6,0.12)' },
  success: { border: 'transparent', background: 'rgba(16,150,110,0.12)' },
  danger: { border: 'transparent', background: 'rgba(220,38,38,0.12)' },
};

 
export const TOKEN_COLORS: Record<string, string> = {
  comment: '#7b8497',
  prolog: '#7b8497',
  doctype: '#7b8497',
  cdata: '#7b8497',
  punctuation: '#5a6375',
  operator: '#5a6375',
  keyword: '#a626a4',
  builtin: '#a626a4',
  important: '#a626a4',
  atrule: '#a626a4',
  tag: '#a626a4',
  string: '#2f7d32',
  char: '#2f7d32',
  'attr-value': '#2f7d32',
  'template-string': '#2f7d32',
  inserted: '#2f7d32',
  selector: '#2f7d32',
  function: '#2f5fd0',
  'class-name': '#2f5fd0',
  url: '#2f5fd0',
  number: '#b15c00',
  boolean: '#b15c00',
  constant: '#b15c00',
  symbol: '#b15c00',
  regex: '#b15c00',
  variable: '#c0392b',
  property: '#c0392b',
  parameter: '#c0392b',
  'attr-name': '#c0392b',
  entity: '#c0392b',
  deleted: '#c0392b',
};

 
const NEUTRAL_FILL = 'rgba(128,128,128,0.1)';
const NEUTRAL_FILL_STRONG = 'rgba(128,128,128,0.16)';
const NEUTRAL_BORDER = 'rgba(128,128,128,0.28)';
const NEUTRAL_BORDER_STRONG = 'rgba(128,128,128,0.4)';
const NEUTRAL_CODE_HEAD = 'rgba(128,128,128,0.14)';
const NEUTRAL_FAINT_TEXT = 'rgb(140,146,156)';
const HEADING_BASE =
  'margin-bottom:6px;padding:3px 0;font-weight:700;line-height:1.25;letter-spacing:-0.015em';

export const INLINE_STYLES: Record<string, string> = {
  p: 'margin:0 0 6px;padding:3px 0;line-height:1.72',
  cellP: 'margin:0;padding:0',
  h1: `margin-top:32px;${HEADING_BASE};font-size:${em(2.15)};line-height:1.15;letter-spacing:-0.025em`,
  h2: `margin-top:36px;${HEADING_BASE};font-size:${em(1.55)}`,
  h3: `margin-top:24px;${HEADING_BASE};font-size:${em(1.2)}`,
  h4: `margin-top:20px;${HEADING_BASE};font-size:${em(1.06)}`,
  h5: `margin-top:16px;${HEADING_BASE};font-size:${em(1)}`,
  h6: `margin-top:12px;${HEADING_BASE};font-size:${em(0.92)};opacity:0.75`,
  time: '',
  blockquote: `margin:10px 0 14px;padding:4px 0 4px 16px;border-left:3px solid ${NEUTRAL_BORDER_STRONG};opacity:0.85`,
  pre: `margin:10px 0 18px;padding:16px 18px;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_BLOCK};background:${NEUTRAL_FILL};white-space:pre-wrap;overflow-x:auto;tab-size:2`,
  // The header bar sits on top of the block, so the block gives up its top
  // edge and corners to it.
  preTitled: 'margin-top:0;border-top:0;border-top-left-radius:0;border-top-right-radius:0',
  codeTitle: `display:flex;align-items:center;justify-content:space-between;gap:8px;margin:10px 0 0;padding:8px 12px 8px 16px;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_BLOCK} ${RADIUS_BLOCK} 0 0;background:${NEUTRAL_CODE_HEAD};font-family:${MONO};font-size:12.5px;line-height:1.5`,
  codeTitleName: 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500',
  codeTitleLang: 'flex:none;margin-left:auto;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;opacity:0.65',
  code: `font-family:${MONO};font-size:13.5px;line-height:1.7`,
  inlineCode: `padding:1px 6px;border:1px solid ${NEUTRAL_BORDER};border-radius:5px;background:${NEUTRAL_FILL};font-family:${MONO};font-size:0.85em;overflow-wrap:anywhere`,
  kbd: `padding:1px 6px;border:1px solid ${NEUTRAL_BORDER_STRONG};border-bottom-width:2px;border-radius:4px;background:${NEUTRAL_FILL};font-family:${MONO};font-size:0.82em`,
  ul: 'margin:4px 0 12px;padding-left:24px',
  ol: 'margin:4px 0 12px;padding-left:24px',
  li: 'padding:3px 0 3px 4px;line-height:1.72',
  // `.da-hr-wrap`'s 6px of padding, folded into the rule's own margin.
  hr: `margin:6px 0;border:none;border-top:1px solid ${NEUTRAL_BORDER_STRONG}`,
  // The outer frame and rounded corners live on the wrapper; `border-style:
  // hidden` on a collapsed table suppresses the cells' outer edges so they do
  // not double up against it.
  tableWrap: `margin:10px 0;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_SM}`,
  table:
    'border-collapse:collapse;border-style:hidden;table-layout:fixed;width:max-content;min-width:100%;font-size:0.95em',
  td: `min-width:60px;padding:10px 14px;line-height:1.55;border:1px solid ${NEUTRAL_BORDER};vertical-align:top;text-align:left`,
  th: `min-width:60px;padding:10px 14px;line-height:1.55;border:1px solid ${NEUTRAL_BORDER};background:${NEUTRAL_FILL};color:${NEUTRAL_FAINT_TEXT};vertical-align:top;text-align:left;font-size:0.8em;font-weight:600;letter-spacing:0.06em;text-transform:uppercase`,
  // `.da-image-wrap`'s 10px margin, folded in: the wrapper is an editing
  // container and is not serialized.
  figure: 'margin:10px 0;display:inline-block;max-width:100%',
  img: 'max-width:100%;height:auto;display:block',
  figcaption: 'margin-top:6px;font-size:0.85em;text-align:center;opacity:0.7',
  mention: `display:inline-block;padding:1px 6px;border-radius:4px;background:${NEUTRAL_FILL_STRONG};font-size:0.94em;font-weight:500;white-space:nowrap`,
  todo: 'display:flex;gap:8px;align-items:flex-start;padding:3px 0',
  todoChecked:
    'display:flex;gap:8px;align-items:flex-start;padding:3px 0;opacity:0.6;text-decoration:line-through',
  link: 'text-decoration:underline;text-underline-offset:3px',
  details: 'padding:3px 0',
  summary: 'cursor:pointer;font-weight:550',
  video: 'max-width:100%;border-radius:8px;display:block;margin:16px 0',
  audio: 'width:100%;margin:12px 0',
  embed: 'position:relative;margin:16px 0',
  iframe: `width:100%;aspect-ratio:16/9;border:1px solid ${NEUTRAL_BORDER};border-radius:8px`,
  columns: 'display:flex;gap:16px;margin:10px 0',
  // The stylesheet's dashed outline and its padding mark the drop target while
  // editing; only the layout itself belongs in the output.
  column: 'flex:1;min-width:0',
  calloutIcon: 'flex:none;line-height:1.6;font-size:16px',
  calloutBody: 'flex:1;min-width:0',
  file: `display:inline-flex;gap:10px;align-items:center;padding:10px 14px;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_SM};background:${NEUTRAL_FILL};text-decoration:none`,
  footnote: 'cursor:help',
  equation: `margin:14px 0;padding:12px;border-radius:8px;background:${NEUTRAL_FILL};font-family:${MONO};text-align:center`,
  inlineEquation: `padding:1px 4px;border-radius:4px;background:${NEUTRAL_FILL};font-family:${MONO}`,
};

 
export const STATIC_SKIN: Record<string, string> = {
  p: `font-family:${FONT};color:${TEXT}`,
  h1: `font-family:${FONT};color:${HEADING}`,
  h2: `font-family:${FONT};color:${HEADING}`,
  h3: `font-family:${FONT};color:${HEADING}`,
  h4: `font-family:${FONT};color:${HEADING}`,
  h5: `font-family:${FONT};color:${HEADING}`,
  h6: `font-family:${FONT};color:${MUTED};opacity:1`,
  time: `color:${ACCENT}`,
  blockquote: `color:${MUTED};font-family:${FONT};border-left-color:${BORDER_STRONG};opacity:1`,
  pre: `border-color:${BORDER};background:${CODE_BG}`,
  codeTitle: `border-color:${BORDER};background:${CODE_HEAD};color:${FG}`,
  codeTitleLang: `color:${MUTED};font-family:${FONT};opacity:1`,
  code: `color:${CODE_FG}`,
  inlineCode: `border-color:${BORDER};background:${CODE_BG};color:${HEADING}`,
  kbd: `border-color:${BORDER_STRONG};background:${SURFACE}`,
  ul: `font-family:${FONT};color:${TEXT}`,
  ol: `font-family:${FONT};color:${TEXT}`,
  hr: `border-top-color:${BORDER_STRONG}`,
  tableWrap: `border-color:${BORDER}`,
  table: `font-family:${FONT};color:${TEXT}`,
  td: `border-color:${BORDER};background:#ffffff`,
  th: `border-color:${BORDER};background:${SURFACE};color:${FAINT}`,
  figcaption: `color:${MUTED};font-family:${FONT}`,
  mention: `background:${ACCENT_SOFT};color:${ACCENT}`,
  todo: `font-family:${FONT};color:${TEXT}`,
  todoChecked: `font-family:${FONT};color:${FAINT}`,
  link: `color:${ACCENT}`,
  details: `font-family:${FONT};color:${TEXT}`,
  iframe: `border-color:${BORDER}`,
  file: `border-color:${BORDER};background:${SURFACE};color:${FG};font-family:${FONT}`,
  footnote: `color:${ACCENT}`,
  equation: `background:${SURFACE}`,
  inlineEquation: `background:${SURFACE}`,
};

export function calloutStyle(variant: string, staticSkin = false): string {
  const structure = `display:flex;gap:12px;margin:10px 0 18px;padding:14px 16px;border-radius:${RADIUS_BLOCK};font-size:0.96em`;
  if (staticSkin) {
    const tint = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
    return `${structure};border:1px solid ${tint.border};background:${tint.background};font-family:${FONT};color:${FG}`;
  }
 
  const wash = CALLOUT_WASH[variant] ?? CALLOUT_WASH.info;
  return `${structure};border:1px solid ${wash.border};background:${wash.background}`;
}
