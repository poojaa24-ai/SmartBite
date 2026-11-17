import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { totalCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [rescueDeals, setRescueDeals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [catRes, foodRes, sellerRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/foods?limit=6').catch(() => ({ data: { foods: [] } })),
        api.get('/sellers?limit=4').catch(() => ({ data: { sellers: [] } })),
      ]);

      setCategories(catRes.data.categories || []);
      const foods = foodRes.data.foods || [];
      setFeaturedFoods(foods);
      setRescueDeals(foods.filter((f) => f.isRescueDeal));
      setTopSellers(sellerRes.data.sellers || []);
    } catch (err) {
      console.log('Home load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.deliverTo}>DELIVERING TO</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={colors.accent} />
            <Text style={styles.locationText}>Koramangala, Bengaluru</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-handle-outline" size={22} color={colors.primary} />
            {totalCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Prompt */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Explore')}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search "Jolada Rotti", "Akki Rotti", "Biryani"...</Text>
        </TouchableOpacity>

        {/* Hero Card */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.heroBadgeText}>FRESHBATCH TODAY</Text>
          </View>
          <Text style={styles.heroTitle}>Authentic Homemade Meals</Text>
          <Text style={styles.heroSubtitle}>
            Hand-crafted in local kitchens with real ghee & mother's love.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.heroButtonText}>Explore Kitchens</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Food Rescue Flash Banner */}
        {rescueDeals.length > 0 && (
          <TouchableOpacity
            style={styles.rescueBanner}
            onPress={() => navigation.navigate('FoodRescue')}
          >
            <View style={styles.rescueIcon}>
              <Ionicons name="leaf" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rescueTitle}>Food Rescue Deals Active!</Text>
              <Text style={styles.rescueSub}>
                Up to 40% OFF leftover fresh batches. Save food, save money.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* Categories Horizontal */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={styles.catCard}
              onPress={() => navigation.navigate('Explore', { category: cat.slug || cat.name })}
            >
              <View style={styles.catIconWrap}>
                <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.catName} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FreshBatch Spotlight Dishes */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>FreshBatch Specials</Text>
            <Text style={styles.sectionSub}>Limited daily portions prepared fresh</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foodHorizontalList}
          >
            {featuredFoods.map((food) => {
              const portionPct = food.dailyPortionLimit
                ? Math.round((food.availablePortions / food.dailyPortionLimit) * 100)
                : 100;

              return (
                <TouchableOpacity
                  key={food._id}
                  style={styles.foodCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('FoodDetail', { foodId: food._id })}
                >
                  <Image source={{ uri: food.images?.[0] }} style={styles.foodImg} />
                  <View style={styles.foodTag}>
                    <Text style={styles.foodTagText}>
                      {food.foodType === 'veg' ? '🌱 VEG' : '🍗 NON-VEG'}
                    </Text>
                  </View>

                  <View style={styles.foodCardBody}>
                    <Text style={styles.foodTitle} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={styles.kitchenName} numberOfLines={1}>
                      by {food.seller?.kitchenName || 'Home Kitchen'}
                    </Text>

                    {/* FreshBatch Portions Remaining Bar */}
                    <View style={styles.batchBarWrap}>
                      <View style={styles.batchBarBg}>
                        <View
                          style={[
                            styles.batchBarFill,
                            {
                              width: `${Math.min(portionPct, 100)}%`,
                              backgroundColor:
                                food.availablePortions <= 3 ? colors.error : colors.primaryLight,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.batchText}>
                        {food.availablePortions} left / {food.dailyPortionLimit || 20}
                      </Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₹{food.price}</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}>
                          {food.averageRating ? food.averageRating.toFixed(1) : '4.8'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Top Verified Home Chefs */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Verified Home Kitchens</Text>
            <Text style={styles.sectionSub}>FSSAI registered & hygiene audited</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sellersGrid}>
          {topSellers.map((seller) => (
            <TouchableOpacity
              key={seller._id}
              style={styles.sellerCard}
              onPress={() => navigation.navigate('ChefDetail', { sellerId: seller._id })}
            >
              <Image
                source={{
                  uri:
                    seller.profileImage ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
                }}
                style={styles.sellerAvatar}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.sellerKitchenName} numberOfLines={1}>
                    {seller.kitchenName}
                  </Text>
                  {seller.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.primaryLight} />
                  )}
                </View>
                <Text style={styles.sellerCuisine} numberOfLines={1}>
                  {seller.cuisineSpecialties?.join(', ') || 'Authentic Home Cook'}
                </Text>
                <Text style={styles.sellerLocation} numberOfLines={1}>
                  📍 {seller.serviceAreas?.[0] || 'Bengaluru'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Subscription Promo Card */}
        <TouchableOpacity
          style={styles.subscriptionBanner}
          onPress={() => navigation.navigate('MealSubscriptions')}
        >
          <View style={styles.subIcon}>
            <Ionicons name="calendar-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Daily Tiffin Subscriptions</Text>
            <Text style={styles.subDesc}>
              Healthy homemade breakfast, lunch & dinner delivered 7 days a week.
            </Text>
          </View>
          <Text style={styles.subAction}>Plans →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deliverTo: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 13, fontWeight: '700', color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 30 },
  searchBar: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: { fontSize: 13, color: colors.textMuted },
  heroBanner: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    padding: 18,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  heroBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  heroSubtitle: { color: '#bbf7d0', fontSize: 12, marginTop: 4, lineHeight: 17 },
  heroButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  heroButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  rescueBanner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rescueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescueTitle: { fontSize: 13, fontWeight: '800', color: colors.accentDark },
  rescueSub: { fontSize: 11, color: '#7c2d12', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.text },
  sectionSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  seeAll: { fontSize: 12, fontWeight: '700', color: colors.primary },
  catList: { paddingHorizontal: 16, gap: 10 },
  catCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catName: { fontSize: 11, fontWeight: '700', color: colors.text },
  foodHorizontalList: { paddingHorizontal: 16, gap: 12 },
  foodCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodImg: { width: '100%', height: 120, backgroundColor: colors.creamDark },
  foodTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  foodTagText: { fontSize: 9, fontWeight: '800', color: colors.primary },
  foodCardBody: { padding: 12 },
  foodTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  kitchenName: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  batchBarWrap: { marginTop: 8 },
  batchBarBg: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' },
  batchBarFill: { height: '100%', borderRadius: 2 },
  batchText: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginTop: 3 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: { fontSize: 15, fontWeight: '900', color: colors.primary },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: 'bold', color: '#92400e' },
  sellersGrid: { paddingHorizontal: 16, gap: 10 },
  sellerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.creamDark },
  sellerKitchenName: { fontSize: 14, fontWeight: '800', color: colors.text },
  sellerCuisine: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sellerLocation: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  subscriptionBanner: {
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  subDesc: { color: '#86efac', fontSize: 11, marginTop: 2, lineHeight: 15 },
  subAction: { color: colors.accent, fontWeight: 'bold', fontSize: 12 },
});

export default HomeScreen;
