import { Fragment, useEffect } from 'react';
import { useSlate } from 'slate-react';
import { MenuItem, MenuLabel } from './ToolbarPrimitives';
import {
  FONT_CATEGORY_LABELS,
  FONT_FAMILIES,
  getFontFamily,
  groupFonts,
  loadFonts,
  matchFont,
  setFontFamily,
} from '../core/fonts';
import type { DaEditor, FontOption } from '../core/types';

export interface FontMenuProps {
  fonts?: FontOption[];
  onPicked?: () => void;
}

export function FontMenu({ fonts = FONT_FAMILIES, onPicked }: FontMenuProps) {
  const editor = useSlate() as DaEditor;
  const current = matchFont(getFontFamily(editor), fonts);

  useEffect(() => {
    if (editor.loadWebFonts !== false) loadFonts(fonts);
  }, [editor, fonts]);

  return (
    <>
      {groupFonts(fonts).map((group) => (
        <Fragment key={group.category ?? 'default'}>
          {group.category && <MenuLabel>{FONT_CATEGORY_LABELS[group.category]}</MenuLabel>}
          {group.fonts.map((font) => (
            <MenuItem
              key={font.label}
              label={font.label}
              fontFamily={font.value || undefined}
              active={font.value ? current?.value === font.value : !current}
              onClick={() => {
                setFontFamily(editor, font);
                onPicked?.();
              }}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
}
