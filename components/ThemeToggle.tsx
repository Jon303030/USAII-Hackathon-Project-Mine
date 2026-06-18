'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('report-workflow-theme') as Theme | null;
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function chooseTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    localStorage.setItem('report-workflow-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  return (
    <div className="theme-toggle" aria-label="Theme selector">
      <button className={theme === 'light' ? 'active' : ''} type="button" onClick={() => chooseTheme('light')}>
        <Sun size={16} />
        {t({ en: 'Light', zh: '浅色' })}
      </button>
      <button className={theme === 'dark' ? 'active' : ''} type="button" onClick={() => chooseTheme('dark')}>
        <Moon size={16} />
        {t({ en: 'Dark', zh: '深色' })}
      </button>
    </div>
  );
}
