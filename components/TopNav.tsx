'use client';

import Link from 'next/link';
import { FileEdit, Heart, Home, Search, SquareStack, Users } from 'lucide-react';
import { LanguageSwitch, useLanguage } from './LanguageProvider';
import { ThemeToggle } from './ThemeToggle';

export function TopNav() {
  const { t } = useLanguage();

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">RW</span>
        <span>{t({ en: 'Report Workflow', zh: '申请流程助手' })}</span>
      </Link>
      <nav className="nav" aria-label={t({ en: 'Primary navigation', zh: '主要导航' })}>
        <Link href="/" title={t({ en: 'Main page', zh: '首页' })}>
          <Home size={17} />
          {t({ en: 'Main', zh: '首页' })}
        </Link>
        <Link href="/assistant" title={t({ en: 'Senior application assistant', zh: '长者申请助手' })}>
          <Heart size={17} />
          {t({ en: 'Assistant', zh: '助手' })}
        </Link>
        <Link href="/fill" title={t({ en: 'Fill workflow', zh: '填写流程' })}>
          <FileEdit size={17} />
          {t({ en: 'Form Fill', zh: '填写表格' })}
        </Link>
        <Link href="/navigate" title={t({ en: 'Navigate workflow', zh: '寻找表格流程' })}>
          <Search size={17} />
          {t({ en: 'Navigator', zh: '找表格' })}
        </Link>
        <Link href="/view" title={t({ en: 'View workflow', zh: '查看表格流程' })}>
          <SquareStack size={17} />
          {t({ en: 'Form Viewer', zh: '查看表格' })}
        </Link>
        <Link href="/user-management" title={t({ en: 'User management', zh: '用户管理' })}>
          <Users size={17} />
          {t({ en: 'Users', zh: '用户' })}
        </Link>
        <LanguageSwitch />
        <ThemeToggle />
      </nav>
    </header>
  );
}
