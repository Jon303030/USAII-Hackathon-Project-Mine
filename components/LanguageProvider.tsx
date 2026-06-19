'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';

export type AppLanguage = 'en' | 'zh';

export type BilingualText = {
  en: string;
  zh: string;
};

type LanguageContextValue = {
  language: AppLanguage;
  hasChosenLanguage: boolean;
  chooseLanguage: (language: AppLanguage) => void;
  t: (text: BilingualText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const storageKey = 'report-workflow-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>('zh');
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'en' || saved === 'zh') {
      setLanguage(saved);
      setHasChosenLanguage(true);
      document.documentElement.lang = saved === 'zh' ? 'zh-CN' : 'en';
    }
    setReady(true);
  }, []);

  function chooseLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage);
    setHasChosenLanguage(true);
    localStorage.setItem(storageKey, nextLanguage);
    document.documentElement.lang = nextLanguage === 'zh' ? 'zh-CN' : 'en';
  }

  const value = useMemo(
    () => ({
      language,
      hasChosenLanguage,
      chooseLanguage,
      t: (item: BilingualText) => item[language],
    }),
    [hasChosenLanguage, language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {ready && !hasChosenLanguage ? <LanguageGate onChoose={chooseLanguage} /> : null}
    </LanguageContext.Provider>
  );
}

function LanguageGate({ onChoose }: { onChoose: (language: AppLanguage) => void }) {
  return (
    <div className="language-gate" role="dialog" aria-modal="true" aria-labelledby="language-gate-title">
      <div className="language-gate-panel">
        <span className="language-gate-icon">
          <Languages size={26} />
        </span>
        <div>
          <h2 id="language-gate-title">请选择语言 / Choose Language</h2>
          <p>网站会用您选择的语言显示。您也可以在聊天界面右上角更改。</p>
          <p>The website will use your selected language. You can also change it from the chat header.</p>
        </div>
        <div className="language-gate-actions">
          <button className="btn primary" type="button" onClick={() => onChoose('zh')}>
            华文
          </button>
          <button className="btn primary" type="button" onClick={() => onChoose('en')}>
            English
          </button>
        </div>
      </div>
    </div>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}

export function LanguageSwitch() {
  const { chooseLanguage, language } = useLanguage();

  return (
    <div className="language-switch" aria-label={language === 'zh' ? '语言选择' : 'Language selector'}>
      <button className={language === 'zh' ? 'active' : ''} type="button" onClick={() => chooseLanguage('zh')}>
        华文
      </button>
      <button className={language === 'en' ? 'active' : ''} type="button" onClick={() => chooseLanguage('en')}>
        EN
      </button>
    </div>
  );
}
