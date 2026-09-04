import { useState } from 'react';
import { useSlate } from 'slate-react';
import {
  AlignJustifyIcon,
  ClearFormattingIcon,
  CodeIcon,
  CommentIcon,
  EmojiIcon,
  HighlighterIcon,
  ImageIcon,
  IndentIcon,
  LinkIcon,
  MoonIcon,
  MoreIcon,
  OutdentIcon,
  PaletteIcon,
  PlusIcon,
  RedoIcon,
  SparklesIcon,
  SunIcon,
  TableIcon,
  TrashIcon,
  UndoIcon,
} from '../icons';
import {
  ALIGN_SPECS,
  BLOCK_SPECS,
  EXTRA_MARK_SPECS,
  HIGHLIGHT_COLORS,
  INSERT_SPECS,
  MARK_SPECS,
  MEDIA_SPECS,
  TEXT_COLORS,
} from './toolbarConfig';
import { MenuItem, ToolbarButton, ToolbarDropdown, ToolbarSeparator } from './ToolbarPrimitives';
import { EmojiPicker } from './EmojiPicker';
import {
  clearMarks,
  FONT_FAMILIES,
  getAlign,
  getBlockType,
  getFontSize,
  getLineHeight,
  indent,
  isMarkActive,
  LINE_HEIGHTS,
  replaceBlock,
  setAlign,
  setFontSize,
  setLineHeight,
  setMark,
  stepFontSize,
  toggleMark,
} from '../core/transforms';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertColumn,
  insertRow,
  insertTable,
  isInTable,
  toggleHeaderRow,
} from '../core/tables';
import { MARK, type DaEditor, type EditorMode, type MediaKind } from '../core/types';

