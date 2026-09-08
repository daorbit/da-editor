import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from '../icons';

/* Width kept clear for the trailing "More" button, which is 32px plus gaps. */
const OVERFLOW_RESERVE = 48;

/**
 * The box a popup is actually clipped by: the nearest ancestor that scrolls
 * or hides its overflow, falling back to the viewport. Without this, a menu
 * inside a fixed-height editor sizes itself to the whole window and gets cut
 * off by the editor's own overflow.
 */
function findClipBounds(from: HTMLElement): { top: number; bottom: number } {
  let node = from.parentElement;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') {
      const rect = node.getBoundingClientRect();
      return {
        top: Math.max(0, rect.top),
        bottom: Math.min(window.innerHeight, rect.bottom),
      };
    }
    node = node.parentElement;
  }
  return { top: 0, bottom: window.innerHeight };
}

/**
 * The horizontal counterpart. Separate walk rather than a second axis on the
 * one above, because the element that clips vertically is often not the one
 * that clips horizontally — an editor pane scrolls on Y while the surrounding
 * layout column is what bounds X.
 *
 * Falls back to the editor's own box rather than the viewport: when the editor
 * is a panel with a sidebar beside it, a menu can overflow the editor by a wide
 * margin while still sitting well inside the window, so measuring against the
 * window would never flip it.
 */
function findClipBoundsX(from: HTMLElement): { left: number; right: number } {
  let node = from.parentElement;
  while (node && node !== document.body) {
    const { overflowX } = getComputedStyle(node);
    if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') {
      const rect = node.getBoundingClientRect();
      return {
        left: Math.max(0, rect.left),
        right: Math.min(window.innerWidth, rect.right),
      };
    }
    node = node.parentElement;
  }

  const editor = from.closest<HTMLElement>('.da-editor');
  if (editor) {
    const rect = editor.getBoundingClientRect();
    return {
      left: Math.max(0, rect.left),
      right: Math.min(window.innerWidth, rect.right),
    };
  }
  return { left: 0, right: window.innerWidth };
}
/* Fallback only, for the first pass before a separator exists to measure:
   1px rule plus its 6px margins. */
const SEPARATOR_WIDTH = 13;

/* Preferred menu height. Kept in step with `.da-tb__menu`'s `max-height`, which
   applies before this component has measured anything. */
const MENU_MAX_HEIGHT = 320;

 

export function useOverflowCollapse(
  availableRef: RefObject<HTMLDivElement | null>,
  measureRef: RefObject<HTMLDivElement | null>,
  groupCount: number,
): number {
  const [visibleCount, setVisibleCount] = useState(groupCount);

  useLayoutEffect(() => {
    const rowEl = availableRef.current;
    const measureEl = measureRef.current;
    if (!rowEl || !measureEl) return;

    const toolbarEl = rowEl.closest<HTMLElement>('.da-tb--fixed') ?? rowEl;
    const editorEl = toolbarEl.closest<HTMLElement>('.da-editor');

 
    const boundsEl = editorEl ?? toolbarEl;

    const recalc = () => {
      const groups = Array.from(
        measureEl.querySelectorAll<HTMLElement>(':scope > [data-tb-group]'),
      );
      if (groups.length === 0) return;

      const style = getComputedStyle(toolbarEl);
      const padding =
        parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
      const rowGap = parseFloat(style.columnGap || style.gap || '0');

      const outerWidth = boundsEl.getBoundingClientRect().width;
 
      const naturalWidth = (selector: string, fallback = 0) => {
        const el = toolbarEl.querySelector<HTMLElement>(selector);
        if (!el) return fallback;
        const rect = el.getBoundingClientRect().width;
        return Math.max(rect, el.scrollWidth);
      };

      const endWidth = naturalWidth('.da-tb__end');
      const overflowWidth = naturalWidth('.da-tb__overflow', OVERFLOW_RESERVE);
      const leadingWidth = naturalWidth('.da-tb__leading');

      // One gap per in-flow sibling boundary. The measure row is absolutely
      // positioned and out of flow, so it takes no gap; `.da-tb__leading` only
      // exists when the host passed leading content.
      const gapCount = leadingWidth > 0 ? 3 : 2;
      const rowGapTotal = rowGap * gapCount;

      // No separator reserve here: the one before "More" lives *inside*
      // `.da-tb__overflow` and is already part of `overflowWidth`.
      const available =
        outerWidth - padding - rowGapTotal - leadingWidth - endWidth - overflowWidth;

      /*
       * What one group costs beyond its own width: the separator drawn before
       * it, plus the row's flex gap on either side of that separator.
       *
       * Measured rather than assumed. A hardcoded guess is wrong by a few px per
       * group and there are a dozen groups, so the error compounds into enough
       * slack to admit a group that does not fit.
       */
      const rowStyle = getComputedStyle(rowEl);
      const scrollGap = parseFloat(rowStyle.columnGap || rowStyle.gap || '0');
      const sepEl = rowEl.querySelector<HTMLElement>('.da-tb__sep');
      let separatorCost = SEPARATOR_WIDTH;
      if (sepEl) {
        const sepStyle = getComputedStyle(sepEl);
        separatorCost =
          sepEl.getBoundingClientRect().width +
          parseFloat(sepStyle.marginLeft || '0') +
          parseFloat(sepStyle.marginRight || '0');
      }
      const perGroupCost = separatorCost + scrollGap * 2;

      let used = 0;
      let fit = 0;
      for (const group of groups) {
        // `getBoundingClientRect` rather than `offsetWidth`: the latter rounds
        // to an integer, and rounding down once per group accumulates into
        // enough slack to keep a group that does not fit.
        const width =
          group.getBoundingClientRect().width + (fit > 0 ? perGroupCost : 0);
        if (used + width > available) break;
        used += width;
        fit += 1;
      }

      setVisibleCount(fit);
    };

    recalc();

 
    const observer = new ResizeObserver(recalc);
    observer.observe(boundsEl);

 
    for (const selector of ['.da-tb__end', '.da-tb__overflow', '.da-tb__leading']) {
      const el = toolbarEl.querySelector<HTMLElement>(selector);
      if (el) observer.observe(el);
    }

    // The first pass can run before the host's web font has loaded, which makes
    // every button narrower than it will end up. Nothing resizes the editor
    // afterwards, so without this the toolbar keeps a count measured against
    // the fallback font for the life of the page.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) recalc();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // Re-measure whenever the number of groups changes (props/state driven).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupCount]);

  return Math.min(visibleCount, groupCount);
}

/** Broadcast so opening one toolbar popover closes any other that's open. */
const DA_TB_CLOSE_OTHERS = 'da-tb-close-others';

/** Closes this popover when a *different* one announces it just opened. */
export function useCloseOnOtherOpen(open: boolean, close: () => void, id: string) {
  useEffect(() => {
    if (open) {
      document.dispatchEvent(new CustomEvent(DA_TB_CLOSE_OTHERS, { detail: id }));
    }
  }, [open, id]);

  useEffect(() => {
    if (!open) return;
    const onCloseOthers = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) close();
    };
    document.addEventListener(DA_TB_CLOSE_OTHERS, onCloseOthers);
    return () => document.removeEventListener(DA_TB_CLOSE_OTHERS, onCloseOthers);
  }, [open, close, id]);
}

