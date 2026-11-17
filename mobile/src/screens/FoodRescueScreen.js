import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/colors';

const FoodRescueScreen = ({ navigation }) => {
  const { addToCart } = useCart();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRescueDeals = async () => {
    try {
      const res = await api.get('/foods?rescueOnly=true');
      setDeals(res.data.foods || []);
    } catch (err) {
      console.log('Rescue fetch err:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescueDeals();
  }, []);

  const handleRescue = async (dish) => {
    const res = await addToCart(dish._id, 1, true);
    if (res.success) {
      Alert.alert('Rescued!', `${dish.name} added to your basket at special rescue pricing!`, [
        { text: 'Keep Exploring', style: 'cancel' },
        { text: 'View Basket', onPress: () => navigation.navigate('Cart') },
      ]);
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Rescue Deals</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Rescue Mission Banner */}
        <View style={styles.missionBanner}>
          <View style={styles.missionIcon}>
            <Ionicons name="leaf" size={24} color="#fff" />
          </View>
          <Text style={styles.missionTitle}>Zero Food Waste Movement</Text>
          <Text style={styles.missionSub}>
            Every evening, our home chefs list extra portions cooked in fresh batches at 30% to 50%
            discount. Fresh, hygienic, and eco-friendly!
          </Text>
        </View>

        <Text style={styles.dealsHeading}>Available Rescue Portions Right Now</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : deals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>All Batches Sold Out!</Text>
            <Text style={styles.emptySub}>
              No extra food portions remain right now. Home chefs post new rescue deals every afternoon
              from 3:30 PM onwards!
            </Text>
          </View>
        ) : (
          deals.map((dish) => {
            const savings = dish.price - (dish.rescueDiscountedPrice || dish.price);

            return (
              <View key={dish._id} style={styles.dealCard}>
                <Image
                  source={{
                    uri:
                      dish.images?.[0] ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
                  }}
                  style={styles.dishImage}
                />

                <View style={styles.dealBody}>
                  <View style={styles.kitchenRow}>
                    <Text style={styles.kitchenName}>
                      {dish.seller?.kitchenName || 'Home Kitchen'}
                    </Text>
                    <View style={styles.saveTag}>
                      <Text style={styles.saveTagText}>SAVE ₹{savings}</Text>
                    </View>
                  </View>

                  <Text style={styles.dishName}>{dish.name}</Text>

                  <View style={styles.deadlineRow}>
                    <Ionicons name="time-outline" size={13} color={colors.accentDark} />
                    <Text style={styles.deadlineText}>Claim before 10:00 PM tonight</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                        <Text style={styles.discountedPrice}>
                          ₹{dish.rescueDiscountedPrice || dish.price}
                        </Text>
                        <Text style={styles.originalPrice}>₹{dish.price}</Text>
                      </View>
                      <Text style={styles.portionCount}>
                        {dish.availablePortions} portions left
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.rescueBtn}
                      onPress={() => handleRescue(dish)}
                    >
                      <Ionicons name="basket" size={14} color="#fff" />
                      <Text style={styles.rescueBtnText}>Rescue Dish</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  scroll: { padding: 16, paddingBottom: 40 },
  missionBanner: {
    backgroundColor: '#14532d',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  missionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  missionTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  missionSub: { fontSize: 12, color: '#bbf7d0', marginTop: 4, lineHeight: 18 },
  dealsHeading: { fontSize: 15, fontWeight: '900', color: colors.text, marginBottom: 14 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 10 },
  emptySub: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  dealCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  dishImage: { width: '100%', height: 140, backgroundColor: colors.creamDark },
  dealBody: { padding: 14 },
  kitchenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kitchenName: { fontSize: 12, fontWeight: '700', color: colors.primary },
  saveTag: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveTagText: { fontSize: 9, fontWeight: '900', color: colors.accentDark },
  dishName: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: 4 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  deadlineText: { fontSize: 11, color: colors.accentDark, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  discountedPrice: { fontSize: 18, fontWeight: '900', color: colors.primary },
  originalPrice: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'line-through' },
  portionCount: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  rescueBtn: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rescueBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default FoodRescueScreen;
