import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useSlate } from 'slate-react';
import {
  AlignJustifyIcon,
  BulletedListIcon,
  CellIcon,
  ClearFormattingIcon,
  ColumnIcon,
  ColumnsThreeIcon,
  EmojiIcon,
  ExportIcon,
  HighlighterIcon,
  ImageIcon,
  ImportIcon,
  IndentIcon,
  LetterCaseIcon,
  LinkIcon,
  MoonIcon,
  MoreIcon,
  NumberedListIcon,
  OutdentIcon,
  PaintBucketIcon,
  PlusIcon,
  RedoIcon,
  RowIcon,
  SparklesIcon,
  SunIcon,
  TableIcon,
  TodoListIcon,
  TrashIcon,
  UndoIcon,
} from '../icons';
import {
  ALIGN_SPECS,
  BLOCK_SPECS,
  EXTRA_MARK_SPECS,
  INSERT_GROUPS,
  INSERT_SPECS,
  MARK_SPECS,
  MEDIA_SPECS,
} from './toolbarConfig';
import {
  MenuItem,
  MenuLabel,
  MenuSeparator,
  SubMenu,
  ToolbarButton,
  ToolbarDropdown,
  ToolbarSeparator,
  useCloseOnOtherOpen,
} from './ToolbarPrimitives';
import { EmojiPicker } from './EmojiPicker';
import { ColorPicker } from './ColorPicker';
import {
  BULLET_STYLES,
  clearMarks,
  FONT_FAMILIES,
  getAlign,
  getBlockType,
  getFontSize,
  getLineHeight,
  getListStyle,
  getMarkValue,
  indent,
  insertColumns,
  isMarkActive,
  LINE_HEIGHTS,
  NUMBER_STYLES,
  replaceBlock,
  setAlign,
  setFontSize,
  setLineHeight,
  setListStyle,
  setMark,
  stepFontSize,
  toggleBlock,
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
import { ELEMENT, MARK, type DaEditor, type MediaKind } from '../core/types';

export interface FixedToolbarProps {
  onAskAi?: () => void;
  onLink?: () => void;
  onMedia?: (kind: MediaKind) => void;
  onImport?: (format: 'html' | 'markdown' | 'word') => void;
  onExport?: (format: 'html' | 'markdown') => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export function FixedToolbar({
  onAskAi,
  onLink,
  onMedia,
  onImport,
  onExport,
  onToggleTheme,
  isDark,
}: FixedToolbarProps) {
  const editor = useSlate() as DaEditor;
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiId = useId();
  const emojiRef = useRef<HTMLDivElement>(null);
  const [customTextColors, setCustomTextColors] = useState<string[]>([]);
  const [customBgColors, setCustomBgColors] = useState<string[]>([]);

  useCloseOnOtherOpen(emojiOpen, () => setEmojiOpen(false), emojiId);

  useEffect(() => {
    if (!emojiOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!emojiRef.current?.contains(event.target as globalThis.Node)) setEmojiOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEmojiOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [emojiOpen]);

  const blockType = getBlockType(editor);
  const align = getAlign(editor);
  const fontSize = getFontSize(editor);
  const lineHeight = getLineHeight(editor);
  const listStyle = getListStyle(editor);
  const inTable = isInTable(editor);

  // Falls back to the paragraph spec so the button always has an icon.
  const activeBlock =
    BLOCK_SPECS.find((spec) => spec.type === blockType) ??
    BLOCK_SPECS.find((spec) => spec.type === ELEMENT.paragraph);
  const activeAlign = ALIGN_SPECS.find((spec) => spec.align === align) ?? ALIGN_SPECS[0];
  const canUndo = editor.history.undos.length > 0;
  const canRedo = editor.history.redos.length > 0;

  /* Each entry is one atomic group: it is shown inline, or moved whole into
     the overflow menu when the toolbar runs out of room. */
  const groups: Array<{ key: string; inline: ReactNode; menu?: ReactNode }> = [];

  groups.push({
    key: 'history',
    inline: (
      <>
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
      </>
    ),
    menu: (
      <>
        <MenuItem label="Undo" hint="Ctrl+Z" disabled={!canUndo} onClick={() => editor.undo()} />
        <MenuItem label="Redo" hint="Ctrl+Shift+Z" disabled={!canRedo} onClick={() => editor.redo()} />
      </>
    ),
  });

  if (onAskAi) {
    groups.push({
      key: 'ai',
      inline: (
        <ToolbarButton icon={<SparklesIcon />} label="Ask AI" shortcut="Ctrl+J" onClick={onAskAi} />
      ),
      menu: <MenuItem icon={<SparklesIcon />} label="Ask AI" hint="Ctrl+J" onClick={onAskAi} />,
    });
  }

  if (onImport || onExport) {
    groups.push({
      key: 'io',
      inline: (
        <>
          {onExport && (
            <ToolbarDropdown label="Export" icon={<ExportIcon />}>
              {(close) => (
                <>
                  <MenuItem label="Export as HTML" onClick={() => { onExport('html'); close(); }} />
                  <MenuItem label="Export as Markdown" onClick={() => { onExport('markdown'); close(); }} />
                </>
              )}
            </ToolbarDropdown>
          )}
          {onImport && (
            <ToolbarDropdown label="Import" icon={<ImportIcon />}>
              {(close) => (
                <>
                  <MenuItem label="Import from HTML" onClick={() => { onImport('html'); close(); }} />
                  <MenuItem label="Import from Markdown" onClick={() => { onImport('markdown'); close(); }} />
                  <MenuItem label="Import from Word" onClick={() => { onImport('word'); close(); }} />
                </>
              )}
            </ToolbarDropdown>
          )}
        </>
      ),
      menu: (
        <>
          {onExport && (
            <SubMenu icon={<ExportIcon />} label="Export">
              <MenuItem label="Export as HTML" onClick={() => onExport('html')} />
              <MenuItem label="Export as Markdown" onClick={() => onExport('markdown')} />
            </SubMenu>
          )}
          {onImport && (
            <SubMenu icon={<ImportIcon />} label="Import">
              <MenuItem label="Import from HTML" onClick={() => onImport('html')} />
              <MenuItem label="Import from Markdown" onClick={() => onImport('markdown')} />
              <MenuItem label="Import from Word" onClick={() => onImport('word')} />
            </SubMenu>
          )}
        </>
      ),
    });
  }

  groups.push({
    key: 'insert',
    inline: (
      <ToolbarDropdown label="Insert" icon={<PlusIcon />}>
        {(close) =>
          INSERT_GROUPS.map((group) => {
            const items = INSERT_SPECS.filter((spec) => spec.group === group);
            if (items.length === 0) return null;
            return (
              <Fragment key={group}>
                <MenuLabel>{group}</MenuLabel>
                {items.map((spec) => (
                  <MenuItem
                    key={spec.key}
                    icon={spec.icon}
                    label={spec.label}
                    onClick={() => {
                      spec.run(editor, { onMedia, onAskAi, onLink });
                      close();
                    }}
                  />
                ))}
              </Fragment>
            );
          })
        }
      </ToolbarDropdown>
    ),
  });

  const blockMenuItems = (close?: () => void) => (
    <>
      <MenuLabel>Turn into</MenuLabel>
      {BLOCK_SPECS.map((spec) => (
        <MenuItem
          key={spec.type}
          icon={spec.icon}
          label={spec.label}
          active={spec.type === blockType}
          onClick={() => {
            if (spec.type === ELEMENT.columns) insertColumns(editor, 3);
            else replaceBlock(editor, spec.type);
            close?.();
          }}
        />
      ))}
    </>
  );

  groups.push({
    key: 'blocktype',
    inline: (
      <ToolbarDropdown
        label="Block type"
        icon={activeBlock?.icon}
        value={activeBlock?.label ?? 'Text'}
      >
        {(close) => blockMenuItems(close)}
      </ToolbarDropdown>
    ),
    menu: (
      <SubMenu icon={activeBlock?.icon} label={activeBlock?.label ?? 'Text'}>
        {blockMenuItems()}
      </SubMenu>
    ),
  });

  groups.push({
    key: 'fontsize',
    inline: (
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
    ),
    menu: (
      <>
        <MenuItem label="Decrease font size" onClick={() => stepFontSize(editor, -1)} />
        <MenuItem label="Increase font size" onClick={() => stepFontSize(editor, 1)} />
      </>
    ),
  });

  groups.push({
    key: 'marks',
    inline: (
      <>
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
      </>
    ),
    menu: (
      <>
        {MARK_SPECS.map((spec) => (
          <MenuItem
            key={spec.mark}
            icon={spec.icon}
            label={spec.label}
            hint={spec.shortcut}
            active={isMarkActive(editor, spec.mark)}
            onClick={() => toggleMark(editor, spec.mark)}
          />
        ))}
      </>
    ),
  });

  groups.push({
    key: 'colors',
    inline: (
      <>
        <ToolbarDropdown label="Text color" icon={<LetterCaseIcon />} wide>
          {(close) => (
            <ColorPicker
              value={getMarkValue(editor, MARK.color) as string | undefined}
              customColors={customTextColors}
              onAddCustomColor={(color) =>
                setCustomTextColors((colors) => [...new Set([color, ...colors])].slice(0, 8))
              }
              onChange={(color) => setMark(editor, MARK.color, color)}
              onClose={close}
            />
          )}
        </ToolbarDropdown>
        <ToolbarDropdown label="Background color" icon={<PaintBucketIcon />} wide>
          {(close) => (
            <ColorPicker
              value={getMarkValue(editor, MARK.backgroundColor) as string | undefined}
              customColors={customBgColors}
              onAddCustomColor={(color) =>
                setCustomBgColors((colors) => [...new Set([color, ...colors])].slice(0, 8))
              }
              onChange={(color) => setMark(editor, MARK.backgroundColor, color)}
              onClose={close}
              clearLabel="No background"
            />
          )}
        </ToolbarDropdown>
        <ToolbarDropdown label="Highlight" icon={<HighlighterIcon />} wide>
          {(close) => (
            <ColorPicker
              value={getMarkValue(editor, MARK.highlight) as string | undefined}
              onChange={(color) => setMark(editor, MARK.highlight, color)}
              onClose={close}
              clearLabel="No highlight"
            />
          )}
        </ToolbarDropdown>
      </>
    ),
    menu: (
      <SubMenu icon={<LetterCaseIcon />} label="Colors">
        <ColorPicker
          value={getMarkValue(editor, MARK.color) as string | undefined}
          onChange={(color) => setMark(editor, MARK.color, color)}
          onClose={() => undefined}
        />
      </SubMenu>
    ),
  });

  groups.push({
    key: 'align',
    inline: (
      <>
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
      </>
    ),
    menu: (
      <>
        <SubMenu icon={activeAlign.icon} label="Alignment">
          {ALIGN_SPECS.map((spec) => (
            <MenuItem
              key={spec.align}
              icon={spec.icon}
              label={spec.label}
              active={spec.align === align}
              onClick={() => setAlign(editor, spec.align)}
            />
          ))}
        </SubMenu>
        <SubMenu icon={<AlignJustifyIcon />} label="Line height">
          {LINE_HEIGHTS.map((value) => (
            <MenuItem
              key={value}
              label={String(value)}
              active={value === lineHeight}
              onClick={() => setLineHeight(editor, value)}
            />
          ))}
        </SubMenu>
      </>
    ),
  });

  groups.push({
    key: 'lists',
    inline: (
      <>
        <ToolbarDropdown
          label="Numbered list"
          icon={<NumberedListIcon />}
          onIconClick={() => toggleBlock(editor, ELEMENT.numberedList)}
        >
          {(close) =>
            NUMBER_STYLES.map((style) => (
              <MenuItem
                key={style.value}
                label={style.label}
                active={listStyle === style.value}
                onClick={() => {
                  toggleBlock(editor, ELEMENT.numberedList);
                  setListStyle(editor, style.value);
                  close();
                }}
              />
            ))
          }
        </ToolbarDropdown>
        <ToolbarDropdown
          label="Bulleted list"
          icon={<BulletedListIcon />}
          onIconClick={() => toggleBlock(editor, ELEMENT.bulletedList)}
        >
          {(close) =>
            BULLET_STYLES.map((style) => (
              <MenuItem
                key={style.value}
                label={`${style.glyph}  ${style.label}`}
                active={listStyle === style.value}
                onClick={() => {
                  toggleBlock(editor, ELEMENT.bulletedList);
                  setListStyle(editor, style.value);
                  close();
                }}
              />
            ))
          }
        </ToolbarDropdown>
        <ToolbarButton
          icon={<TodoListIcon />}
          label="To-do list"
          active={blockType === ELEMENT.todoListItem}
          onClick={() => replaceBlock(editor, ELEMENT.todoListItem)}
        />
      </>
    ),
    menu: (
      <>
        <SubMenu icon={<NumberedListIcon />} label="Numbered list">
          {NUMBER_STYLES.map((style) => (
            <MenuItem
              key={style.value}
              label={style.label}
              active={listStyle === style.value}
              onClick={() => {
                toggleBlock(editor, ELEMENT.numberedList);
                setListStyle(editor, style.value);
              }}
            />
          ))}
        </SubMenu>
        <SubMenu icon={<BulletedListIcon />} label="Bulleted list">
          {BULLET_STYLES.map((style) => (
            <MenuItem
              key={style.value}
              label={`${style.glyph}  ${style.label}`}
              active={listStyle === style.value}
              onClick={() => {
                toggleBlock(editor, ELEMENT.bulletedList);
                setListStyle(editor, style.value);
              }}
            />
          ))}
        </SubMenu>
        <MenuItem
          icon={<TodoListIcon />}
          label="To-do list"
          onClick={() => replaceBlock(editor, ELEMENT.todoListItem)}
        />
      </>
    ),
  });

  groups.push({
    key: 'indent',
    inline: (
      <>
        <ToolbarButton icon={<OutdentIcon />} label="Outdent" onClick={() => indent(editor, -1)} />
        <ToolbarButton icon={<IndentIcon />} label="Indent" onClick={() => indent(editor, 1)} />
      </>
    ),
    menu: (
      <>
        <MenuItem icon={<OutdentIcon />} label="Outdent" onClick={() => indent(editor, -1)} />
        <MenuItem icon={<IndentIcon />} label="Indent" onClick={() => indent(editor, 1)} />
      </>
    ),
  });

  if (onLink) {
    groups.push({
      key: 'link',
      inline: <ToolbarButton icon={<LinkIcon />} label="Link" shortcut="Ctrl+K" onClick={onLink} />,
      menu: <MenuItem icon={<LinkIcon />} label="Link" hint="Ctrl+K" onClick={onLink} />,
    });
  }

  const tableMenu = (close?: () => void) => (
    <>
      <SubMenu icon={<TableIcon />} label="Table">
        <MenuItem label="Insert 3 × 3 table" onClick={() => { insertTable(editor); close?.(); }} />
        <MenuItem
          label="Toggle header row"
          disabled={!inTable}
          onClick={() => { toggleHeaderRow(editor); close?.(); }}
        />
      </SubMenu>
      <SubMenu icon={<CellIcon />} label="Cell" disabled={!inTable}>
        <MenuItem label="Toggle header row" onClick={() => { toggleHeaderRow(editor); close?.(); }} />
      </SubMenu>
      <SubMenu icon={<RowIcon />} label="Row" disabled={!inTable}>
        <MenuItem label="Insert above" onClick={() => { insertRow(editor, 'above'); close?.(); }} />
        <MenuItem label="Insert below" onClick={() => { insertRow(editor, 'below'); close?.(); }} />
        <MenuItem icon={<TrashIcon />} label="Delete row" onClick={() => { deleteRow(editor); close?.(); }} />
      </SubMenu>
      <SubMenu icon={<ColumnIcon />} label="Column" disabled={!inTable}>
        <MenuItem label="Insert left" onClick={() => { insertColumn(editor, 'left'); close?.(); }} />
        <MenuItem label="Insert right" onClick={() => { insertColumn(editor, 'right'); close?.(); }} />
        <MenuItem icon={<TrashIcon />} label="Delete column" onClick={() => { deleteColumn(editor); close?.(); }} />
      </SubMenu>
      <MenuSeparator />
      <MenuItem
        icon={<TrashIcon />}
        label="Delete table"
        disabled={!inTable}
        onClick={() => { deleteTable(editor); close?.(); }}
      />
    </>
  );

  groups.push({
    key: 'table',
    inline: (
      <ToolbarDropdown label="Table" icon={<TableIcon />}>
        {(close) => tableMenu(close)}
      </ToolbarDropdown>
    ),
    menu: <SubMenu icon={<TableIcon />} label="Table">{tableMenu()}</SubMenu>,
  });

  groups.push({
    key: 'emoji',
    inline: (
      <div className="da-tb__dropdown" ref={emojiRef}>
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
    ),
  });

  if (onMedia) {
    groups.push({
      key: 'media',
      inline: (
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
      ),
      menu: (
        <SubMenu icon={<ImageIcon />} label="Media">
          {MEDIA_SPECS.map((spec) => (
            <MenuItem
              key={spec.kind}
              icon={spec.icon}
              label={spec.label}
              onClick={() => onMedia(spec.kind)}
            />
          ))}
        </SubMenu>
      ),
    });
  }

  groups.push({
    key: 'columns',
    inline: (
      <ToolbarButton
        icon={<ColumnsThreeIcon />}
        label="3 columns"
        onClick={() => insertColumns(editor, 3)}
      />
    ),
    menu: (
      <MenuItem
        icon={<ColumnsThreeIcon />}
        label="3 columns"
        onClick={() => insertColumns(editor, 3)}
      />
    ),
  });

  return (
    <div className="da-tb da-tb--fixed" role="toolbar" aria-label="Editor toolbar">
      {/* Tools scroll horizontally when the window is too narrow for them. */}
      <div className="da-tb__scroll">
        {groups.map((group, index) => (
          <Fragment key={group.key}>
            {index > 0 && <ToolbarSeparator />}
            <div className="da-tb__group">{group.inline}</div>
          </Fragment>
        ))}

        <ToolbarSeparator />

      {/* Always-present overflow for the rarely used marks. */}
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
            <MenuLabel>Font</MenuLabel>
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
            <MenuSeparator />
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

      {/* Pinned right cluster, never scrolled away. */}
      <div className="da-tb__end">
      {onToggleTheme && (
        <ToolbarButton
          icon={isDark ? <SunIcon /> : <MoonIcon />}
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
        />
      )}

      </div>
    </div>
  );
}
