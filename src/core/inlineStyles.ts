
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

 
const CALLOUT_WASH: Record<string, { border: string; background: string }> = {
  info: { border: 'rgba(59,91,253,0.4)', background: 'rgba(59,91,253,0.1)' },
  warning: { border: 'rgba(217,119,6,0.4)', background: 'rgba(217,119,6,0.12)' },
  success: { border: 'rgba(16,150,110,0.4)', background: 'rgba(16,150,110,0.12)' },
  danger: { border: 'rgba(220,38,38,0.4)', background: 'rgba(220,38,38,0.12)' },
};

 
export const TOKEN_COLORS: Record<string, string> = {
  comment: '#6a737d',
  prolog: '#6a737d',
  doctype: '#6a737d',
  cdata: '#6a737d',
  punctuation: '#6b7280',
  property: '#d73a49',
  tag: '#d73a49',
  boolean: '#d73a49',
  number: '#d73a49',
  constant: '#d73a49',
  symbol: '#d73a49',
  deleted: '#d73a49',
  selector: '#22863a',
  'attr-name': '#22863a',
  string: '#22863a',
  char: '#22863a',
  builtin: '#22863a',
  inserted: '#22863a',
  operator: '#005cc5',
  entity: '#005cc5',
  url: '#005cc5',
  variable: '#005cc5',
  atrule: '#6f42c1',
  'attr-value': '#6f42c1',
  function: '#6f42c1',
  'class-name': '#6f42c1',
  keyword: '#d73a49',
  regex: '#e36209',
  important: '#e36209',
};

 
const NEUTRAL_FILL = 'rgba(128,128,128,0.1)';
const NEUTRAL_FILL_STRONG = 'rgba(128,128,128,0.16)';
const NEUTRAL_BORDER = 'rgba(128,128,128,0.28)';
const NEUTRAL_BORDER_STRONG = 'rgba(128,128,128,0.4)';

