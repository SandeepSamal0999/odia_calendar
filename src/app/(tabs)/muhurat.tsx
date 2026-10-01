import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ComponentProps, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroBackdrop } from '../../components/TempleArt';
import { Choghadiya, isNow, muhuratFor, QUALITY_LABEL, Quality, Slot } from '../../lib/muhurat';
import { Lang, WEEKDAYS } from '../../lib/names';
import { formatTime, getDay, gregorianLong, label, lunarTithi, shiftDate, todayKey } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { cardShadow, colors } from '../../lib/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const QUALITY_COLORS: Record<Quality, { fg: string; bg: string }> = {
  best: { fg: '#1B7F3B', bg: '#DDF5E4' },
  good: { fg: '#2E7D32', bg: '#E8F5E9' },
  neutral: { fg: '#8A6D00', bg: '#FFF4CC' },
  bad: { fg: '#C62828', bg: '#FDE4E4' },
};

const range = (slot: Slot, lang: Lang) => `${formatTime(slot.start, lang)} – ${formatTime(slot.end, lang)}`;

export default function MuhuratScreen() {
  const { lang } = useSettings();
  const insets = useSafeAreaInsets();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [now, setNow] = useState(() => Date.now());
  const day = getDay(date)!;
  const m = muhuratFor(day);
  const [showNight, setShowNight] = useState(() => m.night.some((slot) => isNow(slot, now)));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const go = (n: number) => {
    const next = shiftDate(date, n);
    if (getDay(next)) setDate(next);
  };
  const t = lunarTithi(day, lang);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#FDEAF2', '#FBDDE9', '#FDEEF4']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <HeroBackdrop />
          <View style={styles.heroRow}>
            <Text style={styles.heroTitle}>{label('muhurat', lang)}</Text>
            <Pressable onPress={() => router.push('/saved')} hitSlop={10} accessibilityLabel={label('saved', lang)}>
              <Ionicons name="star" size={26} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.card, styles.dateCard]}>
            <CircleButton icon="arrow-back" onPress={() => go(-1)} label="Previous day" />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.dateTitle}>{gregorianLong(date, lang)}</Text>
              <Text style={styles.dateSub} numberOfLines={1}>
                {WEEKDAYS[lang][day.weekday]} · {t.month} {t.tithi}
              </Text>
              {date !== today ? (
                <Pressable onPress={() => setDate(today)} style={styles.todayChip}>
                  <Text style={styles.todayChipText}>{label('goToToday', lang)}</Text>
                </Pressable>
              ) : null}
            </View>
            <CircleButton icon="arrow-forward" onPress={() => go(1)} label="Next day" />
          </View>

          <View style={styles.card}>
            <SectionTitle icon="check-decagram" tint="#1B7F3B" title={label('auspicious', lang)} />
            <TimingRow
              icon="white-balance-sunny"
              tint="#F2A01E"
              title={label('abhijit', lang)}
              slot={m.abhijit}
              lang={lang}
              good
              now={now}
              note={day.weekday === 3 ? (lang === 'or' ? 'ବୁଧବାରରେ ଗ୍ରହଣୀୟ ନୁହେଁ' : 'Not observed on Wednesdays') : undefined}
            />
            <TimingRow icon="meditation" tint="#7B5FE0" title={label('brahma', lang)} slot={m.brahma} lang={lang} good now={now} />
          </View>

          <View style={styles.card}>
            <SectionTitle icon="alert-octagon" tint="#C62828" title={label('inauspicious', lang)} />
            <TimingRow icon="clock-alert-outline" tint="#C62828" title={label('rahuKaal', lang)} slot={m.rahuKaal} lang={lang} now={now} />
            <TimingRow icon="skull-outline" tint="#8E2C48" title={label('yamaganda', lang)} slot={m.yamaganda} lang={lang} now={now} />
            <TimingRow icon="timer-sand" tint="#6D4C41" title={label('gulika', lang)} slot={m.gulika} lang={lang} now={now} />
          </View>

          <View style={styles.card}>
            <View style={styles.choghadiyaHeader}>
              <SectionTitle icon="clock-time-eight-outline" tint={colors.primary} title={label('choghadiya', lang)} />
              <View style={styles.segment}>
                {[false, true].map((night) => (
                  <Pressable
                    key={String(night)}
                    onPress={() => setShowNight(night)}
                    style={[styles.segmentBtn, showNight === night && styles.segmentActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: showNight === night }}
                  >
                    <Ionicons name={night ? 'moon' : 'sunny'} size={14} color={showNight === night ? colors.white : colors.primary} />
                    <Text style={[styles.segmentText, showNight === night && styles.segmentTextActive]}>
                      {label(night ? 'nightTime' : 'dayTime', lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {(showNight ? m.night : m.day).map((slot) => (
              <ChoghadiyaRow key={slot.start} slot={slot} lang={lang} current={isNow(slot, now)} />
            ))}
          </View>
        </View>
      </ScrollView>
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

function SectionTitle({ icon, tint, title }: { icon: IconName; tint: string; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <MaterialCommunityIcons name={icon} size={22} color={tint} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface TimingProps {
  icon: IconName;
  tint: string;
  title: string;
  slot: Slot;
  lang: Lang;
  now: number;
  good?: boolean;
  note?: string;
}

function TimingRow({ icon, tint, title, slot, lang, now, good, note }: TimingProps) {
  const current = isNow(slot, now);
  const q = QUALITY_COLORS[good ? 'good' : 'bad'];
  return (
    <View style={[styles.timingRow, current && { backgroundColor: q.bg }]}>
      <View style={[styles.bubble, { backgroundColor: `${tint}1F` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.timingTitle}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.timingValue, { color: q.fg }]}>{range(slot, lang)}</Text>
        {current ? <NowBadge lang={lang} color={q.fg} /> : null}
      </View>
    </View>
  );
}

function ChoghadiyaRow({ slot, lang, current }: { slot: Choghadiya; lang: Lang; current: boolean }) {
  const q = QUALITY_COLORS[slot.quality];
  return (
    <View style={[styles.chRow, current && styles.chRowCurrent]}>
      <View style={[styles.chDot, { backgroundColor: q.fg }]} />
      <Text style={styles.chName}>{slot.name[lang]}</Text>
      {current ? <NowBadge lang={lang} color={colors.primary} /> : null}
      <Text style={styles.chTime}>{range(slot, lang)}</Text>
      <View style={[styles.chip, { backgroundColor: q.bg }]}>
        <Text style={[styles.chipText, { color: q.fg }]}>{QUALITY_LABEL[slot.quality][lang]}</Text>
      </View>
    </View>
  );
}

function NowBadge({ lang, color }: { lang: Lang; color: string }) {
  return (
    <View style={[styles.nowBadge, { borderColor: color }]}>
      <Text style={[styles.nowText, { color }]}>{label('now', lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { height: 170, paddingHorizontal: 16, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 4 },
  heroTitle: { flex: 1, color: colors.white, fontSize: 24, fontWeight: '800' },
  body: { paddingHorizontal: 12, gap: 12, marginTop: -80 },
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
  dateTitle: { fontSize: 19, fontWeight: '800', color: '#1E2A5A' },
  dateSub: { fontSize: 13, color: colors.muted, marginTop: 3 },
  todayChip: { marginTop: 6, backgroundColor: colors.primarySoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3 },
  todayChipText: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12 },
  bubble: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  timingTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  timingValue: { fontSize: 14, fontWeight: '800' },
  note: { fontSize: 11, color: colors.muted, marginTop: 1 },

  choghadiyaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  segment: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: 16, padding: 3 },
  segmentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13 },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  segmentTextActive: { color: colors.white },
  chRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  chRowCurrent: { backgroundColor: '#FFF0F5', borderRadius: 10 },
  chDot: { width: 8, height: 8, borderRadius: 4 },
  chName: { fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 64 },
  chTime: { flex: 1, textAlign: 'right', fontSize: 13, color: colors.text, fontWeight: '600' },
  chip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, minWidth: 58, alignItems: 'center' },
  chipText: { fontSize: 11, fontWeight: '800' },
  nowBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 },
  nowText: { fontSize: 10, fontWeight: '800' },
});
