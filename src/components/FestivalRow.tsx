import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { festivalIcon } from '../lib/festivalMeta';
import { GREGORIAN_MONTHS, Lang, WEEKDAYS, WEEKDAYS_SHORT } from '../lib/names';
import { Festival, festivalName, getDay, num, parts } from '../lib/panchang';
import { colors } from '../lib/theme';

export function FestivalRow({ festival, lang, onPress }: { festival: Festival; lang: Lang; onPress: () => void }) {
  const { month, day } = parts(festival.date);
  const weekday = getDay(festival.date)?.weekday ?? 0;
  const minor = festival.type === 'vrat' || festival.type === 'sankranti';
  const holiday = festival.type === 'holiday';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={[styles.badge, minor && styles.badgeMinor]}>
        <Text style={[styles.badgeDay, minor && styles.badgeTextMinor]}>{num(String(day).padStart(2, '0'), lang)}</Text>
        <Text style={[styles.badgeSmall, minor && styles.badgeTextMinor]}>
          {GREGORIAN_MONTHS.en[month].slice(0, 3).toUpperCase()}
        </Text>
        <Text style={[styles.badgeSmall, minor && styles.badgeTextMinor]}>{WEEKDAYS_SHORT[lang][weekday]}</Text>
      </View>
      <Text style={styles.icon}>{festivalIcon(festival)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, minor && styles.nameMinor]} numberOfLines={2}>
          {festivalName(festival, lang)}
        </Text>
        <Text style={styles.sub}>
          {WEEKDAYS[lang][weekday]}
          {holiday ? <Text style={styles.holiday}>{lang === 'or' ? ' · ଛୁଟି' : ' · Holiday'}</Text> : null}
        </Text>
      </View>
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  badge: { width: 52, paddingVertical: 5, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
  badgeMinor: { backgroundColor: colors.primarySoft },
  badgeDay: { color: colors.white, fontSize: 19, fontWeight: '800', lineHeight: 22 },
  badgeSmall: { color: colors.white, fontSize: 9, fontWeight: '700', lineHeight: 11 },
  badgeTextMinor: { color: colors.primaryDark },
  icon: { fontSize: 30, width: 40, textAlign: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  nameMinor: { fontWeight: '500', color: colors.muted },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  holiday: { color: colors.primary, fontWeight: '600' },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
