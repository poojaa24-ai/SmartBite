import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, seller: null });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCart({ items: [], totalPrice: 0, seller: null });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.log('Mobile cart fetch:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (foodId, quantity = 1, isRescueItem = false) => {
    if (!token) return { success: false, message: 'Please sign in first' };
    try {
      const res = await api.post('/cart/add', {
        foodId,
        quantity,
        isRescueItem,
        resetCartIfDifferentSeller: true, // Auto reset on mobile for smooth experience
      });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const totalCount = cart.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, loading, totalCount, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
