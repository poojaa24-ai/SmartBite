import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, Upload, FileText, Send } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const VerificationStatus = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [seller, setSeller] = useState(null);
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiDocument, setFssaiDocument] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await api.get('/sellers/me/profile');
        if (res.data.success && res.data.seller) {
          setSeller(res.data.seller);
          setFssaiNumber(res.data.seller.fssaiNumber || '');
          setFssaiDocument(res.data.seller.fssaiDocument || '');
          setGovernmentId(res.data.seller.governmentId || '');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSeller();
  }, []);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!fssaiNumber) {
      error('Please enter your FSSAI registration number or declaration.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/sellers/me/verification', {
        fssaiNumber,
        fssaiDocument,
        governmentId,
      });

      if (res.data.success) {
        setSeller(res.data.seller);
        success(res.data.message);
        refreshUser();
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = seller?.verificationStatus || 'pending';

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Feature 5: Verified Home Kitchen Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Kitchen Verification & FSSAI Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          SmartBite verifies every home kitchen to ensure hygiene, food safety compliance, and legal transparency
        </p>
      </div>

      {/* Verification Status Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
        status === 'approved'
          ? 'bg-emerald-50/80 border-emerald-200'
          : status === 'rejected'
          ? 'bg-red-50/80 border-red-200'
          : 'bg-amber-50/80 border-amber-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            status === 'approved'
              ? 'bg-emerald-600 text-white'
              : status === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-amber-500 text-white'
          }`}>
            {status === 'approved' ? (
              <ShieldCheck className="w-8 h-8" />
            ) : status === 'rejected' ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Current Application Status
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-serif capitalize mt-0.5">
              {status === 'approved' ? 'Verified Home Kitchen Approved' : status === 'rejected' ? 'Application Needs Revision' : 'Verification Under Administrative Review'}
            </h2>
            <p className="text-xs mt-1 leading-relaxed text-slate-600">
              {seller?.verificationNotes || 'Your documents are being reviewed against hygiene standards.'}
            </p>
          </div>
        </div>

        <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 text-center ${
          status === 'approved'
            ? 'bg-emerald-600 text-white'
            : status === 'rejected'
            ? 'bg-red-600 text-white'
            : 'bg-amber-500 text-white'
        }`}>
          {status}
        </span>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmitVerification} className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
          Submit / Update Food Safety Credentials
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            FSSAI Registration / Application Number (14 Digits)
          </label>
          <input
            type="text"
            required
            value={fssaiNumber}
            onChange={(e) => setFssaiNumber(e.target.value)}
            placeholder="e.g. 21223005000124"
            className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-forest-800"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            FSSAI domestic petty food business registration is mandated by Indian food safety regulations.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Government Identity Proof Document (Aadhaar / Voter ID)
            </label>
            <input
              type="text"
              value={governmentId}
              onChange={(e) => setGovernmentId(e.target.value)}
              placeholder="Document link or Reference number"
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              FSSAI Certificate / Food Safety Declaration File
            </label>
            <input
              type="text"
              value={fssaiDocument}
              onChange={(e) => setFssaiDocument(e.target.value)}
              placeholder="Certificate URL or Document link"
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-800">Verification Guidelines:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Ensure all food is prepared in a pest-free, hygienic domestic cooking space.</li>
            <li>All drinking and cooking water must be filtered or boiled.</li>
            <li>Verified badges are displayed publicly only upon admin verification.</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Submitting...' : 'Submit Verification Application'}</span>
        </button>
      </form>
    </div>
  );
};

export default VerificationStatus;
