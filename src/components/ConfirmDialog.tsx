import { useEffect, useRef } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
  /**
   * Only needed when the dialog is rendered outside the editor: its colours
   * come from tokens defined on `.da-editor`, and without an ancestor carrying
   * them every `var()` falls back to nothing and the buttons render unstyled.
   */
  theme?: 'light' | 'dark';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  theme,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => confirmRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Stopped here so the same Escape does not also close a toolbar popover
      // or the editor's own overlays behind the dialog.
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
      if (event.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className={`da-dialog__backdrop${theme ? ' da-editor' : ''}`}
      data-theme={theme}
      onMouseDown={onCancel}
    >
      <div
        className="da-dialog da-dialog--compact"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 className="da-dialog__title">{title}</h3>
        <p className="da-dialog__message">{message}</p>

        <div className="da-dialog__actions">
          <button type="button" className="da-dialog__btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`da-dialog__btn ${danger ? 'da-dialog__btn--danger' : 'da-dialog__btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
