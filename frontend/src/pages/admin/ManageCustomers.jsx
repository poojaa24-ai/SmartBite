import React, { useState, useEffect } from 'react';
import { Users, Search, Power, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageCustomers = () => {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/customers?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/toggle-status`);
      if (res.data.success) {
        success(res.data.message);
        fetchCustomers();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Manage Customers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer accounts, activity status, and permissions
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Contact Details</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={c.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">ID: {c._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{c.email}</p>
                    <p className="text-slate-400">{c.phone || 'No phone provided'}</p>
                  </td>
                  <td className="py-4 px-6">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-colors ${
                        c.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default ManageCustomers;
