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

const OVERFLOW_RESERVE = 44;
const SEPARATOR_WIDTH = 9;

 
export function useOverflowCollapse(
  availableRef: RefObject<HTMLDivElement | null>,
  measureRef: RefObject<HTMLDivElement | null>,
  groupCount: number,
): number {
  const [visibleCount, setVisibleCount] = useState(groupCount);

  useLayoutEffect(() => {
    const availableEl = availableRef.current;
    const measureEl = measureRef.current;
    if (!availableEl || !measureEl) return;

    const recalc = () => {
      const groups = Array.from(
        measureEl.querySelectorAll<HTMLElement>(':scope > [data-tb-group]'),
      );
      if (groups.length === 0) return;

      const available = availableEl.clientWidth - OVERFLOW_RESERVE;
      let used = 0;
      let fit = 0;
      for (const group of groups) {
        const width = group.offsetWidth + (fit > 0 ? SEPARATOR_WIDTH : 0);
        if (used + width > available) break;
        used += width;
        fit += 1;
      }
      setVisibleCount(Math.max(1, fit));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(availableEl);
    return () => observer.disconnect();
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
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useCloseOnOtherOpen(open, () => setOpen(false), menuId);

  // Flips the panel to hang from the right edge when it would otherwise
  // overflow the viewport — most noticeable on trailing buttons like "More".
  useLayoutEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    setAlignRight(rect.right > window.innerWidth);
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
          className={`da-tb__menu${wide ? ' da-tb__menu--wide' : ''}${alignRight ? ' da-tb__menu--right' : ''}`}
          id={menuId}
          role="menu"
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

  return (
    <div
      className="da-tb__submenu"
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
        <div className="da-tb__menu da-tb__menu--sub" role="menu">
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
