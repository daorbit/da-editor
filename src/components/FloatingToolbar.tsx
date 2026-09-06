import { useEffect, useRef, useState } from 'react';
import { Editor, Element as SlateElement, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { LinkIcon, MoreIcon, SparklesIcon } from '../icons';
import {
  BLOCK_SPECS,
  EXTRA_MARK_SPECS,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_ICON,
  MARK_SPECS,
} from './toolbarConfig';
import { MenuItem, ToolbarButton, ToolbarDropdown, ToolbarSeparator } from './ToolbarPrimitives';
import {
  clearMarks,
  DEFAULT_FONT_SIZE,
  getBlockType,
  getFontSize,
  isMarkActive,
  replaceBlock,
  setFontSize,
  stepFontSize,
  setMark,
  toggleMark,
} from '../core/transforms';
import { ELEMENT, MARK, type DaEditor } from '../core/types';

export interface FloatingToolbarProps {
  onAskAi?: () => void;
  onLink?: () => void;
}

/**
 * The `fontSize` mark, or — when unset — the selection's actual rendered
 * size (e.g. a heading's CSS-driven size), so the stepper always shows what
 * the user sees rather than a stale default.
 */
function getEffectiveFontSize(editor: DaEditor): number {
  const marked = getFontSize(editor);
  if (marked !== null) return marked;

  try {
    const [node] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });
    if (!node) return DEFAULT_FONT_SIZE;
    const dom = ReactEditor.toDOMNode(editor, node[0]);
    const computed = Number.parseFloat(getComputedStyle(dom).fontSize);
    return Number.isFinite(computed) ? Math.round(computed) : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

interface Position {
  top: number;
  left: number;
}

export function FloatingToolbar({ onAskAi, onLink }: FloatingToolbarProps) {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const blockType = getBlockType(editor);
  const fontSize = getEffectiveFontSize(editor);
  // Falls back to the paragraph spec so the button always has an icon.
  const activeBlock =
    BLOCK_SPECS.find((spec) => spec.type === blockType) ??
    BLOCK_SPECS.find((spec) => spec.type === ELEMENT.paragraph);

  const { selection } = editor;

  // Only show over a real, non-empty, focused selection.
  const shouldShow =
    Boolean(selection) &&
    ReactEditor.isFocused(editor) &&
    !Range.isCollapsed(selection!) &&
    Editor.string(editor, selection!) !== '';

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldShow) {
      setPosition(null);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setPosition(null);
      return;
    }

    const rect = domSelection.getRangeAt(0).getBoundingClientRect();
    const container = el.offsetParent as HTMLElement | null;
    const base = container?.getBoundingClientRect();

    // Flip below the selection when there isn't enough room above (e.g. the
    // selection sits right under the sticky toolbar).
    const spaceAbove = rect.top - (base?.top ?? 0);
    const top =
      spaceAbove < el.offsetHeight + 8
        ? rect.bottom - (base?.top ?? 0) + 8
        : spaceAbove - el.offsetHeight - 8;

    setPosition({
      top,
      left: Math.max(
        4,
        rect.left - (base?.left ?? 0) + rect.width / 2 - el.offsetWidth / 2,
      ),
    });
  });

  if (!shouldShow) return null;

  return (
    <div
      ref={ref}
      className="da-tb da-tb--floating"
      role="toolbar"
      aria-label="Selection toolbar"
      // Rendered before measuring so the ref exists; hidden until positioned.
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {onAskAi && (
        <>
          <ToolbarButton icon={<SparklesIcon />} label="Ask AI" onClick={onAskAi}>
            {/* Not `da-tb__value`: that carries a fixed 78px width so a
                changing dropdown label cannot reflow the toolbar, and this
                label never changes — it only padded the button out. */}
            <span className="da-tb__label">Ask AI</span>
          </ToolbarButton>
          <ToolbarSeparator />
        </>
      )}

      <ToolbarDropdown
        label="Turn into"
        icon={activeBlock?.icon}
        value={activeBlock?.label ?? 'Text'}
      >
        {(close) =>
          BLOCK_SPECS.map((spec) => (
            <MenuItem
              key={spec.type}
              icon={spec.icon}
              label={spec.label}
              active={spec.type === blockType}
              onClick={() => {
                replaceBlock(editor, spec.type);
                close();
              }}
            />
          ))
        }
      </ToolbarDropdown>

      <ToolbarSeparator />

      <div className="da-tb__stepper">
        <button
          type="button"
          className="da-tb__btn da-tb__btn--step"
          title="Decrease font size"
          aria-label="Decrease font size"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepFontSize(editor, -1)}
        >
          −
        </button>
        <input
          type="number"
          className="da-tb__size"
          value={fontSize}
          aria-label="Font size"
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isNaN(next)) setFontSize(editor, next);
          }}
        />
        <button
          type="button"
          className="da-tb__btn da-tb__btn--step"
          title="Increase font size"
          aria-label="Increase font size"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepFontSize(editor, 1)}
        >
          +
        </button>
      </div>

      <ToolbarSeparator />

      {MARK_SPECS.map((spec) => (
        <ToolbarButton
          key={spec.mark}
          icon={spec.icon}
          label={spec.label}
          shortcut={spec.shortcut}
          active={isMarkActive(editor, spec.mark)}
          onClick={() => toggleMark(editor, spec.mark)}
        />
      ))}

      <ToolbarDropdown label="Highlight" icon={HIGHLIGHT_ICON}>
        {(close) => (
          <div className="da-tb__swatches">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.label}
                type="button"
                className="da-tb__swatch"
                title={color.label}
                aria-label={color.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setMark(editor, MARK.highlight, color.value || null);
                  close();
                }}
              >
                <span
                  className="da-tb__swatch-chip"
                  style={{ background: color.value || 'transparent' }}
                  data-empty={color.value ? undefined : true}
                />
              </button>
            ))}
          </div>
        )}
      </ToolbarDropdown>

      {onLink && (
        <ToolbarButton icon={<LinkIcon />} label="Link" shortcut="Ctrl+K" onClick={onLink} />
      )}

      <ToolbarDropdown label="More" icon={<MoreIcon />}>
        {(close) => (
          <>
            {EXTRA_MARK_SPECS.map((spec) => (
              <MenuItem
                key={spec.mark}
                icon={spec.icon}
                label={spec.label}
                active={isMarkActive(editor, spec.mark)}
                onClick={() => {
                  toggleMark(editor, spec.mark);
                  close();
                }}
              />
            ))}
            <MenuItem
              label="Clear formatting"
              onClick={() => {
                clearMarks(editor);
                close();
              }}
            />
          </>
        )}
      </ToolbarDropdown>
    </div>
  );
}
