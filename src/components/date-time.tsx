"use client";

import { format, isValid, parse, startOfToday } from "date-fns";
import { CalendarDays, ChevronDown, Clock, X } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { enGB } from "react-day-picker/locale";
import "react-day-picker/style.css";

const ISO = "yyyy-MM-dd";
const toDate = (s?: string | null) => {
  const d = s ? parse(s, ISO, new Date()) : undefined;
  return d && isValid(d) ? d : undefined;
};

// A button that shows the date in words and opens a calendar.
// Submits the value as yyyy-MM-dd under `name`, like a native date input.
export function DateField({
  name,
  initial,
  min,
  required = false,
  placeholder = "Choose a date",
  onChange,
}: {
  name: string;
  initial?: string | null;
  min?: string | null;
  required?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = toDate(value);
  const earliest = toDate(min) ?? startOfToday();

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const set = (v: string) => {
    setValue(v);
    onChange?.(v);
  };

  return (
    <div ref={root} className="relative">
      {/* Visually hidden but focusable, so the browser's "required" check still works. */}
      <input name={name} value={value} required={required} onChange={() => {}} tabIndex={-1} aria-hidden className="sr-only" />
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center gap-3 text-left ${open ? "border-purple" : ""}`}
      >
        <CalendarDays aria-hidden className="h-5 w-5 shrink-0 text-purple" />
        <span className={`flex-1 ${selected ? "" : "text-muted"}`}>{selected ? format(selected, "EEE, d MMM yyyy") : placeholder}</span>
        <ChevronDown aria-hidden className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {selected && !required && (
        <button type="button" onClick={() => set("")} aria-label="Clear date" className="absolute right-12 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-purple-soft hover:text-ink">
          <X aria-hidden className="h-4 w-4" />
        </button>
      )}
      {open && (
        <div role="dialog" aria-label="Choose a date" className="card pop-in absolute left-0 top-full z-30 mt-2 p-3 shadow-xl">
          <DayPicker
            mode="single"
            locale={enGB}
            autoFocus
            selected={selected}
            defaultMonth={selected ?? earliest}
            startMonth={earliest}
            disabled={{ before: earliest }}
            onSelect={(d) => {
              if (d) set(format(d, ISO));
              setOpen(false);
              trigger.current?.focus();
            }}
            className="fiat-calendar"
          />
        </div>
      )}
    </div>
  );
}

// Times every 15 minutes, shown as "10:30 am". Submits "HH:mm".
const TIMES = Array.from({ length: (22 - 6) * 4 + 1 }, (_, i) => {
  const mins = 6 * 60 + i * 15;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});
export const timeLabel = (t: string) => format(parse(t, "HH:mm", new Date()), "h:mm a").toLowerCase();

// Uncontrolled with `initial`, or controlled with `value` + `onChange`.
export function TimeSelect({ name, initial, value, onChange }: { name: string; initial?: string | null; value?: string; onChange?: (value: string) => void }) {
  const current = value ?? initial;
  const options = current && !TIMES.includes(current) ? [...TIMES, current].sort() : TIMES;
  const control = value === undefined ? { defaultValue: initial ?? "10:00" } : { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value) };
  return (
    <Select name={name} {...control} required icon={<Clock aria-hidden className="h-5 w-5 text-purple" />}>
      {options.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}
    </Select>
  );
}

// Native select (good on phones) with our input styling and a chevron.
export function Select({ icon, className = "", ...props }: ComponentProps<"select"> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>}
      <select {...props} className={`input cursor-pointer appearance-none pr-12 ${icon ? "pl-12" : ""} ${className}`} />
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
    </div>
  );
}
