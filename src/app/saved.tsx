import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { WEEKDAYS } from '../lib/names';
import { festivalName, festivalsOn, getDay, gregorianLong, label, odiaDate } from '../lib/panchang';
import { useSettings } from '../lib/settings';
import { colors } from '../lib/theme';

export default function SavedScreen() {
  const { lang, saved } = useSettings();
  const days = saved.map(getDay).filter((d) => d !== undefined);
  return (
    <View style={styles.screen}>
      <AppHeader left={{ icon: 'back', onPress: () => router.back() }} title={label('saved', lang)} />
      <FlatList
        data={days}
        keyExtractor={(d) => d.date}
        ListEmptyComponent={<Text style={styles.empty}>{label('noSaved', lang)}</Text>}
        renderItem={({ item }) => {
          const fest = festivalsOn(item)[0];
          return (
            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/day/[date]', params: { date: item.date } })}>
              <Text style={styles.title}>{gregorianLong(item.date, lang)} · {WEEKDAYS[lang][item.weekday]}</Text>
              <Text style={styles.sub}>
                {odiaDate(item, lang)}
                {fest ? ` · ${festivalName(fest, lang)}` : ''}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { textAlign: 'center', color: colors.muted, padding: 32, fontSize: 15 },
  row: { backgroundColor: colors.card, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 3 },
});
