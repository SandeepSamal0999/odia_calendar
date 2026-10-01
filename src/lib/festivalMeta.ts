import type { Lang } from './names';
import type { Festival, PanchangDay } from './panchang';

/** Emoji for a festival, matched on its id (ids are `<name>-<date>`). */
const ICONS: [RegExp, string][] = [
  [/^ganesh|^ananta/, '🐘'],
  [/^ratha|^bahuda|^hera|^suna|^niladri|^snana/, '🛕'],
  [/^maha-(shasthi|saptami|ashtami|navami)/, '🔱'],
  [/^vijaya/, '🏹'],
  [/^diwali/, '🪔'],
  [/^dola|^holi/, '🎨'],
  [/^pahili|^basi|^sankranti-2/, '🌸'],
  [/^maha-shivaratri/, '🕉️'],
  [/^janmashtami/, '🦚'],
  [/^ram-navami/, '🏹'],
  [/^vasant/, '🪕'],
  [/^nuakhai/, '🌾'],
  [/^manabasa/, '🌾'],
  [/^kartika|^boita/, '⛵'],
  [/^savitri/, '🌳'],
  [/^akshaya/, '🌼'],
  [/^buddha/, '☸️'],
  [/^mahalaya|^chitalagi/, '🪔'],
  [/^sankranti-9/, '🪁'],
  [/^sankranti/, '☀️'],
  [/purnima/, '🌕'],
  [/^amavasya/, '🌑'],
  [/^ekadashi/, '🌙'],
];
const FIXED_ICONS: Record<string, string> = {
  "New Year's Day": '🎆',
  'Republic Day': '🇮🇳',
  'Independence Day': '🇮🇳',
  'Utkal Divas': '🏳️',
  'Good Friday': '✝️',
  'Gandhi Jayanti': '🕊️',
  Christmas: '🎄',
};

export function festivalIcon(f: Festival): string {
  if (FIXED_ICONS[f.en]) return FIXED_ICONS[f.en];
  return ICONS.find(([re]) => re.test(f.id))?.[1] ?? '🪔';
}

