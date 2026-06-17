import { TopNav } from '@/components/TopNav';
import { UserManagementClient } from '@/user-management/UserManagementClient';

export default function UserManagementPage() {
  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="page-head">
          <div>
            <h1>User Management</h1>
            <p>Add users and manage access with only two roles: user and admin.</p>
          </div>
        </div>
        <UserManagementClient />
      </section>
    </main>
  );
}
