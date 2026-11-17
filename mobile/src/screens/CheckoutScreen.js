import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/colors';

const CheckoutScreen = ({ route, navigation }) => {
  const { discountAmount = 0, couponCode = '', grandTotal = 0 } = route.params || {};
  const { cart, fetchCart } = useCart();

  const [orderType, setOrderType] = useState('delivery'); // delivery or pickup
  const [paymentMethod, setPaymentMethod] = useState('simulated'); // simulated, cod, razorpay
  const [addressLine, setAddressLine] = useState('Flat 402, Green Glen Layout, Bellandur');
  const [city, setCity] = useState('Bengaluru');
  const [postalCode, setPostalCode] = useState('560103');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && (!addressLine || !city || !postalCode)) {
      Alert.alert('Address Incomplete', 'Please provide complete delivery address');
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        orderType,
        deliveryAddress: {
          street: addressLine,
          city,
          pincode: postalCode,
          state: 'Karnataka',
        },
        deliveryNotes,
        couponCode: couponCode || undefined,
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        const order = res.data.order;

        // If simulated payment, confirm payment via simulated endpoint
        if (paymentMethod === 'simulated') {
          await api.post('/payments/simulated', { orderId: order._id }).catch(() => {});
        }

        await fetchCart(); // clear cart state
        Alert.alert('Order Confirmed!', `Your order #${order.orderNumber} has been sent to the home kitchen!`, [
          {
            text: 'Track Order',
            onPress: () => navigation.replace('OrderTracking', { orderId: order._id }),
          },
        ]);
      }
    } catch (err) {
      Alert.alert('Order Failed', err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Order Type Toggle */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Fulfillment Method</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'delivery' && styles.toggleBtnActive]}
              onPress={() => setOrderType('delivery')}
            >
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={orderType === 'delivery' ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  orderType === 'delivery' && styles.toggleBtnTextActive,
                ]}
              >
                Home Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'pickup' && styles.toggleBtnActive]}
              onPress={() => setOrderType('pickup')}
            >
              <Ionicons
                name="walk-outline"
                size={18}
                color={orderType === 'pickup' ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  orderType === 'pickup' && styles.toggleBtnTextActive,
                ]}
              >
                Self Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Card */}
        {orderType === 'delivery' ? (
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>

            <Text style={styles.inputLabel}>Street / Building / Flat</Text>
            <TextInput
              style={styles.input}
              value={addressLine}
              onChangeText={setAddressLine}
              placeholder="House/Flat number, Apartment name, Road"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PIN Code</Text>
                <TextInput
                  style={styles.input}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="560001"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Cooking / Delivery Instructions</Text>
            <TextInput
              style={styles.input}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="e.g. Less spicy, ring the doorbell, leave at gate"
            />
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="storefront-outline" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Kitchen Pickup Address</Text>
            </View>
            <Text style={styles.pickupAddress}>
              {cart.seller?.kitchenAddress?.street || '12th Main, 4th Block, Koramangala'},{' '}
              {cart.seller?.kitchenAddress?.city || 'Bengaluru'} -{' '}
              {cart.seller?.kitchenAddress?.pincode || '560034'}
            </Text>
            <Text style={styles.pickupTime}>
              Estimated Ready Time: 35-45 minutes after confirmation
            </Text>
          </View>
        )}

        {/* Payment Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.payOption,
              paymentMethod === 'simulated' && styles.payOptionActive,
            ]}
            onPress={() => setPaymentMethod('simulated')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'simulated' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.payName}>Simulated Instant Payment (Demo)</Text>
                <View style={styles.instantTag}>
                  <Text style={styles.instantTagText}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={styles.paySub}>
                Instant confirmation via simulated UPI / NetBanking for presentation
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'cod' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'cod' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Cash on Delivery / Pickup</Text>
              <Text style={styles.paySub}>Pay with cash or scan QR when your food arrives</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'razorpay' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('razorpay')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'razorpay' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Razorpay Payment Gateway</Text>
              <Text style={styles.paySub}>UPI, Debit/Credit Cards, Wallets, NetBanking</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Amount Box */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Payable</Text>
            <Text style={styles.summaryAmount}>₹{grandTotal}</Text>
          </View>
          {couponCode ? (
            <Text style={styles.couponNotice}>Applied promo coupon: {couponCode}</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.placeBtn}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
              <Text style={styles.placeBtnText}>Confirm Order (₹{grandTotal})</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.creamDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  toggleBtnTextActive: { color: '#fff' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  input: {
    backgroundColor: colors.cream,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  pickupAddress: { fontSize: 12, color: colors.text, lineHeight: 18, marginTop: 6 },
  pickupTime: { fontSize: 11, color: colors.accent, fontWeight: '700', marginTop: 6 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  payOptionActive: { borderColor: colors.primary, backgroundColor: '#f0fdf4' },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.primary },
  payName: { fontSize: 13, fontWeight: '800', color: colors.text },
  paySub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  instantTag: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  instantTagText: { fontSize: 8, fontWeight: '900', color: colors.accentDark },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, fontWeight: '900', color: colors.text },
  summaryAmount: { fontSize: 18, fontWeight: '900', color: colors.primary },
  couponNotice: { fontSize: 11, color: colors.success, fontWeight: '700', marginTop: 6 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  placeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default CheckoutScreen;
