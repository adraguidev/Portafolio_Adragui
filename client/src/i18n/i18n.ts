import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    resources: {
      en,
      es,
      fr,
      it,
      de,
      pt,
      ja,
      zh
    },
    supportedLngs: ['es', 'en', 'fr', 'it', 'de', 'pt', 'ja', 'zh'],
  }); 