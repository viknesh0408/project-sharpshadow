import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';

export default function AdminCategories() {
  const { toastSuccess, toastError } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', icon: '' }); setShowModal(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, slug: c.slug || '', icon: c.icon || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
        toastSuccess('Category updated!');
      } else {
        await api.post('/admin/categories', form);
        toastSuccess('Category created!');
      }
      setShowModal(false);
      load();
    } catch { toastError('Failed to save category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toastSuccess('Category deleted');
      load();
    } catch { toastError('Failed to delete category'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
        ) : categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="admin-card flex items-center gap-4 hover:border-brand-500/30 transition-all">
            <span className="text-3xl">{cat.icon || '📁'}</span>
            <div className="flex-1">
              <p className="font-semibold text-white">{cat.name}</p>
              <p className="text-xs text-slate-400">/{cat.slug}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(cat)} className="btn-ghost p-2 text-brand-400">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="btn-ghost p-2 text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="font-semibold text-white text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="e.g. UI Kits" required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className="input" placeholder="e.g. ui-kits" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Emoji Icon</label>
                <input value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} className="input" placeholder="🎨" maxLength={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center py-3">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary py-3 px-6">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
