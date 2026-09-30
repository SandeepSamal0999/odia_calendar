/** Panchang vocabulary in Odia and English. Indices match src/data/panchang-*.json. */

export type Lang = 'or' | 'en';
type Names = Record<Lang, string[]>;

export const GREGORIAN_MONTHS: Names = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  or: ['ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'],
};

export const WEEKDAYS: Names = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  or: ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର'],
};

export const WEEKDAYS_SHORT: Names = {
  en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  or: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
};

/** Odia solar months, indexed by the sun's sidereal rashi (0 = Mesha → Baisakha). */
export const ODIA_SOLAR_MONTHS: Names = {
  en: ['Baisakha', 'Jyeshtha', 'Ashadha', 'Shrabana', 'Bhadraba', 'Ashwina', 'Kartika', 'Margashira', 'Pausha', 'Magha', 'Phalguna', 'Chaitra'],
  or: ['ବୈଶାଖ', 'ଜ୍ୟେଷ୍ଠ', 'ଆଷାଢ଼', 'ଶ୍ରାବଣ', 'ଭାଦ୍ରବ', 'ଆଶ୍ୱିନ', 'କାର୍ତ୍ତିକ', 'ମାର୍ଗଶିର', 'ପୌଷ', 'ମାଘ', 'ଫାଲ୍ଗୁନ', 'ଚୈତ୍ର'],
};

/** Lunar months, 0 = Chaitra. */
export const LUNAR_MONTHS: Names = {
  en: ['Chaitra', 'Baisakha', 'Jyeshtha', 'Ashadha', 'Shrabana', 'Bhadraba', 'Ashwina', 'Kartika', 'Margashira', 'Pausha', 'Magha', 'Phalguna'],
  or: ['ଚୈତ୍ର', 'ବୈଶାଖ', 'ଜ୍ୟେଷ୍ଠ', 'ଆଷାଢ଼', 'ଶ୍ରାବଣ', 'ଭାଦ୍ରବ', 'ଆଶ୍ୱିନ', 'କାର୍ତ୍ତିକ', 'ମାର୍ଗଶିର', 'ପୌଷ', 'ମାଘ', 'ଫାଲ୍ଗୁନ'],
};

/** Tithis 1–15; index 14 is Purnima, and Amavasya is handled separately. */
export const TITHIS: Names = {
  en: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'],
  or: ['ପ୍ରତିପଦା', 'ଦ୍ୱିତୀୟା', 'ତୃତୀୟା', 'ଚତୁର୍ଥୀ', 'ପଞ୍ଚମୀ', 'ଷଷ୍ଠୀ', 'ସପ୍ତମୀ', 'ଅଷ୍ଟମୀ', 'ନବମୀ', 'ଦଶମୀ', 'ଏକାଦଶୀ', 'ଦ୍ୱାଦଶୀ', 'ତ୍ରୟୋଦଶୀ', 'ଚତୁର୍ଦ୍ଦଶୀ', 'ପୂର୍ଣ୍ଣିମା'],
};
export const AMAVASYA: Record<Lang, string> = { en: 'Amavasya', or: 'ଅମାବାସ୍ୟା' };

export const PAKSHA: Record<Lang, { S: string; K: string }> = {
  en: { S: 'Shukla', K: 'Krishna' },
  or: { S: 'ଶୁକ୍ଳ', K: 'ଅନ୍ଧାର' },
};

/** Odia day-count words used in "ଆଶ୍ୱିନ ଅନ୍ଧାର ଦୁଇ ଦିନ". */
export const ODIA_COUNT_WORDS = ['ଏକ', 'ଦୁଇ', 'ତିନି', 'ଚାରି', 'ପାଞ୍ଚ', 'ଛଅ', 'ସାତ', 'ଆଠ', 'ନଅ', 'ଦଶ', 'ଏଗାର', 'ବାର', 'ତେର', 'ଚଉଦ', 'ପନ୍ଦର'];

export const NAKSHATRAS: Names = {
  en: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
  or: ['ଅଶ୍ୱିନୀ', 'ଭରଣୀ', 'କୃତ୍ତିକା', 'ରୋହିଣୀ', 'ମୃଗଶିରା', 'ଆର୍ଦ୍ରା', 'ପୁନର୍ବସୁ', 'ପୁଷ୍ୟା', 'ଅଶ୍ଳେଷା', 'ମଘା', 'ପୂର୍ବଫାଲ୍ଗୁନୀ', 'ଉତ୍ତରଫାଲ୍ଗୁନୀ', 'ହସ୍ତା', 'ଚିତ୍ରା', 'ସ୍ୱାତୀ', 'ବିଶାଖା', 'ଅନୁରାଧା', 'ଜ୍ୟେଷ୍ଠା', 'ମୂଳା', 'ପୂର୍ବାଷାଢ଼ା', 'ଉତ୍ତରାଷାଢ଼ା', 'ଶ୍ରବଣା', 'ଧନିଷ୍ଠା', 'ଶତଭିଷା', 'ପୂର୍ବଭାଦ୍ରପଦ', 'ଉତ୍ତରଭାଦ୍ରପଦ', 'ରେବତୀ'],
};

export const YOGAS: Names = {
  en: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
  or: ['ବିଷ୍କମ୍ଭ', 'ପ୍ରୀତି', 'ଆୟୁଷ୍ମାନ', 'ସୌଭାଗ୍ୟ', 'ଶୋଭନ', 'ଅତିଗଣ୍ଡ', 'ସୁକର୍ମା', 'ଧୃତି', 'ଶୂଳ', 'ଗଣ୍ଡ', 'ବୃଦ୍ଧି', 'ଧ୍ରୁବ', 'ବ୍ୟାଘାତ', 'ହର୍ଷଣ', 'ବଜ୍ର', 'ସିଦ୍ଧି', 'ବ୍ୟତୀପାତ', 'ବରୀୟାନ', 'ପରିଘ', 'ଶିବ', 'ସିଦ୍ଧ', 'ସାଧ୍ୟ', 'ଶୁଭ', 'ଶୁକ୍ଳ', 'ବ୍ରହ୍ମ', 'ଇନ୍ଦ୍ର', 'ବୈଧୃତି'],
};

