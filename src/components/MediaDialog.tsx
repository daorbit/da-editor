import { useEffect, useRef, useState } from 'react';
import { ImageIcon, PlusIcon } from '../icons';
import { isEmbeddable, pickFile, resolveFileUrl, toEmbedUrl } from '../core/media';
import type { MediaKind, UploadHandler } from '../core/types';

const TITLES: Record<MediaKind, string> = {
  image: 'Insert image',
  video: 'Insert video',
  audio: 'Insert audio',
  file: 'Attach file',
  embed: 'Embed',
};

const PLACEHOLDERS: Record<MediaKind, string> = {
  image: 'Paste an image URL…',
  video: 'Paste a video or YouTube URL…',
  audio: 'Paste an audio URL…',
  file: 'Paste a file URL…',
  embed: 'Paste a URL to embed…',
};

export interface MediaDialogProps {
  kind: MediaKind | null;
  onUpload?: UploadHandler;
  onInsert: (kind: MediaKind, url: string, name?: string) => void;
  onClose: () => void;
}

export function MediaDialog({ kind, onUpload, onInsert, onClose }: MediaDialogProps) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (kind) {
      setUrl('');
      setError(null);
      setBusy(false);
      // Let the dialog mount before stealing focus.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [kind]);

  useEffect(() => {
    if (!kind) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [kind, onClose]);

  if (!kind) return null;

  const submitUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const href = /^(https?:|data:|blob:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    // A YouTube or Vimeo link inserted as video becomes an iframe embed.
    if (kind === 'video' && isEmbeddable(href)) {
      onInsert('embed', toEmbedUrl(href));
    } else {
      onInsert(kind, href);
    }
    onClose();
  };

  const chooseFile = async () => {
    setError(null);
    const file = await pickFile(kind);
    if (!file) return;

    setBusy(true);
    try {
      const resolved = await resolveFileUrl(file, kind, onUpload);
      onInsert(kind, resolved, file.name);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="da-dialog__backdrop" onMouseDown={onClose}>
      <div
        className="da-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[kind]}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 className="da-dialog__title">{TITLES[kind]}</h3>

        <button
          type="button"
          className="da-dialog__drop"
          disabled={busy}
          onClick={chooseFile}
        >
          <span className="da-dialog__drop-icon">
            {kind === 'image' ? <ImageIcon size={18} /> : <PlusIcon size={18} />}
          </span>
          <span className="da-dialog__drop-label">
            {busy ? 'Uploading…' : 'Choose from your device'}
          </span>
          <span className="da-dialog__drop-hint">
            Opens your gallery or file browser
          </span>
        </button>

        <div className="da-dialog__divider">
          <span>or paste a link</span>
        </div>

        <div className="da-dialog__row">
          <input
            ref={inputRef}
            type="url"
            className="da-dialog__input"
            placeholder={PLACEHOLDERS[kind]}
            value={url}
            disabled={busy}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitUrl();
              }
            }}
          />
        </div>

        {error && <p className="da-dialog__error">{error}</p>}

        <div className="da-dialog__actions">
          <button type="button" className="da-dialog__btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="da-dialog__btn da-dialog__btn--primary"
            disabled={!url.trim() || busy}
            onClick={submitUrl}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
