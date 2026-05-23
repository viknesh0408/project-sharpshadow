import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Package, Clock, User, ArrowRight, ExternalLink } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { downloadService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const { toastSuccess, toastError } = useToast();
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toastError('Name cannot be empty');
      return;
    }
    setUpdating(true);
    try {
      const res = await userService.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      updateUser({
        name: res.name,
        email: res.email,
      });
      toastSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update profile';
      toastError(errMsg);
    } finally {
      setUpdating(false);
    }
  };
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'profile'>('purchases');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    orderService.getOrderHistory()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (productId: number) => {
    setDownloadingId(productId);
    try {
      const { downloadUrl } = await downloadService.getDownloadUrl(productId);
      window.open(downloadUrl, '_blank');
      toastSuccess('Download started!');
    } catch {
      toastError('Failed to get download link');
    } finally {
      setDownloadingId(null);
    }
  };

  const paidOrders = orders.filter(o => o.status === 'PAID');
  const allItems = paidOrders.flatMap(o => o.items || []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="page-container">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">My Dashboard</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Purchases', value: paidOrders.length, icon: <Package className="w-5 h-5" />, color: 'text-brand-400' },
              { label: 'Files', value: allItems.length, icon: <Download className="w-5 h-5" />, color: 'text-accent-cyan' },
              { label: 'Total Spent', value: formatPrice(totalSpent), icon: <Clock className="w-5 h-5" />, color: 'text-accent-green' },
              { label: 'Orders', value: orders.length, icon: <User className="w-5 h-5" />, color: 'text-accent-pink' },
            ].map(stat => (
              <div key={stat.label} className="admin-stat-card">
                <div className={`${stat.color} bg-current/10 rounded-xl p-3`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-dark-border">
            {(['purchases', 'profile'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                  ${activeTab === tab ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                {tab === 'purchases' ? 'My Purchases' : 'Profile'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'purchases' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
              </div>
            ) : allItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No purchases yet</h3>
                <p className="text-slate-400 text-sm mb-6">Browse our collection and find your perfect design asset</p>
                <Link to="/products" className="btn-primary">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {paidOrders.map(order => (
                  <div key={order.id} className="card p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Order #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        <span className="badge badge-green text-xs">✓ Paid</span>
                      </div>
                      <p className="font-semibold text-white">{formatPrice(Number(order.totalAmount))}</p>
                    </div>
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 rounded-xl bg-dark-bg border border-dark-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-dark-hover flex items-center justify-center">
                              <Package className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.productTitle}</p>
                              <p className="text-xs text-slate-400">{formatPrice(Number(item.price))}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(item.productId)}
                            disabled={downloadingId === item.productId}
                            className="flex items-center gap-1.5 text-xs btn-secondary py-2 px-3"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloadingId === item.productId ? 'Getting link...' : 'Download'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-lg">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="input mt-1.5 w-full bg-dark-bg border border-dark-border text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input mt-1.5 w-full bg-dark-bg border border-dark-border text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Type</label>
                  <p className="text-slate-400 mt-1.5 font-medium select-none capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="pt-4 border-t border-dark-border flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={updating}
                    className="btn-secondary py-2.5 px-5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="card p-6 space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                  <p className="text-white mt-1.5 font-medium">{user?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                  <p className="text-white mt-1.5 font-medium">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Type</label>
                  <p className="text-white mt-1.5 font-medium select-none capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="pt-4 border-t border-dark-border flex items-center justify-between">
                  <button
                    onClick={handleStartEdit}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    Edit Profile
                  </button>
                  <p className="text-xs text-slate-500">Update your name and contact email</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
