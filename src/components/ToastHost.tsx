import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { dismissToast, useToasts, type Toast } from '../core/toast';
import { CheckIcon, WarningIcon, InfoIcon } from '../icons';

const TONE_ICON = {
  neutral: InfoIcon,
  success: CheckIcon,
  danger: WarningIcon,
} as const;

/** How long the exit animation runs; keep in step with `.da-toast--leaving`. */
const LEAVE_MS = 180;

function ToastCard({ toast }: { toast: Toast }) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const Icon = TONE_ICON[toast.tone];

  // The store drops the toast on its own timer; this only plays the exit
  // animation slightly ahead so the card is gone by the time it is unmounted.
  useEffect(() => {
    if (toast.duration <= 0) return;
    timer.current = setTimeout(
      () => setLeaving(true),
      Math.max(0, toast.duration - LEAVE_MS),
    );
    return () => clearTimeout(timer.current);
  }, [toast.duration]);

  return (
    <div
      className={`da-toast da-toast--${toast.tone}${leaving ? ' da-toast--leaving' : ''}`}
      role="status"
      onClick={() => dismissToast(toast.id)}
    >
      <Icon size={15} className="da-toast__icon" />
      <span className="da-toast__msg">{toast.message}</span>
    </div>
  );
}

export interface ToastHostProps {
  /**
   * The editor's resolved theme. The host is portalled to `<body>`, outside the
   * editor's `[data-theme]` scope, so it cannot inherit the palette — it is
   * stamped here instead. Without it the toast would follow the OS setting and
   * go dark while a `theme="light"` editor stays light.
   */
  theme?: 'light' | 'dark';
}

/**
 * Renders the editor's toasts in a fixed, top-centre stack. Portalled to
 * `document.body` so a scrolled or `overflow:hidden` editor container cannot
 * clip it. `aria-live` polite: a copy confirmation should not interrupt a
 * screen reader mid-sentence.
 */
export function ToastHost({ theme }: ToastHostProps = {}) {
  const toasts = useToasts();
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="da-toast-host"
      data-theme={theme}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
