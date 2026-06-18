'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { TopNav } from '@/components/TopNav';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
      setError(
        payload.error === 'Name is required.'
          ? t({ en: 'Name is required.', zh: '请输入姓名。' })
          : payload.error ?? t({ en: 'Login failed', zh: '登录失败' }),
      );
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
              <h1>{t({ en: 'Login', zh: '登录' })}</h1>
              <p>{t({ en: 'Demo login for the fill workflow.', zh: '填写流程的示例登录。' })}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label className="field">
              <span>{t({ en: 'Name', zh: '姓名' })}</span>
              <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            {error ? <div className="notice">{error}</div> : null}
            <button className="btn primary" type="submit" disabled={loading}>
              <LogIn size={18} />
              {loading ? t({ en: 'Signing in...', zh: '正在登录...' }) : t({ en: 'Continue', zh: '继续' })}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
