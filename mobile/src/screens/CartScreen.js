import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const CartScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { cart, fetchCart, loading } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [applying, setApplying] = useState(false);

  const updateQuantity = async (foodId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      if (newQty <= 0) {
        await api.delete(`/cart/item/${foodId}`);
      } else {
        await api.put(`/cart/item/${foodId}`, { quantity: newQty });
      }
      fetchCart();
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || err.message);
    }
  };

  const removeItem = async (foodId) => {
    try {
      await api.delete(`/cart/item/${foodId}`);
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplying(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: cart.totalPrice,
      });
      if (res.data.success) {
        setDiscountAmount(res.data.discountAmount || 50);
        setAppliedCoupon(couponCode.toUpperCase());
        Alert.alert('Success', `Coupon ${couponCode.toUpperCase()} applied!`);
      }
    } catch (err) {
      Alert.alert('Invalid Coupon', err.response?.data?.message || 'Coupon code not applicable');
    } finally {
      setApplying(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bag-handle-outline" size={60} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your Basket is Empty</Text>
        <Text style={styles.emptySub}>Sign in to view your saved homemade selections</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;
  const deliveryFee = subtotal > 350 ? 0 : 30;
  const platformFee = 15;
  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee - discountAmount);

  if (items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="basket-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your Basket is Empty</Text>
        <Text style={styles.emptySub}>
          Explore delicious homemade dishes from verified local kitchens.
        </Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.exploreText}>Explore Homemade Food</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Food Basket</Text>
        <Text style={styles.headerCount}>{items.length} items</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Kitchen Banner */}
        <View style={styles.kitchenHeader}>
          <Ionicons name="home-outline" size={16} color={colors.primary} />
          <Text style={styles.kitchenName}>
            Ordering from {cart.seller?.kitchenName || 'Verified Home Chef'}
          </Text>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.food?._id || item._id} style={styles.itemRow}>
              <Image
                source={{
                  uri:
                    item.food?.images?.[0] ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                }}
                style={styles.itemThumb}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.food?.name}
                </Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>

                <View style={styles.qtyRow}>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.food._id, item.quantity, -1)}
                    >
                      <Ionicons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.food._id, item.quantity, 1)}
                    >
                      <Ionicons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemSubtotal}>₹{item.price * item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => removeItem(item.food._id)}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon Code Section */}
        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>Have a Promo Coupon?</Text>
          <View style={styles.couponInputRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="e.g. SMART50, HOMELOVE"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyCoupon}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {appliedCoupon ? (
            <View style={styles.appliedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.appliedText}>
                Coupon {appliedCoupon} applied (-₹{discountAmount})
              </Text>
            </View>
          ) : null}
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Partner Fee</Text>
            <Text style={styles.billValue}>
              {deliveryFee === 0 ? <Text style={{ color: colors.success }}>FREE</Text> : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Eco Packaging & Platform</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.success }]}>Coupon Discount</Text>
              <Text style={[styles.billValue, { color: colors.success }]}>-₹{discountAmount}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Checkout Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalPrice}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() =>
            navigation.navigate('Checkout', {
              discountAmount,
              couponCode: appliedCoupon,
              grandTotal,
            })
          }
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 14 },
  emptySub: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  exploreText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  signInText: { color: '#fff', fontWeight: 'bold' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  headerCount: { fontSize: 12, color: colors.textMuted },
  scroll: { padding: 16, paddingBottom: 100 },
  kitchenHeader: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kitchenName: { fontSize: 12, fontWeight: '700', color: colors.primary },
  itemsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.creamDark },
  itemName: { fontSize: 13, fontWeight: '800', color: colors.text },
  itemPrice: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamDark,
    borderRadius: 8,
  },
  qtyBtn: { padding: 6 },
  qtyVal: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 6 },
  itemSubtotal: { fontSize: 13, fontWeight: '900', color: colors.text },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  couponTitle: { fontSize: 12, fontWeight: '800', color: colors.text, marginBottom: 8 },
  couponInputRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  applyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  appliedText: { fontSize: 11, color: colors.success, fontWeight: 'bold' },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 12 },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: { fontSize: 12, color: colors.textMuted },
  billValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  billDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: '900', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '900', color: colors.primary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  bottomTotalLabel: { fontSize: 10, color: colors.textMuted },
  bottomTotalPrice: { fontSize: 18, fontWeight: '900', color: colors.primary },
  checkoutBtn: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  checkoutBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});

export default CartScreen;
