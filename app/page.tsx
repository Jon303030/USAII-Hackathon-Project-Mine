'use client';

import Link from 'next/link';
import { FileEdit, FileStack, Heart, Search, Users } from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { useLanguage, type BilingualText } from '@/components/LanguageProvider';

const modules = [
  {
    href: '/assistant',
    title: { en: 'Senior Assistant', zh: '长者申请助手' },
    body: {
      en: 'Bilingual guided flow for seniors: collect details, match aid forms, review drafts, consent, and prepare SMS follow-up.',
      zh: '给长者使用的双语引导流程：收集资料、匹配援助表格、复核草稿、同意条款并准备短信通知。',
    },
    icon: Heart,
  },
  {
    href: '/fill',
    title: { en: 'Form Fill', zh: '填写表格' },
    body: {
      en: 'Answer three chatbot prompts with tap, text, or voice. Review the filled result right away.',
      zh: '通过点击、输入或语音回答三个问题，并马上查看填写结果。',
    },
    icon: FileEdit,
  },
  {
    href: '/navigate',
    title: { en: 'Navigator', zh: '找表格' },
    body: {
      en: 'Answer three guided questions, extract keywords, and open the right report.',
      zh: '回答三个引导问题，系统提取关键词并找出合适表格。',
    },
    icon: Search,
  },
  {
    href: '/view',
    title: { en: 'Form Viewer', zh: '查看表格' },
    body: {
      en: 'Upload, preview, extract, delete, merge, and download PDF files from the PVC workspace.',
      zh: '上传、预览、抽取、删除、合并和下载 PDF 表格文件。',
    },
    icon: FileStack,
  },
  {
    href: '/user-management',
    title: { en: 'User Management', zh: '用户管理' },
    body: {
      en: 'Add users, review access, and keep roles simple: user or admin.',
      zh: '新增用户、查看权限，并以普通用户和管理员两种角色管理。',
    },
    icon: Users,
  },
] satisfies Array<{
  href: string;
  title: BilingualText;
  body: BilingualText;
  icon: typeof Heart;
}>;

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="dashboard-hero">
          <div>
            <h1>{t({ en: 'Dashboard', zh: '主页面' })}</h1>
            <p>
              {t({
                en: 'Choose a language first, then use one clean workspace for application help, form filling, PDF viewing, and user access.',
                zh: '请先选择语言，然后在同一个工作区使用申请助手、表格填写、PDF 查看和用户管理。',
              })}
            </p>
          </div>
          <span className="hero-badge">Node.js 22 / Port 8000</span>
        </div>

        <div className="dashboard-grid">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="module-card" href={item.href} key={item.href}>
                <div>
                  <h2 className="module-title">
                    <span className="icon-pill">
                      <Icon size={22} />
                    </span>
                    {t(item.title)}
                  </h2>
                  <p>{t(item.body)}</p>
                </div>
                <span className="status">{t({ en: 'Open', zh: '打开' })}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
