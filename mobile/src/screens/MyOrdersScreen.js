import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const MyOrdersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.log('Orders load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="receipt-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <Text style={styles.emptySub}>Track all your homemade food deliveries and receipts</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderOrderItem = ({ item }) => {
    const isLive = !['delivered', 'cancelled'].includes(item.orderStatus);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('OrderTracking', { orderId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isLive ? styles.statusLive : styles.statusDone,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isLive ? styles.statusLiveText : styles.statusDoneText,
              ]}
            >
              {item.orderStatus.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.kitchenRow}>
          <Ionicons name="home-outline" size={14} color={colors.primary} />
          <Text style={styles.kitchenText}>
            {item.seller?.kitchenName || 'SmartBite Home Kitchen'}
          </Text>
        </View>

        <Text style={styles.itemsSummary} numberOfLines={2}>
          {item.items?.map((i) => `${i.quantity}x ${i.food?.name || 'Dish'}`).join(' • ')}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{item.totalAmount}</Text>
          <View style={styles.actionRow}>
            <Text style={styles.trackAction}>
              {isLive ? 'Track Live →' : 'View Details →'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySub}>
            You haven't tasted homemade goodness through SmartBite yet!
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.signInText}>Explore Dishes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 12 },
  emptySub: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  signInText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  list: { padding: 16, gap: 12 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { fontSize: 13, fontWeight: '900', color: colors.text },
  orderDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusLive: { backgroundColor: '#ffedd5' },
  statusLiveText: { color: colors.accentDark, fontSize: 9, fontWeight: '900' },
  statusDone: { backgroundColor: '#f0fdf4' },
  statusDoneText: { color: colors.primary, fontSize: 9, fontWeight: '800' },
  kitchenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  kitchenText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  itemsSummary: { fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 16 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  price: { fontSize: 15, fontWeight: '900', color: colors.text },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  trackAction: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

export default MyOrdersScreen;
