import { TopNav } from '@/components/TopNav';
import { NavigateClient } from '@/navigate/NavigateClient';

export default function NavigatePage() {
  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>Navigator</h1>
            <p>A guided chatbot asks three questions, extracts keywords, and returns matching reports.</p>
          </div>
        </div>
        <NavigateClient />
      </section>
    </main>
  );
}
