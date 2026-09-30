import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { label, YEAR } from '../lib/panchang';
import { colors } from '../lib/theme';

interface Props {
  /** Left button: back arrow or menu. */
  left?: { icon: 'back' | 'menu'; onPress: () => void };
  title?: string;
  right?: ReactNode;
}

export function AppHeader({ left, title, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      {left ? (
        <Pressable onPress={left.onPress} hitSlop={12} style={styles.side} accessibilityRole="button"
          accessibilityLabel={left.icon === 'back' ? 'Back' : 'Menu'}>
          <Ionicons name={left.icon === 'back' ? 'chevron-back' : 'menu'} size={28} color={colors.white} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title ?? `${label('appTitle', 'en')} ${YEAR}`}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function HeaderIcon({ name, onPress, label: a11y }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={a11y} style={styles.icon}>
      <Ionicons name={name} size={26} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  side: { width: 36 },
  title: { flex: 1, color: colors.white, fontSize: 21, fontWeight: '700', marginLeft: 6 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 14, minWidth: 36, justifyContent: 'flex-end' },
  icon: { padding: 2 },
});
