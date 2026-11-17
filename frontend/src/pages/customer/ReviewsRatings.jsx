import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, Send, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ReviewsRatings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const orderId = searchParams.get('orderId');
  const foodId = searchParams.get('foodId');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Please write a short review comment.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/reviews', {
        foodId,
        orderId,
        rating,
        comment,
      });

      if (res.data.success) {
        success(res.data.message || 'Review submitted successfully!');
        navigate('/my-orders');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <Link
        to="/my-orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Orders</span>
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block mb-1">
            Share Your Experience
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Rate & Review Homemade Dish
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your heartfelt feedback helps local home chefs improve recipes and builds trust in our community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-800 ml-2">{rating} of 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the taste, authenticity, and packaging? Mention what you loved!"
              className="w-full px-4 py-3 text-sm bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Customer Review</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewsRatings;
