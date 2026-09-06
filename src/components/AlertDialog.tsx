import { useEffect, useRef } from 'react';

export interface AlertDialogProps {
  message: string | null;
  title?: string;
  onClose: () => void;
}
 
export function AlertDialog({ message, title = 'Something went wrong', onClose }: AlertDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!message) return;
    requestAnimationFrame(() => buttonRef.current?.focus());
  }, [message]);

  useEffect(() => {
    if (!message) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="da-dialog__backdrop" onMouseDown={onClose}>
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
          <button
            ref={buttonRef}
            type="button"
            className="da-dialog__btn da-dialog__btn--primary"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
