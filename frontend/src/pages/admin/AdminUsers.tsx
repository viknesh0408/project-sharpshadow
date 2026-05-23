import React, { useEffect, useState } from 'react';
import { Trash2, Shield, User } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';

export default function AdminUsers() {
  const { toastSuccess, toastError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toastSuccess('User deleted');
      load();
    } catch { toastError('Failed to delete user'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6}><div className="skeleton h-8 my-1 rounded" /></td></tr>
                ))
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs font-bold text-white">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400 text-sm">{u.email || '—'}</td>
                  <td className="text-slate-400 text-sm">{u.phone || '—'}</td>
                  <td>
                    {u.role === 'ADMIN'
                      ? <span className="badge badge-brand flex items-center gap-1 w-fit"><Shield className="w-3 h-3" /> Admin</span>
                      : <span className="badge bg-dark-hover text-slate-400 border border-dark-border flex items-center gap-1 w-fit"><User className="w-3 h-3" /> User</span>}
                  </td>
                  <td className="text-slate-400 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => handleDelete(u.id)} className="btn-ghost p-2 text-red-400 hover:bg-red-950/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
