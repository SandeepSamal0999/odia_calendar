import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { label, LOCATION, YEAR } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { colors, radius } from '../../lib/theme';

function Row({ icon, title, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.rowTitle}>{title}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

export default function MoreScreen() {
  const { lang, toggleLang, saved } = useSettings();
  return (
    <View style={styles.screen}>
      <AppHeader left={{ icon: 'back', onPress: () => router.navigate('/') }} title={label('more', lang)} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Row icon="globe-outline" title={label('language', lang)} value={lang === 'or' ? 'ଓଡ଼ିଆ' : 'English'} onPress={toggleLang} />
          <Row icon="star-outline" title={label('saved', lang)} value={String(saved.length)} onPress={() => router.push('/saved')} />
          <Row icon="location-outline" title={label('location', lang)} value={`${LOCATION.name} (IST)`} />
        </View>
        <View style={styles.card}>
          <Text style={styles.aboutTitle}>{label('about', lang)}</Text>
          <Text style={styles.about}>
            {lang === 'or'
              ? `ଓଡ଼ିଆ କ୍ୟାଲେଣ୍ଡର ${YEAR} — ତିଥି, ନକ୍ଷତ୍ର, ଯୋଗ, କରଣ, ସୂର୍ଯ୍ୟୋଦୟ ଓ ସୂର୍ଯ୍ୟାସ୍ତ ${LOCATION.name} ପାଇଁ ଗଣନା କରାଯାଇଛି। ପର୍ବ ତାରିଖ ତିଥି ନିୟମ ଅନୁସାରେ ନିର୍ଣ୍ଣୟ କରାଯାଇଛି; ଧାର୍ମିକ କାର୍ଯ୍ୟ ପାଇଁ ସ୍ଥାନୀୟ ପଞ୍ଜିକା ସହ ମିଳାଇ ନିଅନ୍ତୁ।`
              : `Odia Calendar ${YEAR}. Tithi, nakshatra, yoga, karana, sunrise and sunset are calculated for ${LOCATION.name}, Odisha (Lahiri ayanamsa). Festival dates follow their tithi rules; please confirm with your local Panjika for religious observances.`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  rowValue: { fontSize: 14, color: colors.muted },
  aboutTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, padding: 16, paddingBottom: 4 },
  about: { fontSize: 14, lineHeight: 21, color: colors.muted, padding: 16, paddingTop: 4 },
});
