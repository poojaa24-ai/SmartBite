import React, { useState, useEffect } from 'react';
import { Users, Plus, Share2, Copy, Check, Lock, ShoppingBag, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const GroupOrders = () => {
  const { user } = useAuth();
  const { joinGroupRoom, socket } = useSocket();
  const { success, error, info } = useToast();

  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [kitchenFoods, setKitchenFoods] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await api.get('/sellers');
      if (res.data.success && res.data.sellers.length > 0) {
        setSellers(res.data.sellers);
        setSelectedSellerId(res.data.sellers[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/group-orders', {
        sellerId: selectedSellerId,
        name: groupName || `${user?.name || 'My'}'s Team Lunch`,
      });

      if (res.data.success) {
        setActiveGroup(res.data.groupOrder);
        setShowCreateModal(false);
        success(`Group order created! Code: ${res.data.groupOrder.code}`);
        joinGroupRoom(res.data.groupOrder.code);
        loadKitchenFoods(res.data.groupOrder.seller._id || res.data.groupOrder.seller);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!groupCodeInput.trim()) return;

    try {
      setLoading(true);
      const code = groupCodeInput.trim().toUpperCase();
      const res = await api.get(`/group-orders/${code}`);
      if (res.data.success) {
        setActiveGroup(res.data.groupOrder);
        joinGroupRoom(code);
        success(`Joined group order: ${res.data.groupOrder.name}`);
        loadKitchenFoods(res.data.groupOrder.seller._id || res.data.groupOrder.seller);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadKitchenFoods = async (sellerId) => {
    try {
      const res = await api.get(`/foods?seller=${sellerId}`);
      if (res.data.success) {
        setKitchenFoods(res.data.foods);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItemToGroup = async (foodId, currentQty = 0) => {
    if (!activeGroup) return;
    try {
      const res = await api.post(`/group-orders/${activeGroup.code}/items`, {
        participantName: user ? user.name : 'Team Member',
        foodId,
        quantity: currentQty + 1,
      });

      if (res.data.success) {
        setActiveGroup(res.data.groupOrder);
        success('Item added to your group plate!');
      }
    } catch (err) {
      error(err.message);
    }
  };

  const copyCode = () => {
    if (!activeGroup) return;
    navigator.clipboard.writeText(activeGroup.code);
    setCopied(true);
    success('Group Order Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckoutGroup = async () => {
    if (!activeGroup) return;
    try {
      setLoading(true);
      const res = await api.post(`/group-orders/${activeGroup.code}/checkout`, {
        paymentMethod: 'simulated_upi',
      });
      if (res.data.success) {
        success('Group order placed successfully!');
        window.location.href = `/order-tracking/${res.data.order._id}`;
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-forest-800" />
            <span>Feature 4: Community Group Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Community & Team Group Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order together from one home kitchen, track individual contributions, and checkout together
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Group</span>
        </button>
      </div>

      {/* Join Group Input Bar (if no active group) */}
      {!activeGroup && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">Have an Invite Code?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter the 6-character code shared by your friend or colleague to join their homemade food order session.
          </p>

          <form onSubmit={handleJoinByCode} className="flex gap-2 max-w-xs mx-auto pt-2">
            <input
              type="text"
              value={groupCodeInput}
              onChange={(e) => setGroupCodeInput(e.target.value)}
              placeholder="e.g. SB-A78B"
              className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-center bg-cream-50 border border-cream-300 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
            >
              Join
            </button>
          </form>
        </div>
      )}

      {/* Active Group Order Session Board */}
      {activeGroup && (
        <div className="space-y-6">
          {/* Active Session Card */}
          <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-accent-500 text-white px-3 py-1 rounded-full">
                  Live Session
                </span>
                <span className="text-sm font-mono font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full">
                  CODE: {activeGroup.code}
                </span>
              </div>
              <h2 className="text-2xl font-black font-serif">{activeGroup.name}</h2>
              <p className="text-xs text-forest-200">
                Home Kitchen: {activeGroup.seller?.kitchenName || 'Selected Kitchen'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={copyCode}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              {activeGroup.status === 'open' && (
                <button
                  onClick={handleCheckoutGroup}
                  disabled={loading || activeGroup.totalAmount === 0}
                  className="px-6 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Host Checkout (₹{activeGroup.totalAmount})</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Participants Subtotals Column */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
              <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
                Participants & Contributions ({activeGroup.participants?.length || 0})
              </h3>

              <div className="space-y-4">
                {activeGroup.participants?.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      <span className="text-xs font-black font-serif text-forest-900">
                        ₹{p.subtotal}
                      </span>
                    </div>

                    {p.items?.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No dishes chosen yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {p.items?.map((it, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-slate-600">
                            <span>{it.name} (x{it.quantity})</span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between items-baseline text-base font-black font-serif text-slate-900">
                <span>Group Total:</span>
                <span className="text-forest-900">₹{activeGroup.totalAmount}</span>
              </div>
            </div>

            {/* Menu Items to Add Column */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
              <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
                Kitchen Menu – Add Items to Your Plate
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kitchenFoods.map((f) => (
                  <div key={f._id} className="p-3 rounded-2xl border border-cream-200 flex gap-3 items-center">
                    <img src={f.image} alt={f.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{f.name}</h4>
                      <span className="text-xs font-serif font-black text-slate-900 block mt-0.5">₹{f.price}</span>
                      <button
                        onClick={() => handleAddItemToGroup(f._id)}
                        className="mt-2 px-3 py-1 rounded-lg bg-forest-900 text-white text-[11px] font-bold hover:bg-forest-800 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200">
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">Create Community Group Order</h3>
            <p className="text-xs text-slate-500 mb-6">
              Pick a home kitchen to order from and invite your team to choose dishes.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Order Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Team Lunch"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Home Kitchen</label>
                <select
                  value={selectedSellerId}
                  onChange={(e) => setSelectedSellerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                >
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.kitchenName} ({s.address?.locality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800"
                >
                  Create & Get Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOrders;
