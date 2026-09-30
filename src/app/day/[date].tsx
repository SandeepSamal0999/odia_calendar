import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FestivalHighlight } from '../../components/FestivalHighlight';
import { HeroBackdrop } from '../../components/TempleArt';
import { KARANAS, Lang, LUNAR_MONTHS, NAKSHATRAS, PAKSHA, RASHIS, WEEKDAYS, YOGAS } from '../../lib/names';
import {
  abhijitText,
  festivalName,
  festivalsOn,
  formatTime,
  getDay,
  gregorianLong,
  label,
  lunarTithi,
  odiaDate,
  PanchangDay,
  parts,
  shiftDate,
  tithiName,
  todayKey,
  untilText,
} from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { cardShadow, colors } from '../../lib/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((z) => `${z}︎`);

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { lang, isSaved, toggleSaved } = useSettings();
  const insets = useSafeAreaInsets();
  const day = getDay(date) ?? getDay(todayKey())!;
  const saved = isSaved(day.date);

  const go = (n: number) => {
    const next = shiftDate(day.date, n);
    if (getDay(next)) router.setParams({ date: next });
  };

  const share = () => {
    const t = lunarTithi(day, 'en');
    const lines = [
      `${gregorianLong(day.date, 'en')} (${WEEKDAYS.en[day.weekday]})`,
      `${odiaDate(day, 'or')} · ${t.month} ${t.tithi}`,
      ...festivalsOn(day).map((f) => `🎉 ${festivalName(f, 'en')}`),
      `Sunrise ${formatTime(day.sunrise, 'en')} · Sunset ${formatTime(day.sunset, 'en')}`,
      `Nakshatra ${NAKSHATRAS.en[day.nakshatra.n - 1]} · Rahu Kaal ${formatTime(day.rahuKaal[0], 'en')}–${formatTime(day.rahuKaal[1], 'en')}`,
      '— Odia Calendar 2026',
    ];
    Share.share({ message: lines.join('\n') }).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#FDEAF2', '#FBDDE9', '#FDEEF4']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <HeroBackdrop />
          <View style={styles.heroRow}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              hitSlop={12}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={28} color={colors.white} />
            </Pressable>
            <Text style={styles.heroTitle}>{label('panchang', lang)}</Text>
            <Pressable onPress={() => toggleSaved(day.date)} hitSlop={10} accessibilityLabel={saved ? 'Remove from saved' : 'Save date'}>
              <Ionicons name={saved ? 'star' : 'star-outline'} size={26} color={colors.white} />
            </Pressable>
            <Pressable onPress={share} hitSlop={10} accessibilityLabel="Share">
              <Ionicons name="share-social" size={26} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <DateCard day={day} onPrev={() => go(-1)} onNext={() => go(1)} />
          <FestivalHighlight day={day} lang={lang} />
          <DatesCard day={day} lang={lang} />
          <DetailsCard day={day} lang={lang} />
        </View>
      </ScrollView>
    </View>
  );
}

function DateCard({ day, onPrev, onNext }: { day: PanchangDay; onPrev: () => void; onNext: () => void }) {
  const t = lunarTithi(day, 'or');
  return (
    <View style={[styles.card, styles.dateCard]}>
      <CircleButton icon="arrow-back" onPress={onPrev} label="Previous day" />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.dateTitle}>{gregorianLong(day.date, 'en')}</Text>
        <Text style={styles.dateOdia} numberOfLines={1} adjustsFontSizeToFit>
          {t.month} {t.tithi}
        </Text>
        <Text style={styles.dateWeekday}>
          {WEEKDAYS.en[day.weekday]} · {WEEKDAYS.or[day.weekday]}
        </Text>
      </View>
      <Pressable
        style={styles.calButton}
        onPress={() => router.navigate({ pathname: '/calendar', params: { month: String(parts(day.date).month + 1) } })}
        accessibilityLabel="Open in calendar"
      >
        <MaterialCommunityIcons name="calendar-month-outline" size={24} color={colors.primary} />
      </Pressable>
      <CircleButton icon="arrow-forward" onPress={onNext} label="Next day" />
    </View>
  );
}

function CircleButton({ icon, onPress, label: a11y }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={styles.circleBtn} accessibilityRole="button" accessibilityLabel={a11y}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </Pressable>
  );
}

