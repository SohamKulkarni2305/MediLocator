export type Language = 'en' | 'hi';

interface TranslationCopy {
  screens: string;
  currency: string;
  light: string;
  dark: string;
  english: string;
  hindi: string;
  deliverTo: string;
  editDetails: string;
  bloodGroup: string;
  chronicRegimen: string;
  modify: string;
  change: string;
  linkedVerified: string;
  active: string;
  lifetimeSavings: string;
  accountUpdated: string;
  accountSaveFailed: string;
}

const translations: Record<Language, TranslationCopy> = {
  en: { screens: 'Screens', currency: 'Currency', light: 'Light', dark: 'Dark', english: 'English', hindi: 'हिन्दी', deliverTo: 'Deliver to', editDetails: 'Edit Details', bloodGroup: 'Blood Group', chronicRegimen: 'Chronic Regimen', modify: 'Modify', change: 'Change', linkedVerified: 'Linked & Verified', active: 'Active', lifetimeSavings: 'MediLocator Lifetime Savings', accountUpdated: 'Account details updated successfully', accountSaveFailed: 'Could not save account details. Please try again.' },
  hi: { screens: 'स्क्रीन', currency: 'मुद्रा', light: 'लाइट', dark: 'डार्क', english: 'English', hindi: 'हिन्दी', deliverTo: 'डिलीवरी पता', editDetails: 'विवरण बदलें', bloodGroup: 'रक्त समूह', chronicRegimen: 'दीर्घकालिक उपचार', modify: 'बदलें', change: 'परिवर्तन', linkedVerified: 'लिंक और सत्यापित', active: 'सक्रिय', lifetimeSavings: 'मेडीलोकेटर की कुल बचत', accountUpdated: 'खाते का विवरण सफलतापूर्वक अपडेट हुआ', accountSaveFailed: 'खाते का विवरण सेव नहीं हो सका। कृपया पुनः प्रयास करें।' },
} as const;

export function getTranslations(language: Language): TranslationCopy {
  return translations[language];
}
