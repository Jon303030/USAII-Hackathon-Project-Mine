'use client';

import { TopNav } from '@/components/TopNav';
import { useLanguage } from '@/components/LanguageProvider';
import { NavigateClient } from '@/navigate/NavigateClient';

export default function NavigatePage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>{t({ en: 'Navigator', zh: '找表格' })}</h1>
            <p>
              {t({
                en: 'A guided chatbot asks three questions, extracts keywords, and returns matching reports.',
                zh: '引导式聊天助手会问三个问题、提取关键词，并返回匹配的表格。',
              })}
            </p>
          </div>
        </div>
        <NavigateClient />
      </section>
    </main>
  );
}
