import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-1 text-sm font-medium border rounded-md transition-colors hover:bg-secondary/10"
      aria-label={`Change language to ${locale === 'es' ? 'English' : 'Spanish'}`}
    >
      <motion.span
        key={locale}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center"
      >
        {locale === 'es' ? (
          <>
            <span className="mr-2">🇪🇸</span>
            <span className="hidden sm:inline">{t('language.en')}</span>
          </>
        ) : (
          <>
            <span className="mr-2">🇬🇧</span>
            <span className="hidden sm:inline">{t('language.es')}</span>
          </>
        )}
      </motion.span>
    </button>
  );
};

export default LanguageSwitcher;