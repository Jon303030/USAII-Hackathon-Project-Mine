'use client';

import { TopNav } from '@/components/TopNav';
import { RequireLogin } from '@/components/AuthGuard';
import { ElderlyAssistantClient } from '@/elderly-assistant/ElderlyAssistantClient';

export default function AssistantPage() {
  return (
    <RequireLogin>
      <main className="shell assistant-shell">
        <TopNav />
        <section className="container assistant-container">
          <ElderlyAssistantClient />
        </section>
      </main>
    </RequireLogin>
  );
}
