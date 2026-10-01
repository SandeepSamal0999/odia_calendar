import type { Lang } from './names';
import { getDay, PanchangDay, shiftDate } from './panchang';

/** Muhurat timings derived from sunrise/sunset (IST). Times are "YYYY-MM-DDTHH:MM" like the dataset. */

const IST_MS = 330 * 60000;
const toMs = (iso: string) => Date.parse(`${iso}:00+05:30`);
const toIso = (ms: number) => new Date(ms + IST_MS).toISOString().slice(0, 16);

export type Quality = 'best' | 'good' | 'neutral' | 'bad';

export interface Slot {
  start: string;
  end: string;
}

export interface Choghadiya extends Slot {
  name: Record<Lang, string>;
  quality: Quality;
}

const CHOGHADIYA: Record<string, { name: Record<Lang, string>; quality: Quality }> = {
  udveg: { name: { en: 'Udveg', or: 'ଉଦ୍‌ବେଗ' }, quality: 'bad' },
  char: { name: { en: 'Char', or: 'ଚର' }, quality: 'neutral' },
  labh: { name: { en: 'Labh', or: 'ଲାଭ' }, quality: 'good' },
  amrit: { name: { en: 'Amrit', or: 'ଅମୃତ' }, quality: 'best' },
  kaal: { name: { en: 'Kaal', or: 'କାଳ' }, quality: 'bad' },
  shubh: { name: { en: 'Shubh', or: 'ଶୁଭ' }, quality: 'good' },
  rog: { name: { en: 'Rog', or: 'ରୋଗ' }, quality: 'bad' },
};
const DAY_CYCLE = ['udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog'];
const NIGHT_CYCLE = ['shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg'];
/** First choghadiya of the day / night, by weekday (Sun..Sat). */
const DAY_START = ['udveg', 'amrit', 'rog', 'labh', 'shubh', 'char', 'kaal'];
const NIGHT_START = ['shubh', 'char', 'kaal', 'udveg', 'amrit', 'rog', 'labh'];

/** Which eighth of daytime (1-based) each period falls in, by weekday (Sun..Sat). */
const YAMAGANDA = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

export interface Muhurat {
  rahuKaal: Slot;
  yamaganda: Slot;
  gulika: Slot;
  abhijit: Slot;
  brahma: Slot;
  day: Choghadiya[];
  night: Choghadiya[];
}

function slices(startMs: number, endMs: number, cycle: string[], first: string): Choghadiya[] {
  const part = (endMs - startMs) / 8;
  const offset = cycle.indexOf(first);
  return Array.from({ length: 8 }, (_, i) => ({
    ...CHOGHADIYA[cycle[(offset + i) % 7]],
    start: toIso(startMs + part * i),
    end: toIso(startMs + part * (i + 1)),
  }));
}

export function muhuratFor(day: PanchangDay): Muhurat {
  const sunrise = toMs(day.sunrise);
  const sunset = toMs(day.sunset);
  const dayPart = (sunset - sunrise) / 8;
  const eighth = (n: number): Slot => ({
    start: toIso(sunrise + dayPart * (n - 1)),
    end: toIso(sunrise + dayPart * n),
  });

  // Neighbouring days bound the nights; at the ends of the year assume a symmetric night.
  const prev = getDay(shiftDate(day.date, -1));
  const next = getDay(shiftDate(day.date, 1));
  const nightLen = 86400000 - (sunset - sunrise);
  const prevSunset = prev ? toMs(prev.sunset) : sunrise - nightLen;
  const nextSunrise = next ? toMs(next.sunrise) : sunset + nightLen;
  const nightMuhurta = (sunrise - prevSunset) / 15;

  return {
    // The dataset's value is computed from unrounded times; use it so all screens agree.
    rahuKaal: { start: day.rahuKaal[0], end: day.rahuKaal[1] },
    yamaganda: eighth(YAMAGANDA[day.weekday]),
    gulika: eighth(GULIKA[day.weekday]),
    abhijit: { start: day.abhijit[0], end: day.abhijit[1] },
    brahma: { start: toIso(sunrise - 2 * nightMuhurta), end: toIso(sunrise - nightMuhurta) },
    day: slices(sunrise, sunset, DAY_CYCLE, DAY_START[day.weekday]),
    night: slices(sunset, nextSunrise, NIGHT_CYCLE, NIGHT_START[day.weekday]),
  };
}

export const isNow = (slot: Slot, now = Date.now()) => now >= toMs(slot.start) && now < toMs(slot.end);

export const QUALITY_LABEL: Record<Quality, Record<Lang, string>> = {
  best: { en: 'Best', or: 'ଉତ୍ତମ' },
  good: { en: 'Good', or: 'ଶୁଭ' },
  neutral: { en: 'Neutral', or: 'ସାଧାରଣ' },
  bad: { en: 'Avoid', or: 'ଅଶୁଭ' },
};