export const KARANAS: Names = {
  en: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'],
  or: ['ବବ', 'ବାଳବ', 'କୌଳବ', 'ତୈତିଳ', 'ଗର', 'ବଣିଜ', 'ବିଷ୍ଟି', 'ଶକୁନି', 'ଚତୁଷ୍ପଦ', 'ନାଗ', 'କିଂସ୍ତୁଘ୍ନ'],
};

export const RASHIS: Names = {
  en: ['Mesha', 'Vrisha', 'Mithuna', 'Karkata', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'],
  or: ['ମେଷ', 'ବୃଷ', 'ମିଥୁନ', 'କର୍କଟ', 'ସିଂହ', 'କନ୍ୟା', 'ତୁଳା', 'ବିଛା', 'ଧନୁ', 'ମକର', 'କୁମ୍ଭ', 'ମୀନ'],
};

/** UI labels. */
export const LABELS = {
  appTitle: { en: 'Odia Calendar', or: 'ଓଡ଼ିଆ କ୍ୟାଲେଣ୍ଡର' },
  home: { en: 'Home', or: 'ମୂଳ ପୃଷ୍ଠା' },
  calendar: { en: 'Calendar', or: 'କ୍ୟାଲେଣ୍ଡର' },
  today: { en: 'Today', or: 'ଆଜି' },
  festivals: { en: 'Festivals', or: 'ପର୍ବପର୍ବାଣୀ' },
  more: { en: 'More', or: 'ଅଧିକ' },
  dailyPanchang: { en: 'Daily Panchang', or: 'ଦୈନିକ ପଞ୍ଜିକା' },
  todaysPanchang: { en: "Today's Panchang", or: 'ଆଜିର ପଞ୍ଜିକା' },
  panchang: { en: 'Panchang', or: 'ପଞ୍ଜିକା' },
  festivalsIn: { en: 'Festivals in', or: 'ପର୍ବପର୍ବାଣୀ -' },
  festivalsAndDays: { en: 'Festivals & Important Days', or: 'ପର୍ବପର୍ବାଣୀ ଓ ବିଶେଷ ଦିନ' },
  noFestivals: { en: 'No festivals this day', or: 'ଆଜି କୌଣସି ପର୍ବ ନାହିଁ' },
  tithi: { en: 'Tithi', or: 'ତିଥି' },
  nakshatra: { en: 'Nakshatra', or: 'ନକ୍ଷତ୍ର' },
  yoga: { en: 'Yoga', or: 'ଯୋଗ' },
  karana: { en: 'Karana', or: 'କରଣ' },
  paksha: { en: 'Paksha', or: 'ପକ୍ଷ' },
  sunrise: { en: 'Sunrise', or: 'ସୂର୍ଯ୍ୟୋଦୟ' },
  sunset: { en: 'Sunset', or: 'ସୂର୍ଯ୍ୟାସ୍ତ' },
  moonrise: { en: 'Moonrise', or: 'ଚନ୍ଦ୍ରୋଦୟ' },
  moonset: { en: 'Moonset', or: 'ଚନ୍ଦ୍ରାସ୍ତ' },
  sunSign: { en: 'Sun Sign', or: 'ସୂର୍ଯ୍ୟ ରାଶି' },
  moonSign: { en: 'Moon Sign', or: 'ଚନ୍ଦ୍ର ରାଶି' },
  abhijit: { en: 'Abhijit Muhurat', or: 'ଅଭିଜିତ ମୁହୂର୍ତ୍ତ' },
  rahuKaal: { en: 'Rahu Kaal', or: 'ରାହୁ କାଳ' },
  odiaDate: { en: 'Odia Date', or: 'ଓଡ଼ିଆ ତାରିଖ' },
  lunarMonth: { en: 'Lunar Month', or: 'ଚାନ୍ଦ୍ର ମାସ' },
  sankranti: { en: 'Sankranti', or: 'ସଂକ୍ରାନ୍ତି' },
  until: { en: 'until', or: 'ପର୍ଯ୍ୟନ୍ତ' },
  nextDay: { en: 'next day', or: 'ପରଦିନ' },
  none: { en: '—', or: '—' },
  adhika: { en: 'Adhika', or: 'ଅଧିକ' },
  saved: { en: 'Saved Dates', or: 'ସଂରକ୍ଷିତ ତାରିଖ' },
  noSaved: { en: 'Tap ☆ on any date to save it here.', or: 'ଯେକୌଣସି ତାରିଖରେ ☆ ଦବାଇ ଏଠାରେ ସଂରକ୍ଷଣ କରନ୍ତୁ।' },
  language: { en: 'Language', or: 'ଭାଷା' },
  all: { en: 'All', or: 'ସମସ୍ତ' },
  majorOnly: { en: 'Festivals', or: 'ପର୍ବ' },
  goToToday: { en: 'Today', or: 'ଆଜି' },
  viewDetails: { en: 'Full Panchang', or: 'ସମ୍ପୂର୍ଣ୍ଣ ପଞ୍ଜିକା' },
  location: { en: 'Location', or: 'ସ୍ଥାନ' },
  about: { en: 'About', or: 'ବିଷୟରେ' },
} satisfies Record<string, Record<Lang, string>>;