function DatesCard({ day, lang }: { day: PanchangDay; lang: Lang }) {
  const t = lunarTithi(day, lang);
  const sankranti = day.sankranti;
  return (
    <View style={[styles.card, styles.datesCard]}>
      <View style={styles.dateHalf}>
        <IconBubble icon="calendar-month-outline" tint={colors.primary} bg="#FFE3EF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.smallLabel}>{label('odiaDate', lang)}</Text>
          <Text style={styles.dateValue} numberOfLines={1} adjustsFontSizeToFit>{odiaDate(day, lang)}</Text>
          {sankranti ? (
            <Text style={styles.smallNote} numberOfLines={1}>
              {RASHIS[lang][sankranti.rashi]} {label('sankranti', lang)} · {formatTime(sankranti.at, lang)}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.vDivider} />
      <View style={styles.dateHalf}>
        <IconBubble icon="moon-waning-crescent" tint="#6F63D9" bg="#E9E6FF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.smallLabel}>{label('lunarMonth', lang)}</Text>
          <Text style={styles.dateValue} numberOfLines={2}>{t.month} {t.tithi}</Text>
          <Text style={styles.smallNote} numberOfLines={1}>
            {lang === 'or' ? 'ଅମାନ୍ତ' : 'Amanta'}: {LUNAR_MONTHS[lang][day.lunar.amanta]}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface Detail {
  icon: IconName;
  tint: string;
  bg: string;
  label: string;
  value: string;
  note?: string;
  badge?: string;
}

function DetailsCard({ day, lang }: { day: PanchangDay; lang: Lang }) {
  const until = (end: string | null) => untilText(end, day.date, lang) || undefined;
  const items: Detail[] = [
    { icon: 'white-balance-sunny', tint: '#F2711C', bg: '#FFEBDD', label: label('sunrise', lang), value: formatTime(day.sunrise, lang) },
    { icon: 'weather-sunset', tint: '#F2711C', bg: '#FFEBDD', label: label('sunset', lang), value: formatTime(day.sunset, lang) },
    { icon: 'moon-waning-crescent', tint: '#7B5FE0', bg: '#ECE7FF', label: label('moonrise', lang), value: formatTime(day.moonrise, lang) },
    { icon: 'weather-night', tint: '#5F6FD9', bg: '#E4E8FF', label: label('moonset', lang), value: formatTime(day.moonset, lang) },
    { icon: 'spa', tint: '#E0357A', bg: '#FFE3EF', label: label('tithi', lang), value: tithiName(day.tithi.n, lang), note: until(day.tithi.end) },
    { icon: 'star', tint: '#F2B01E', bg: '#FFF4D6', label: label('nakshatra', lang), value: NAKSHATRAS[lang][day.nakshatra.n - 1], note: until(day.nakshatra.end) },
    { icon: 'white-balance-sunny', tint: '#F2A01E', bg: '#FFF4D6', label: label('sunSign', lang), value: RASHIS[lang][day.sunRashi], badge: ZODIAC[day.sunRashi] },
    { icon: 'moon-waning-crescent', tint: '#6F7BE0', bg: '#E4E8FF', label: label('moonSign', lang), value: RASHIS[lang][day.moonRashi.n], note: until(day.moonRashi.end), badge: ZODIAC[day.moonRashi.n] },
    { icon: 'meditation', tint: '#D63A7A', bg: '#FFE3EF', label: label('yoga', lang), value: YOGAS[lang][day.yoga.n - 1], note: until(day.yoga.end) },
    { icon: 'pot-mix', tint: '#C9821B', bg: '#FFF1D9', label: label('karana', lang), value: KARANAS[lang][day.karana] },
    { icon: 'flower', tint: '#E0357A', bg: '#FFE3EF', label: label('paksha', lang), value: PAKSHA[lang][day.lunar.paksha] },
    {
      icon: 'clock-outline',
      tint: '#D63A5A',
      bg: '#FFE6EA',
      label: label('rahuKaal', lang),
      value: `${formatTime(day.rahuKaal[0], lang)} –\n${formatTime(day.rahuKaal[1], lang)}`,
    },
  ];

  const explainAbhijit = () =>
    Alert.alert(
      label('abhijit', lang),
      lang === 'or'
        ? `ଅଭିଜିତ ମୁହୂର୍ତ୍ତ: ${abhijitText(day, lang)}\n\nମଧ୍ୟାହ୍ନର ଏହି ସମୟ ଶୁଭ କାର୍ଯ୍ୟ ପାଇଁ ଉତ୍ତମ ବୋଲି ମନାଯାଏ।`
        : `Abhijit Muhurat: ${abhijitText(day, lang)}\n\nThe midday muhurta considered auspicious for starting new work.`,
    );

  return (
    <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
      <LinearGradient colors={['#C4104F', '#E8337A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.detailsHeader}>
        <MaterialCommunityIcons name="spa" size={26} color={colors.white} />
        <Text style={styles.detailsTitle} numberOfLines={1}>
          {lang === 'or' ? 'ପଞ୍ଜିକା ବିବରଣୀ' : 'Panchang Details'}
        </Text>
        <Text style={styles.detailsTime}>{abhijitText(day, lang)}</Text>
        <Pressable onPress={explainAbhijit} hitSlop={10} accessibilityLabel={label('abhijit', lang)}>
          <Ionicons name="information-circle" size={24} color={colors.white} />
        </Pressable>
      </LinearGradient>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.gridCell}>
            <View style={styles.detailTile}>
              <IconBubble icon={item.icon} tint={item.tint} bg={item.bg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.detailValue} numberOfLines={2} adjustsFontSizeToFit>{item.value}</Text>
                {item.note ? <Text style={styles.smallNote} numberOfLines={2}>{item.note}</Text> : null}
              </View>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function IconBubble({ icon, tint, bg }: { icon: IconName; tint: string; bg: string }) {
  return (
    <View style={[styles.bubble, { backgroundColor: bg }]}>
      <MaterialCommunityIcons name={icon} size={24} color={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { height: 190, paddingHorizontal: 16, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroTitle: { flex: 1, color: colors.white, fontSize: 22, fontWeight: '800' },
  body: { paddingHorizontal: 12, gap: 12, marginTop: -84 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 14, ...cardShadow },

  dateCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTitle: { fontSize: 20, fontWeight: '800', color: '#1E2A5A' },
  dateOdia: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 4 },
  dateWeekday: { fontSize: 13, color: colors.muted, marginTop: 3 },

  datesCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  dateHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  vDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.border, marginHorizontal: 8 },
  dateValue: { fontSize: 14, fontWeight: '800', color: colors.text },

  detailsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  detailsTitle: { flex: 1, color: colors.white, fontSize: 17, fontWeight: '800' },
  detailsTime: { color: colors.white, fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 6, backgroundColor: '#FFF7FA' },
  gridCell: { width: '50%', padding: 4 },
  detailTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    minHeight: 76,
  },
  bubble: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  smallLabel: { fontSize: 12, color: colors.muted },
  detailValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  smallNote: { fontSize: 10, color: colors.muted, marginTop: 1 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 16, color: colors.primary },
});
