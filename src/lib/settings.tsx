import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from './names';

interface Settings {
  lang: Lang;
  toggleLang: () => void;
  saved: string[];
  isSaved: (date: string) => boolean;
  toggleSaved: (date: string) => void;
}

const SettingsContext = createContext<Settings | null>(null);
const STORAGE_KEY = 'odia-calendar/settings/v1';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('or');
  const [saved, setSaved] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as Partial<{ lang: Lang; saved: string[] }>;
        if (stored.lang === 'en' || stored.lang === 'or') setLang(stored.lang);
        if (Array.isArray(stored.saved)) setSaved(stored.saved);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, saved })).catch(() => {});
  }, [lang, saved, loaded]);

  const toggleLang = useCallback(() => setLang((l) => (l === 'or' ? 'en' : 'or')), []);
  const toggleSaved = useCallback(
    (date: string) => setSaved((s) => (s.includes(date) ? s.filter((d) => d !== date) : [...s, date].sort())),
    [],
  );

  const value = useMemo(
    () => ({ lang, toggleLang, saved, isSaved: (d: string) => saved.includes(d), toggleSaved }),
    [lang, toggleLang, saved, toggleSaved],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
