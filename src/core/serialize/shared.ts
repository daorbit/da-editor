export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
 
export const UNSAFE_URL = /^\s*(?:javascript|data|vbscript|file)\s*:/i;

export function safeUrl(url: string): string {
  return UNSAFE_URL.test(url) ? '' : escapeHtml(url);
}

export function sanitizeIncomingUrl(url: string): string {
  return UNSAFE_URL.test(url) ? '' : url;
}

 
export const COLOR_FUNCTION = /^(?:rgb|rgba|hsl|hsla)\(\s*[\d.,%\s/]+\)$/i;

 
export function safeCss(value: string): string {
  const trimmed = value.trim();
  if (COLOR_FUNCTION.test(trimmed)) return trimmed;
  if (/[<>"';(){}]|url\s*\(|expression|@import|\/\*/i.test(trimmed)) return '';
  return escapeHtml(trimmed);
}

 
export function attrSafeCss(value: string): string {
  return value.replace(/"/g, "'");
}

 
export function formatDate(iso: string): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
