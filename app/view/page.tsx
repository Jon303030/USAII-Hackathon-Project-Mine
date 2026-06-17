import { Suspense } from 'react';
import { TopNav } from '@/components/TopNav';
import { ViewClient } from '@/view/ViewClient';

export default function ViewPage() {
  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>Form Viewer</h1>
            <p>A PDF viewer workspace for upload, preview, page editing, merge, and local download.</p>
          </div>
        </div>
        <Suspense fallback={<div className="band">Loading PDF workspace...</div>}>
          <ViewClient />
        </Suspense>
      </section>
    </main>
  );
}
