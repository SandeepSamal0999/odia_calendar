/**
 * Generates src/data/panchang-2026.json — the per-day Panchang and festival
 * dataset the app ships with.
 *
 *   npm run generate:data
 *
 * Everything is computed for Cuttack, Odisha (IST) using sidereal (Lahiri)
 * positions, the Odia solar-month rule (month starts on the civil day of the
 * Sankranti) and purnimanta lunar months. Festival dates are derived from
 * their tithi / sankranti rules; fixed-date observances and any corrections
 * from the printed Panjika go in FIXED_FESTIVALS / OVERRIDES below.
 */
import * as Astronomy from 'astronomy-engine';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const YEAR = 2026;
const LOCATION = { name: 'Cuttack', lat: 20.4625, lon: 85.883, elevation: 30 };
const IST_OFFSET_MIN = 330;
const observer = new Astronomy.Observer(LOCATION.lat, LOCATION.lon, LOCATION.elevation);

// ---------- time helpers (all "local" values are IST) ----------

const pad = (n: number) => String(n).padStart(2, '0');

/** Date for an IST wall-clock time. */
function istDate(y: number, m: number, d: number, hh = 0, mm = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MIN * 60000);
}

/** "YYYY-MM-DDTHH:MM" in IST. */
function toIst(date: Date): string {
  const t = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
}

const istDay = (date: Date) => toIst(date).slice(0, 10);

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

// ---------- astronomy ----------

const norm = (a: number) => ((a % 360) + 360) % 360;

/** Lahiri ayanamsa (degrees). */
function ayanamsa(date: Date): number {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  return 23.85306 + 1.396971 * T + 0.000308 * T * T;
}

const sunSid = (d: Date) => norm(Astronomy.SunPosition(d).elon - ayanamsa(d));
const moonSid = (d: Date) => norm(Astronomy.EclipticGeoMoon(d).lon - ayanamsa(d));
const elongation = (d: Date) => Astronomy.MoonPhase(d); // moon − sun, 0..360
const yogaAngle = (d: Date) => norm(sunSid(d) + moonSid(d));

