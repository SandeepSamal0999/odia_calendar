# Odia Calendar 2026

React Native (Expo SDK 57, Expo Router) app: a 2026 Odia calendar with English/Gregorian month
navigation, a festival list for every month, and full Panchang details for each date.

## Run

```bash
npm install --legacy-peer-deps
npx expo start          # press a (Android) / i (iOS), or scan with Expo Go
```

## Screens

| Route | What |
| --- | --- |
| `src/app/(tabs)/index.tsx` | Home: today's date, Odia/lunar date, daily Panchang with ◀ ▶ day stepping |
| `src/app/(tabs)/calendar.tsx` | January–December grid (◀ ▶ or swipe), `n/12` counter, festivals of the month |
| `src/app/(tabs)/festivals.tsx` | All 2026 festivals grouped by month (major only / all) |
| `src/app/(tabs)/more.tsx` | Language (ଓଡ଼ିଆ / English), saved dates, about |
| `src/app/day/[date].tsx` | Date details: tithi, nakshatra, yoga, karana, sun/moon times, rashi, Rahu Kaal, festivals |
| `src/app/saved.tsx` | Dates starred from the details screen |

The centre **Today** button in the tab bar opens today's details.

## Data

`src/data/panchang-2026.json` is generated — do not edit it by hand:

```bash
npm run generate:data   # scripts/generate-panchang.ts
```

The generator uses `astronomy-engine` for Cuttack (IST) with Lahiri ayanamsa:

- **Odia date** — solar month begins on the civil day of the Sankranti (Kanya Sankranti 17 Sep = Ashwina 1).
- **Lunar month** — purnimanta naming (as used in Odisha), adhika months detected automatically.
- **Tithi / nakshatra / yoga / karana** at sunrise, with end times.
- **Festivals** — derived from tithi rules (sunrise, midday, aparahna, sunset or midnight as the
  festival requires) plus sankrantis and fixed-date holidays.

To align with a specific printed Panjika, add corrections to `OVERRIDES` (festival id → date) or
new entries to `FIXED_FESTIVALS` in the generator and re-run it. Islamic festivals (Eid etc.) are not
yet included because they depend on moon sighting.
