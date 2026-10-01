import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FestivalRow } from '../../components/FestivalRow';
import { HeroBackdrop } from '../../components/TempleArt';
import { GREGORIAN_MONTHS, Lang } from '../../lib/names';
import { festivalsInMonth, isMajor, label, num, YEAR } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { cardShadow, colors } from '../../lib/theme';

const countText = (n: number, lang: Lang) =>
  lang === 'or' ? `${num(n, 'or')} ଟି ପର୍ବ` : `${n} ${n === 1 ? 'Festival' : 'Festivals'}`;

export default function FestivalsScreen() {
  const { lang } = useSettings();
  const insets = useSafeAreaInsets();
  const [showAll, setShowAll] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<number, number>>({});

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => ({
        month,
        festivals: festivalsInMonth(month).filter((f) => showAll || isMajor(f)),
      })).filter((m) => m.festivals.length > 0),
    [showAll],
  );

  const toggle = (month: number) =>
    setCollapsed((c) => {
      const next = new Set(c);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });

  const jumpTo = (month: number) => {
    setPickerOpen(false);
    setCollapsed((c) => {
      const next = new Set(c);
      next.delete(month);
      return next;
    });
    scrollRef.current?.scrollTo({ y: offsets.current[month] ?? 0, animated: true });
  };

  const openDay = (date: string) => router.push({ pathname: '/day/[date]', params: { date } });

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <HeroBackdrop />
        <View style={styles.heroRow}>
          <Pressable onPress={() => router.navigate('/')} hitSlop={12} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {lang === 'or' ? `ପର୍ବପର୍ବାଣୀ ${num(YEAR, 'or')}` : `Festivals ${YEAR}`}
            </Text>
            <Text style={styles.heroSubtitle}>
              {lang === 'or' ? `Odisha Festivals ${YEAR}` : `ଓଡ଼ିଶା ପର୍ବପର୍ବାଣୀ ${num(YEAR, 'or')}`}
            </Text>
          </View>
        </View>
        <View style={styles.controls}>
          <View style={styles.segment}>
            {[false, true].map((all) => (
              <Pressable
                key={String(all)}
                onPress={() => setShowAll(all)}
                style={[styles.segmentBtn, showAll === all && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: showAll === all }}
              >
                <Text style={[styles.segmentText, showAll === all && styles.segmentTextActive]}>
                  {label(all ? 'all' : 'majorOnly', lang)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.monthBtn} onPress={() => setPickerOpen(true)} accessibilityRole="button">
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.primary} />
            <Text style={styles.monthBtnText}>{lang === 'or' ? 'ମାସ ବାଛନ୍ତୁ' : 'Select Month'}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
        {months.map(({ month, festivals }) => {
          const isCollapsed = collapsed.has(month);
          return (
            <View
              key={month}
              style={styles.card}
              onLayout={(e) => {
                offsets.current[month] = e.nativeEvent.layout.y - 10;
              }}
            >
              <Pressable
                style={[styles.cardHeader, isCollapsed && styles.cardHeaderCollapsed]}
                onPress={() => toggle(month)}
                accessibilityRole="button"
                accessibilityState={{ expanded: !isCollapsed }}
              >
                <MaterialCommunityIcons name="calendar-month" size={22} color={colors.primary} />
                <Text style={styles.cardTitle}>
                  {GREGORIAN_MONTHS.en[month]} {YEAR}
                </Text>
                <Text style={styles.count}>{countText(festivals.length, lang)}</Text>
                <Ionicons name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={18} color={colors.primary} />
              </Pressable>
              {!isCollapsed &&
                festivals.map((f) => <FestivalRow key={f.id} festival={f} lang={lang} onPress={() => openDay(f.date)} />)}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.sheetTitle}>{lang === 'or' ? 'ମାସ ବାଛନ୍ତୁ' : 'Select Month'}</Text>
            <View style={styles.monthGrid}>
              {months.map(({ month, festivals }) => (
                <Pressable key={month} style={styles.monthCell} onPress={() => jumpTo(month)} accessibilityRole="button">
                  <Text style={styles.monthCellName}>{GREGORIAN_MONTHS.en[month].slice(0, 3)}</Text>
                  <Text style={styles.monthCellCount}>{num(festivals.length, lang)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FDEAF2' },
  hero: { height: 168, paddingHorizontal: 14, overflow: 'hidden', justifyContent: 'space-between', paddingBottom: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: colors.white, fontSize: 13, fontWeight: '600', opacity: 0.95 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 3 },
  segmentBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 17 },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  segmentTextActive: { color: colors.white },
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...cardShadow,
  },
  monthBtnText: { color: colors.text, fontSize: 12, fontWeight: '600' },

  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden', ...cardShadow },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FDE3EE',
  },
  cardHeaderCollapsed: { backgroundColor: '#FDEBF2' },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  count: { fontSize: 12, fontWeight: '600', color: colors.primary },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 12 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell: {
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  monthCellName: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  monthCellCount: { fontSize: 11, color: colors.primary, marginTop: 2 },
});
