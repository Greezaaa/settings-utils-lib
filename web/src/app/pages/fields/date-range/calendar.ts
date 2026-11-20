export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface CalendarMonth {
  readonly title: string;
  readonly blanks: readonly number[];
  readonly days: readonly Date[];
}

export interface RangePreset {
  readonly label: string;
  readonly range: (today: Date) => DateRange;
}

const DAY_MS = 86_400_000;
const MONTH_TITLE = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const TYPED_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export const WEEKDAYS: readonly string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const sameDay = (a: Date | null, b: Date | null): boolean => !!a && !!b && a.getTime() === b.getTime();

export const ordered = (a: Date, b: Date): DateRange => (a <= b ? { start: a, end: b } : { start: b, end: a });

export const inRange = (day: Date, range: DateRange | null): boolean =>
  !!range && day >= range.start && day <= range.end;

export const daysIn = ({ start, end }: DateRange): number => Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;

export const monthOf = (first: Date): CalendarMonth => {
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  return {
    title: MONTH_TITLE.format(first),
    blanks: Array.from({ length: leading }, (_, index) => index),
    days: Array.from({ length: count }, (_, index) => addDays(first, index)),
  };
};

export const formatShort = (date: Date): string => SHORT_DATE.format(date);

export const formatTyped = (date: Date): string =>
  [date.getDate(), date.getMonth() + 1].map((part) => String(part).padStart(2, '0')).join('/') +
  `/${date.getFullYear()}`;

export const parseTyped = (text: string): Date | null => {
  const match = TYPED_DATE.exec(text.trim());
  if (!match) {
    return null;
  }
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 ? date : null;
};

export const RANGE_PRESETS: readonly RangePreset[] = [
  { label: 'Today', range: (today) => ({ start: today, end: today }) },
  { label: 'Next 7 days', range: (today) => ({ start: today, end: addDays(today, 6) }) },
  { label: 'Last 30 days', range: (today) => ({ start: addDays(today, -29), end: today }) },
  {
    label: 'This month',
    range: (today) => ({ start: addMonths(today, 0), end: addDays(addMonths(today, 1), -1) }),
  },
];
