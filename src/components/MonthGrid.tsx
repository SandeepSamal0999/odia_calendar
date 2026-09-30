import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WEEKDAYS_SHORT } from '../lib/names';
import { daysInMonth, festivalName, festivalsOn, isMajor, odiaNum, PanchangDay, tithiName } from '../lib/panchang';
import type { Lang } from '../lib/names';
import { colors, radius } from '../lib/theme';

interface Props {
  month: number;
  width: number;
  lang: Lang;
  today: string;
  onPressDay: (date: string) => void;
}

function Cell({ day, lang, isToday, onPress }: { day: PanchangDay; lang: Lang; isToday: boolean; onPress: () => void }) {
  const fests = festivalsOn(day);
  const major = fests.find(isMajor);
  const holiday = fests.some((f) => f.type === 'holiday');
  const isSunday = day.weekday === 0;
  const dateNum = Number(day.date.slice(8));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${day.date}${major ? `, ${major.en}` : ''}`}
      style={({ pressed }) => [
        styles.cell,
        holiday && styles.holiday,
        isToday && styles.today,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.date, (isSunday || holiday) && styles.red]}>{dateNum}</Text>
      <Text style={styles.odia} numberOfLines={1}>
        {lang === 'or' ? odiaNum(day.odia.day) : day.odia.day}
      </Text>
      <Text style={styles.tithi} numberOfLines={1}>
        {tithiName(day.tithi.n, lang)}
      </Text>
      {major ? (
        <Text style={styles.festival} numberOfLines={1}>
          {festivalName(major, lang).split(' · ')[0]}
        </Text>
      ) : fests.length > 0 ? (
        <View style={styles.dot} />
      ) : null}
    </Pressable>
  );
}

export const MonthGrid = memo(function MonthGrid({ month, width, lang, today, onPressDay }: Props) {
  const days = daysInMonth(month);
  const lead = days[0].weekday;
  const cells: (PanchangDay | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const cellWidth = Math.floor((width - 12) / 7);

  return (
    <View style={{ paddingHorizontal: 6 }}>
      <View style={styles.row}>
        {WEEKDAYS_SHORT[lang].map((w, i) => (
          <Text key={w} style={[styles.weekday, { width: cellWidth }, i === 0 && styles.red]}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((day, i) => (
            <View key={i} style={{ width: cellWidth, padding: 2 }}>
              {day ? (
                <Cell day={day} lang={lang} isToday={day.date === today} onPress={() => onPressDay(day.date)} />
              ) : (
                <View style={styles.empty} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  weekday: { textAlign: 'center', fontWeight: '700', fontSize: 12, color: colors.muted, paddingVertical: 8 },
  cell: {
    minHeight: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#F6E1EA',
  },
  empty: { minHeight: 72 },
  holiday: { backgroundColor: colors.holidayBg, borderColor: colors.border },
  today: { borderColor: colors.todayRing, borderWidth: 2 },
  pressed: { opacity: 0.6 },
  date: { fontSize: 19, fontWeight: '700', color: colors.text },
  red: { color: colors.sunday },
  odia: { fontSize: 11, color: colors.primaryDark, fontWeight: '600' },
  tithi: { fontSize: 9, color: colors.muted },
  festival: { fontSize: 9, color: colors.primary, fontWeight: '700', marginTop: 1 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 3 },
});
