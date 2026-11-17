import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../../services/api';
import FoodCard from '../../components/FoodCard';
import EmptyState from '../../components/EmptyState';
import { FoodCardSkeleton } from '../../components/LoadingSkeleton';

const FavouriteFoods = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/favorites');
        if (res.data.success) {
          setFavorites(res.data.favorites || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          My Favorite Dishes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your saved authentic regional dishes for quick daily re-ordering
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FoodCardSkeleton />
          <FoodCardSkeleton />
          <FoodCardSkeleton />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Favorites Saved Yet"
          description="Click the heart icon on any homemade food card to save your favorite dishes here."
          actionText="Explore Dishes"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteFoods;
