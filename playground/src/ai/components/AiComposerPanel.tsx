import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Settings2, Square, X } from 'lucide-react';
import { getProvider } from '../constants';
import { useAiCompose } from '../hooks/useAiCompose';
import type { AiConfig, ComposeMode } from '../types';
import { OrbitMark } from './OrbitMark';

interface Props {
  theme: 'light' | 'dark';
  config: AiConfig;
  selection: string;
  context: string;
  columnRect: { left: number; width: number } | null;
  onInsert: (text: string, mode: ComposeMode) => void;
  onBusyChange: (busy: boolean) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function AiComposerPanel({
  theme,
  config,
  selection,
  context,
  columnRect,
  onInsert,
  onBusyChange,
  onOpenSettings,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const { compose, cancel, loading, error, setError } = useAiCompose(config);

  const provider = getProvider(config.provider);
  const mode: ComposeMode = selection.trim() ? 'replace' : 'insert';

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    onBusyChange(loading);
  }, [loading, onBusyChange]);

  useEffect(() => () => onBusyChange(false), [onBusyChange]);

  const submit = async () => {
    if (!prompt.trim() || loading) return;
    setError(null);
    const text = await compose({
      prompt,
      selection: selection.trim() || undefined,
      context: context.trim() || undefined,
    });
    if (text) {
      onInsert(text, mode);
      setPrompt('');
    }
  };

  return (
    <div
      className="ai-panel"
      data-theme={theme}
      style={
        columnRect
          ? { left: columnRect.left, width: columnRect.width }
          : undefined
      }
    >
      <div className="ai-panel__aurora" aria-hidden />
      <div className="ai-panel__inner">
        <div className="ai-panel__head">
          <div className="ai-panel__brand">
            <OrbitMark size={18} theme={theme} />
            <span className="ai-panel__name">Orbit AI</span>
            <span className="ai-panel__meta">
              {provider?.label} · {config.model}
            </span>
            {loading && <span className="ai-panel__status">writing…</span>}
          </div>
          <div className="ai-panel__head-actions">
            <button
              type="button"
              className="ai-panel__icon"
              aria-label="AI settings"
              onClick={onOpenSettings}
            >
              <Settings2 size={15} />
            </button>
            <button type="button" className="ai-panel__icon" aria-label="Close" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {error && <div className="ai-panel__error">{error}</div>}

        {selection.trim() && (
          <div className="ai-panel__selection">Replacing your selection: “{selection.trim()}”</div>
        )}

        <div className="ai-panel__inputwrap">
          <textarea
            ref={inputRef}
            className="ai-panel__input"
            value={prompt}
            rows={3}
            placeholder="Ask Orbit to write something…"
            disabled={loading}
            onChange={(event) => setPrompt(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
              if (event.key === 'Escape') onClose();
            }}
          />
          <div className="ai-panel__send-row">
            {loading ? (
              <button
                type="button"
                className="ai-panel__send ai-panel__send--stop"
                aria-label="Stop"
                onClick={cancel}
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="ai-panel__send"
                aria-label="Send"
                disabled={!prompt.trim()}
                onClick={submit}
              >
                <ArrowUp size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="ai-panel__foot">
          {loading
            ? 'Writing into your document — editing is paused until it finishes.'
            : 'Enter to send · Shift+Enter for a new line'}
        </div>
      </div>
    </div>
  );
}
