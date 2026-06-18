'use client';

import { TopNav } from '@/components/TopNav';
import { useLanguage } from '@/components/LanguageProvider';
import { FillClient } from '@/fill/FillClient';

export default function FillPage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>{t({ en: 'Form Fill', zh: '填写表格' })}</h1>
            <p>
              {t({
                en: 'A WhatsApp-style chatbot collects three answers, then shows the filled result.',
                zh: '像 WhatsApp 一样的聊天助手会收集三个答案，然后显示填写结果。',
              })}
            </p>
          </div>
        </div>
        <FillClient />
      </section>
    </main>
  );
}
