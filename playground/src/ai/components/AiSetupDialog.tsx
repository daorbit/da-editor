import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { AI_PROVIDERS, getProvider } from '../constants';
import type { AiConfig, AiProviderId } from '../types';
import { AiSelect } from './AiSelect';
import { OrbitMark } from './OrbitMark';
import { ProviderIcon } from './ProviderIcon';

interface Props {
  open: boolean;
  theme: 'light' | 'dark';
  current: AiConfig | null;
  onSave: (config: AiConfig) => void;
  onClear: () => void;
  onClose: () => void;
}

export function AiSetupDialog({ open, theme, current, onSave, onClear, onClose }: Props) {
  const [providerId, setProviderId] = useState<AiProviderId>(current?.provider ?? 'openai');
  const [model, setModel] = useState(current?.model ?? AI_PROVIDERS[0].models[0].id);
  const [apiKey, setApiKey] = useState(current?.apiKey ?? '');
  const [touched, setTouched] = useState(false);

  const provider = useMemo(() => getProvider(providerId) ?? AI_PROVIDERS[0], [providerId]);

  useEffect(() => {
    if (!open) return;
    setProviderId(current?.provider ?? 'openai');
    setModel(current?.model ?? AI_PROVIDERS[0].models[0].id);
    setApiKey(current?.apiKey ?? '');
    setTouched(false);
  }, [open, current]);

  useEffect(() => {
    if (!provider.models.some((m) => m.id === model)) {
      setModel(provider.models[0].id);
    }
  }, [provider, model]);

  if (!open) return null;

  const keyMissing = !apiKey.trim();

  const submit = () => {
    setTouched(true);
    if (keyMissing) return;
    onSave({ provider: providerId, model, apiKey: apiKey.trim() });
    onClose();
  };

  return (
    <div className="ai-dialog__backdrop" data-theme={theme} onMouseDown={onClose}>
      <div
        className="ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="AI model setup"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ai-dialog__head">
          <div className="ai-dialog__title">
            <OrbitMark size={18} theme={theme} />
            <span>Connect an AI model</span>
          </div>
          <button type="button" className="ai-dialog__icon" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p className="ai-dialog__hint">
          Your key is stored only in this browser (localStorage) and sent straight to the
          provider from the page. Nothing is saved on a server.
        </p>

        <label className="ai-field">
          <span className="ai-field__label">Provider</span>
          <div className="ai-provider-grid">
            {AI_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="ai-provider-grid__item"
                data-active={p.id === providerId || undefined}
                onClick={() => setProviderId(p.id)}
              >
                <ProviderIcon id={p.id} size={22} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </label>

        <div className="ai-field">
          <span className="ai-field__label">Model</span>
          <AiSelect
            ariaLabel="AI model"
            value={model}
            options={provider.models}
            onChange={setModel}
          />
        </div>

        <label className="ai-field">
          <span className="ai-field__label">{provider.keyLabel}</span>
          <input
            className="ai-field__control"
            type="password"
            autoComplete="off"
            value={apiKey}
            placeholder={provider.keyPlaceholder}
            onChange={(event) => setApiKey(event.currentTarget.value)}
          />
          <span className="ai-field__note">
            {provider.keyHint} ·{' '}
            <a href={provider.docsUrl} target="_blank" rel="noreferrer">
              get a key
            </a>
          </span>
          {touched && keyMissing && <span className="ai-field__error">A key is required</span>}
        </label>

        <div className="ai-dialog__actions">
          {current && (
            <button
              type="button"
              className="ai-btn ai-btn--danger"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Remove saved key
            </button>
          )}
          <div className="ai-dialog__actions-right">
            <button type="button" className="ai-btn ai-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="ai-btn ai-btn--primary" onClick={submit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
