import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Upload, X, Search } from 'lucide-react';
import api from '@/services/api';
import { categoryService } from '@/services/productService';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  previewImageUrl: string;
  categoryId: number;
  categoryName: string;
  featured: boolean;
  downloadCount: number;
}

const EMPTY_FORM = {
  title: '', description: '', price: '', categoryId: '',
  tags: '', featured: false,
};

export default function AdminProducts() {
  const { toastSuccess, toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadProducts = () => {
    setLoading(true);
    api.get('/products', { params: { size: 100 } })
      .then(r => setProducts(r.data.content))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description,
      price: String(p.price), categoryId: String(p.categoryId),
      tags: '', featured: p.featured,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.categoryId) {
      toastError('Title, price, and category are required');
      return;
    }
    if (!editing && (!previewFile || !downloadFile)) {
      toastError('Preview image and download file are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const data = {
        title: form.title, description: form.description,
        price: parseFloat(form.price),
        categoryId: parseInt(form.categoryId),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        featured: form.featured,
      };
      fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (previewFile) fd.append('previewImage', previewFile);
      if (downloadFile) fd.append('downloadFile', downloadFile);

      if (editing) {
        await api.put(`/admin/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toastSuccess('Product updated!');
      } else {
        await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toastSuccess('Product created!');
      }
      setShowModal(false);
      loadProducts();
    } catch (e: any) {
      toastError(e.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toastSuccess('Product deleted');
      loadProducts();
    } catch { toastError('Failed to delete product'); }
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()));

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Products</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-11"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Preview</th><th>Title</th><th>Category</th>
                <th>Price</th><th>Downloads</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="skeleton h-8 my-1 rounded" /></td></tr>
                ))
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <img src={p.previewImageUrl} alt={p.title}
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${p.id}/80/60`; }}
                      className="w-14 h-10 rounded-lg object-cover" />
                  </td>
                  <td>
                    <p className="font-medium text-white line-clamp-1 max-w-xs">{p.title}</p>
                  </td>
                  <td><span className="badge-category">{p.categoryName}</span></td>
                  <td className="font-semibold text-white">{formatINR(p.price)}</td>
                  <td className="text-slate-400">{p.downloadCount}</td>
                  <td>
                    {p.featured
                      ? <span className="badge badge-brand">Yes</span>
                      : <span className="text-slate-500 text-xs">No</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="btn-ghost p-2 text-brand-400 hover:bg-brand-500/10">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn-ghost p-2 text-red-400 hover:bg-red-950/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="font-semibold text-white text-lg">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" placeholder="Product title" required />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="input min-h-[80px] resize-none" placeholder="Product description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Price (₹) *</label>
                  <input type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm(f => ({...f, price: e.target.value}))} className="input" placeholder="299" required />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: e.target.value}))}
                    className="input bg-dark-card" required>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} className="input" placeholder="psd, ui, dark" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-xl border border-dark-border">
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={e => setForm(f => ({...f, featured: e.target.checked}))}
                  className="w-4 h-4 accent-brand-500" />
                <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">Mark as Featured</label>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  Preview Image {!editing && '*'}
                </label>
                <label className="flex items-center gap-3 p-3 bg-dark-bg border border-dashed border-dark-border rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {previewFile ? previewFile.name : 'Click to upload image'}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => setPreviewFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  Download File {!editing && '*'}
                </label>
                <label className="flex items-center gap-3 p-3 bg-dark-bg border border-dashed border-dark-border rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {downloadFile ? downloadFile.name : 'Click to upload PSD/file'}
                  </span>
                  <input type="file" className="hidden"
                    onChange={e => setDownloadFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center py-3">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
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
