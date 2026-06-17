'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { TopNav } from '@/components/TopNav';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('Ali');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? 'Login failed');
      return;
    }

    localStorage.setItem('report-workflow-user', JSON.stringify(payload.user));
    router.push('/fill');
  }

  return (
    <main className="shell">
      <TopNav />
      <section className="login-wrap">
        <form className="band login-panel" onSubmit={handleSubmit}>
          <div className="page-head" style={{ marginBottom: 18 }}>
            <div>
              <h1>Login</h1>
              <p>Demo login for the fill workflow.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label className="field">
              <span>Name</span>
              <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            {error ? <div className="notice">{error}</div> : null}
            <button className="btn primary" type="submit" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
