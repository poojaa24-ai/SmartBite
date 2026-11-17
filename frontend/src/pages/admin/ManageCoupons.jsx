import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageCoupons = () => {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New coupon fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('50');
  const [minOrderAmount, setMinOrderAmount] = useState('150');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [validDays, setValidDays] = useState('30');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons/active');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const validUntil = new Date(Date.now() + Number(validDays) * 24 * 60 * 60 * 1000);
      const res = await api.post('/coupons', {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: Number(maxDiscount),
        validUntil,
      });

      if (res.data.success) {
        success('Coupon created successfully!');
        setShowModal(false);
        setCode('');
        setDescription('');
        fetchCoupons();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data.success) {
        success('Coupon deleted.');
        fetchCoupons();
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
            Promotional Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage customer discount vouchers, referral offers, and holiday promos
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-sm bg-cream-100 px-3 py-1 rounded-xl text-forest-900 tracking-wider">
                  {c.code}
                </span>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mt-2">{c.description}</h4>

              <div className="text-xs text-slate-600 space-y-1 mt-3 pt-3 border-t border-cream-100">
                <p>
                  <span className="font-bold">Discount:</span> {c.discountValue}
                  {c.discountType === 'percentage' ? '% Off' : ' Flat Off'} (Max ₹{c.maxDiscount})
                </p>
                <p>
                  <span className="font-bold">Min Order:</span> ₹{c.minOrderAmount}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Valid Until: {new Date(c.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-cream-200">
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">Create Promo Coupon</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME100"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs uppercase font-mono font-bold bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% discount up to ₹100 on first order"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    required
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
