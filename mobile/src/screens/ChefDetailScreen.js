import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { colors } from '../theme/colors';

const ChefDetailScreen = ({ route, navigation }) => {
  const { sellerId } = route.params;
  const [seller, setSeller] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [sellerRes, foodRes] = await Promise.all([
          api.get(`/sellers/${sellerId}`),
          api.get(`/foods?seller=${sellerId}`),
        ]);
        setSeller(sellerRes.data.seller);
        setFoods(foodRes.data.foods || []);
      } catch (err) {
        console.log('Chef profile error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [sellerId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: colors.textMuted }}>Kitchen profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {seller.kitchenName}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Kitchen Info Box */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri:
                seller.profileImage ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
            }}
            style={styles.avatar}
          />
          <View style={styles.nameRow}>
            <Text style={styles.kitchenName}>{seller.kitchenName}</Text>
            {seller.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color={colors.primaryLight} />
            )}
          </View>
          <Text style={styles.ownerName}>Head Chef: {seller.user?.name || 'Home Cook'}</Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.statValue}>
                  {seller.averageRating ? seller.averageRating.toFixed(1) : '4.9'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{seller.yearsOfExperience || 6} yrs</Text>
              <Text style={styles.statLabel}>Cooking Exp</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{seller.totalOrders || 120}+</Text>
              <Text style={styles.statLabel}>Batches Delivered</Text>
            </View>
          </View>

          {/* Verification Badge Box */}
          <View style={styles.fssaiBox}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fssaiTitle}>
                {seller.isVerified ? 'Verified Home Kitchen' : 'Verification Under Review'}
              </Text>
              <Text style={styles.fssaiSub}>
                FSSAI Reg: {seller.fssaiNumber ? seller.fssaiNumber : 'Applied & Processed'} • Hygiene
                Standard A+
              </Text>
            </View>
          </View>

          {/* Bio */}
          {seller.bio && (
            <Text style={styles.bioText}>"{seller.bio}"</Text>
          )}

          {/* Cuisine Specialties */}
          {seller.cuisineSpecialties && seller.cuisineSpecialties.length > 0 && (
            <View style={styles.specialtiesRow}>
              {seller.cuisineSpecialties.map((tag, idx) => (
                <View key={idx} style={styles.specChip}>
                  <Text style={styles.specText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu Dishes */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Kitchen Menu ({foods.length} Dishes)</Text>
          {foods.map((food) => (
            <TouchableOpacity
              key={food._id}
              style={styles.foodRow}
              onPress={() => navigation.navigate('FoodDetail', { foodId: food._id })}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 10 }}>
                    {food.foodType === 'veg' ? '🌱' : '🍗'}
                  </Text>
                  <Text style={styles.dishName}>{food.name}</Text>
                </View>
                <Text style={styles.dishPrice}>₹{food.price}</Text>
                <Text style={styles.dishDesc} numberOfLines={2}>
                  {food.description}
                </Text>
                <Text style={styles.dishPortions}>
                  {food.availablePortions} portions left today
                </Text>
              </View>

              <Image source={{ uri: food.images?.[0] }} style={styles.dishThumb} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
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
  scroll: { paddingBottom: 40 },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kitchenName: { fontSize: 20, fontWeight: '900', color: colors.text },
  ownerName: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.creamDark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: colors.border },
  fssaiBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  fssaiTitle: { fontSize: 11, fontWeight: '800', color: colors.primaryDark },
  fssaiSub: { fontSize: 10, color: '#166534', marginTop: 1 },
  bioText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  specChip: {
    backgroundColor: colors.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specText: { fontSize: 11, color: colors.text, fontWeight: '600' },
  menuSection: { padding: 16 },
  menuTitle: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 12 },
  foodRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishName: { fontSize: 14, fontWeight: '800', color: colors.text },
  dishPrice: { fontSize: 14, fontWeight: '900', color: colors.primary, marginTop: 2 },
  dishDesc: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  dishPortions: { fontSize: 10, color: colors.accent, fontWeight: '700', marginTop: 6 },
  dishThumb: { width: 75, height: 75, borderRadius: 12, backgroundColor: colors.creamDark },
});

export default ChefDetailScreen;
