import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { FestivalRow } from '../../components/FestivalRow';
import { MonthGrid } from '../../components/MonthGrid';
import { GREGORIAN_MONTHS } from '../../lib/names';
import { festivalsInMonth, label, parts, todayKey, YEAR } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { colors, radius } from '../../lib/theme';

const openDay = (date: string) => router.push({ pathname: '/day/[date]', params: { date } });
const clampMonth = (i: number) => Math.max(0, Math.min(11, i));

export default function CalendarScreen() {
  const { lang } = useSettings();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ month?: string }>();
  const today = todayKey();
  const monthParam = Number(params.month) - 1;
  const [index, setIndex] = useState(monthParam >= 0 && monthParam < 12 ? monthParam : parts(today).month);
  const scrollRef = useRef<ScrollView>(null);

  // Navigation from other tabs (/calendar?month=9) selects that month.
  const [handledParam, setHandledParam] = useState(params.month);
  if (params.month !== handledParam) {
    setHandledParam(params.month);
    if (monthParam >= 0 && monthParam < 12) setIndex(monthParam);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [index]);

  const goTo = (i: number) => setIndex(clampMonth(i));

  // Horizontal swipe changes month; vertical drags stay with the ScrollView.
  const [swipe] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 60) setIndex((i) => clampMonth(i + (g.dx < 0 ? 1 : -1)));
      },
      onPanResponderTerminationRequest: () => false,
    }),
  );

  const festivals = festivalsInMonth(index);

  return (
    <View style={styles.screen}>
      <AppHeader
        left={{ icon: 'back', onPress: () => router.navigate('/') }}
        right={<Text style={styles.counter}>{`${index + 1}/12`}</Text>}
      />
      <View style={styles.monthBar}>
        <Pressable
          style={[styles.arrow, index === 0 && styles.arrowDisabled]}
          onPress={() => goTo(index - 1)}
          disabled={index === 0}
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => goTo(parts(today).month)} style={styles.monthTitleWrap}>
          <Text style={styles.monthTitle}>{GREGORIAN_MONTHS.en[index]}</Text>
          <Text style={styles.monthSub}>{YEAR}</Text>
        </Pressable>
        <Pressable
          style={[styles.arrow, index === 11 && styles.arrowDisabled]}
          onPress={() => goTo(index + 1)}
          disabled={index === 11}
          accessibilityLabel="Next month"
        >
          <Ionicons name="chevron-forward" size={28} color={colors.primary} />
        </Pressable>
      </View>
      <View style={{ flex: 1 }} {...swipe.panHandlers}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.page}>
          <MonthGrid month={index} width={width} lang={lang} today={today} onPressDay={openDay} />
          <View style={styles.festivalsCard}>
            <Text style={styles.festivalsTitle}>
              {lang === 'or'
                ? `${GREGORIAN_MONTHS.or[index]} ${label('festivals', 'or')}`
                : `${label('festivalsIn', 'en')} ${GREGORIAN_MONTHS.en[index]}`}
            </Text>
            {festivals.length === 0 ? (
              <Text style={styles.empty}>—</Text>
            ) : (
              festivals.map((f) => <FestivalRow key={f.id} festival={f} lang={lang} onPress={() => openDay(f.date)} />)
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  counter: { color: colors.white, fontSize: 20, fontWeight: '700' },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  arrow: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  arrowDisabled: { opacity: 0.4 },
  monthTitleWrap: { flex: 1, alignItems: 'center' },
  monthTitle: { color: colors.white, fontSize: 24, fontWeight: '800' },
  monthSub: { color: colors.primarySoft, fontSize: 12, fontWeight: '600' },
  page: { paddingTop: 6, paddingBottom: 40, gap: 14 },
  festivalsCard: { marginHorizontal: 10, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' },
  festivalsTitle: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 10,
  },
  empty: { textAlign: 'center', padding: 16, color: colors.muted },
});
