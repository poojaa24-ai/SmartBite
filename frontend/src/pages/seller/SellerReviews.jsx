import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const SellerReviews = () => {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/sellers/me/profile');
      if (profileRes.data.success && profileRes.data.seller) {
        const res = await api.get(`/reviews/seller/${profileRes.data.seller._id}`);
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handlePostReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { reply: text.trim() });
      if (res.data.success) {
        success('Response posted to review!');
        setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
        fetchReviews();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Customer Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Read what food lovers say about your dishes and reply with heartfelt gratitude
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Yet"
          description="Customer reviews for your kitchen will appear here after orders are delivered."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.customer?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.customer?.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      Dish: {rev.food?.name} • {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pl-13">
                "{rev.comment}"
              </p>

              {/* Existing Chef Reply */}
              {rev.chefReply?.reply ? (
                <div className="mt-3 p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-slate-700 ml-6">
                  <span className="font-bold text-forest-900 block">Your Response:</span>
                  <span className="mt-0.5 block">{rev.chefReply.reply}</span>
                </div>
              ) : (
                /* Reply Input */
                <div className="pt-2 flex gap-2 ml-6">
                  <input
                    type="text"
                    value={replyText[rev._id] || ''}
                    onChange={(e) =>
                      setReplyText({ ...replyText, [rev._id]: e.target.value })
                    }
                    placeholder="Reply as Home Chef (e.g. Thank you! Glad you enjoyed)..."
                    className="flex-1 px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
                  />
                  <button
                    onClick={() => handlePostReply(rev._id)}
                    className="px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
