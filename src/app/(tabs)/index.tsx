import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FestivalHighlight } from '../../components/FestivalHighlight';
import { HeroBackdrop, TempleIcon } from '../../components/TempleArt';
import { festivalIcon } from '../../lib/festivalMeta';
import { GREGORIAN_MONTHS, Lang, NAKSHATRAS, RASHIS, WEEKDAYS } from '../../lib/names';
import {
  Festival,
  FESTIVALS,
  festivalName,
  formatTime,
  getDay,
  isMajor,
  label,
  lunarTithi,
  num,
  odiaDate,
  PanchangDay,
  parts,
  tithiName,
  todayKey,
  untilText,
  YEAR,
} from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { cardShadow, colors } from '../../lib/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const openDay = (date: string) => router.push({ pathname: '/day/[date]', params: { date } });
const otherLang = (lang: Lang): Lang => (lang === 'or' ? 'en' : 'or');

export default function HomeScreen() {
  const { lang, toggleLang } = useSettings();
  const insets = useSafeAreaInsets();
  const today = todayKey();
  const day = getDay(today)!;
  const upcoming = FESTIVALS.filter((f) => f.date > today && isMajor(f)).slice(0, 4);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#EC2A6F', '#F47CA5', '#F9B6CC']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
          <HeroBackdrop />
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>
                {label('appTitle', 'en')} {YEAR}
              </Text>
              <Text style={styles.heroSubtitle}>ଓଡ଼ିଆ ପଞ୍ଜିକା ୨୦୨୬</Text>
            </View>
            <RoundButton icon="globe-outline" onPress={toggleLang} label="Switch language" />
          </View>
        </View>

        <View style={styles.body}>
          <DateCard day={day} lang={lang} />
          <PanchangCard day={day} lang={lang} />
          <FestivalHighlight day={day} lang={lang} onPress={() => openDay(day.date)} />
          {upcoming.length > 0 && <UpcomingCard festivals={upcoming} lang={lang} />}
        </View>
      </ScrollView>
    </View>
  );
}

