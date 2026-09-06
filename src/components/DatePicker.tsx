import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * The 42 cells of a month grid: the target month plus the leading and trailing
 * days needed to fill whole weeks, so the grid never changes height between
 * months and the rows stay aligned as the user pages through.
 */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export interface DatePickerProps {
  /** ISO timestamp of the currently selected day, if any. */
  value?: string;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export function DatePicker({ value, onSelect, onClose }: DatePickerProps) {
  const selected = useMemo(() => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [value]);

  const [month, setMonth] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const ref = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  const days = useMemo(() => monthGrid(month), [month]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as globalThis.Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const shiftMonth = (delta: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <div
      ref={ref}
      className="da-datepicker"
      role="dialog"
      aria-label="Choose a date"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="da-datepicker__head">
        <button
          type="button"
          className="da-datepicker__nav"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeftIcon size={16} />
        </button>
        <span className="da-datepicker__month" aria-live="polite">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          className="da-datepicker__nav"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <div className="da-datepicker__weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day} className="da-datepicker__weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="da-datepicker__grid" role="grid">
        {days.map((day) => {
          const outside = day.getMonth() !== month.getMonth();
          const isSelected = selected ? sameDay(day, selected) : false;
          return (
            <button
              key={day.toISOString()}
              type="button"
              role="gridcell"
              className="da-datepicker__day"
              data-outside={outside || undefined}
              data-today={sameDay(day, today) || undefined}
              data-selected={isSelected || undefined}
              aria-selected={isSelected}
              onClick={() => {
                onSelect(day);
                onClose();
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="da-datepicker__foot">
        <button
          type="button"
          className="da-datepicker__today"
          onClick={() => {
            onSelect(today);
            onClose();
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
}
