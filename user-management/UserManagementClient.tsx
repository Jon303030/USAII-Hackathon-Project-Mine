'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

type UserRecord = {
  id: string;
  name: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Pending';
};

export function UserManagementClient() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesSearch = !query || user.name.toLowerCase().includes(query) || user.id.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  const adminCount = users.filter((user) => user.role === 'admin').length;
  const userCount = users.filter((user) => user.role === 'user').length;

  async function refresh() {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data.users);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    const data = await response.json();
    setMessage(
      response.ok
        ? t({ en: data.message ?? 'User added.', zh: '用户已新增。' })
        : t({ en: data.error ?? 'Unable to add user.', zh: '无法新增用户。' }),
    );
    if (response.ok) {
      setUsers(data.users);
      setName('');
    }
  }

  return (
    <div className="user-workspace">
      <div className="metric-strip">
        <div className="mini-stat accent-blue">
          <span>{t({ en: 'Total users', zh: '用户总数' })}</span>
          <strong>{users.length}</strong>
        </div>
        <div className="mini-stat accent-green">
          <span>{t({ en: 'Users', zh: '普通用户' })}</span>
          <strong>{userCount}</strong>
        </div>
        <div className="mini-stat accent-amber">
          <span>{t({ en: 'Admins', zh: '管理员' })}</span>
          <strong>{adminCount}</strong>
        </div>
      </div>

      <div className="management-layout">
        <form className="manager-panel create-user-panel" onSubmit={addUser}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{t({ en: 'Access', zh: '权限' })}</span>
              <h2>{t({ en: 'Add User', zh: '新增用户' })}</h2>
            </div>
            <span className="icon-pill">
              <Plus size={22} />
            </span>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label className="field">
              <span>{t({ en: 'Name', zh: '姓名' })}</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder={t({ en: 'User name', zh: '用户姓名' })} />
            </label>
            <label className="field">
              <span>{t({ en: 'Role', zh: '角色' })}</span>
              <select className="select" value={role} onChange={(event) => setRole(event.target.value as 'user' | 'admin')}>
                <option value="user">{t({ en: 'user', zh: '普通用户' })}</option>
                <option value="admin">{t({ en: 'admin', zh: '管理员' })}</option>
              </select>
            </label>
            {message ? <div className="notice">{message}</div> : null}
            <button className="btn primary" type="submit">
              <Plus size={18} />
              {t({ en: 'Add User', zh: '新增用户' })}
            </button>
          </div>
        </form>

        <section className="manager-panel user-list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{t({ en: 'Directory', zh: '用户目录' })}</span>
              <h2>{t({ en: 'Users', zh: '用户' })}</h2>
            </div>
            <span className="status">{t({ en: `${filteredUsers.length} shown`, zh: `显示 ${filteredUsers.length} 位` })}</span>
          </div>

          <div className="user-toolbar">
            <label className="field">
              <span>{t({ en: 'Search', zh: '搜索' })}</span>
              <span style={{ position: 'relative' }}>
                <Search size={16} style={{ left: 12, position: 'absolute', top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t({ en: 'Name or ID', zh: '姓名或 ID' })}
                />
              </span>
            </label>
            <label className="field">
              <span>{t({ en: 'Role', zh: '角色' })}</span>
              <select className="select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | 'user' | 'admin')}>
                <option value="all">{t({ en: 'all', zh: '全部' })}</option>
                <option value="user">{t({ en: 'user', zh: '普通用户' })}</option>
                <option value="admin">{t({ en: 'admin', zh: '管理员' })}</option>
              </select>
            </label>
          </div>

          <div className="user-card-list">
            {filteredUsers.map((user) => (
              <div className="user-card" key={user.id}>
                <span className={`user-avatar ${user.role === 'admin' ? 'admin' : ''}`}>
                  {user.role === 'admin' ? <ShieldCheck size={20} /> : <UserRound size={20} />}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.id}</small>
                </div>
                <span className={`role-badge ${user.role}`}>{user.role === 'admin' ? t({ en: 'admin', zh: '管理员' }) : t({ en: 'user', zh: '普通用户' })}</span>
                <span className="status">{user.status === 'Active' ? t({ en: 'Active', zh: '启用' }) : t({ en: 'Pending', zh: '待处理' })}</span>
              </div>
            ))}
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <Users size={34} />
                {t({ en: 'No users match this filter.', zh: '没有符合筛选条件的用户。' })}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
