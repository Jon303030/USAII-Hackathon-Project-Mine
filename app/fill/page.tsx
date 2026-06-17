import { TopNav } from '@/components/TopNav';
import { FillClient } from '@/fill/FillClient';

export default function FillPage() {
  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>Form Fill</h1>
            <p>A WhatsApp-style chatbot collects three answers, then shows the filled result.</p>
          </div>
        </div>
        <FillClient />
      </section>
    </main>
  );
}
