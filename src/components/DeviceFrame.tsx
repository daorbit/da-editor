import type { ReactNode } from 'react';

export type DeviceId = 'desktop' | 'tablet' | 'mobile';

export interface DeviceSpec {
  id: DeviceId;
  label: string;
  /** The device's real CSS viewport — what the page inside actually reflows against. */
  width: number;
  height: number;
  /** Chassis thickness around the screen, and any extra below it (a laptop's base). */
  bezel: number;
  chromeBelow: number;
}

// Labelled by the layout the content falls into rather than by a product name.
// Bezels mirror the padding in the stylesheet — a value that disagrees becomes
// dead space inside the measured frame.
export const DEVICE_SPECS: Record<DeviceId, DeviceSpec> = {
  desktop: { id: 'desktop', label: 'Desktop', width: 1152, height: 720, bezel: 9, chromeBelow: 14 },
  tablet: { id: 'tablet', label: 'Tablet', width: 834, height: 1120, bezel: 10, chromeBelow: 0 },
  mobile: { id: 'mobile', label: 'Mobile', width: 402, height: 874, bezel: 10, chromeBelow: 0 },
};

export const DEVICE_ORDER: DeviceId[] = ['desktop', 'tablet', 'mobile'];

/** Height of the strip holding the camera, above the screen. Mirrors the CSS margin-top. */
const CAMERA_STRIP = 14;

/** How far the laptop's base sticks out past its lid on each side. Mirrors the CSS. */
const BASE_OVERHANG = 26;

/**
 * Outer size of the whole mock, chassis included — what a fit-to-stage scale
 * measures against. These have to match the CSS exactly: any height the
 * stylesheet adds and this does not becomes dead space once centered.
 */
export function frameSize(device: DeviceId): { width: number; height: number } {
  const spec = DEVICE_SPECS[device];
  const cameraStrip = device === 'mobile' ? 0 : CAMERA_STRIP;
  const baseOverhang = device === 'desktop' ? BASE_OVERHANG * 2 : 0;
  return {
    width: spec.width + spec.bezel * 2 + baseOverhang,
    height: spec.height + spec.bezel * 2 + spec.chromeBelow + cameraStrip,
  };
}

interface Props {
  device: DeviceId;
  /** Shrinks the whole frame to fit; the page inside still renders at full size. */
  scale: number;
  /**
   * Laid out but not painted until `scale` has been measured — otherwise the
   * frame appears once at full size and overflows its stage. Hidden rather
   * than unrendered because the stage is measured against what is inside it.
   */
  hidden?: boolean;
  children: ReactNode;
}

/**
 * A hardware mock around the previewed page.
 *
 * The screen renders at the device's true CSS viewport and is then scaled to
 * fit. Scaling the frame rather than narrowing it is what keeps the preview
 * honest: a 402px-wide phone layout stays a phone layout.
 */
export function DeviceFrame({ device, scale, hidden, children }: Props) {
  const spec = DEVICE_SPECS[device];
  const size = frameSize(device);
  const screenStyle = { width: spec.width, height: spec.height };

  // Scaling shrinks paint but not layout, so the untransformed size would keep
  // reserving space. The wrapper takes the scaled size and the frame is pinned
  // inside it, which keeps the mock centered with no dead margin.
  return (
    <div
      className="da-device"
      style={{
        width: size.width * scale,
        height: size.height * scale,
        visibility: hidden ? 'hidden' : undefined,
      }}
    >
      <div
        className="da-device__inner"
        style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
      >
        {device === 'desktop' && (
          <div key="desktop" className="da-device__laptop da-device__chassis">
            <div className="da-device__lid">
              <div className="da-device__notch" />
              <div className="da-device__screen da-device__screen--laptop" style={screenStyle}>
                {children}
              </div>
            </div>
            <div className="da-device__base" />
          </div>
        )}

        {device === 'tablet' && (
          <div key="tablet" className="da-device__tablet da-device__chassis">
            <div className="da-device__camera" />
            <div className="da-device__screen da-device__screen--tablet" style={screenStyle}>
              {children}
            </div>
          </div>
        )}

        {device === 'mobile' && (
          <div key="mobile" className="da-device__phone da-device__chassis">
            <span className="da-device__btn-left da-device__btn-silence" />
            <span className="da-device__btn-left da-device__btn-vol-up" />
            <span className="da-device__btn-left da-device__btn-vol-down" />
            <span className="da-device__btn-right" />
            <div className="da-device__island" />
            <div className="da-device__screen da-device__screen--phone" style={screenStyle}>
              {children}
            </div>
            <div className="da-device__home" />
          </div>
        )}
      </div>
    </div>
  );
}
