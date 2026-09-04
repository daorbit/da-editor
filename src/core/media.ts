import { Transforms } from 'slate';
import { ELEMENT, type DaEditor, type MediaKind, type UploadHandler } from './types';

const ELEMENT_FOR_KIND = {
  image: ELEMENT.image,
  video: ELEMENT.video,
  audio: ELEMENT.audio,
  file: ELEMENT.file,
  embed: ELEMENT.embed,
} as const;

/** File picker `accept` values, so a phone opens the right gallery. */
export const ACCEPT_FOR_KIND: Record<MediaKind, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  file: '*/*',
  embed: '*/*',
};

export function insertMedia(
  editor: DaEditor,
  kind: MediaKind,
  url: string,
  extra: { name?: string; caption?: string } = {},
): void {
  Transforms.insertNodes(editor, {
    type: ELEMENT_FOR_KIND[kind],
    url,
    ...extra,
    children: [{ text: '' }],
  });
  Transforms.insertNodes(editor, { type: ELEMENT.paragraph, children: [{ text: '' }] });
}

/**
 * Resolves a chosen file to a URL. Falls back to a local object URL when the
 * consumer supplies no upload handler, so the picker still works offline.
 */
export async function resolveFileUrl(
  file: File,
  kind: MediaKind,
  onUpload?: UploadHandler,
): Promise<string> {
  if (onUpload) return onUpload(file, kind);
  return URL.createObjectURL(file);
}

/** Opens the native file picker, which on mobile offers the device gallery. */
export function pickFile(kind: MediaKind): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT_FOR_KIND[kind];
    input.style.display = 'none';

    // `change` never fires when the dialog is dismissed, so also watch focus.
    const cleanup = () => {
      window.removeEventListener('focus', onFocus);
      input.remove();
    };
    const onFocus = () => {
      setTimeout(() => {
        if (!input.files?.length) {
          cleanup();
          resolve(null);
        }
      }, 300);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0] ?? null;
      cleanup();
      resolve(file);
    });

    document.body.append(input);
    window.addEventListener('focus', onFocus);
    input.click();
  });
}

const YOUTUBE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
const VIMEO = /vimeo\.com\/(\d+)/;

/** Normalizes a share URL to something embeddable in an iframe. */
export function toEmbedUrl(url: string): string {
  const youtube = url.match(YOUTUBE);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(VIMEO);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return url;
}

export function isEmbeddable(url: string): boolean {
  return YOUTUBE.test(url) || VIMEO.test(url);
}
