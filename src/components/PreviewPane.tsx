import { useEffect, useMemo, useState } from 'react';
import {
  CloseIcon,
  CollapseIcon,
  ExpandIcon,
  MonitorIcon,
  PhoneIcon,
  TabletIcon,
} from '../icons';
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

 
const DEVICE_ICONS: Record<DeviceId, typeof MonitorIcon> = {
  desktop: MonitorIcon,
  tablet: TabletIcon,
  mobile: PhoneIcon,
};

export function PreviewPane({ onClose, value, title = 'Preview' }: PreviewPaneProps) {
  const [device, setDevice] = useState<DeviceId>('desktop');
  const [fullscreen, setFullscreen] = useState(false);

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
    // Escape leaves fullscreen before it closes the preview, so an expanded
    // preview does not vanish in one keystroke.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (fullscreen) setFullscreen(false);
      else onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [fullscreen]);

  return (
    <div
      className={`da-preview${fullscreen ? ' da-preview--fullscreen' : ''}`}
      role="region"
      aria-label={title}
    >
      <div className="da-preview__topbar">
        <span className="da-preview__title">{title}</span>

        <div className="da-preview__devices" role="group" aria-label="Preview device">
          {DEVICE_ORDER.map((id) => {
            const DeviceIcon = DEVICE_ICONS[id];
            return (
              <button
                key={id}
                type="button"
                className={`da-preview__device${device === id ? ' da-preview__device--active' : ''}`}
                aria-pressed={device === id}
                title={DEVICE_SPECS[id].label}
                aria-label={DEVICE_SPECS[id].label}
                onClick={() => setDevice(id)}
              >
                <DeviceIcon size={16} />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="da-preview__action"
          title={fullscreen ? 'Exit full screen' : 'Full screen'}
          aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
          aria-pressed={fullscreen}
          onClick={() => setFullscreen((current) => !current)}
        >
          {fullscreen ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
        </button>

        <button
          type="button"
          className="da-preview__action"
          title="Close preview"
          aria-label="Close preview"
          onClick={onClose}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="da-preview__stage" ref={stageRef}>
        <DeviceFrame device={device} scale={scale} hidden={!measured}>
          <div
            className="da-preview__page"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </DeviceFrame>
      </div>
    </div>
  );
}