function RoundButton({ icon, onPress, label: a11y }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={styles.roundBtn} accessibilityRole="button" accessibilityLabel={a11y}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function DateCard({ day, lang }: { day: PanchangDay; lang: Lang }) {
  const { month, day: dateNum } = parts(day.date);
  const primary = lunarTithi(day, lang);
  const secondary = lunarTithi(day, otherLang(lang));
  return (
    <Pressable style={[styles.card, styles.dateCard]} onPress={() => openDay(day.date)} accessibilityRole="button">
      <LinearGradient colors={['#F4337A', '#C70B55']} style={styles.dateTile}>
        <Text style={styles.tileMonth}>
          {GREGORIAN_MONTHS.en[month].slice(0, 3).toUpperCase()} {YEAR}
        </Text>
        <Text style={styles.tileDay}>{dateNum}</Text>
        <Text style={styles.tileWeekday}>{WEEKDAYS.en[day.weekday].toUpperCase()}</Text>
      </LinearGradient>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.tithiRow}>
          <TempleIcon size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tithiMonth} numberOfLines={1}>{primary.month}</Text>
            <Text style={styles.tithiName} numberOfLines={1} adjustsFontSizeToFit>{primary.tithi}</Text>
            <Text style={styles.tithiSecondary} numberOfLines={1}>
              {secondary.month} {secondary.tithi}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem} numberOfLines={1}>
            {GREGORIAN_MONTHS[lang][month]} {num(YEAR, lang)}
          </Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaItem} numberOfLines={1}>{odiaDate(day, lang)}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaItem} numberOfLines={1}>{WEEKDAYS[lang][day.weekday]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

interface Tile {
  icon: IconName;
  tint: string;
  label: string;
  value: string;
  note?: string;
}

function PanchangCard({ day, lang }: { day: PanchangDay; lang: Lang }) {
  const note = (end: string | null) => {
    const text = untilText(end, day.date, lang);
    return text ? `(${text})` : undefined;
  };
  const top: Tile[] = [
    { icon: 'weather-sunset-up', tint: '#FF8A1F', label: label('sunrise', lang), value: formatTime(day.sunrise, lang) },
    { icon: 'weather-sunset-down', tint: '#FF6A1F', label: label('sunset', lang), value: formatTime(day.sunset, lang) },
    { icon: 'moon-waning-crescent', tint: '#9C7BEA', label: label('moonrise', lang), value: formatTime(day.moonrise, lang) },
  ];
  const bottom: Tile[] = [
    { icon: 'moon-waxing-crescent', tint: '#9C7BEA', label: label('moonset', lang), value: formatTime(day.moonset, lang) },
    { icon: 'flower-tulip', tint: '#F0508A', label: label('tithi', lang), value: tithiName(day.tithi.n, lang), note: note(day.tithi.end) },
    { icon: 'star', tint: '#F5B521', label: label('nakshatra', lang), value: NAKSHATRAS[lang][day.nakshatra.n - 1], note: note(day.nakshatra.end) },
    { icon: 'white-balance-sunny', tint: '#F5A021', label: label('sunSign', lang), value: RASHIS[lang][day.sunRashi] },
    { icon: 'moon-waning-crescent', tint: '#8E8BEA', label: label('moonSign', lang), value: RASHIS[lang][day.moonRashi.n], note: note(day.moonRashi.end) },
  ];
  return (
    <View style={styles.card}>
      <SectionHeader
        title={label('todaysPanchang', lang)}
        action={label('viewDetails', lang)}
        onAction={() => openDay(day.date)}
      />
      <View style={styles.tileRow}>
        {top.map((t) => <PanchangTile key={t.label} tile={t} large />)}
      </View>
      <View style={styles.tileRow}>
        {bottom.map((t) => <PanchangTile key={t.label} tile={t} />)}
      </View>
    </View>
  );
}

function PanchangTile({ tile, large }: { tile: Tile; large?: boolean }) {
  return (
    <View style={[styles.tile, large && styles.tileLarge]}>
      <MaterialCommunityIcons name={tile.icon} size={large ? 32 : 26} color={tile.tint} />
      <Text style={styles.tileLabel} numberOfLines={1} adjustsFontSizeToFit>{tile.label}</Text>
      <Text style={[styles.tileValue, large && styles.tileValueLarge]} numberOfLines={1} adjustsFontSizeToFit>
        {tile.value}
      </Text>
      {tile.note ? <Text style={styles.tileNote} numberOfLines={2}>{tile.note}</Text> : null}
    </View>
  );
}

function UpcomingCard({ festivals, lang }: { festivals: Festival[]; lang: Lang }) {
  return (
    <View style={styles.card}>
      <SectionHeader
        title={lang === 'or' ? 'ଆଗାମୀ ପର୍ବ' : 'Upcoming Festivals'}
        action={lang === 'or' ? 'ସମସ୍ତ' : 'View All'}
        onAction={() => router.navigate('/festivals')}
      />
      {festivals.map((f, i) => {
        const { month, day } = parts(f.date);
        const weekday = getDay(f.date)?.weekday ?? 0;
        return (
          <Pressable
            key={f.id}
            onPress={() => openDay(f.date)}
            style={({ pressed }) => [styles.upRow, i > 0 && styles.upDivider, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.upBadge}>
              <Text style={styles.upDay}>{String(day).padStart(2, '0')}</Text>
              <Text style={styles.upMonth}>{GREGORIAN_MONTHS.en[month].slice(0, 3).toUpperCase()}</Text>
            </View>
            <Text style={styles.upIcon}>{festivalIcon(f)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upName} numberOfLines={1}>{festivalName(f, lang)}</Text>
              <Text style={styles.upSub}>
                {WEEKDAYS[lang][weekday]}
                {f.type === 'holiday' ? (lang === 'or' ? ' · ଛୁଟି' : ' · Holiday') : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction} style={styles.actionPill} accessibilityRole="button">
        <Text style={styles.actionText}>{action} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { height: 250, paddingHorizontal: 16, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: colors.white, fontSize: 14, fontWeight: '600', opacity: 0.95, marginTop: 1 },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 12, gap: 12, marginTop: -84 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 14, ...cardShadow },

  dateCard: { flexDirection: 'row', gap: 12, padding: 12 },
  dateTile: { width: 112, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tileMonth: { color: colors.white, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  tileDay: { color: colors.white, fontSize: 50, fontWeight: '900', lineHeight: 58 },
  tileWeekday: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  tithiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  tithiMonth: { fontSize: 13, fontWeight: '700', color: colors.text },
  tithiName: { fontSize: 26, fontWeight: '900', color: colors.text },
  tithiSecondary: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  metaItem: { flex: 1, fontSize: 11, color: colors.text, textAlign: 'center', fontWeight: '500' },
  metaDivider: { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: colors.muted },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  actionPill: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  tileRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  tile: {
    flex: 1,
    backgroundColor: '#FFF4F8',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 3,
    gap: 3,
  },
  tileLarge: { paddingVertical: 12 },
  tileLabel: { fontSize: 11, color: colors.text },
  tileValue: { fontSize: 12, fontWeight: '800', color: colors.text },
  tileValueLarge: { fontSize: 15 },
  tileNote: { fontSize: 9, color: colors.muted, textAlign: 'center' },

  upRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  upDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  upBadge: { width: 48, paddingVertical: 5, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center' },
  upDay: { fontSize: 18, fontWeight: '900', color: colors.primary },
  upMonth: { fontSize: 10, fontWeight: '800', color: colors.primary },
  upIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  upName: { fontSize: 15, fontWeight: '800', color: colors.text },
  upSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
