'use client';

import { TopNav } from '@/components/TopNav';
import { useLanguage } from '@/components/LanguageProvider';
import { ElderlyAssistantClient } from '@/elderly-assistant/ElderlyAssistantClient';

export default function AssistantPage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>{t({ en: 'Senior Application Assistant', zh: '长者申请助手' })}</h1>
            <p>
              {t({
                en: 'The language is chosen on the main site first, then this assistant collects details, matches forms, fills drafts, confirms consent, and prepares volunteer follow-up.',
                zh: '先在主页面选择语言，然后助手会收集资料、匹配表格、填写草稿、确认同意书，并准备志愿者后续联系。',
              })}
            </p>
          </div>
        </div>
        <ElderlyAssistantClient />
      </section>
    </main>
  );
}
