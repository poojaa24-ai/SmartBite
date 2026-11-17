import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, CheckCircle2, Shield, Heart } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MyProfile = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isVegetarianOnly, setIsVegetarianOnly] = useState(user?.foodPreferences?.isVegetarianOnly || false);
  const [allergies, setAllergies] = useState(user?.foodPreferences?.allergies?.join(', ') || '');
  const [dietaryNotes, setDietaryNotes] = useState(user?.foodPreferences?.dietaryNotes || '');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560001');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      const allergyArr = allergies.split(',').map((s) => s.trim()).filter(Boolean);
      await updateProfile({
        name,
        phone,
        foodPreferences: {
          isVegetarianOnly,
          allergies: allergyArr,
          dietaryNotes,
        },
      });
      success('Profile and food preferences updated!');
    } catch (err) {
      error(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !locality || !pincode) {
      error('Please complete all required address fields.');
      return;
    }
    try {
      const res = await api.post('/users/addresses', {
        label,
        recipientName: recipientName || name,
        phone: addrPhone || phone,
        street,
        locality,
        city,
        pincode,
        isDefault: addresses.length === 0,
      });

      if (res.data.success) {
        success('Address added successfully!');
        setAddresses([res.data.address, ...addresses]);
        setShowAddAddress(false);
        setStreet('');
        setLocality('');
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(addresses.filter((a) => a._id !== id));
      success('Address deleted.');
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, dietary preferences, and delivery locations
        </p>
      </div>

      {/* Profile & Food Preferences Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>
        </div>

        {/* Dietary Preferences (FEATURE 6 input) */}
        <div className="pt-4 border-t border-cream-100 space-y-4">
          <h3 className="text-lg font-bold font-serif text-slate-900">
            Dietary Preferences & Allergens
          </h3>
          <p className="text-xs text-slate-500">
            Our recommendation algorithm and home chefs check these settings to ensure food safety.
          </p>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVegetarianOnly}
              onChange={(e) => setIsVegetarianOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
            />
            <span className="text-sm font-bold text-slate-800">
              I only eat 100% Pure Vegetarian Food
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Known Allergies (comma separated)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Peanuts, Dairy, Gluten, Sesame"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Dietary Notes for Home Chefs
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="e.g. Less oil, medium spicy"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loadingProfile}
            className="px-6 py-2.5 rounded-full bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-colors shadow-md"
          >
            {loadingProfile ? 'Saving Changes...' : 'Save Profile & Preferences'}
          </button>
        </div>
      </form>

      {/* Saved Delivery Addresses Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-cream-100 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Saved Delivery Addresses</h3>
            <p className="text-xs text-slate-500">Addresses used for quick checkout</p>
          </div>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Add Address Form Modal / Accordion */}
        {showAddAddress && (
          <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-4 animate-in fade-in">
            <h4 className="text-sm font-bold text-slate-900">New Address Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Label</label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work / Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">House / Flat / Street</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #42, 3rd Cross"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Locality / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jayanagar 4th Block"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Address Cards List */}
        {addresses.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No addresses saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-4 rounded-2xl border border-cream-200 bg-cream-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-forest-100 text-forest-900 text-[10px] font-extrabold uppercase">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{addr.recipientName}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {addr.street}, {addr.locality}, {addr.city} - {addr.pincode}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-cream-200 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
