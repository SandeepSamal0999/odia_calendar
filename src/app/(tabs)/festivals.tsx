import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { FestivalRow } from '../../components/FestivalRow';
import { GREGORIAN_MONTHS } from '../../lib/names';
import { festivalsInMonth, isMajor, label, num, YEAR } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { colors } from '../../lib/theme';

export default function FestivalsScreen() {
  const { lang } = useSettings();
  const [showAll, setShowAll] = useState(false);

  const sections = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => ({
        month,
        data: festivalsInMonth(month).filter((f) => showAll || isMajor(f)),
      })).filter((s) => s.data.length > 0),
    [showAll],
  );

  return (
    <View style={styles.screen}>
      <AppHeader left={{ icon: 'back', onPress: () => router.navigate('/') }} title={`${label('festivals', lang)} ${num(YEAR, lang)}`} />
      <View style={styles.chips}>
        {[false, true].map((all) => (
          <Pressable
            key={String(all)}
            onPress={() => setShowAll(all)}
            style={[styles.chip, showAll === all && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: showAll === all }}
          >
            <Text style={[styles.chipText, showAll === all && styles.chipTextActive]}>
              {label(all ? 'all' : 'majorOnly', lang)}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(f) => f.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <Pressable
            style={styles.header}
            onPress={() => router.navigate({ pathname: '/calendar', params: { month: String(section.month + 1) } })}
          >
            <Text style={styles.headerText}>
              {GREGORIAN_MONTHS.en[section.month]} {YEAR}
            </Text>
            <Text style={styles.headerLink}>{lang === 'or' ? 'କ୍ୟାଲେଣ୍ଡର ›' : 'Calendar ›'}</Text>
          </Pressable>
        )}
        renderItem={({ item }) => (
          <FestivalRow festival={item} lang={lang} onPress={() => router.push({ pathname: '/day/[date]', params: { date: item.date } })} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', gap: 8, padding: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '700' },
  chipTextActive: { color: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerText: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  headerLink: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
