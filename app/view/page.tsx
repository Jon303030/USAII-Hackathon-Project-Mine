'use client';

import { Suspense } from 'react';
import { TopNav } from '@/components/TopNav';
import { useLanguage } from '@/components/LanguageProvider';
import { ViewClient } from '@/view/ViewClient';

export default function ViewPage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>{t({ en: 'Form Viewer', zh: '查看表格' })}</h1>
            <p>
              {t({
                en: 'A PDF viewer workspace for upload, preview, page editing, merge, and local download.',
                zh: '用于上传、预览、编辑页面、合并和下载 PDF 的工作区。',
              })}
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="band">{t({ en: 'Loading PDF workspace...', zh: '正在载入 PDF 工作区...' })}</div>}>
          <ViewClient />
        </Suspense>
      </section>
    </main>
  );
}
