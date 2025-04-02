import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <motion.div 
      className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-1"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {i18n.language === 'es' || i18n.language.startsWith('es') ? (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center space-x-1 h-8 px-2"
          onClick={() => changeLanguage('en')}
        >
          <span className="text-sm mr-1">🇬🇧</span>
          <span className="text-xs font-medium">{t('switchToEnglish')}</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center space-x-1 h-8 px-2"
          onClick={() => changeLanguage('es')}
        >
          <span className="text-sm mr-1">🇪🇸</span>
          <span className="text-xs font-medium">{t('switchToSpanish')}</span>
        </Button>
      )}
    </motion.div>
  );
};

export default LanguageSwitcher;