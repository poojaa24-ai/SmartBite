import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, ShieldCheck, MapPin, Clock, DollarSign, Camera, Save } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const KitchenProfile = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [kitchenName, setKitchenName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560001');
  const [openTime, setOpenTime] = useState('08:00 AM');
  const [closeTime, setCloseTime] = useState('09:30 PM');
  const [cuisines, setCuisines] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [banner, setBanner] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/sellers/me/profile');
        if (res.data.success && res.data.seller) {
          const s = res.data.seller;
          setKitchenName(s.kitchenName || '');
          setTagline(s.tagline || '');
          setBio(s.bio || '');
          setPhone(s.phone || '');
          setStreet(s.address?.street || '');
          setLocality(s.address?.locality || '');
          setCity(s.address?.city || 'Bangalore');
          setPincode(s.address?.pincode || '');
          setOpenTime(s.operatingHours?.open || '08:00 AM');
          setCloseTime(s.operatingHours?.close || '09:30 PM');
          setCuisines(s.cuisines?.join(', ') || '');
          setUpiId(s.bankDetails?.upiId || '');
          setAccountNumber(s.bankDetails?.accountNumber || '');
          setIfscCode(s.bankDetails?.ifscCode || '');
          setBanner(s.banner || '');
          setLogo(s.logo || '');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const cuisinesArr = cuisines.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await api.put('/sellers/me/profile', {
        kitchenName,
        tagline,
        bio,
        phone,
        address: { street, locality, city, pincode },
        operatingHours: { open: openTime, close: closeTime },
        cuisines: cuisinesArr,
        bankDetails: { upiId, accountNumber, ifscCode },
        banner,
        logo,
      });

      if (res.data.success) {
        success('Kitchen profile updated successfully!');
        refreshUser();
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">Kitchen Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update how customers see your home kitchen, operating hours, and bank details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        {/* Basic Kitchen Info */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
            Kitchen Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Name</label>
              <input
                type="text"
                required
                value={kitchenName}
                onChange={(e) => setKitchenName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Authentic North Karnataka Jowar Rotti"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Story / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about your recipes, culinary tradition, and passion..."
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialty Cuisines (comma separated)</label>
              <input
                type="text"
                value={cuisines}
                onChange={(e) => setCuisines(e.target.value)}
                placeholder="North Karnataka, Satvik, Traditional Breakfast"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Address */}
        <div className="space-y-4 pt-4 border-t border-cream-100">
          <h3 className="text-base font-bold font-serif text-slate-900">Operating Schedule & Location</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opens At</label>
              <input
                type="text"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Closes At</label>
              <input
                type="text"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                placeholder="09:30 PM"
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Street / House No</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Locality / Area</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Bank & Payouts */}
        <div className="space-y-4 pt-4 border-t border-cream-100">
          <h3 className="text-base font-bold font-serif text-slate-900">Direct Payout Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">UPI ID for Payouts</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="chef@oksbi"
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="918801122334"
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="SBIN0004561"
                className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Update Kitchen Profile'}</span>
        </button>
      </form>
    </div>
  );
};

export default KitchenProfile;
