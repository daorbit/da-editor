import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDownIcon } from '../icons';

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
  children: (close: () => void) => ReactNode;
}

export function ToolbarDropdown({ label, icon, value, disabled, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
    <div className="da-tb__dropdown" ref={rootRef}>
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
        {icon}
        {value && <span className="da-tb__value">{value}</span>}
        <ChevronDownIcon size={12} className="da-tb__caret" />
      </button>
      {open && (
        <div className="da-tb__menu" id={menuId} role="menu">
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
  onClick: () => void;
}

export function MenuItem({ icon, label, hint, active, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`da-tb__item${active ? ' da-tb__item--active' : ''}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon && <span className="da-tb__item-icon">{icon}</span>}
      <span className="da-tb__item-label">{label}</span>
      {hint && <span className="da-tb__item-hint">{hint}</span>}
    </button>
  );
}
