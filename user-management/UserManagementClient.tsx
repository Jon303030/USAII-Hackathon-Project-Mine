'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, UserRound, Users } from 'lucide-react';

type UserRecord = {
  id: string;
  name: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Pending';
};

export function UserManagementClient() {
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
    setMessage(data.message ?? data.error);
    if (response.ok) {
      setUsers(data.users);
      setName('');
    }
  }

  return (
    <div className="user-workspace">
      <div className="metric-strip">
        <div className="mini-stat accent-blue">
          <span>Total users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="mini-stat accent-green">
          <span>Users</span>
          <strong>{userCount}</strong>
        </div>
        <div className="mini-stat accent-amber">
          <span>Admins</span>
          <strong>{adminCount}</strong>
        </div>
      </div>

      <div className="management-layout">
        <form className="manager-panel create-user-panel" onSubmit={addUser}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Access</span>
              <h2>Add User</h2>
            </div>
            <span className="icon-pill">
              <Plus size={22} />
            </span>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label className="field">
              <span>Name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="User name" />
            </label>
            <label className="field">
              <span>Role</span>
              <select className="select" value={role} onChange={(event) => setRole(event.target.value as 'user' | 'admin')}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            {message ? <div className="notice">{message}</div> : null}
            <button className="btn primary" type="submit">
              <Plus size={18} />
              Add User
            </button>
          </div>
        </form>

        <section className="manager-panel user-list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Directory</span>
              <h2>Users</h2>
            </div>
            <span className="status">{filteredUsers.length} shown</span>
          </div>

          <div className="user-toolbar">
            <label className="field">
              <span>Search</span>
              <span style={{ position: 'relative' }}>
                <Search size={16} style={{ left: 12, position: 'absolute', top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name or ID"
                />
              </span>
            </label>
            <label className="field">
              <span>Role</span>
              <select className="select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | 'user' | 'admin')}>
                <option value="all">all</option>
                <option value="user">user</option>
                <option value="admin">admin</option>
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
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                <span className="status">{user.status}</span>
              </div>
            ))}
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <Users size={34} />
                No users match this filter.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
