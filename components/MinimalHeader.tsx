'use client';

import { LanguageSwitch, useLanguage } from './LanguageProvider';
import { ThemeToggle } from './ThemeToggle';

export function MinimalHeader() {
  const { t } = useLanguage();

  return (
    <header className="topbar minimal-topbar">
      <div className="brand minimal-brand">
        <span className="brand-mark">RW</span>
        <span>{t({ en: 'Senior Application Assistant', zh: '长者申请助手' })}</span>
      </div>
      <div className="minimal-topbar-actions">
        <LanguageSwitch />
        <ThemeToggle />
      </div>
    </header>
  );
}
