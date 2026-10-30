import { useCallback, useEffect, useMemo, useState } from 'react';
import translations from '../data/translations.js';
import LanguageContext from './languageContext.js';

function getSavedLanguage() {
  try { return localStorage.getItem('noirson-language') === 'en' ? 'en' : 'zh'; }
  catch { return 'zh'; }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage);
  const setLanguage = useCallback((nextLanguage) => {
    const next = nextLanguage === 'en' ? 'en' : 'zh';
    setLanguageState(next);
    try { localStorage.setItem('noirson-language', next); } catch { /* Current session still switches. */ }
  }, []);
  const t = useCallback((key) => translations[language][key] ?? translations.en[key] ?? key, [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-TW' : 'en'; }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
