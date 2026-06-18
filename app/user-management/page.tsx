'use client';

import { TopNav } from '@/components/TopNav';
import { useLanguage } from '@/components/LanguageProvider';
import { UserManagementClient } from '@/user-management/UserManagementClient';

export default function UserManagementPage() {
  const { t } = useLanguage();

  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>{t({ en: 'User Management', zh: '用户管理' })}</h1>
            <p>
              {t({
                en: 'Add users and manage access with only two roles: user and admin.',
                zh: '新增用户并管理权限，角色只分为普通用户和管理员。',
              })}
            </p>
          </div>
        </div>
        <UserManagementClient />
      </section>
    </main>
  );
}
