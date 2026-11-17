import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { colors } from '../theme/colors';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.log('Order fetch err:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // Polling order updates
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: colors.textMuted }}>Order details could not be found</Text>
      </View>
    );
  }

  const steps = [
    { key: 'placed', label: 'Order Placed', sub: 'Received by kitchen' },
    { key: 'confirmed', label: 'Kitchen Confirmed', sub: 'Ingredients prepped fresh' },
    { key: 'preparing', label: 'Cooking in Progress', sub: 'Slow cooked with authentic spices' },
    { key: 'ready_for_pickup', label: 'Packed & Ready', sub: 'Warm eco-friendly container' },
    {
      key: 'out_for_delivery',
      label: order.orderType === 'pickup' ? 'Ready for Handover' : 'Out for Delivery',
      sub: order.orderType === 'pickup' ? 'Waiting at kitchen counter' : 'Delivery partner on the way',
    },
    { key: 'delivered', label: 'Completed & Delivered', sub: 'Enjoy your homemade meal!' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === order.orderStatus);
  const activeStep = currentIdx >= 0 ? currentIdx : 1;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <TouchableOpacity onPress={fetchOrder}>
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Hero Card */}
        <View style={styles.statusHero}>
          <View style={styles.statusIconWrap}>
            <Ionicons name="restaurant" size={28} color="#fff" />
          </View>
          <Text style={styles.statusBigText}>
            {order.orderStatus === 'delivered'
              ? 'Meal Delivered'
              : order.orderStatus === 'preparing'
              ? 'Cooking with Love'
              : 'Kitchen Active'}
          </Text>
          <Text style={styles.statusEstimated}>
            {order.orderStatus === 'delivered'
              ? 'Delivered Fresh'
              : 'Estimated arrival in 25-35 mins'}
          </Text>
        </View>

        {/* Timeline Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Cooking & Delivery Timeline</Text>

          <View style={styles.stepperWrap}>
            {steps.map((step, idx) => {
              const isDone = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepperIndicator}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    {idx < steps.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          idx < activeStep && { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && { color: colors.text, fontWeight: '800' },
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepSub}>{step.sub}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Home Chef Contact Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.chefAvatarWrap}>
              <Ionicons name="home" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chefTitle}>
                {order.seller?.kitchenName || 'SmartBite Home Kitchen'}
              </Text>
              <Text style={styles.chefSub}>
                Verified Home Chef • FSSAI Hygiene Audited
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callChefBtn}
              onPress={() =>
                Alert.alert(
                  'Contact Kitchen',
                  `Connecting to ${order.seller?.kitchenName || 'Home Kitchen'}`
                )
              }
            >
              <Ionicons name="call" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ordered Items Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dish Summary</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.food?.name || 'Homemade Special'}
              </Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
          </View>
          <Text style={styles.paymentStatus}>
            Payment: {order.paymentStatus?.toUpperCase()} ({order.paymentMethod?.toUpperCase()})
          </Text>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.homeBtnText}>Back to Marketplace</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  scroll: { padding: 16, paddingBottom: 40 },
  statusHero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusBigText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statusEstimated: { fontSize: 12, color: '#bbf7d0', marginTop: 4, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 14 },
  stepperWrap: { paddingLeft: 4 },
  stepRow: { flexDirection: 'row', gap: 14, minHeight: 48 },
  stepperIndicator: { alignItems: 'center', width: 22 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.accent },
  stepDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: 14 },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  chefAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  chefSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  callChefBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  itemQuantity: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  itemName: { flex: 1, fontSize: 12, color: colors.text },
  itemPrice: { fontSize: 12, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  totalAmount: { fontSize: 16, fontWeight: '900', color: colors.primary },
  paymentStatus: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  homeBtn: {
    backgroundColor: colors.creamDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeBtnText: { color: colors.text, fontWeight: '800', fontSize: 13 },
});

export default OrderTrackingScreen;
