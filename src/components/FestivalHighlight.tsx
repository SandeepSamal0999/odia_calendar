import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { festivalBlurb, festivalIcon, tithiObservance } from '../lib/festivalMeta';
import type { Lang } from '../lib/names';
import { festivalName, festivalsOn, isMajor, lunarTithi, PanchangDay, todayKey } from '../lib/panchang';
import { cardShadow, colors } from '../lib/theme';

const otherLang = (lang: Lang): Lang => (lang === 'or' ? 'en' : 'or');

/**
 * The day's main festival — or, when none is listed, the observance tied to its tithi
 * (e.g. Sankashti Chaturthi). Renders nothing when neither applies.
 */
export function FestivalHighlight({ day, lang, onPress }: { day: PanchangDay; lang: Lang; onPress?: () => void }) {
  const todays = festivalsOn(day);
  const festival = todays.find(isMajor) ?? todays[0];
  const observance = festival ? undefined : tithiObservance(day);
  if (!festival && !observance) return null;

  const lunar = (l: Lang) => {
    const t = lunarTithi(day, l);
    return `${t.month} ${t.tithi}`;
  };
  const icon = festival ? festivalIcon(festival) : observance!.icon;
  const title = festival ? festivalName(festival, lang) : lunar(lang);
  const subtitle = festival ? festivalName(festival, otherLang(lang)) : lunar(otherLang(lang));
  const blurb = festival ? festivalBlurb(festival, lang) : observance!.blurb[lang];
  const others = todays.filter((f) => f !== festival).map((f) => festivalName(f, lang));
  const isToday = day.date === todayKey();
  const kicker = lang === 'or' ? (isToday ? 'ଆଜିର ପର୍ବ' : 'ପର୍ବ') : isToday ? "Today's Festival" : 'Festival';

  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress} accessibilityRole="button">
      <LinearGradient colors={['#FFD27A', '#F2803A']} style={styles.art}>
        <Text style={styles.emoji}>{icon}</Text>
      </LinearGradient>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        {blurb ? <Text style={styles.blurb} numberOfLines={2}>{blurb}</Text> : null}
        {others.length > 0 ? <Text style={styles.others} numberOfLines={2}>+ {others.join(', ')}</Text> : null}
      </View>
      {onPress ? (
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    ...cardShadow,
  },
  art: { width: 96, height: 96, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  blurb: { fontSize: 12, color: colors.muted },
  others: { fontSize: 12, color: colors.primaryDark, fontWeight: '600' },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
});
