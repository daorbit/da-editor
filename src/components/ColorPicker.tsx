import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { CheckIcon, PlusIcon } from '../icons';

/**
 * The Open Color scale: eleven hues, each with five steps from light to dark.
 * Laid out as one column per hue so the grid reads as a proper palette.
 */
const HUES: Array<{ name: string; shades: string[] }> = [
  { name: 'Gray', shades: ['#dee2e6', '#adb5bd', '#868e96', '#495057', '#212529'] },
  { name: 'Red', shades: ['#ffc9c9', '#ff8787', '#fa5252', '#e03131', '#c92a2a'] },
  { name: 'Pink', shades: ['#fcc2d7', '#f783ac', '#e64980', '#c2255c', '#a61e4d'] },
  { name: 'Grape', shades: ['#eebefa', '#da77f2', '#be4bdb', '#9c36b5', '#862e9c'] },
  { name: 'Violet', shades: ['#d0bfff', '#9775fa', '#7950f2', '#6741d9', '#5f3dc4'] },
  { name: 'Blue', shades: ['#a5d8ff', '#4dabf7', '#228be6', '#1971c2', '#1864ab'] },
  { name: 'Cyan', shades: ['#99e9f2', '#3bc9db', '#15aabf', '#1098ad', '#0b7285'] },
  { name: 'Teal', shades: ['#96f2d7', '#38d9a9', '#12b886', '#0ca678', '#087f5b'] },
  { name: 'Green', shades: ['#b2f2bb', '#69db7c', '#40c057', '#2f9e44', '#2b8a3e'] },
  { name: 'Yellow', shades: ['#ffec99', '#ffd43b', '#fab005', '#f08c00', '#e67700'] },
  { name: 'Orange', shades: ['#ffd8a8', '#ffa94d', '#fd7e14', '#e8590c', '#d9480f'] },
];

/** Neutrals shown as a separate top row, the way document editors present them. */
const NEUTRALS = ['#ffffff', '#f8f9fa', '#e9ecef', '#adb5bd', '#495057', '#000000'];

export interface ColorPickerProps {
  value?: string;
  customColors?: string[];
  onAddCustomColor?: (color: string) => void;
  onChange: (color: string | null) => void;
  onClose: () => void;
  clearLabel?: string;
}

export function ColorPicker({
  value,
  customColors = [],
  onAddCustomColor,
  onChange,
  onClose,
  clearLabel = 'Default',
}: ColorPickerProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '#228be6');

  const isActive = (color: string) => value?.toLowerCase() === color.toLowerCase();

  const swatch = (color: string, label: string) => (
    <button
      key={label}
      type="button"
      className={`da-color__dot${isActive(color) ? ' da-color__dot--active' : ''}`}
      style={{ background: color }}
      title={label}
      aria-label={label}
      aria-pressed={isActive(color)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        onChange(color);
        onClose();
      }}
    >
      {isActive(color) && <CheckIcon size={11} />}
    </button>
  );

  return (
    <div className="da-color">
      <button
        type="button"
        className="da-color__clear"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onChange(null);
          onClose();
        }}
      >
        <span className="da-color__none" aria-hidden="true" />
        {clearLabel}
      </button>

      <div className="da-color__neutrals">
        {NEUTRALS.map((color, index) => swatch(color, `Neutral ${index + 1}`))}
      </div>

      {/* One column per hue, five steps deep. */}
      <div className="da-color__grid">
        {HUES.map((hue) =>
          hue.shades.map((shade, step) => swatch(shade, `${hue.name} ${step + 1}`)),
        )}
      </div>

      {(customColors.length > 0 || onAddCustomColor) && (
        <div className="da-color__footer">
          <span className="da-color__label">Custom</span>
          <div className="da-color__custom">
            {customColors.map((color) => swatch(color, color))}
            {onAddCustomColor && (
              <button
                type="button"
                className={`da-color__add${customOpen ? ' da-color__add--open' : ''}`}
                title="Pick a custom color"
                aria-label="Pick a custom color"
                aria-expanded={customOpen}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setCustomOpen((open) => !open)}
              >
                <PlusIcon size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {customOpen && (
        <div className="da-color__mixer">
          <HexColorPicker color={draft} onChange={setDraft} />
          <div className="da-color__mixer-row">
            <span className="da-color__preview" style={{ background: draft }} />
            <HexColorInput className="da-color__hex" color={draft} onChange={setDraft} prefixed />
            <button
              type="button"
              className="da-color__apply"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAddCustomColor?.(draft);
                onChange(draft);
                onClose();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
