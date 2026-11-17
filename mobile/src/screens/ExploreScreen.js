import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/colors';

const ExploreScreen = ({ navigation, route }) => {
  const initialCategory = route?.params?.category || '';
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('all'); // all, veg, non-veg
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log('Cat fetch err:', err.message);
    }
  };

  const fetchFoods = async () => {
    setLoading(true);
    try {
      let query = `?limit=30`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (foodType !== 'all') query += `&foodType=${foodType}`;
      if (selectedCategory) query += `&category=${selectedCategory}`;

      const res = await api.get(`/foods${query}`);
      setFoods(res.data.foods || []);
    } catch (err) {
      console.log('Food fetch err:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFoods();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, foodType, selectedCategory]);

  const handleAdd = async (food) => {
    if (food.availablePortions <= 0) {
      Alert.alert('Sold Out', 'All fresh portions for today have been reserved.');
      return;
    }
    const res = await addToCart(food._id, 1, food.isRescueDeal);
    if (res.success) {
      Alert.alert('Added', `${food.name} added to your basket!`);
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('FoodDetail', { foodId: item._id })}
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        }}
        style={styles.foodImg}
      />

      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: item.foodType === 'veg' ? '#f0fdf4' : '#fef2f2' },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: item.foodType === 'veg' ? '#16a34a' : '#dc2626' },
              ]}
            >
              {item.foodType === 'veg' ? '🌱 Pure Veg' : '🍗 Non-Veg'}
            </Text>
          </View>
          {item.isRescueDeal && (
            <View style={styles.rescueTag}>
              <Text style={styles.rescueTagText}>RESCUE DEAL</Text>
            </View>
          )}
        </View>

        <Text style={styles.foodName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.kitchenName} numberOfLines={1}>
          by {item.seller?.kitchenName || 'Home Kitchen'}
        </Text>

        <View style={styles.portionInfo}>
          <Ionicons
            name="flame-outline"
            size={13}
            color={item.availablePortions <= 3 ? colors.error : colors.primary}
          />
          <Text
            style={[
              styles.portionText,
              item.availablePortions <= 3 && { color: colors.error, fontWeight: 'bold' },
            ]}
          >
            {item.availablePortions > 0
              ? `${item.availablePortions} portions left today`
              : 'Sold out for today'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View>
            {item.isRescueDeal && item.rescueDiscountedPrice ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.price}>₹{item.rescueDiscountedPrice}</Text>
                <Text style={styles.strikethrough}>₹{item.price}</Text>
              </View>
            ) : (
              <Text style={styles.price}>₹{item.price}</Text>
            )}
            <Text style={styles.prepTime}>⏱ {item.preparationTimeMinutes || 30} mins</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              item.availablePortions <= 0 && { backgroundColor: '#cbd5e1' },
            ]}
            onPress={() => handleAdd(item)}
            disabled={item.availablePortions <= 0}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search homemade dishes or kitchens..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Veg / Non-Veg filter toggle */}
        <View style={styles.typeFilterRow}>
          <TouchableOpacity
            style={[styles.typePill, foodType === 'all' && styles.typePillActive]}
            onPress={() => setFoodType('all')}
          >
            <Text
              style={[styles.typePillText, foodType === 'all' && styles.typePillTextActive]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typePill, foodType === 'veg' && styles.typePillActive]}
            onPress={() => setFoodType('veg')}
          >
            <Text
              style={[styles.typePillText, foodType === 'veg' && styles.typePillTextActive]}
            >
              🌱 Pure Veg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typePill, foodType === 'non-veg' && styles.typePillActive]}
            onPress={() => setFoodType('non-veg')}
          >
            <Text
              style={[
                styles.typePillText,
                foodType === 'non-veg' && styles.typePillTextActive,
              ]}
            >
              🍗 Non-Veg
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories horizontal list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.catTag,
              !selectedCategory && styles.catTagActive,
            ]}
            onPress={() => setSelectedCategory('')}
          >
            <Text
              style={[
                styles.catTagText,
                !selectedCategory && styles.catTagTextActive,
              ]}
            >
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[
                styles.catTag,
                selectedCategory === (c.slug || c.name) && styles.catTagActive,
              ]}
              onPress={() => setSelectedCategory(c.slug || c.name)}
            >
              <Text
                style={[
                  styles.catTagText,
                  selectedCategory === (c.slug || c.name) && styles.catTagTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textMuted }}>
            Discovering fresh homemade batches...
          </Text>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="fast-food-outline" size={54} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No homemade dishes found</Text>
          <Text style={styles.emptySub}>
            Try clearing filters or search for another dish name.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearch('');
              setFoodType('all');
              setSelectedCategory('');
            }}
          >
            <Text style={styles.resetBtnText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item._id}
          renderItem={renderFoodItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  typeFilterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.creamDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typePillText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  typePillTextActive: { color: '#fff' },
  categoryScroll: { gap: 6, paddingTop: 10, paddingBottom: 4 },
  catTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.creamDark,
  },
  catTagActive: { backgroundColor: colors.primaryDark },
  catTagText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  catTagTextActive: { color: '#fff' },
  listContainer: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  foodImg: { width: 120, height: 130, backgroundColor: colors.creamDark },
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '800' },
  rescueTag: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rescueTagText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  foodName: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 4 },
  kitchenName: { fontSize: 11, color: colors.textMuted },
  portionInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  portionText: { fontSize: 10, color: colors.textMuted },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: { fontSize: 16, fontWeight: '900', color: colors.primary },
  strikethrough: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  prepTime: { fontSize: 10, color: colors.textMuted },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 12 },
  emptySub: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  resetBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default ExploreScreen;
