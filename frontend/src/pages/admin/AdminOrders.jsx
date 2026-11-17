import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/admin/orders?limit=50';
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Global Orders Master List
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction history and fulfillment status across all kitchens
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl font-bold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Kitchen</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Order Status</th>
                <th className="py-4 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 block">{ord.customer?.name}</span>
                    <span className="text-[10px] text-slate-400">{ord.customer?.phone}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800">
                    {ord.seller?.kitchenName}
                  </td>
                  <td className="py-4 px-6 font-black font-serif text-slate-900">
                    ₹{ord.totalAmount}
                  </td>
                  <td className="py-4 px-6">
                    <span className="uppercase text-[10px] font-bold text-slate-700 block">
                      {ord.paymentMethod}
                    </span>
                    <span className={`text-[10px] font-extrabold ${
                      ord.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      ord.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
