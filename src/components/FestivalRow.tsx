import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GREGORIAN_MONTHS, Lang, WEEKDAYS } from '../lib/names';
import { Festival, festivalName, getDay, num, parts } from '../lib/panchang';
import { colors, radius } from '../lib/theme';

const ICONS: Record<Festival['type'], string> = { holiday: '🎉', festival: '🪔', sankranti: '☀️', vrat: '🌙' };

export function FestivalRow({ festival, lang, onPress }: { festival: Festival; lang: Lang; onPress: () => void }) {
  const { month, day } = parts(festival.date);
  const weekday = getDay(festival.date)?.weekday ?? 0;
  const minor = festival.type === 'vrat' || festival.type === 'sankranti';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.badge, minor && styles.badgeMinor]}>
        <Text style={[styles.badgeDay, minor && styles.badgeTextMinor]}>{num(String(day).padStart(2, '0'), lang)}</Text>
        <Text style={[styles.badgeMonth, minor && styles.badgeTextMinor]}>
          {GREGORIAN_MONTHS.en[month].slice(0, 3).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, minor && styles.nameMinor]}>
          {ICONS[festival.type]} {festivalName(festival, lang)}
        </Text>
        <Text style={styles.sub}>
          {WEEKDAYS[lang][weekday]}
          {festival.type === 'holiday' ? (lang === 'or' ? ' · ଛୁଟି' : ' · Holiday') : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  badge: {
    width: 50,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  badgeMinor: { backgroundColor: colors.primarySoft },
  badgeDay: { color: colors.white, fontSize: 18, fontWeight: '800' },
  badgeMonth: { color: colors.white, fontSize: 10, fontWeight: '700' },
  badgeTextMinor: { color: colors.primaryDark },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  nameMinor: { fontWeight: '500', color: colors.muted },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
