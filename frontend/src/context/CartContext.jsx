import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const { success, error, info } = useToast();

  const [cart, setCart] = useState({ items: [], totalPrice: 0, seller: null });
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingFoodId: null,
    pendingQty: 1,
    pendingRescue: false,
  });

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [], totalPrice: 0, seller: null });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (foodId, quantity = 1, isRescueItem = false, specialInstructions = '') => {
    if (!token) {
      info('Please sign in to add homemade food to your cart.');
      return false;
    }
    try {
      const res = await api.post('/cart/add', {
        foodId,
        quantity,
        isRescueItem,
        specialInstructions,
        resetCartIfDifferentSeller: false,
      });

      if (res.data.success) {
        setCart(res.data.cart);
        success(res.data.message || 'Added to cart!');
        return true;
      }
    } catch (err) {
      // Check if it's a different kitchen conflict
      if (err.message.includes('another kitchen') || err.message.includes('conflict')) {
        setConflictModal({
          isOpen: true,
          pendingFoodId: foodId,
          pendingQty: quantity,
          pendingRescue: isRescueItem,
        });
      } else {
        error(err.message);
      }
      return false;
    }
  };

  const confirmResetAndAdd = async () => {
    if (!conflictModal.pendingFoodId) return;
    try {
      const res = await api.post('/cart/add', {
        foodId: conflictModal.pendingFoodId,
        quantity: conflictModal.pendingQty,
        isRescueItem: conflictModal.pendingRescue,
        resetCartIfDifferentSeller: true,
      });

      if (res.data.success) {
        setCart(res.data.cart);
        success('Cart reset and new dish added from this kitchen!');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setConflictModal({ isOpen: false, pendingFoodId: null, pendingQty: 1, pendingRescue: false });
    }
  };

  const closeConflictModal = () => {
    setConflictModal({ isOpen: false, pendingFoodId: null, pendingQty: 1, pendingRescue: false });
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      error(err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        info('Item removed from cart');
      }
    } catch (err) {
      error(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart({ items: [], totalPrice: 0, seller: null });
      }
    } catch (err) {
      error(err.message);
    }
  };

  const totalItemsCount = cart.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}

      {/* Different Kitchen Conflict Modal */}
      {conflictModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-cream-200">
            <h3 className="text-xl font-bold text-forest-950 font-serif mb-2">Replace Cart Items?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Your cart currently contains dishes from another home kitchen. Because each home chef prepares fresh food independently, orders can only be placed from one kitchen at a time.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConflictModal}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Keep Current Cart
              </button>
              <button
                onClick={confirmResetAndAdd}
                className="px-5 py-2.5 rounded-xl bg-forest-900 font-semibold text-white hover:bg-forest-800 transition-colors shadow-md"
              >
                Clear Cart & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
