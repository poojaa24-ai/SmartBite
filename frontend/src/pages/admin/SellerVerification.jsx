import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertCircle, FileText, MapPin, Phone, ChefHat } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const SellerVerification = () => {
  const { success, error } = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionStatus, setActionStatus] = useState('approved');

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sellers');
      if (res.data.success) {
        setSellers(res.data.sellers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const handleDecision = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;

    try {
      const res = await api.put(`/admin/sellers/${reviewModal._id}/verify`, {
        status: actionStatus,
        notes: notes || (actionStatus === 'approved' ? 'Verified hygiene & FSSAI compliance.' : 'Application rejected.'),
        foodSafetyCertified: actionStatus === 'approved',
      });

      if (res.data.success) {
        success(`Home Chef ${reviewModal.kitchenName} has been ${actionStatus}!`);
        setReviewModal(null);
        fetchPendingSellers();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Feature 5: Food Safety & Hygiene Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Home Kitchen Verification Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review submitted FSSAI certifications, government IDs, and domestic kitchen hygiene compliance
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Kitchen Applications"
          description="There are no seller kitchen applications to review at this moment."
        />
      ) : (
        <div className="space-y-4">
          {sellers.map((s) => (
            <div
              key={s._id}
              className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-serif text-slate-900">{s.kitchenName}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      s.verificationStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.verificationStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-bold text-slate-900">Chef:</span> {s.user?.name} (Phone: {s.phone || s.user?.phone})
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">Location:</span> {s.address?.locality}, {s.address?.city}
                  </p>
                  <p className="font-mono text-forest-900 font-bold">
                    FSSAI License / Reg: {s.fssaiNumber || 'Pending / Under Verification'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setReviewModal(s);
                    setActionStatus(s.verificationStatus === 'approved' ? 'rejected' : 'approved');
                    setNotes(s.verificationNotes || '');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Audit & Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-200">
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
              Audit Kitchen: {reviewModal.kitchenName}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Verify compliance with Indian Food Safety & Standards Authority (FSSAI) guidelines.
            </p>

            <form onSubmit={handleDecision} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-2">
                <p>
                  <span className="font-bold text-slate-900">Chef Name:</span> {reviewModal.user?.name}
                </p>
                <p>
                  <span className="font-bold text-slate-900">FSSAI Number:</span> {reviewModal.fssaiNumber || 'None provided'}
                </p>
                <p>
                  <span className="font-bold text-slate-900">Address:</span> {reviewModal.address?.street}, {reviewModal.address?.locality}, {reviewModal.address?.city}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionStatus('approved')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      actionStatus === 'approved'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-cream-100 text-slate-700'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Verified Badge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('rejected')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      actionStatus === 'rejected'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-cream-100 text-slate-700'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Notes / Reason</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. FSSAI registration verified with Central portal. Kitchen approved."
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerification;
