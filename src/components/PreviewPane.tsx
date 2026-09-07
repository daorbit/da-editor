import { useEffect, useMemo, useState } from 'react';
import { CloseIcon } from '../icons';
import { serializeHtml } from '../core/serialize';
import { useFitScale } from '../core/useFitScale';
import type { EditorValue } from '../core/types';
import { DEVICE_ORDER, DEVICE_SPECS, DeviceFrame, frameSize, type DeviceId } from './DeviceFrame';

export interface PreviewPaneProps {
  onClose: () => void;
  /** The document to render — the editor's live value, so edits show as typed. */
  value: EditorValue;
  title?: string;
}

/**
 * A live preview beside the editor, rendered from the same `serializeHtml`
 * output a save produces — so what the preview shows and what gets stored
 * cannot drift apart.
 *
 * The page renders inside a hardware frame at the device's true CSS width and
 * is then scaled to fit the pane, rather than being squeezed into whatever
 * width the pane has: a phone layout has to stay a phone layout to be worth
 * trusting, at any divider position.
 */
export function PreviewPane({ onClose, value, title = 'Preview' }: PreviewPaneProps) {
  const [device, setDevice] = useState<DeviceId>('desktop');

  const size = frameSize(device);
  const { ref: stageRef, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 32, y: 32 },
  });

  // Inline styles so the preview stands on its own, exactly as published HTML
  // does wherever the editor's stylesheet is not loaded.
  const html = useMemo(() => serializeHtml(value, { inlineStyles: true }), [value]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="da-preview" role="region" aria-label={title}>
      <div className="da-preview__topbar">
        <span className="da-preview__title">{title}</span>

        <div className="da-preview__devices" role="group" aria-label="Preview device">
          {DEVICE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className={`da-preview__device${device === id ? ' da-preview__device--active' : ''}`}
              aria-pressed={device === id}
              onClick={() => setDevice(id)}
            >
              {DEVICE_SPECS[id].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="da-preview__close"
          aria-label="Close preview"
          onClick={onClose}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {/* The frame is laid out from the first render so the stage has something
          to size against, and stays unpainted until that fit is measured. */}
      <div className="da-preview__stage" ref={stageRef}>
        <DeviceFrame device={device} scale={scale} hidden={!measured}>
          <div
            className="da-preview__page"
            // The HTML comes from this editor's own serializer, which drops
            // executable URL schemes and escapes text as it writes.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </DeviceFrame>
      </div>
    </div>
  );
}
