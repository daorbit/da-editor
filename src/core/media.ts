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

/** The media kind a dropped or pasted file should become, from its MIME type. */
export function kindForFile(file: File): MediaKind {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
}

/**
 * Inserts dropped or pasted files, uploading each through the host's handler.
 *
 * Sequential rather than `Promise.all`: each insert moves the selection, and
 * concurrent uploads would resolve in arbitrary order and interleave the nodes
 * against the order the files were dropped in.
 */
export async function insertFiles(
  editor: DaEditor,
  files: readonly File[],
  onUpload?: UploadHandler,
): Promise<void> {
  for (const file of files) {
    const kind = kindForFile(file);
    try {
      const url = await resolveFileUrl(file, kind, onUpload);
      insertMedia(editor, kind, url, kind === 'file' ? { name: file.name } : {});
    } catch {
      // One failed upload should not abandon the rest of the drop.
    }
  }
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
