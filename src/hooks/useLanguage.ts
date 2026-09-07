import { useState, useCallback } from 'react';
import { translations, type Lang } from '../locales';
import type { TranslationKey } from '../types';

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('fs_lang') as Lang | null;
    return saved || 'ru';
  });

  const t = useCallback((key: TranslationKey): string => {
    // Приведение к Record<string, string> для безопасного доступа
    const dict = translations[lang] as Record<string, string>;
    return dict[key] || key;
  }, [lang]);

  const setLanguage = (l: Lang) => {
    setLang(l);
    localStorage.setItem('fs_lang', l);
  };

  return { lang, t, setLanguage };
}
