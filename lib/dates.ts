// All "days" in the app are Stockholm calendar days, regardless of server TZ.
export const TZ = "Europe/Stockholm";

/** YYYY-MM-DD for the given instant in Stockholm. */
export function stockholmDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** HH:MM in Stockholm. */
export function stockholmTime(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function stockholmHour(d: Date = new Date()): number {
  return Number(stockholmTime(d).slice(0, 2));
}

/** Parse YYYY-MM-DD as a UTC-midnight date for pure calendar arithmetic. */
function parse(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const d = parse(date);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000);
}

/** Monday of the ISO week containing date. */
export function weekStart(date: string): string {
  const d = parse(date);
  const dow = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - dow);
  return fmt(d);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(date: string): number {
  return (parse(date).getUTCDay() + 6) % 7;
}

const WEEKDAYS = ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"];
const WEEKDAYS_SHORT = ["M", "T", "O", "T", "F", "L", "S"];
const MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
const MONTHS_SHORT = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export function weekdayName(date: string): string {
  return WEEKDAYS[weekdayIndex(date)];
}
export function weekdayShort(i: number): string {
  return WEEKDAYS_SHORT[i];
}

/** "torsdag 12 november" */
export function longDate(date: string): string {
  const d = parse(date);
  return `${weekdayName(date)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "12 nov" */
export function shortDate(date: string): string {
  const d = parse(date);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

export function greeting(d: Date = new Date()): string {
  const h = stockholmHour(d);
  if (h < 5) return "God natt";
  if (h < 10) return "God morgon";
  if (h < 17) return "Hej";
  return "God kväll";
}
