export type Language = 'en' | 'hi';

interface TranslationCopy {
  screens: string;
  currency: string;
  light: string;
  dark: string;
  english: string;
  hindi: string;
}

const translations: Record<Language, TranslationCopy> = {
  en: { screens: 'Screens', currency: 'Currency', light: 'Light', dark: 'Dark', english: 'English', hindi: 'हिन्दी' },
  hi: { screens: 'स्क्रीन', currency: 'मुद्रा', light: 'लाइट', dark: 'डार्क', english: 'English', hindi: 'हिन्दी' },
} as const;

export function getTranslations(language: Language): TranslationCopy {
  return translations[language];
}
