import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type BottomTabBarProps, Tabs } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LABELS } from '../../lib/names';
import { label, odiaNum, todayKey } from '../../lib/panchang';
import { useSettings } from '../../lib/settings';
import { colors } from '../../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const TABS: Record<string, { label: keyof typeof LABELS; icon: IconName; active: IconName }> = {
  index: { label: 'home', icon: 'home-outline', active: 'home' },
  calendar: { label: 'calendar', icon: 'calendar-outline', active: 'calendar' },
  festivals: { label: 'festivals', icon: 'star-outline', active: 'star' },
  more: { label: 'more', icon: 'ellipsis-horizontal-circle-outline', active: 'ellipsis-horizontal-circle' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { lang } = useSettings();
  const today = todayKey();
  const day = Number(today.slice(8));

  const renderTab = (name: string) => {
    const index = state.routes.findIndex((r) => r.name === name);
    const route = state.routes[index];
    const focused = state.index === index;
    const tab = TABS[name];
    return (
      <Pressable
        key={name}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
      >
        <View style={styles.pill}>
          {focused && <View style={styles.pillActive} />}
          <Ionicons name={focused ? tab.active : tab.icon} size={22} color={focused ? colors.primary : colors.text} />
        </View>
        <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
          {label(tab.label, lang)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {renderTab('index')}
      {renderTab('calendar')}
      <View style={styles.centerSlot}>
        <Pressable
          onPress={() => router.push({ pathname: '/day/[date]', params: { date: today } })}
          style={({ pressed }) => [styles.centerButton, pressed && { transform: [{ scale: 0.95 }] }]}
          accessibilityRole="button"
          accessibilityLabel="Today's Panchang"
        >
          <View style={styles.centerCal}>
            <View style={styles.centerCalTop} />
            <Text style={styles.centerDay}>{lang === 'or' ? odiaNum(day) : day}</Text>
          </View>
        </Pressable>
        <Text style={[styles.label, styles.labelToday]}>{label('today', lang)}</Text>
      </View>
      {renderTab('festivals')}
      {renderTab('more')}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="festivals" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 4,
    elevation: 12,
    shadowColor: '#7A0A35',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  pill: { paddingHorizontal: 18, paddingVertical: 5 },
  // Mounted (not restyled) on focus: toggling backgroundColor dropped the border radius on Android.
  pillActive: { ...StyleSheet.absoluteFill, backgroundColor: colors.primarySoft, borderRadius: 16 },
  label: { color: colors.text, fontSize: 12, fontWeight: '600' },
  labelActive: { color: colors.primary, fontWeight: '800' },
  labelToday: { color: colors.primary, fontWeight: '800' },
  centerSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  centerButton: {
    position: 'absolute',
    top: -38,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  centerCal: {
    width: 38,
    height: 38,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
  },
  centerCalTop: { height: 9, alignSelf: 'stretch', backgroundColor: colors.primaryDark },
  centerDay: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginTop: 1 },
});