/** First moment after `start` where the (increasing) angle fn reaches `target`. */
function findCrossing(fn: (d: Date) => number, target: number, start: Date, maxHours = 72): Date | null {
  const delta = (d: Date) => ((fn(d) - target + 540) % 360) - 180;
  const step = 30 * 60000;
  let a = start;
  let da = delta(a);
  for (let t = start.getTime() + step; t <= start.getTime() + maxHours * 3600000; t += step) {
    const b = new Date(t);
    const db = delta(b);
    if (da < 0 && db >= 0) {
      let lo = a.getTime();
      let hi = b.getTime();
      while (hi - lo > 20000) {
        const mid = (lo + hi) / 2;
        if (delta(new Date(mid)) < 0) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    a = b;
    da = db;
  }
  return null;
}

function riseSet(body: Astronomy.Body, dir: 1 | -1, dayStart: Date): Date | null {
  const t = Astronomy.SearchRiseSet(body, observer, dir, dayStart, 1);
  if (!t) return null;
  return t.date.getTime() < dayStart.getTime() + 86400000 ? t.date : null;
}

const tithiAt = (d: Date) => Math.floor(elongation(d) / 12) + 1; // 1..30
const nakshatraAt = (d: Date) => Math.floor(moonSid(d) / (360 / 27)) + 1; // 1..27
const yogaAt = (d: Date) => Math.floor(yogaAngle(d) / (360 / 27)) + 1; // 1..27
const rashiOf = (lon: number) => Math.floor(lon / 30); // 0 = Mesha

/** Karana index into KARANAS (0..10). */
function karanaAt(d: Date): number {
  const k = Math.floor(elongation(d) / 6); // 0..59
  if (k === 0) return 10; // Kimstughna
  if (k >= 57) return 7 + (k - 57); // Shakuni, Chatushpada, Naga
  return (k - 1) % 7;
}

// ---------- new moons → lunar months ----------

interface LunarMonth {
  start: Date;
  end: Date;
  /** 0 = Chaitra … 11 = Phalguna (amanta naming). */
  name: number;
  adhika: boolean;
}

function buildLunarMonths(from: Date, to: Date): LunarMonth[] {
  const newMoons: Date[] = [];
  let t: Date = from;
  while (t < to) {
    const nm = Astronomy.SearchMoonPhase(0, t, 40)!;
    newMoons.push(nm.date);
    t = new Date(nm.date.getTime() + 86400000);
  }
  const months: LunarMonth[] = [];
  for (let i = 0; i + 1 < newMoons.length; i++) {
    const r0 = rashiOf(sunSid(newMoons[i]));
    const r1 = rashiOf(sunSid(newMoons[i + 1]));
    months.push({ start: newMoons[i], end: newMoons[i + 1], name: (r0 + 1) % 12, adhika: r0 === r1 });
  }
  return months;
}

// ---------- sankrantis → Odia solar date ----------

interface Sankranti {
  at: Date;
  day: string;
  rashi: number;
}

function buildSankrantis(from: Date, to: Date): Sankranti[] {
  const list: Sankranti[] = [];
  let t = from;
  while (t < to) {
    const next = (Math.floor(sunSid(t) / 30) + 1) % 12;
    const at = findCrossing(sunSid, next * 30, t, 24 * 33)!;
    list.push({ at, day: istDay(at), rashi: next });
    t = new Date(at.getTime() + 3600000);
  }
  return list;
}

// ---------- build days ----------

const rangeStart = istDate(YEAR - 1, 11, 1);
const rangeEnd = istDate(YEAR + 1, 2, 28);
const lunarMonths = buildLunarMonths(istDate(YEAR - 1, 10, 1), istDate(YEAR + 1, 3, 31));
const sankrantis = buildSankrantis(istDate(YEAR - 1, 10, 1), istDate(YEAR + 1, 3, 31));

const monthAt = (d: Date) => lunarMonths.find((m) => d >= m.start && d < m.end)!;

interface Sample {
  tithi: number;
  month: LunarMonth;
}

interface Day {
  date: string;
  weekday: number;
  odia: { month: number; day: number }; // month: 0 = Baisakha (sun in Mesha)
  lunar: { amanta: number; purnimanta: number; adhika: boolean; paksha: 'S' | 'K' };
  tithi: { n: number; end: string | null };
  nakshatra: { n: number; end: string | null };
  yoga: { n: number; end: string | null };
  karana: number;
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  sunRashi: number;
  moonRashi: { n: number; end: string | null };
  abhijit: [string, string];
  rahuKaal: [string, string];
  sankranti?: { rashi: number; at: string };
  festivals: string[];
  samples: { sunrise: Sample; midday: Sample; aparahna: Sample; sunset: Sample; midnight: Sample };
}

const RAHU_SEGMENT = [8, 2, 7, 5, 6, 4, 3]; // 1-based eighth of daytime, Sun..Sat

const days: Day[] = [];
for (let key = istDay(rangeStart); key <= istDay(rangeEnd); key = addDays(key, 1)) {
  const [y, m, d] = key.split('-').map(Number);
  const dayStart = istDate(y, m, d);
  const sunrise = riseSet(Astronomy.Body.Sun, 1, dayStart)!;
  const sunset = riseSet(Astronomy.Body.Sun, -1, dayStart)!;
  const dayLen = sunset.getTime() - sunrise.getTime();
  const midday = new Date(sunrise.getTime() + dayLen / 2);
  const aparahna = new Date(sunrise.getTime() + dayLen * 0.7); // middle of the 4th fifth of daytime
  const midnight = istDate(y, m, d, 23, 59);
  const at = (ms: number) => toIst(new Date(ms));

  const tithi = tithiAt(sunrise);
  const nak = nakshatraAt(sunrise);
  const yoga = yogaAt(sunrise);
  const moonR = rashiOf(moonSid(sunrise));
  const month = monthAt(sunrise);
  const paksha = tithi <= 15 ? 'S' : 'K';

  // Odia solar date: month begins on the civil day of the sankranti.
  const current = [...sankrantis].reverse().find((s) => s.day <= key)!;
  const odiaDay = (Date.UTC(y, m - 1, d) - Date.parse(current.day + 'T00:00:00Z')) / 86400000 + 1;
  const todaysSankranti = sankrantis.find((s) => s.day === key);

  const end = (fn: (d: Date) => number, target: number) => {
    const t = findCrossing(fn, norm(target), sunrise);
    return t ? toIst(t) : null;
  };
  const seg = RAHU_SEGMENT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] - 1;
  const sample = (t: Date): Sample => ({ tithi: tithiAt(t), month: monthAt(t) });

  days.push({
    date: key,
    weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
    odia: { month: current.rashi, day: odiaDay },
    lunar: {
      amanta: month.name,
      purnimanta: paksha === 'K' ? (month.name + 1) % 12 : month.name,
      adhika: month.adhika,
      paksha,
    },
    tithi: { n: tithi, end: end(elongation, tithi * 12) },
    nakshatra: { n: nak, end: end(moonSid, (nak * 360) / 27) },
    yoga: { n: yoga, end: end(yogaAngle, (yoga * 360) / 27) },
    karana: karanaAt(sunrise),
    sunrise: toIst(sunrise),
    sunset: toIst(sunset),
    moonrise: (() => { const r = riseSet(Astronomy.Body.Moon, 1, dayStart); return r && toIst(r); })(),
    moonset: (() => { const r = riseSet(Astronomy.Body.Moon, -1, dayStart); return r && toIst(r); })(),
    sunRashi: rashiOf(sunSid(sunrise)),
    moonRashi: { n: moonR, end: end(moonSid, (moonR + 1) * 30) },
    abhijit: [at(sunrise.getTime() + (dayLen * 7) / 15), at(sunrise.getTime() + (dayLen * 8) / 15)],
    rahuKaal: [at(sunrise.getTime() + (dayLen * seg) / 8), at(sunrise.getTime() + (dayLen * (seg + 1)) / 8)],
    sankranti: todaysSankranti && { rashi: todaysSankranti.rashi, at: toIst(todaysSankranti.at) },
    festivals: [],
    samples: {
      sunrise: sample(sunrise),
      midday: sample(midday),
      aparahna: sample(aparahna),
      sunset: sample(sunset),
      midnight: sample(midnight),
    },
  });
}

// ---------- festivals ----------

type FestivalType = 'festival' | 'holiday' | 'vrat' | 'sankranti';
interface Festival {
  id: string;
  date: string;
  en: string;
  or: string;
  type: FestivalType;
}

// Month indices (amanta): 0 Chaitra, 1 Vaishakha, 2 Jyeshtha, 3 Ashadha, 4 Shravana,
// 5 Bhadrapada, 6 Ashwin, 7 Kartika, 8 Margashira, 9 Pausha, 10 Magha, 11 Phalguna.
// Tithi: 1–15 shukla (15 = purnima), 16–30 krishna (30 = amavasya).
type When = keyof Day['samples'];
interface LunarRule {
  id: string;
  en: string;
  or: string;
  type?: FestivalType;
  month: number;
  tithi: number;
  when?: When;
}

const LUNAR_FESTIVALS: LunarRule[] = [
  { id: 'vasant-panchami', en: 'Vasant Panchami · Saraswati Puja', or: 'ଶ୍ରୀପଞ୍ଚମୀ · ସରସ୍ୱତୀ ପୂଜା', month: 10, tithi: 5, type: 'holiday' },
  { id: 'magha-saptami', en: 'Magha Saptami', or: 'ମାଘ ସପ୍ତମୀ', month: 10, tithi: 7 },
  { id: 'maha-shivaratri', en: 'Maha Shivaratri', or: 'ମହାଶିବରାତ୍ରି', month: 10, tithi: 29, when: 'midnight', type: 'holiday' },
  { id: 'dola-purnima', en: 'Dola Purnima', or: 'ଦୋଳ ପୂର୍ଣ୍ଣିମା', month: 11, tithi: 15, type: 'holiday' },
  { id: 'holi', en: 'Holi', or: 'ହୋଲି', month: 11, tithi: 16, type: 'holiday' },
  { id: 'ashokashtami', en: 'Ashokashtami', or: 'ଅଶୋକାଷ୍ଟମୀ', month: 0, tithi: 8 },
  { id: 'ram-navami', en: 'Ram Navami', or: 'ରାମ ନବମୀ', month: 0, tithi: 9, when: 'midday', type: 'holiday' },
  { id: 'mahavir-jayanti', en: 'Mahavir Jayanti', or: 'ମହାବୀର ଜୟନ୍ତୀ', month: 0, tithi: 13 },
  { id: 'akshaya-tritiya', en: 'Akshaya Tritiya · Chandan Yatra begins', or: 'ଅକ୍ଷୟ ତୃତୀୟା · ଚନ୍ଦନ ଯାତ୍ରା ଆରମ୍ଭ', month: 1, tithi: 3 },
  { id: 'buddha-purnima', en: 'Buddha Purnima', or: 'ବୁଦ୍ଧ ପୂର୍ଣ୍ଣିମା', month: 1, tithi: 15, type: 'holiday' },
  { id: 'savitri-brata', en: 'Savitri Brata', or: 'ସାବିତ୍ରୀ ବ୍ରତ', month: 1, tithi: 30, type: 'holiday' },
  { id: 'sitala-sasthi', en: 'Sitala Sasthi', or: 'ଶୀତଳ ଷଷ୍ଠୀ', month: 2, tithi: 6 },
  { id: 'snana-purnima', en: 'Snana Purnima', or: 'ଦେବସ୍ନାନ ପୂର୍ଣ୍ଣିମା', month: 2, tithi: 15 },
  { id: 'ratha-yatra', en: 'Ratha Yatra', or: 'ରଥଯାତ୍ରା', month: 3, tithi: 2, type: 'holiday' },
  { id: 'hera-panchami', en: 'Hera Panchami', or: 'ହେରା ପଞ୍ଚମୀ', month: 3, tithi: 5 },
  { id: 'bahuda-yatra', en: 'Bahuda Yatra', or: 'ବାହୁଡ଼ା ଯାତ୍ରା', month: 3, tithi: 10 },
  { id: 'suna-besha', en: 'Suna Besha', or: 'ସୁନା ବେଶ', month: 3, tithi: 11 },
  { id: 'niladri-bije', en: 'Niladri Bije', or: 'ନୀଳାଦ୍ରି ବିଜେ', month: 3, tithi: 13 },
  { id: 'chitalagi-amavasya', en: 'Chitalagi Amavasya', or: 'ଚିତାଲାଗି ଅମାବାସ୍ୟା', month: 3, tithi: 30 },
  { id: 'gamha-purnima', en: 'Gamha Purnima · Raksha Bandhan', or: 'ଗହ୍ମା ପୂର୍ଣ୍ଣିମା · ରକ୍ଷାବନ୍ଧନ', month: 4, tithi: 15, type: 'holiday' },
  { id: 'janmashtami', en: 'Sri Krishna Janmashtami', or: 'ଶ୍ରୀକୃଷ୍ଣ ଜନ୍ମାଷ୍ଟମୀ', month: 4, tithi: 23, when: 'midnight', type: 'holiday' },
  { id: 'ganesh-chaturthi', en: 'Ganesh Chaturthi', or: 'ଗଣେଶ ଚତୁର୍ଥୀ', month: 5, tithi: 4, when: 'midday', type: 'holiday' },
  { id: 'nuakhai', en: 'Nuakhai · Rishi Panchami', or: 'ନୂଆଖାଇ · ଋଷି ପଞ୍ଚମୀ', month: 5, tithi: 5, when: 'midday', type: 'holiday' },
  { id: 'ananta-chaturdashi', en: 'Ananta Chaturdashi · Ganesh Visarjan', or: 'ଅନନ୍ତ ଚତୁର୍ଦ୍ଦଶୀ · ଗଣେଶ ବିସର୍ଜନ', month: 5, tithi: 14 },
  { id: 'mahalaya', en: 'Mahalaya', or: 'ମହାଳୟା', month: 5, tithi: 30 },
  { id: 'maha-shasthi', en: 'Durga Puja · Maha Shasthi', or: 'ଦୁର୍ଗାପୂଜା · ମହାଷଷ୍ଠୀ', month: 6, tithi: 6 },
  { id: 'maha-saptami', en: 'Durga Puja · Maha Saptami', or: 'ମହାସପ୍ତମୀ', month: 6, tithi: 7, type: 'holiday' },
  { id: 'maha-ashtami', en: 'Durga Puja · Maha Ashtami', or: 'ମହାଷ୍ଟମୀ', month: 6, tithi: 8, type: 'holiday' },
  { id: 'maha-navami', en: 'Durga Puja · Maha Navami', or: 'ମହାନବମୀ', month: 6, tithi: 9, type: 'holiday' },
  { id: 'vijaya-dashami', en: 'Vijaya Dashami · Dussehra', or: 'ବିଜୟା ଦଶମୀ · ଦଶହରା', month: 6, tithi: 10, when: 'aparahna', type: 'holiday' },
  { id: 'kumar-purnima', en: 'Kumar Purnima', or: 'କୁମାର ପୂର୍ଣ୍ଣିମା', month: 6, tithi: 15, type: 'holiday' },
  { id: 'diwali', en: 'Diwali · Kali Puja', or: 'ଦୀପାବଳି · କାଳୀ ପୂଜା', month: 6, tithi: 30, when: 'sunset', type: 'holiday' },
  { id: 'chhath', en: 'Chhath Puja', or: 'ଛଠ ପୂଜା', month: 7, tithi: 6 },
  { id: 'kartika-purnima', en: 'Kartika Purnima · Boita Bandana', or: 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା · ବୋଇତ ବନ୍ଦାଣ', month: 7, tithi: 15, type: 'holiday' },
  { id: 'prathamastami', en: 'Prathamastami', or: 'ପ୍ରଥମାଷ୍ଟମୀ', month: 7, tithi: 23 },
  { id: 'pausha-purnima', en: 'Pausha Purnima · Pusha Punei', or: 'ପୁଷ ପୁନେଇ', month: 9, tithi: 15 },
];

const FIXED_FESTIVALS: Omit<Festival, 'id'>[] = [
  { date: '2026-01-01', en: "New Year's Day", or: 'ନୂଆ ବର୍ଷ', type: 'festival' },
  { date: '2026-01-26', en: 'Republic Day', or: 'ଗଣତନ୍ତ୍ର ଦିବସ', type: 'holiday' },
  { date: '2026-04-01', en: 'Utkal Divas', or: 'ଉତ୍କଳ ଦିବସ', type: 'holiday' },
  { date: '2026-04-03', en: 'Good Friday', or: 'ଗୁଡ୍ ଫ୍ରାଇଡେ', type: 'holiday' },
  { date: '2026-08-15', en: 'Independence Day', or: 'ସ୍ୱାଧୀନତା ଦିବସ', type: 'holiday' },
  { date: '2026-10-02', en: 'Gandhi Jayanti', or: 'ଗାନ୍ଧି ଜୟନ୍ତୀ', type: 'holiday' },
  { date: '2026-12-25', en: 'Christmas', or: 'ବଡ଼ଦିନ', type: 'holiday' },
];

/** Corrections from the printed Panjika: festival id (e.g. 'nuakhai-2026-09-15') → date, or null to drop. */
const OVERRIDES: Record<string, string | null> = {};

const RASHI_EN = ['Mesha', 'Vrisha', 'Mithuna', 'Karkata', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const RASHI_OR = ['ମେଷ', 'ବୃଷ', 'ମିଥୁନ', 'କର୍କଟ', 'ସିଂହ', 'କନ୍ୟା', 'ତୁଳା', 'ବିଛା', 'ଧନୁ', 'ମକର', 'କୁମ୍ଭ', 'ମୀନ'];
const SANKRANTI_NAMES: Record<number, { en: string; or: string }> = {
  0: { en: 'Pana Sankranti · Odia New Year', or: 'ପଣା ସଂକ୍ରାନ୍ତି · ମହାବିଷୁବ ସଂକ୍ରାନ୍ତି' },
  2: { en: 'Raja Sankranti', or: 'ରଜ ସଂକ୍ରାନ୍ତି' },
  5: { en: 'Viswakarma Puja · Kanya Sankranti', or: 'ବିଶ୍ୱକର୍ମା ପୂଜା · କନ୍ୟା ସଂକ୍ରାନ୍ତି' },
  9: { en: 'Makar Sankranti', or: 'ମକର ସଂକ୍ରାନ୍ତି' },
};

const inYear = (key: string) => key.startsWith(`${YEAR}-`);
const festivals: Festival[] = [];
// Ids are suffixed with the date so a festival occurring twice in a year stays unique.
const add = (f: Festival) => {
  if (!inYear(f.date)) return;
  festivals.push({ ...f, id: f.id.endsWith(f.date) ? f.id : `${f.id}-${f.date}` });
};

// Lunar festivals: first day (per lunar month instance) whose tithi at the rule's
// time matches; if the tithi is kshaya (skipped), the day it begins and ends in.
for (const rule of LUNAR_FESTIVALS) {
  const when = rule.when ?? 'sunrise';
  for (const lm of lunarMonths.filter((m) => m.name === rule.month && !m.adhika)) {
    const tithiOn = (i: number) => days[i]?.samples[when].tithi;
    let hit = days.find((d) => d.samples[when].month === lm && d.samples[when].tithi === rule.tithi);
    if (!hit) {
      const prev = rule.tithi === 1 ? 30 : rule.tithi - 1;
      hit = days.find((d, i) => d.samples[when].month === lm && tithiOn(i) === prev && ![prev, rule.tithi].includes(tithiOn(i + 1)!));
    }
    if (hit) add({ id: rule.id, date: hit.date, en: rule.en, or: rule.or, type: rule.type ?? 'festival' });
  }
}

// Sankrantis (and Raja's three days around Mithuna Sankranti).
for (const s of sankrantis) {
  const name = SANKRANTI_NAMES[s.rashi] ?? { en: `${RASHI_EN[s.rashi]} Sankranti`, or: `${RASHI_OR[s.rashi]} ସଂକ୍ରାନ୍ତି` };
  const type = s.rashi in SANKRANTI_NAMES ? 'holiday' : 'sankranti';
  add({ id: `sankranti-${s.rashi}`, date: s.day, ...name, type });
  if (s.rashi === 2) {
    add({ id: 'pahili-raja', date: addDays(s.day, -1), en: 'Pahili Raja', or: 'ପହିଲି ରଜ', type: 'holiday' });
    add({ id: 'basi-raja', date: addDays(s.day, 1), en: 'Basi Raja', or: 'ବାସି ରଜ', type: 'festival' });
  }
}

// Manabasa Gurubar: Thursdays of purnimanta Margashira.
for (const d of days) {
  if (d.weekday === 4 && d.lunar.purnimanta === 8 && !d.lunar.adhika) {
    add({ id: `manabasa-${d.date}`, date: d.date, en: 'Manabasa Gurubar', or: 'ମାଣବସା ଗୁରୁବାର', type: 'festival' });
  }
}

// Monthly observances: Ekadashi, Purnima, Amavasya.
for (const d of days) {
  const t = d.tithi.n;
  const already = festivals.some((f) => f.date === d.date && f.type !== 'vrat');
  if (t === 11 || t === 26) add({ id: `ekadashi-${d.date}`, date: d.date, en: 'Ekadashi', or: 'ଏକାଦଶୀ', type: 'vrat' });
  if (!already && t === 15) add({ id: `purnima-${d.date}`, date: d.date, en: 'Purnima', or: 'ପୂର୍ଣ୍ଣିମା', type: 'vrat' });
  if (!already && t === 30) add({ id: `amavasya-${d.date}`, date: d.date, en: 'Amavasya', or: 'ଅମାବାସ୍ୟା', type: 'vrat' });
}

FIXED_FESTIVALS.forEach((f, i) => add({ id: `fixed-${i}`, ...f }));

for (const [id, date] of Object.entries(OVERRIDES)) {
  const f = festivals.find((x) => x.id === id);
  if (!f) continue;
  if (date === null) festivals.splice(festivals.indexOf(f), 1);
  else Object.assign(f, { date, id: f.id.replace(/\d{4}-\d{2}-\d{2}$/, date) });
}

const TYPE_ORDER: FestivalType[] = ['holiday', 'festival', 'sankranti', 'vrat'];
festivals.sort((a, b) => a.date.localeCompare(b.date) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

// ---------- output ----------

const yearDays = days.filter((d) => inYear(d.date));
for (const d of yearDays) d.festivals = festivals.filter((f) => f.date === d.date).map((f) => f.id);

const out = {
  year: YEAR,
  location: LOCATION,
  generatedAt: new Date().toISOString(),
  festivals,
  days: yearDays.map(({ samples, ...rest }) => rest),
};

const file = resolve(__dirname, '..', 'src', 'data', `panchang-${YEAR}.json`);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(out));
console.log(`Wrote ${yearDays.length} days, ${festivals.length} festivals → ${file}`);
