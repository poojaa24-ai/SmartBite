import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AddFood = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [preparationTime, setPreparationTime] = useState('25');
  const [calories, setCalories] = useState('380');
  const [servingSize, setServingSize] = useState('1 Plate / 1 Person');
  const [freshBatchPortions, setFreshBatchPortions] = useState('20');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          setCategory(res.data.categories[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !category) {
      error('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/foods', {
        name,
        description,
        price: Number(price),
        category,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        isVeg,
        ingredients: ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        allergens: allergens.split(',').map((s) => s.trim()).filter(Boolean),
        preparationTime: Number(preparationTime),
        calories: Number(calories),
        servingSize,
        freshBatchPortions: Number(freshBatchPortions),
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      });

      if (res.data.success) {
        success('Dish added to your kitchen menu successfully!');
        navigate('/seller/manage-food');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">Add Homemade Dish</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish a new authentic homestyle recipe with daily FreshBatch portion limits
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        {/* Dish Basic Info */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
            Dish Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sabsige Soppu Akki Rotti"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Heritage Story</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the flavors, spices, and how this dish is traditionally enjoyed..."
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price per Portion (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="120"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl font-bold font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preparation Type</label>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    isVeg ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    !isVeg ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* FEATURE 1: FreshBatch Daily Portion Setting */}
        <div className="space-y-4 pt-4 border-t border-cream-100 bg-forest-50/50 p-5 rounded-2xl border border-forest-900/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-800" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-950 font-serif">
              Feature 1: FreshBatch™ Daily Portion Cap
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Specify how many portions of this dish you can hygienically prepare each day. SmartBite will stop taking orders once this number is reached.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Available Portions Cap
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={freshBatchPortions}
                onChange={(e) => setFreshBatchPortions(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-white border border-cream-300 rounded-xl font-bold font-serif text-forest-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Serving Size</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="e.g. 2 Rottis + Yennegai + Curd"
                className="w-full px-4 py-2 text-sm bg-white border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Ingredients & Allergens */}
        <div className="space-y-4 pt-4 border-t border-cream-100">
          <h3 className="text-base font-bold font-serif text-slate-900">
            Ingredients & Food Safety Transparency
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ingredients List (comma separated)
            </label>
            <input
              type="text"
              required
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Jowar Flour, Roasted Peanuts, Brinjals, Sesame, Curd"
              className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allergen Warnings (comma separated)
              </label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g. Peanuts, Gluten, Dairy"
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-colors shadow-md flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{loading ? 'Publishing Dish...' : 'Publish Dish to Kitchen Menu'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddFood;
