import { useSlate } from 'slate-react';
import {
  ClearFormattingIcon,
  IndentIcon,
  LinkIcon,
  MoreIcon,
  OutdentIcon,
  PaletteIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from '../icons';
import {
  ALIGN_SPECS,
  BLOCK_SPECS,
  EXTRA_MARK_SPECS,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_ICON,
  MARK_SPECS,
  TEXT_COLORS,
} from './toolbarConfig';
import { MenuItem, ToolbarButton, ToolbarDropdown, ToolbarSeparator } from './ToolbarPrimitives';
import {
  clearMarks,
  getAlign,
  getBlockType,
  indent,
  isMarkActive,
  replaceBlock,
  setAlign,
  setMark,
  toggleMark,
} from '../core/transforms';
import { MARK, type DaEditor } from '../core/types';

export interface FixedToolbarProps {
  onAskAi?: () => void;
  onLink?: () => void;
}

export function FixedToolbar({ onAskAi, onLink }: FixedToolbarProps) {
  const editor = useSlate() as DaEditor;
  const blockType = getBlockType(editor);
  const align = getAlign(editor);
  const activeBlock = BLOCK_SPECS.find((spec) => spec.type === blockType);
  const activeAlign = ALIGN_SPECS.find((spec) => spec.align === align) ?? ALIGN_SPECS[0];

  const canUndo = editor.history.undos.length > 0;
  const canRedo = editor.history.redos.length > 0;

  return (
    <div className="da-tb da-tb--fixed" role="toolbar" aria-label="Editor toolbar">
      <ToolbarButton
        icon={<UndoIcon />}
        label="Undo"
        shortcut="Ctrl+Z"
        disabled={!canUndo}
        onClick={() => editor.undo()}
      />
      <ToolbarButton
        icon={<RedoIcon />}
        label="Redo"
        shortcut="Ctrl+Shift+Z"
        disabled={!canRedo}
        onClick={() => editor.redo()}
      />

      <ToolbarSeparator />

      {onAskAi && (
        <>
          <ToolbarButton
            icon={<SparklesIcon />}
            label="Ask AI"
            shortcut="Ctrl+J"
            onClick={onAskAi}
          >
            <span className="da-tb__value">Ask AI</span>
          </ToolbarButton>
          <ToolbarSeparator />
        </>
      )}

      <ToolbarDropdown
        label="Block type"
        icon={activeBlock?.icon}
        value={activeBlock?.label ?? 'Text'}
      >
        {(close) =>
          BLOCK_SPECS.map((spec) => (
            <MenuItem
              key={spec.type}
              icon={spec.icon}
              label={spec.label}
              hint={spec.hint}
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

      <ColorDropdown editor={editor} />
      <HighlightDropdown editor={editor} />

      <ToolbarSeparator />

      <ToolbarDropdown label="Alignment" icon={activeAlign.icon}>
        {(close) =>
          ALIGN_SPECS.map((spec) => (
            <MenuItem
              key={spec.align}
              icon={spec.icon}
              label={spec.label}
              active={spec.align === align}
              onClick={() => {
                setAlign(editor, spec.align);
                close();
              }}
            />
          ))
        }
      </ToolbarDropdown>

      <ToolbarButton
        icon={<OutdentIcon />}
        label="Outdent"
        onClick={() => indent(editor, -1)}
      />
      <ToolbarButton icon={<IndentIcon />} label="Indent" onClick={() => indent(editor, 1)} />

      <ToolbarSeparator />

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
              icon={<ClearFormattingIcon />}
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

function ColorDropdown({ editor }: { editor: DaEditor }) {
  return (
    <ToolbarDropdown label="Text color" icon={<PaletteIcon />}>
      {(close) => (
        <div className="da-tb__swatches">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.label}
              type="button"
              className="da-tb__swatch"
              title={color.label}
              aria-label={color.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setMark(editor, MARK.color, color.value || null);
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
  );
}

function HighlightDropdown({ editor }: { editor: DaEditor }) {
  return (
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
  );
}
