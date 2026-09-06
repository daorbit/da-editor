import { useEffect, useRef, useState } from 'react';

export interface PromptDialogProps {
  /** Null closes the dialog; a request object opens it. */
  request: PromptRequest | null;
  onClose: () => void;
}

export interface PromptRequest {
  title: string;
  initialValue: string;
  placeholder?: string;
  multiline?: boolean;
  submitLabel?: string;
  onSubmit: (value: string) => void;
}
 
export function PromptDialog({ request, onClose }: PromptDialogProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!request) return;
    setValue(request.initialValue);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [request, onClose]);

  if (!request) return null;

  const submit = () => {
    request.onSubmit(value);
    onClose();
  };

  return (
    <div className="da-dialog__backdrop" onMouseDown={onClose}>
      <div
        className="da-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={request.title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 className="da-dialog__title">{request.title}</h3>

        <div className="da-dialog__row">
          {request.multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="da-dialog__input da-dialog__input--area"
              placeholder={request.placeholder}
              value={value}
              rows={3}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {

                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className="da-dialog__input"
              placeholder={request.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          )}
        </div>

        <div className="da-dialog__actions">
          <button type="button" className="da-dialog__btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="da-dialog__btn da-dialog__btn--primary"
            onClick={submit}
          >
            {request.submitLabel ?? 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
