const MS_PER_DAY = 86400000;

export function minutesFromDayStart(
  referenceHour: number,
  h: number,
  m: number
): number {
  let total = 0;
  for (let hour = referenceHour; hour < h; hour += 1) {
    total += 60;
  }
  total += m;
  return total;
}

export type MonthCell = {
  date: Date;
  inCurrentMonth: boolean;
};

/**
 * Renders a month grid; weeks start on Monday. Includes leading/trailing days
 * to fill 6 weeks (42 cells) for stable layout.
 */
export function getMonthGridCells(year: number, month0: number): MonthCell[] {
  const first = new Date(year, month0, 1);
  const back = (first.getDay() + 6) % 7; // 0=Mon
  const start = new Date(first.getTime() - back * MS_PER_DAY);
  const out: MonthCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start.getTime() + i * MS_PER_DAY);
    out.push({ date: d, inCurrentMonth: d.getMonth() === month0 });
  }
  return out;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
export { WEEKDAYS };

export function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