export interface ToolbarButtonProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  shortcut?: string;
  children?: ReactNode;
  onClick: () => void;
}

export function ToolbarButton({
  icon,
  label,
  active,
  disabled,
  shortcut,
  children,
  onClick,
}: ToolbarButtonProps) {
  const title = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      type="button"
      className={`da-tb__btn${active ? ' da-tb__btn--active' : ''}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // Preserve the editor selection when the button takes the click.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

export function ToolbarSeparator() {
  return <span className="da-tb__sep" role="separator" aria-orientation="vertical" />;
}

export interface DropdownProps {
  label: string;
  icon?: ReactNode;
  /** Text shown next to the icon, for value-bearing dropdowns. */
  value?: string;
  disabled?: boolean;
  /** Widens the panel for pickers rather than plain menus. */
  wide?: boolean;
  /**
   * Makes this a split button: clicking the icon runs this action, while the
   * caret still opens the menu.
   */
  onIconClick?: () => void;
  children: (close: () => void) => ReactNode;
}

export function ToolbarDropdown({
  label,
  icon,
  value,
  disabled,
  wide,
  onIconClick,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  // Pixels to shift the panel back inside its clip box once it has been
  // aligned, for panels too wide to fit either edge of the trigger.
  const [nudge, setNudge] = useState(0);
  const [placement, setPlacement] = useState<{ up: boolean; maxHeight?: number }>({
    up: false,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useCloseOnOtherOpen(open, () => setOpen(false), menuId);

  // Flips the panel to hang from the right edge when it would otherwise
  // overflow the viewport — most noticeable on trailing buttons like "More".
  // Also caps its height to the space actually available, and flips it above
  // the trigger when there is more room there, so long menus never clip.
  useLayoutEffect(() => {
    if (!open) {
      setNudge(0);
      setAlignRight(false);
      return;
    }
    const menu = menuRef.current;
    const root = rootRef.current;
    if (!menu || !root) return;

    const rect = menu.getBoundingClientRect();

    const GAP = 8;
    const trigger = root.getBoundingClientRect();

    /* Horizontal placement, in three steps: hang from the left edge of the
       trigger; flip to its right edge if that overflows; then, if the panel is
       wider than the room on either side (the emoji and colour pickers are),
       nudge it back by the leftover pixels. Flipping alone cannot fix a panel
       that does not fit whichever edge it hangs from. */
    const clipX = findClipBoundsX(root);
    const width = rect.width;
    const flip = trigger.left + width > clipX.right && trigger.right - width >= clipX.left;
    setAlignRight(flip);

    const projectedLeft = flip ? trigger.right - width : trigger.left;
    const overflowRight = Math.max(0, projectedLeft + width - clipX.right);
    const shifted = projectedLeft - overflowRight;
    const overflowLeft = Math.max(0, clipX.left - shifted);
    setNudge(Math.round(overflowLeft - overflowRight));

    // The menu is clipped by the nearest scrolling/hidden ancestor, not by
    // the viewport — an editor with a fixed height is exactly that case. So
    // the available space has to be measured against that box.
    const clip = findClipBounds(root);
    const below = clip.bottom - trigger.bottom - GAP;
    const above = trigger.top - clip.top - GAP;
    // Only flip up when below is genuinely cramped and above is roomier.
    const up = below < Math.min(rect.height, 180) && above > below;
    // The room available is a *ceiling*, not a target: in a full-height editor
    // there may be 900px below the trigger, and a menu that grows to fill it is
    // a list nobody can scan. `MENU_MAX_HEIGHT` is the preferred size, and the
    // available space only ever shrinks it further.
    const room = Math.max(120, Math.floor(up ? above : below));
    setPlacement({ up, maxHeight: Math.min(MENU_MAX_HEIGHT, room) });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as globalThis.Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={`da-tb__dropdown${onIconClick ? ' da-tb__dropdown--split' : ''}`} ref={rootRef}>
      {onIconClick ? (
        <>
          <button
            type="button"
            className="da-tb__btn da-tb__btn--split-main"
            title={label}
            aria-label={label}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onIconClick}
          >
            {icon}
          </button>
          <button
            type="button"
            className={`da-tb__btn da-tb__btn--split-caret${open ? ' da-tb__btn--active' : ''}`}
            title={`${label} options`}
            aria-label={`${label} options`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDownIcon size={12} className="da-tb__caret" />
          </button>
        </>
      ) : (
        <button
          type="button"
          className={`da-tb__btn da-tb__btn--dropdown${open ? ' da-tb__btn--active' : ''}`}
          title={label}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Both slots always render, so a changing label or icon cannot
              resize the button and reflow the toolbar. */}
          {value !== undefined ? (
            <>
              {icon && <span className="da-tb__icon">{icon}</span>}
              <span className="da-tb__value">{value}</span>
            </>
          ) : (
            icon
          )}
          <ChevronDownIcon size={12} className="da-tb__caret" />
        </button>
      )}
      {open && (
        <div
          ref={menuRef}
          className={`da-tb__menu${wide ? ' da-tb__menu--wide' : ''}${alignRight ? ' da-tb__menu--right' : ''}${placement.up ? ' da-tb__menu--up' : ''}`}
          id={menuId}
          role="menu"
          style={{
            ...(placement.maxHeight ? { maxHeight: placement.maxHeight } : null),
            // Applied as a transform rather than an offset so it composes with
            // whichever edge the panel is anchored to.
            ...(nudge ? { transform: `translateX(${nudge}px)` } : null),
          }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function MenuItem({ icon, label, hint, active, disabled, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`da-tb__item${active ? ' da-tb__item--active' : ''}`}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon && <span className="da-tb__item-icon">{icon}</span>}
      <span className="da-tb__item-label">{label}</span>
      {active && !hint && <CheckIcon size={13} className="da-tb__item-check" />}
      {hint && <span className="da-tb__item-hint">{hint}</span>}
    </button>
  );
}

export interface SubMenuProps {
  icon?: ReactNode;
  label: string;
  disabled?: boolean;
  children: ReactNode;
}

/** A menu row that opens a nested panel beside it on hover or focus. */
export function SubMenu({ icon, label, disabled, children }: SubMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null,
  );
  const rowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  // The submenu is fixed-positioned rather than nested inside the parent's
  // flow, so the parent menu can scroll without clipping it. That means
  // computing its position from the row each time it opens.
  useLayoutEffect(() => {
    if (!open) return;
    const row = rowRef.current;
    const sub = subRef.current;
    if (!row || !sub) return;

    const trigger = row.getBoundingClientRect();
    const panel = sub.getBoundingClientRect();
    const GAP = 2;

    let left = trigger.right + GAP;
    // Flip to the left of the row when it would run off-screen.
    if (left + panel.width > window.innerWidth) {
      left = Math.max(4, trigger.left - panel.width - GAP);
    }

    // Clamped to the clipping ancestor, for the same reason the parent menu is.
    const clip = findClipBounds(row);
    let top = trigger.top - 5;
    if (top + panel.height > clip.bottom - 4) {
      top = Math.max(clip.top + 4, clip.bottom - panel.height - 4);
    }

    setPos({ top, left, maxHeight: Math.max(120, Math.floor(clip.bottom - top - 4)) });
  }, [open]);

  return (
    <div
      className="da-tb__submenu"
      ref={rowRef}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setPos(null);
      }}
    >
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className="da-tb__item"
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        {icon && <span className="da-tb__item-icon">{icon}</span>}
        <span className="da-tb__item-label">{label}</span>
        <ChevronRightIcon size={13} className="da-tb__item-arrow" />
      </button>
      {open && !disabled && (
        <div
          ref={subRef}
          className="da-tb__menu da-tb__menu--sub"
          role="menu"
          style={{
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            maxHeight: pos?.maxHeight,
            // Hidden for the first paint, before its position is measured.
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="da-tb__menu-label">{children}</div>;
}

export function MenuSeparator() {
  return <div className="da-tb__menu-sep" role="separator" />;
}
