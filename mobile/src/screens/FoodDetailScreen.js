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

const FoodDetailScreen = ({ route, navigation }) => {
  const { foodId } = route.params;
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/foods/${foodId}`);
        setFood(res.data.food);
      } catch (err) {
        Alert.alert('Error', 'Failed to load dish details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [foodId]);

  const handleAddToCart = async () => {
    if (!food) return;
    if (quantity > food.availablePortions) {
      Alert.alert('Limit Exceeded', `Only ${food.availablePortions} portions available today.`);
      return;
    }
    setAdding(true);
    const res = await addToCart(food._id, quantity, food.isRescueDeal);
    setAdding(false);
    if (res.success) {
      Alert.alert(
        'Added to Basket',
        `${quantity}x ${food.name} added!`,
        [
          { text: 'Continue Browsing', style: 'cancel' },
          { text: 'View Basket', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } else {
      Alert.alert('Note', res.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!food) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Dish not found</Text>
      </View>
    );
  }

  const effectivePrice =
    food.isRescueDeal && food.rescueDiscountedPrice ? food.rescueDiscountedPrice : food.price;
  const portionPct = food.dailyPortionLimit
    ? Math.round((food.availablePortions / food.dailyPortionLimit) * 100)
    : 100;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero Image */}
        <View style={styles.imageWrap}>
          <Image
            source={{
              uri:
                food.images?.[0] ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700',
            }}
            style={styles.image}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: food.foodType === 'veg' ? '#f0fdf4' : '#fef2f2' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: food.foodType === 'veg' ? '#16a34a' : '#dc2626' },
                ]}
              >
                {food.foodType === 'veg' ? '🌱 Pure Veg' : '🍗 Non-Veg'}
              </Text>
            </View>
            <View style={styles.badgeCategory}>
              <Text style={styles.badgeCategoryText}>
                {food.category?.name || 'Traditional Homemade'}
              </Text>
            </View>
            {food.isRescueDeal && (
              <View style={styles.badgeRescue}>
                <Text style={styles.badgeRescueText}>RESCUE DEAL ACTIVE</Text>
              </View>
            )}
          </View>

          {/* Title & Price */}
          <Text style={styles.title}>{food.name}</Text>

          <View style={styles.priceRow}>
            {food.isRescueDeal && food.rescueDiscountedPrice ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={styles.price}>₹{food.rescueDiscountedPrice}</Text>
                <Text style={styles.strikethrough}>₹{food.price}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    SAVE ₹{food.price - food.rescueDiscountedPrice}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.price}>₹{food.price}</Text>
            )}

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {food.averageRating ? food.averageRating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.reviewCount}>({food.numReviews || 12} reviews)</Text>
            </View>
          </View>

          {/* FreshBatch Portions Tracker Box */}
          <View style={styles.batchBox}>
            <View style={styles.batchHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flash" size={16} color={colors.accent} />
                <Text style={styles.batchTitle}>FreshBatch Inventory Tracker</Text>
              </View>
              <Text style={styles.batchAvailable}>
                {food.availablePortions} / {food.dailyPortionLimit || 20} left
              </Text>
            </View>

            <View style={styles.batchBarTrack}>
              <View
                style={[
                  styles.batchBarProgress,
                  {
                    width: `${Math.min(portionPct, 100)}%`,
                    backgroundColor:
                      food.availablePortions <= 3 ? colors.error : colors.primaryLight,
                  },
                ]}
              />
            </View>
            <Text style={styles.batchSubtext}>
              {food.availablePortions > 0
                ? 'Cooked fresh today in small batches to preserve authentic aroma and quality.'
                : 'All fresh portions have been claimed for today. Next batch arrives tomorrow!'}
            </Text>
          </View>

          {/* Chef Kitchen Card */}
          <TouchableOpacity
            style={styles.chefCard}
            onPress={() =>
              food.seller?._id &&
              navigation.navigate('ChefDetail', { sellerId: food.seller._id })
            }
          >
            <Image
              source={{
                uri:
                  food.seller?.profileImage ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
              }}
              style={styles.chefAvatar}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.chefKitchenName}>
                  {food.seller?.kitchenName || 'Verified Home Kitchen'}
                </Text>
                {food.seller?.isVerified && (
                  <Ionicons name="checkmark-circle" size={15} color={colors.primaryLight} />
                )}
              </View>
              <Text style={styles.chefSub}>
                {food.seller?.serviceAreas?.[0] || 'Koramangala, Bengaluru'} •{' '}
                {food.seller?.yearsOfExperience || 8}+ years cooking experience
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>About this dish</Text>
            <Text style={styles.bodyText}>
              {food.description ||
                'Prepared using traditional recipes handed down through generations. Cooked with pure ingredients and utmost hygiene.'}
            </Text>
          </View>

          {/* Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Key Ingredients</Text>
              <View style={styles.chipRow}>
                {food.ingredients.map((item, idx) => (
                  <View key={idx} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Allergens Notice */}
          {food.allergens && food.allergens.length > 0 && (
            <View style={styles.allergenBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#9a3412" />
              <View style={{ flex: 1 }}>
                <Text style={styles.allergenTitle}>Allergen Information</Text>
                <Text style={styles.allergenText}>
                  Contains: {food.allergens.join(', ')}. Please verify with the home chef if you have acute sensitivities.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.min(food.availablePortions || 10, q + 1))}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.addCartBtn,
            food.availablePortions <= 0 && { backgroundColor: '#cbd5e1' },
          ]}
          onPress={handleAddToCart}
          disabled={adding || food.availablePortions <= 0}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="bag-add" size={18} color="#fff" />
              <Text style={styles.addCartText}>
                {food.availablePortions > 0
                  ? `Add ${quantity} • ₹${effectivePrice * quantity}`
                  : 'Sold Out Today'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 100 },
  imageWrap: { position: 'relative', width: '100%', height: 260 },
  image: { width: '100%', height: '100%', backgroundColor: colors.creamDark },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  content: { padding: 18 },
  tagsRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  badgeCategory: {
    backgroundColor: colors.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCategoryText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  badgeRescue: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRescueText: { fontSize: 9, fontWeight: '900', color: '#fff' },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  price: { fontSize: 24, fontWeight: '900', color: colors.primary },
  strikethrough: {
    fontSize: 16,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: colors.accentDark, fontSize: 10, fontWeight: 'bold' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: colors.text },
  reviewCount: { fontSize: 11, color: colors.textMuted },
  batchBox: {
    backgroundColor: colors.creamDark,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchTitle: { fontSize: 12, fontWeight: '800', color: colors.text },
  batchAvailable: { fontSize: 12, fontWeight: '800', color: colors.primary },
  batchBarTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  batchBarProgress: { height: '100%', borderRadius: 3 },
  batchSubtext: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 15 },
  chefCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  chefAvatar: { width: 44, height: 44, borderRadius: 22 },
  chefKitchenName: { fontSize: 13, fontWeight: '800', color: colors.text },
  chefSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  section: { marginTop: 14 },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 6 },
  bodyText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: colors.creamDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 11, color: colors.text, fontWeight: '600' },
  allergenBox: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  allergenTitle: { fontSize: 12, fontWeight: 'bold', color: '#9a3412' },
  allergenText: { fontSize: 11, color: '#7c2d12', marginTop: 2, lineHeight: 16 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 14, fontWeight: '900', paddingHorizontal: 8, color: colors.text },
  addCartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted },
});

export default FoodDetailScreen;
