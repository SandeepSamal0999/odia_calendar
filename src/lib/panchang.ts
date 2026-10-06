import data from '../data/panchang-2026.json';
import {
  AMAVASYA,
  GREGORIAN_MONTHS,
  LABELS,
  Lang,
  LUNAR_MONTHS,
  ODIA_COUNT_WORDS,
  ODIA_SOLAR_MONTHS,
  PAKSHA,
  TITHIS,
} from './names';

export type FestivalType = 'festival' | 'holiday' | 'vrat' | 'sankranti';

export interface Festival {
  id: string;
  date: string;
  en: string;
  or: string;
  type: FestivalType;
}

interface Timed {
  n: number;
  end: string | null;
}

export interface PanchangDay {
  date: string;
  weekday: number;
  odia: { month: number; day: number };
  lunar: { amanta: number; purnimanta: number; adhika: boolean; paksha: 'S' | 'K' };
  tithi: Timed;
  nakshatra: Timed;
  yoga: Timed;
  karana: number;
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  sunRashi: number;
  moonRashi: Timed;
  abhijit: [string, string];
  rahuKaal: [string, string];
  sankranti?: { rashi: number; at: string };
  festivals: string[];
}

export const YEAR: number = data.year;
export const LOCATION = data.location;
export const DAYS = data.days as PanchangDay[];
const TYPE_ORDER: FestivalType[] = ['holiday', 'festival', 'sankranti', 'vrat'];

/**
 * Festivals sorted by date (holidays first within a day). The festival list is the
 * single source of truth: festivals are matched to days by `date`, so entries edited
 * by hand in the JSON show up without updating each day's `festivals` ids.
 */
export const FESTIVALS = [...(data.festivals as Festival[])].sort(
  (a, b) => a.date.localeCompare(b.date) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type),
);

const dayIndex = new Map(DAYS.map((d) => [d.date, d]));
const festivalsByDate = new Map<string, Festival[]>();
for (const f of FESTIVALS) festivalsByDate.set(f.date, [...(festivalsByDate.get(f.date) ?? []), f]);

export const getDay = (date: string) => dayIndex.get(date);
export const festivalsOn = (day: PanchangDay) => festivalsByDate.get(day.date) ?? [];
export const isMajor = (f: Festival) => f.type === 'holiday' || f.type === 'festival';

/** Days of a Gregorian month (0-based month). */
export function daysInMonth(month: number): PanchangDay[] {
  const prefix = `${YEAR}-${String(month + 1).padStart(2, '0')}-`;
  return DAYS.filter((d) => d.date.startsWith(prefix));
}

export function festivalsInMonth(month: number): Festival[] {
  const prefix = `${YEAR}-${String(month + 1).padStart(2, '0')}-`;
  return FESTIVALS.filter((f) => f.date.startsWith(prefix));
}

// ---------- dates ----------

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Today's date key, clamped into the supported year. */
export function todayKey(): string {
  const key = dateKey(new Date());
  if (key < `${YEAR}-01-01`) return `${YEAR}-01-01`;
  if (key > `${YEAR}-12-31`) return `${YEAR}-12-31`;
  return key;
}

export function shiftDate(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}

export const parts = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
};

// ---------- formatting ----------

const ODIA_DIGITS = '୦୧୨୩୪୫୬୭୮୯';
export const odiaNum = (n: number | string) => String(n).replace(/\d/g, (c) => ODIA_DIGITS[Number(c)]);
export const num = (n: number | string, lang: Lang) => (lang === 'or' ? odiaNum(n) : String(n));
export const label = (key: keyof typeof LABELS, lang: Lang) => LABELS[key][lang];

export function tithiName(n: number, lang: Lang): string {
  if (n === 30) return AMAVASYA[lang];
  if (n === 15) return TITHIS[lang][14];
  return TITHIS[lang][(n - 1) % 15];
}

/** "Ashwina 14" — the Odia solar date. */
export function odiaDate(day: PanchangDay, lang: Lang): string {
  const month = ODIA_SOLAR_MONTHS[lang][day.odia.month];
  return lang === 'or' ? `${month} ${odiaNum(day.odia.day)} ଦିନ` : `${month} ${day.odia.day}`;
}

/** "ଆଶ୍ୱିନ ଅନ୍ଧାର ଦୁଇ ଦିନ" / "Ashwina Krishna Dwitiya" — the purnimanta lunar day. */
export function lunarDate(day: PanchangDay, lang: Lang): string {
  const { purnimanta, paksha, adhika } = day.lunar;
  const month = (adhika ? `${LABELS.adhika[lang]} ` : '') + LUNAR_MONTHS[lang][purnimanta];
  const t = day.tithi.n;
  if (t === 15 || t === 30) return `${month} ${tithiName(t, lang)}`;
  const inPaksha = ((t - 1) % 15) + 1;
  if (lang === 'or') return `${month} ${PAKSHA.or[paksha]} ${ODIA_COUNT_WORDS[inPaksha - 1]} ଦିନ`;
  return `${month} ${PAKSHA.en[paksha]} ${tithiName(t, lang)}`;
}

/** { month: "Ashwina Krishna", tithi: "Chaturthi" } — formal lunar-day name, split for display. */
export function lunarTithi(day: PanchangDay, lang: Lang): { month: string; tithi: string } {
  const { purnimanta, paksha, adhika } = day.lunar;
  const month = (adhika ? `${LABELS.adhika[lang]} ` : '') + LUNAR_MONTHS[lang][purnimanta];
  const t = day.tithi.n;
  const pakshaName = lang === 'or' ? (paksha === 'S' ? 'ଶୁକ୍ଳ' : 'କୃଷ୍ଣ') : PAKSHA.en[paksha];
  return { month: t === 15 || t === 30 ? month : `${month} ${pakshaName}`, tithi: tithiName(t, lang) };
}

/** "05:37 AM" or Odia "ସକାଳ ୦୫:୩୭". */
export function formatTime(iso: string | null, lang: Lang): string {
  if (!iso) return LABELS.none[lang];
  const [h, m] = iso.slice(11, 16).split(':').map(Number);
  const h12 = pad(((h + 11) % 12) + 1);
  if (lang === 'en') return `${h12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
  const period = h < 4 ? 'ରାତି' : h < 12 ? 'ସକାଳ' : h < 16 ? 'ଦିନ' : h < 19 ? 'ସନ୍ଧ୍ୟା' : 'ରାତି';
  return `${period} ${odiaNum(`${h12}:${pad(m)}`)}`;
}

/** "until 02:56 PM" / "until 02:26 AM (next day)", relative to `date`. */
export function untilText(end: string | null, date: string, lang: Lang): string {
  if (!end) return '';
  const nextDay = end.slice(0, 10) > date;
  const time = formatTime(end, lang) + (nextDay ? ` (${LABELS.nextDay[lang]})` : '');
  return lang === 'or' ? `${time} ${LABELS.until.or}` : `${LABELS.until.en} ${time}`;
}

export const abhijitText = (day: PanchangDay, lang: Lang) =>
  `${formatTime(day.abhijit[0], lang)} – ${formatTime(day.abhijit[1], lang)}`;

export function gregorianLong(key: string, lang: Lang): string {
  const { year, month, day } = parts(key);
  const m = GREGORIAN_MONTHS[lang][month];
  return lang === 'or' ? `${m} ${odiaNum(day)}, ${odiaNum(year)}` : `${m} ${day}, ${year}`;
}

export const festivalName = (f: Festival, lang: Lang) => (lang === 'or' ? f.or : f.en);
