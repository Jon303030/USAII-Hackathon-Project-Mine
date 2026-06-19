'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileEdit, Heart, Search, SquareStack, Users } from 'lucide-react';
import { LanguageSwitch, useLanguage } from './LanguageProvider';
import { ThemeToggle } from './ThemeToggle';

const modules = [
  {
    href: '/assistant',
    title: { en: 'Assistant', zh: '助手' },
    fullTitle: { en: 'Senior application assistant', zh: '长者申请助手' },
    icon: Heart,
  },
  {
    href: '/fill',
    title: { en: 'Form Fill', zh: '填写表格' },
    fullTitle: { en: 'Fill workflow', zh: '填写流程' },
    icon: FileEdit,
  },
  {
    href: '/navigate',
    title: { en: 'Navigator', zh: '找表格' },
    fullTitle: { en: 'Navigate workflow', zh: '寻找表格流程' },
    icon: Search,
  },
  {
    href: '/view',
    title: { en: 'Form Viewer', zh: '查看表格' },
    fullTitle: { en: 'View workflow', zh: '查看表格流程' },
    icon: SquareStack,
  },
  {
    href: '/user-management',
    title: { en: 'Users', zh: '用户' },
    fullTitle: { en: 'User management', zh: '用户管理' },
    icon: Users,
  },
] as const;

export function TopNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="topbar">
      <Link className="brand" href="/assistant" title={t({ en: 'Senior application assistant', zh: '长者申请助手' })}>
        <span className="brand-mark">RW</span>
        <span>{t({ en: 'Report Workflow', zh: '申请流程助手' })}</span>
      </Link>
      <nav className="nav" aria-label={t({ en: 'Page switcher', zh: '页面切换' })}>
        {modules.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={active ? 'active' : ''}
              href={item.href}
              key={item.href}
              title={t(item.fullTitle)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} />
              {t(item.title)}
            </Link>
          );
        })}
        <LanguageSwitch />
        <ThemeToggle />
      </nav>
    </header>
  );
}
