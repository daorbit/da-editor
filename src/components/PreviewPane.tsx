import { useEffect, useMemo, useState } from 'react';
import {
  DeviceFrame,
  frameSize,
  getDevice,
  useFitScale,
  type DeviceId,
} from 'da-frame-set';
import {
  CloseIcon,
  CollapseIcon,
  ExpandIcon,
  MonitorIcon,
  PhoneIcon,
  TabletIcon,
} from '../icons';
import { serializeHtml } from '../core/serialize';
import type { EditorValue } from '../core/types';

export interface PreviewPaneProps {
  onClose: () => void;
  value: EditorValue;
  title?: string;
}

/* The three viewports the preview offers, labelled by the layout the content
   falls into rather than by a product name. Each id is a da-frame-set device. */
const PREVIEW_DEVICES: { id: DeviceId; label: string; icon: typeof MonitorIcon }[] = [
  { id: 'macbook-pro-16', label: 'Desktop', icon: MonitorIcon },
  { id: 'ipad-air', label: 'Tablet', icon: TabletIcon },
  { id: 'iphone-pro', label: 'Mobile', icon: PhoneIcon },
];

export function PreviewPane({ onClose, value, title = 'Preview' }: PreviewPaneProps) {
  const [device, setDevice] = useState<DeviceId>('macbook-pro-16');
  const [fullscreen, setFullscreen] = useState(false);

  const size = frameSize(getDevice(device));
  const { ref: stageRef, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    // Mirrors `.da-preview__stage`'s padding on both axes.
    padding: { x: 24, y: 24 },
  });

  const html = useMemo(() => serializeHtml(value, { inlineStyles: true }), [value]);

  useEffect(() => {
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
          {PREVIEW_DEVICES.map(({ id, label, icon: DeviceIcon }) => (
            <button
              key={id}
              type="button"
              className={`da-preview__device${device === id ? ' da-preview__device--active' : ''}`}
              aria-pressed={device === id}
              title={label}
              aria-label={label}
              onClick={() => setDevice(id)}
            >
              <DeviceIcon size={16} />
            </button>
          ))}
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