export const INLINE_STYLES: Record<string, string> = {
  p: 'margin:0 0 2px;padding:3px 0;line-height:1.65',
  h1: `margin:24px 0 0;padding:3px 0;font-size:${em(1.85)};font-weight:650;line-height:1.3;letter-spacing:-0.01em`,
  h2: `margin:20px 0 0;padding:3px 0;font-size:${em(1.45)};font-weight:650;line-height:1.3;letter-spacing:-0.01em`,
  h3: `margin:16px 0 0;padding:3px 0;font-size:${em(1.2)};font-weight:650;line-height:1.3;letter-spacing:-0.01em`,
  h4: `margin:14px 0 0;padding:3px 0;font-size:${em(1.08)};font-weight:650;line-height:1.3;letter-spacing:-0.01em`,
  h5: `margin:12px 0 0;padding:3px 0;font-size:${em(1)};font-weight:650;line-height:1.3;letter-spacing:-0.01em`,
  h6: `margin:12px 0 0;padding:3px 0;font-size:${em(0.92)};font-weight:650;line-height:1.3;letter-spacing:-0.01em;opacity:0.75`,
  time: '',
  blockquote: `margin:6px 0;padding:2px 0 2px 14px;border-left:3px solid ${NEUTRAL_BORDER_STRONG};opacity:0.85`,
  pre: `margin:8px 0;padding:12px 14px;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_SM};background:${NEUTRAL_FILL};overflow-x:auto`,
  code: `font-family:${MONO};font-size:${em(0.86)};line-height:1.6`,
  inlineCode: `padding:1px 5px;border:1px solid ${NEUTRAL_BORDER};border-radius:4px;background:${NEUTRAL_FILL};font-family:${MONO};font-size:0.87em`,
  kbd: `padding:1px 6px;border:1px solid ${NEUTRAL_BORDER_STRONG};border-bottom-width:2px;border-radius:4px;background:${NEUTRAL_FILL};font-family:${MONO};font-size:0.82em`,
  ul: 'margin:2px 0;padding-left:26px',
  ol: 'margin:2px 0;padding-left:26px',
  li: 'padding:2px 0;line-height:1.65',
  // `.da-hr-wrap`'s 6px of padding, folded into the rule's own margin.
  hr: `margin:6px 0;border:none;border-top:1px solid ${NEUTRAL_BORDER_STRONG}`,
  table: 'border-collapse:collapse;table-layout:fixed;width:100%;margin:10px 0',
  td: `min-width:60px;padding:7px 10px;border:1px solid ${NEUTRAL_BORDER_STRONG};vertical-align:top;text-align:left`,
  th: `min-width:60px;padding:7px 10px;border:1px solid ${NEUTRAL_BORDER_STRONG};background:${NEUTRAL_FILL};vertical-align:top;text-align:left;font-weight:600`,
  // `.da-image-wrap`'s 10px margin, folded in: the wrapper is an editing
  // container and is not serialized.
  figure: 'margin:10px 0;display:inline-block;max-width:100%',
  img: 'max-width:100%;height:auto;display:block',
  figcaption: 'margin-top:6px;font-size:0.85em;text-align:center;opacity:0.7',
  mention: `display:inline-block;padding:1px 6px;border-radius:4px;background:${NEUTRAL_FILL_STRONG};font-size:0.94em;font-weight:500;white-space:nowrap`,
  todo: 'display:flex;gap:8px;align-items:flex-start;padding:3px 0',
  todoChecked:
    'display:flex;gap:8px;align-items:flex-start;padding:3px 0;opacity:0.6;text-decoration:line-through',
  link: 'text-decoration:underline',
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
  calloutIcon: 'flex:none;line-height:1.5;font-size:16px',
  calloutBody: 'flex:1;min-width:0',
  file: `display:inline-flex;gap:10px;align-items:center;padding:10px 14px;border:1px solid ${NEUTRAL_BORDER};border-radius:${RADIUS_SM};background:${NEUTRAL_FILL};text-decoration:none`,
  footnote: 'cursor:help',
  equation: `margin:14px 0;padding:12px;border-radius:8px;background:${NEUTRAL_FILL};font-family:${MONO};text-align:center`,
  inlineEquation: `padding:1px 4px;border-radius:4px;background:${NEUTRAL_FILL};font-family:${MONO}`,
};

 
export const STATIC_SKIN: Record<string, string> = {
  p: `font-family:${FONT};color:${FG}`,
  h1: `font-family:${FONT};color:${FG}`,
  h2: `font-family:${FONT};color:${FG}`,
  h3: `font-family:${FONT};color:${FG}`,
  h4: `font-family:${FONT};color:${FG}`,
  h5: `font-family:${FONT};color:${FG}`,
  h6: `font-family:${FONT};color:${MUTED}`,
  time: `color:${ACCENT}`,
  blockquote: `color:${MUTED};font-family:${FONT}`,
  pre: `border-color:${BORDER};background:${SURFACE}`,
  code: `color:${FG}`,
  inlineCode: `border-color:${BORDER};background:${SURFACE};color:#d6336c`,
  kbd: `border-color:${BORDER_STRONG};background:${SURFACE}`,
  ul: `font-family:${FONT};color:${FG}`,
  ol: `font-family:${FONT};color:${FG}`,
  hr: `border-top-color:${BORDER_STRONG}`,
  table: `font-family:${FONT};color:${FG}`,
  td: `border-color:${BORDER_STRONG}`,
  th: `border-color:${BORDER_STRONG};background:${SURFACE}`,
  figcaption: `color:${MUTED};font-family:${FONT}`,
  mention: `background:${ACCENT_SOFT};color:${ACCENT}`,
  todo: `font-family:${FONT};color:${FG}`,
  todoChecked: `font-family:${FONT};color:${FAINT}`,
  link: `color:${ACCENT}`,
  details: `font-family:${FONT};color:${FG}`,
  iframe: `border-color:${BORDER}`,
  file: `border-color:${BORDER};background:${SURFACE};color:${FG};font-family:${FONT}`,
  footnote: `color:${ACCENT}`,
  equation: `background:${SURFACE}`,
  inlineEquation: `background:${SURFACE}`,
};

export function calloutStyle(variant: string, staticSkin = false): string {
  const structure = `display:flex;gap:10px;margin:8px 0;padding:12px 14px;border-radius:${RADIUS_SM}`;
  if (staticSkin) {
    const tint = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
    return `${structure};border:1px solid ${tint.border};background:${tint.background};font-family:${FONT};color:${FG}`;
  }
 
  const wash = CALLOUT_WASH[variant] ?? CALLOUT_WASH.info;
  return `${structure};border:1px solid ${wash.border};background:${wash.background}`;
}