type Blurb = Record<Lang, string>;
const DESCRIPTIONS: [RegExp, Blurb][] = [
  [/^ganesh/, { en: 'Birth of Lord Ganesha, remover of obstacles.', or: 'ବିଘ୍ନହର୍ତ୍ତା ଶ୍ରୀ ଗଣେଶଙ୍କ ଜନ୍ମୋତ୍ସବ।' }],
  [/^ratha/, { en: 'Lord Jagannath’s chariot festival in Puri.', or: 'ପୁରୀରେ ମହାପ୍ରଭୁ ଶ୍ରୀଜଗନ୍ନାଥଙ୍କ ରଥଯାତ୍ରା।' }],
  [/^bahuda/, { en: 'Return journey of the deities to Srimandir.', or: 'ମହାପ୍ରଭୁଙ୍କ ଶ୍ରୀମନ୍ଦିରକୁ ଫେରନ୍ତି ଯାତ୍ରା।' }],
  [/^nuakhai/, { en: 'Harvest festival offering new rice to the deity.', or: 'ନୂଆ ଧାନ ଅର୍ପଣ କରୁଥିବା ଫସଲ ପର୍ବ।' }],
  [/^maha-|^vijaya/, { en: 'Durga Puja — worship of Maa Durga.', or: 'ମା’ ଦୁର୍ଗାଙ୍କ ଆରାଧନା।' }],
  [/^diwali/, { en: 'Festival of lights and Kali Puja.', or: 'ଆଲୋକର ପର୍ବ ଓ କାଳୀ ପୂଜା।' }],
  [/^pahili|^basi|^sankranti-2/, { en: 'Raja — celebrating Mother Earth and womanhood.', or: 'ଧରିତ୍ରୀ ମାତା ଓ ନାରୀତ୍ୱର ପର୍ବ।' }],
  [/^sankranti-0/, { en: 'Odia New Year (Maha Vishuba Sankranti).', or: 'ଓଡ଼ିଆ ନୂଆ ବର୍ଷ।' }],
  [/^sankranti-5/, { en: 'Worship of Lord Viswakarma, the divine architect.', or: 'ଦେବଶିଳ୍ପୀ ବିଶ୍ୱକର୍ମାଙ୍କ ପୂଜା।' }],
  [/^sankranti/, { en: 'The Sun enters a new rashi.', or: 'ସୂର୍ଯ୍ୟଙ୍କ ରାଶି ପରିବର୍ତ୍ତନ।' }],
  [/^kartika/, { en: 'Boita Bandana — remembering Odisha’s maritime past.', or: 'ବୋଇତ ବନ୍ଦାଣ — ସାଧବ ପରମ୍ପରାର ସ୍ମୃତି।' }],
  [/^kumar/, { en: 'Full moon festival of Kumar Kartikeya.', or: 'କୁମାର କାର୍ତ୍ତିକେୟଙ୍କ ପୂର୍ଣ୍ଣିମା ପର୍ବ।' }],
  [/^manabasa/, { en: 'Thursday worship of Maa Lakshmi in Margashira.', or: 'ମାର୍ଗଶିର ଗୁରୁବାରରେ ମା’ ଲକ୍ଷ୍ମୀଙ୍କ ପୂଜା।' }],
  [/^janmashtami/, { en: 'Birth of Lord Sri Krishna.', or: 'ଶ୍ରୀକୃଷ୍ଣଙ୍କ ଜନ୍ମୋତ୍ସବ।' }],
  [/^maha-shivaratri/, { en: 'The great night of Lord Shiva.', or: 'ଭଗବାନ ଶିବଙ୍କ ମହାରାତ୍ରି।' }],
  [/^ekadashi/, { en: 'Fasting day dedicated to Lord Vishnu.', or: 'ଶ୍ରୀବିଷ୍ଣୁଙ୍କ ଉଦ୍ଦେଶ୍ୟରେ ଉପବାସ ଦିନ।' }],
  [/purnima/, { en: 'Full moon day.', or: 'ପୂର୍ଣ୍ଣିମା ତିଥି।' }],
  [/^amavasya/, { en: 'New moon day, for remembering ancestors.', or: 'ପିତୃପୁରୁଷଙ୍କ ସ୍ମରଣ ଦିନ।' }],
];

export function festivalBlurb(f: Festival, lang: Lang): string | undefined {
  return DESCRIPTIONS.find(([re]) => re.test(f.id))?.[1][lang];
}

/** Observance tied to the day's tithi when there is no listed festival. */
export function tithiObservance(day: PanchangDay): { icon: string; blurb: Blurb } | undefined {
  switch (day.tithi.n) {
    case 4:
      return { icon: '🐘', blurb: { en: 'Vinayaka Chaturthi, dedicated to Lord Ganesha.', or: 'ବିନାୟକ ଚତୁର୍ଥୀ — ଶ୍ରୀ ଗଣେଶଙ୍କ ପୂଜା।' } };
    case 19:
      return { icon: '🐘', blurb: { en: 'Sankashti Chaturthi, a sacred day dedicated to Lord Ganesha.', or: 'ସଙ୍କଷ୍ଟି ଚତୁର୍ଥୀ — ଶ୍ରୀ ଗଣେଶଙ୍କ ଉଦ୍ଦେଶ୍ୟରେ ପବିତ୍ର ଦିନ।' } };
    case 13:
    case 28:
      return { icon: '🕉️', blurb: { en: 'Pradosha, evening worship of Lord Shiva.', or: 'ପ୍ରଦୋଷ — ସନ୍ଧ୍ୟାରେ ଶିବଙ୍କ ପୂଜା।' } };
    case 6:
      return { icon: '🦚', blurb: { en: 'Shashthi, dedicated to Lord Kartikeya.', or: 'ଷଷ୍ଠୀ — କାର୍ତ୍ତିକେୟଙ୍କ ପୂଜା।' } };
    case 8:
    case 23:
      return { icon: '🔱', blurb: { en: 'Ashtami, auspicious for worship of the Devi.', or: 'ଅଷ୍ଟମୀ — ଦେବୀ ପୂଜା ପାଇଁ ଶୁଭ।' } };
    default:
      return undefined;
  }
}
