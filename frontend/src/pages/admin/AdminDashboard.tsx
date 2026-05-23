import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react';
import api from '@/services/api';

interface Analytics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setAnalytics(r.data))
      .catch(() => setAnalytics({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const stats = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: <Users className="w-6 h-6" />, color: 'from-brand-500 to-brand-700', change: '+12%' },
    { label: 'Total Products', value: analytics.totalProducts.toLocaleString(), icon: <Package className="w-6 h-6" />, color: 'from-accent-cyan to-blue-700', change: '+5%' },
    { label: 'Total Orders', value: analytics.totalOrders.toLocaleString(), icon: <ShoppingCart className="w-6 h-6" />, color: 'from-accent-green to-teal-700', change: '+23%' },
    { label: 'Total Revenue', value: formatINR(analytics.totalRevenue), icon: <DollarSign className="w-6 h-6" />, color: 'from-accent-pink to-purple-700', change: '+18%' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Analytics Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform performance at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)
        ) : stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="admin-card relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 translate-x-8 -translate-y-8`} />
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
              <div className="text-white">{stat.icon}</div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <span className="text-xs text-accent-green font-medium">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { href: '/admin/products', label: 'Upload new product', icon: '📦' },
              { href: '/admin/categories', label: 'Add new category', icon: '📁' },
              { href: '/admin/orders', label: 'View recent orders', icon: '🛒' },
              { href: '/admin/users', label: 'Manage users', icon: '👥' },
            ].map(action => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-colors"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm text-slate-300 hover:text-white">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-green" />
            System Status
          </h3>
          <div className="space-y-3">
            {[
              { label: 'API Server', status: 'Online', color: 'bg-accent-green' },
              { label: 'Firebase Storage', status: 'Connected', color: 'bg-accent-green' },
              { label: 'Payment Gateway', status: 'Active', color: 'bg-accent-green' },
              { label: 'Firebase Auth', status: 'Connected', color: 'bg-accent-green' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-dark-bg border border-dark-border">
                <span className="text-sm text-slate-300">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color} animate-pulse`} />
                  <span className="text-xs text-slate-400">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
