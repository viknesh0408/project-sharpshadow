import React, { useEffect, useState } from 'react';
import api from '@/services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/history').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const statusColors: Record<string, string> = {
    PAID:    'badge-green',
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    FAILED:  'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
        <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Payment ID</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><div className="skeleton h-8 my-1 rounded" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-500 py-12">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs text-slate-300">#{o.id}</td>
                  <td className="font-mono text-xs text-slate-400 max-w-[120px] truncate">{o.paymentId || '—'}</td>
                  <td className="font-semibold text-white">{formatINR(Number(o.totalAmount))}</td>
                  <td>
                    <span className={`badge border ${statusColors[o.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