export interface FixedToolbarProps {
  onAskAi?: () => void;
  onLink?: () => void;
  onComment?: () => void;
  onMedia?: (kind: MediaKind) => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  /** Renders the light/dark toggle when provided. */
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export function FixedToolbar({
  onAskAi,
  onLink,
  onComment,
  onMedia,
  mode = 'editing',
  onModeChange,
  onToggleTheme,
  isDark,
}: FixedToolbarProps) {
  const editor = useSlate() as DaEditor;
  const [emojiOpen, setEmojiOpen] = useState(false);

  const blockType = getBlockType(editor);
  const align = getAlign(editor);
  const fontSize = getFontSize(editor);
  const lineHeight = getLineHeight(editor);
  const inTable = isInTable(editor);

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
          <ToolbarButton icon={<SparklesIcon />} label="Ask AI" shortcut="Ctrl+J" onClick={onAskAi} />
          <ToolbarSeparator />
        </>
      )}

      {/* Insert */}
      <ToolbarDropdown label="Insert" icon={<PlusIcon />}>
        {(close) =>
          INSERT_SPECS.map((spec) => (
            <MenuItem
              key={spec.key}
              icon={spec.icon}
              label={spec.label}
              onClick={() => {
                spec.run(editor, { onMedia, onAskAi });
                close();
              }}
            />
          ))
        }
      </ToolbarDropdown>

      <ToolbarSeparator />

      {/* Block type */}
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

      {/* Font size stepper */}
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

      {/* Marks */}
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

      <SwatchDropdown
        editor={editor}
        label="Text color"
        icon={<PaletteIcon />}
        mark={MARK.color}
        colors={TEXT_COLORS}
      />
      <SwatchDropdown
        editor={editor}
        label="Highlight"
        icon={<HighlighterIcon />}
        mark={MARK.highlight}
        colors={HIGHLIGHT_COLORS}
      />

      <ToolbarSeparator />

      {/* Alignment + lists + indent */}
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

      <ToolbarDropdown label="Line height" icon={<AlignJustifyIcon />}>
        {(close) =>
          LINE_HEIGHTS.map((value) => (
            <MenuItem
              key={value}
              label={String(value)}
              active={value === lineHeight}
              onClick={() => {
                setLineHeight(editor, value);
                close();
              }}
            />
          ))
        }
      </ToolbarDropdown>

      <ToolbarButton icon={<OutdentIcon />} label="Outdent" onClick={() => indent(editor, -1)} />
      <ToolbarButton icon={<IndentIcon />} label="Indent" onClick={() => indent(editor, 1)} />

      <ToolbarSeparator />

      {/* Link, table, emoji, media */}
      {onLink && (
        <ToolbarButton icon={<LinkIcon />} label="Link" shortcut="Ctrl+K" onClick={onLink} />
      )}

      <ToolbarDropdown label="Table" icon={<TableIcon />}>
        {(close) => (
          <>
            <MenuItem
              icon={<TableIcon />}
              label="Insert table"
              onClick={() => {
                insertTable(editor);
                close();
              }}
            />
            {inTable && (
              <>
                <MenuItem
                  label="Row above"
                  onClick={() => {
                    insertRow(editor, 'above');
                    close();
                  }}
                />
                <MenuItem
                  label="Row below"
                  onClick={() => {
                    insertRow(editor, 'below');
                    close();
                  }}
                />
                <MenuItem
                  label="Column left"
                  onClick={() => {
                    insertColumn(editor, 'left');
                    close();
                  }}
                />
                <MenuItem
                  label="Column right"
                  onClick={() => {
                    insertColumn(editor, 'right');
                    close();
                  }}
                />
                <MenuItem
                  label="Toggle header row"
                  onClick={() => {
                    toggleHeaderRow(editor);
                    close();
                  }}
                />
                <MenuItem
                  icon={<TrashIcon />}
                  label="Delete row"
                  onClick={() => {
                    deleteRow(editor);
                    close();
                  }}
                />
                <MenuItem
                  icon={<TrashIcon />}
                  label="Delete column"
                  onClick={() => {
                    deleteColumn(editor);
                    close();
                  }}
                />
                <MenuItem
                  icon={<TrashIcon />}
                  label="Delete table"
                  onClick={() => {
                    deleteTable(editor);
                    close();
                  }}
                />
              </>
            )}
          </>
        )}
      </ToolbarDropdown>

      <div className="da-tb__dropdown">
        <ToolbarButton
          icon={<EmojiIcon />}
          label="Emoji"
          active={emojiOpen}
          onClick={() => setEmojiOpen((open) => !open)}
        />
        {emojiOpen && (
          <div className="da-tb__menu da-tb__menu--wide">
            <EmojiPicker onClose={() => setEmojiOpen(false)} />
          </div>
        )}
      </div>

      {onMedia && (
        <ToolbarDropdown label="Media" icon={<ImageIcon />}>
          {(close) =>
            MEDIA_SPECS.map((spec) => (
              <MenuItem
                key={spec.kind}
                icon={spec.icon}
                label={spec.label}
                onClick={() => {
                  onMedia(spec.kind);
                  close();
                }}
              />
            ))
          }
        </ToolbarDropdown>
      )}

      {onComment && (
        <ToolbarButton icon={<CommentIcon />} label="Comment" onClick={onComment} />
      )}

      {/* Overflow */}
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
            <div className="da-tb__menu-label">Font</div>
            {FONT_FAMILIES.map((font) => (
              <MenuItem
                key={font.label}
                label={font.label}
                onClick={() => {
                  setMark(editor, MARK.fontFamily, font.value || null);
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

      {/* Right-aligned cluster */}
      <div className="da-tb__spacer" />

      {onToggleTheme && (
        <ToolbarButton
          icon={isDark ? <SunIcon /> : <MoonIcon />}
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
        />
      )}

      {onModeChange && (
        <ToolbarDropdown
          label="Editing mode"
          icon={mode === 'viewing' ? <CodeIcon /> : <SparklesIcon />}
          value={mode === 'editing' ? 'Editing' : mode === 'suggesting' ? 'Suggesting' : 'Viewing'}
        >
          {(close) =>
            (['editing', 'suggesting', 'viewing'] as const).map((value) => (
              <MenuItem
                key={value}
                label={value.charAt(0).toUpperCase() + value.slice(1)}
                active={value === mode}
                onClick={() => {
                  onModeChange(value);
                  close();
                }}
              />
            ))
          }
        </ToolbarDropdown>
      )}
    </div>
  );
}

function SwatchDropdown({
  editor,
  label,
  icon,
  mark,
  colors,
}: {
  editor: DaEditor;
  label: string;
  icon: React.ReactNode;
  mark: (typeof MARK)[keyof typeof MARK];
  colors: Array<{ label: string; value: string }>;
}) {
  return (
    <ToolbarDropdown label={label} icon={icon}>
      {(close) => (
        <div className="da-tb__swatches">
          {colors.map((color) => (
            <button
              key={color.label}
              type="button"
              className="da-tb__swatch"
              title={color.label}
              aria-label={color.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setMark(editor, mark, color.value || null);
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
