import { describe, expect, it } from 'vitest';
import {
  FONT_FAMILIES,
  collectFontFamilies,
  fontLabel,
  googleFontsHref,
  matchFont,
  normalizeFonts,
  primaryFamily,
} from './fonts';
import { ELEMENT, type EditorValue } from './types';

describe('primaryFamily', () => {
  it('reads the first family without quotes', () => {
    expect(primaryFamily('"Open Sans", system-ui, sans-serif')).toBe('open sans');
  });
});

describe('matchFont', () => {
  it('matches a pasted stack by its first family', () => {
    expect(matchFont("'Inter', Arial, sans-serif")?.label).toBe('Inter');
  });

  it('returns nothing for unknown fonts', () => {
    expect(matchFont('Onest, system-ui, sans-serif')).toBeUndefined();
  });

  it('keeps values saved by earlier versions', () => {
    expect(matchFont('Georgia, "Times New Roman", serif')?.label).toBe('Georgia');
    expect(matchFont('system-ui, sans-serif')?.label).toBe('System sans');
  });
});

describe('fontLabel', () => {
  it('names the default and unknown fonts', () => {
    expect(fontLabel(undefined)).toBe('Default');
    expect(fontLabel('"Acme Sans", serif')).toBe('Acme Sans');
  });
});

describe('googleFontsHref', () => {
  it('builds one stylesheet URL for several families', () => {
    const href = googleFontsHref(FONT_FAMILIES.filter((f) => f.label === 'Inter' || f.label === 'Lora'));
    expect(href).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap',
    );
  });

  it('returns null when nothing needs loading', () => {
    expect(googleFontsHref([{ label: 'Default', value: '' }])).toBeNull();
  });
});

describe('normalizeFonts', () => {
  const value: EditorValue = [
    {
      type: ELEMENT.paragraph,
      children: [
        { text: 'known', fontFamily: 'Roboto, Arial' },
        { text: 'unknown', fontFamily: 'Onest, system-ui', bold: true },
      ],
    },
  ];

  it('maps known fonts to the list value and drops the rest', () => {
    const [paragraph] = normalizeFonts(value);
    expect(paragraph).toEqual({
      type: ELEMENT.paragraph,
      children: [
        { text: 'known', fontFamily: 'Roboto, system-ui, sans-serif' },
        { text: 'unknown', bold: true },
      ],
    });
  });

  it('collects the families used in a document', () => {
    expect(collectFontFamilies(value)).toEqual(['Roboto, Arial', 'Onest, system-ui']);
  });
});
