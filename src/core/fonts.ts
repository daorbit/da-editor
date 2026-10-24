import { Editor, Element as SlateElement, Text, type Descendant } from 'slate';
import { MARK, type DaEditor, type EditorValue, type FontCategory, type FontOption } from './types';

export const FONT_FAMILIES: FontOption[] = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif', category: 'sans', google: 'Inter:wght@400;500;600;700' },
  { label: 'Onest', value: 'Onest, system-ui, sans-serif', category: 'sans', google: 'Onest:wght@400;500;600;700' },
  { label: 'Manrope', value: 'Manrope, system-ui, sans-serif', category: 'sans', google: 'Manrope:wght@400;500;600;700' },
  { label: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", system-ui, sans-serif', category: 'sans', google: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
  { label: 'Roboto', value: 'Roboto, system-ui, sans-serif', category: 'sans', google: 'Roboto:wght@400;500;700' },
  { label: 'Open Sans', value: '"Open Sans", system-ui, sans-serif', category: 'sans', google: 'Open+Sans:wght@400;600;700' },
  { label: 'Lato', value: 'Lato, system-ui, sans-serif', category: 'sans', google: 'Lato:wght@400;700' },
  { label: 'Montserrat', value: 'Montserrat, system-ui, sans-serif', category: 'sans', google: 'Montserrat:wght@400;500;600;700' },
  { label: 'Poppins', value: 'Poppins, system-ui, sans-serif', category: 'sans', google: 'Poppins:wght@400;500;600;700' },
  { label: 'DM Sans', value: '"DM Sans", system-ui, sans-serif', category: 'sans', google: 'DM+Sans:wght@400;500;700' },
  { label: 'System sans', value: 'system-ui, sans-serif', category: 'sans' },
  { label: 'Merriweather', value: 'Merriweather, Georgia, serif', category: 'serif', google: 'Merriweather:wght@400;700' },
  { label: 'Lora', value: 'Lora, Georgia, serif', category: 'serif', google: 'Lora:wght@400;500;600;700' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif', category: 'serif', google: 'Playfair+Display:wght@400;600;700' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif', category: 'serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", ui-monospace, monospace', category: 'mono', google: 'JetBrains+Mono:wght@400;500;700' },
  { label: 'System mono', value: 'ui-monospace, Menlo, monospace', category: 'mono' },
];

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  sans: 'Sans serif',
  serif: 'Serif',
  mono: 'Monospace',
  display: 'Display',
};

const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2';

const requested = new Set<string>();

export function primaryFamily(stack: string): string {
  const first = stack.split(',')[0] ?? '';
  return first.trim().replace(/^["']|["']$/g, '').toLowerCase();
}

export function matchFont(value: string | undefined, fonts: FontOption[] = FONT_FAMILIES): FontOption | undefined {
  if (!value) return undefined;
  const exact = fonts.find((font) => font.value === value);
  if (exact) return exact;
  const family = primaryFamily(value);
  if (!family) return undefined;
  return fonts.find(
    (font) =>
      font.value !== '' &&
      (primaryFamily(font.value) === family || font.label.toLowerCase() === family),
  );
}

export function resolveFont(
  font: FontOption | string | undefined,
  fonts: FontOption[] = FONT_FAMILIES,
): FontOption | undefined {
  if (!font) return undefined;
  if (typeof font !== 'string') return font.value ? font : undefined;
  return matchFont(font, fonts) ?? { label: font, value: font };
}

export function fontLabel(value: string | undefined, fonts: FontOption[] = FONT_FAMILIES): string {
  if (!value) return fonts.find((font) => font.value === '')?.label ?? 'Default';
  const known = matchFont(value, fonts);
  if (known) return known.label;
  const first = value.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  return first || 'Default';
}

export function googleFontsHref(fonts: FontOption[]): string | null {
  const specs = Array.from(new Set(fonts.map((font) => font.google).filter(Boolean) as string[]));
  if (specs.length === 0) return null;
  return `${GOOGLE_FONTS_CSS}?${specs.map((spec) => `family=${spec}`).join('&')}&display=swap`;
}

export function loadFonts(fonts: FontOption[]): void {
  if (typeof document === 'undefined') return;
  const pending = fonts.filter((font) => font.google && !requested.has(font.google));
  if (pending.length === 0) return;
  const href = googleFontsHref(pending);
  if (!href) return;
  pending.forEach((font) => requested.add(font.google as string));
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-da-fonts', '');
  document.head.append(link);
}

export function collectFontFamilies(value: Descendant[]): string[] {
  const found = new Set<string>();
  const walk = (nodes: Descendant[]) => {
    for (const node of nodes) {
      if (Text.isText(node)) {
        if (node.fontFamily) found.add(node.fontFamily);
      } else if (SlateElement.isElement(node)) {
        walk(node.children);
      }
    }
  };
  walk(value);
  return Array.from(found);
}

export function fontsInValue(value: Descendant[], fonts: FontOption[] = FONT_FAMILIES): FontOption[] {
  return collectFontFamilies(value)
    .map((family) => matchFont(family, fonts))
    .filter((font): font is FontOption => Boolean(font));
}

export function loadFontsForValue(value: Descendant[], fonts: FontOption[] = FONT_FAMILIES): void {
  loadFonts(fontsInValue(value, fonts));
}

export function normalizeFonts(value: EditorValue, fonts: FontOption[] = FONT_FAMILIES): EditorValue {
  const map = (node: Descendant): Descendant => {
    if (Text.isText(node)) {
      if (!node.fontFamily) return node;
      const known = matchFont(node.fontFamily, fonts);
      const next = { ...node };
      if (known && known.value) next.fontFamily = known.value;
      else delete next.fontFamily;
      return next;
    }
    if (SlateElement.isElement(node)) {
      return { ...node, children: node.children.map(map) } as Descendant;
    }
    return node;
  };
  return value.map(map);
}

export function getFontFamily(editor: DaEditor): string | undefined {
  const value = Editor.marks(editor)?.fontFamily;
  return typeof value === 'string' && value ? value : undefined;
}

export function setFontFamily(editor: DaEditor, font: FontOption | null): void {
  if (!font || !font.value) {
    Editor.removeMark(editor, MARK.fontFamily);
    return;
  }
  if (editor.loadWebFonts !== false) loadFonts([font]);
  Editor.addMark(editor, MARK.fontFamily, font.value);
}

export function groupFonts(fonts: FontOption[]): { category: FontCategory | null; fonts: FontOption[] }[] {
  const order: (FontCategory | null)[] = [null, 'sans', 'serif', 'mono', 'display'];
  return order
    .map((category) => ({
      category,
      fonts: fonts.filter((font) => (font.category ?? null) === category),
    }))
    .filter((group) => group.fonts.length > 0);
}
