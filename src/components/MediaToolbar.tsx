import { useCallback, useEffect, useRef, useState } from 'react';
import { Element as SlateElement, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  CheckIcon,
  CloseIcon,
  CropIcon,
  TrashIcon,
} from '../icons';
import { ELEMENT, type DaEditor } from '../core/types';
import { useDismissOnOutside } from '../core/useDismiss';

const MEDIA_TYPES = [
  ELEMENT.image,
  ELEMENT.video,
  ELEMENT.audio,
  ELEMENT.file,
  ELEMENT.embed,
] as const;

type EditingField = 'url' | 'caption' | null;

const RADII = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'full', label: 'Full' },
] as const;

const BORDERS = [
  { value: 'none', label: 'None' },
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Bold' },
] as const;

const SHADOWS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Soft' },
  { value: 'lg', label: 'Deep' },
] as const;

const ASPECTS = [
  { value: '', label: 'Free' },
  { value: '1/1', label: '1:1' },
  { value: '4/3', label: '4:3' },
  { value: '16/9', label: '16:9' },
  { value: '3/1', label: '3:1' },
] as const;

/** Floating controls for the selected media block. */
export function MediaToolbar() {
  const editor = useSlate() as DaEditor;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [editing, setEditing] = useState<EditingField>(null);
  const [showStyle, setShowStyle] = useState(false);
  const [draft, setDraft] = useState('');

  const [match] = Array.from(
    editor.nodes({
      match: (n) =>
        SlateElement.isElement(n) &&
        (MEDIA_TYPES as readonly string[]).includes(n.type),
    }),
  );
  const [dismissed, setDismissed] = useState(false);
  const entry = dismissed ? undefined : match;

  const dismiss = useCallback(() => {
    setEditing(null);
    setShowStyle(false);
    setDismissed(true);
  }, []);

  useDismissOnOutside(ref, Boolean(entry), dismiss);

  const key = match ? JSON.stringify(match[1]) : null;
  useEffect(() => {
    setDismissed(false);
  }, [key]);

  useEffect(() => {
    if (!entry) {
      setEditing(null);
      setShowStyle(false);
    }
  }, [entry]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const entryKey = entry ? JSON.stringify(entry[1]) : null;
  useEffect(() => {
    const el = ref.current;
    if (!el || !entry) {
      setPosition(null);
      return;
    }

    const place = () => {
      try {
        const rect = ReactEditor.toDOMNode(editor, entry[0]).getBoundingClientRect();
        const base = (el.offsetParent as HTMLElement | null)?.getBoundingClientRect();
        setPosition({
          top: rect.bottom - (base?.top ?? 0) + 8,
          left: Math.max(
            4,
            rect.left - (base?.left ?? 0) + rect.width / 2 - el.offsetWidth / 2,
          ),
        });
      } catch {
        setPosition(null);
      }
    };

    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener('scroll', place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', place, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, entryKey, editing, showStyle]);

  if (!entry) return null;

  const [node, path] = entry;
  if (!SlateElement.isElement(node)) return null;

  const isImage = node.type === ELEMENT.image;
  const url = 'url' in node ? node.url : '';
  const caption = 'caption' in node && node.caption ? node.caption : '';
  const radius = 'radius' in node ? node.radius : undefined;
  const border = 'border' in node ? node.border : undefined;
  const shadow = 'shadow' in node ? node.shadow : undefined;
  const aspect = 'aspect' in node ? node.aspect : undefined;
  const fit = 'fit' in node ? node.fit : undefined;
  const align = node.align ?? 'left';

  const set = (props: Record<string, unknown>) =>
    Transforms.setNodes(editor, props, { at: path });

  const startEditing = (field: EditingField) => {
    setDraft(field === 'url' ? url : caption);
    setShowStyle(false);
    setEditing(field);
  };

  const apply = () => {
    if (editing === 'url') {
      const trimmed = draft.trim();
      if (trimmed) set({ url: trimmed });
    } else if (editing === 'caption') {
      set({ caption: draft.trim() || undefined });
    }
    setEditing(null);
  };

  return (
    <div
      ref={ref}
      className="da-media-toolbar"
      role="toolbar"
      aria-label="Media"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {editing ? (
        <div className="da-media-toolbar__row">
          <input
            ref={inputRef}
            className="da-media-toolbar__input"
            value={draft}
            placeholder={editing === 'url' ? 'Paste or type a link…' : 'Caption'}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setEditing(null);
              }
            }}
          />
          <button
            type="button"
            className="da-media-toolbar__btn da-media-toolbar__btn--icon"
            title="Apply"
            aria-label="Apply"
            onClick={apply}
          >
            <CheckIcon size={15} />
          </button>
          <button
            type="button"
            className="da-media-toolbar__btn da-media-toolbar__btn--icon"
            title="Cancel"
            aria-label="Cancel"
            onClick={() => setEditing(null)}
          >
            <CloseIcon size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="da-media-toolbar__row">
            {isImage && (
              <>
                <button
                  type="button"
                  className={`da-media-toolbar__btn da-media-toolbar__btn--icon${
                    align === 'left' ? ' da-media-toolbar__btn--on' : ''
                  }`}
                  title="Align left"
                  aria-label="Align left"
                  onClick={() => set({ align: undefined })}
                >
                  <AlignLeftIcon size={15} />
                </button>
                <button
                  type="button"
                  className={`da-media-toolbar__btn da-media-toolbar__btn--icon${
                    align === 'center' ? ' da-media-toolbar__btn--on' : ''
                  }`}
                  title="Align centre"
                  aria-label="Align centre"
                  onClick={() => set({ align: 'center' })}
                >
                  <AlignCenterIcon size={15} />
                </button>
                <button
                  type="button"
                  className={`da-media-toolbar__btn da-media-toolbar__btn--icon${
                    align === 'right' ? ' da-media-toolbar__btn--on' : ''
                  }`}
                  title="Align right"
                  aria-label="Align right"
                  onClick={() => set({ align: 'right' })}
                >
                  <AlignRightIcon size={15} />
                </button>
                <span className="da-tb__sep" />
                <button
                  type="button"
                  className={`da-media-toolbar__btn${showStyle ? ' da-media-toolbar__btn--on' : ''}`}
                  onClick={() => setShowStyle((v) => !v)}
                >
                  Style
                </button>
              </>
            )}

            <button
              type="button"
              className="da-media-toolbar__btn"
              onClick={() => startEditing('url')}
            >
              Edit link
            </button>
            <button
              type="button"
              className="da-media-toolbar__btn"
              onClick={() => startEditing('caption')}
            >
              Caption
            </button>

            <span className="da-tb__sep" />

            <button
              type="button"
              className="da-media-toolbar__btn da-media-toolbar__btn--icon"
              title="Delete"
              aria-label="Delete"
              onClick={() => Transforms.removeNodes(editor, { at: path })}
            >
              <TrashIcon size={15} />
            </button>
          </div>

          {isImage && showStyle && (
            <div className="da-media-toolbar__panel">
              <ChoiceRow
                label="Radius"
                options={RADII}
                value={radius ?? 'none'}
                onChange={(v) => set({ radius: v === 'none' ? undefined : v })}
              />
              <ChoiceRow
                label="Border"
                options={BORDERS}
                value={border ?? 'none'}
                onChange={(v) => set({ border: v === 'none' ? undefined : v })}
              />
              <ChoiceRow
                label="Shadow"
                options={SHADOWS}
                value={shadow ?? 'none'}
                onChange={(v) => set({ shadow: v === 'none' ? undefined : v })}
              />
              <ChoiceRow
                label={
                  <span className="da-media-toolbar__croplabel">
                    <CropIcon size={13} /> Crop
                  </span>
                }
                options={ASPECTS}
                value={aspect ?? ''}
                onChange={(v) => set({ aspect: v || undefined })}
              />
              {aspect && (
                <ChoiceRow
                  label="Fit"
                  options={[
                    { value: 'cover', label: 'Fill' },
                    { value: 'contain', label: 'Contain' },
                  ]}
                  value={fit ?? 'cover'}
                  onChange={(v) => set({ fit: v })}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: React.ReactNode;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="da-media-toolbar__choice">
      <span className="da-media-toolbar__choicelabel">{label}</span>
      <div className="da-media-toolbar__choices">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`da-media-toolbar__chip${
              option.value === value ? ' da-media-toolbar__chip--on' : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
