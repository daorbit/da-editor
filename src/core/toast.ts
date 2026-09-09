import { useSyncExternalStore } from 'react';

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  /** Milliseconds the toast stays up before it self-dismisses. */
  duration: number;
}

export interface ToastOptions {
  tone?: ToastTone;
  duration?: number;
}

/**
 * A tiny module-level toast bus. The editor and its toolbars fire toasts from
 * plain event handlers — no context to thread, no provider to mount — and a
 * single `<ToastHost>` per editor subscribes and renders them. Kept out of a
 * React context on purpose: `toast()` is called from clipboard and keyboard
 * handlers that are not always inside the tree.
 */
const listeners = new Set<() => void>();
let toasts: Toast[] = [];
let nextId = 1;

/** Coalesce identical back-to-back messages so a double copy is not two cards. */
let lastKey = '';
let lastAt = 0;

function emit(): void {
  for (const listener of listeners) listener();
}

export function dismissToast(id: number): void {
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function toast(message: string, options: ToastOptions = {}): void {
  const now = Date.now();
  const key = `${options.tone ?? 'neutral'}:${message}`;
  if (key === lastKey && now - lastAt < 400) return;
  lastKey = key;
  lastAt = now;

  const item: Toast = {
    id: nextId++,
    message,
    tone: options.tone ?? 'neutral',
    duration: options.duration ?? 2000,
  };

  // Never let a stuck host pile toasts up without bound.
  toasts = [...toasts, item].slice(-4);
  emit();

  if (item.duration > 0) {
    setTimeout(() => dismissToast(item.id), item.duration);
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Toast[] {
  return toasts;
}

/** Current toasts, re-rendering the caller whenever the list changes. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
