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
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const MealSubscriptionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const fetchSubscriptions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/subscriptions/my-subscriptions');
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || []);
      }
    } catch (err) {
      console.log('Sub fetch err:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const plans = [
    {
      id: 'plan_breakfast_weekly',
      name: 'South Indian Breakfast Box',
      mealType: 'breakfast',
      duration: '7 Days (Weekly)',
      price: 840,
      perMeal: 120,
      description: 'Hot Idli, Vada, Chutney, Akki Rotti & filter coffee every morning at 7:30 AM.',
      tag: 'POPULAR',
    },
    {
      id: 'plan_lunch_monthly',
      name: 'North Karnataka Executive Thali',
      mealType: 'lunch',
      duration: '30 Days (Monthly)',
      price: 3600,
      perMeal: 120,
      description: '2 Jolada Rotti, Ennegai curry, Jhunka, Rice, Dal & Shenga Chutney delivered at 1:00 PM.',
      tag: 'BEST VALUE',
    },
    {
      id: 'plan_dinner_weekly',
      name: 'Light Homestyle Dinner',
      mealType: 'dinner',
      duration: '7 Days (Weekly)',
      price: 980,
      perMeal: 140,
      description: 'Phulkas, Dal Tadka, seasonal subzi, curd & soothing khichdi rotation at 8:00 PM.',
      tag: 'HEALTHY',
    },
  ];

  const handleSubscribe = async (plan) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to daily meals', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${plan.name} for ₹${plan.price}? Daily homemade delivery will begin tomorrow morning.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe Now',
          onPress: async () => {
            setSubscribing(true);
            try {
              const res = await api.post('/subscriptions', {
                planName: plan.name,
                mealType: plan.mealType,
                durationDays: plan.mealType === 'lunch' ? 30 : 7,
                amount: plan.price,
                deliveryAddress: {
                  street: 'Flat 402, Green Glen Layout',
                  city: 'Bengaluru',
                  pincode: '560103',
                },
                timeSlot:
                  plan.mealType === 'breakfast'
                    ? '07:30 AM - 08:30 AM'
                    : plan.mealType === 'lunch'
                    ? '12:30 PM - 01:30 PM'
                    : '07:30 PM - 08:30 PM',
              });
              if (res.data.success) {
                Alert.alert('Subscribed!', 'Your daily meal subscription is now active.');
                fetchSubscriptions();
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Subscription failed');
            } finally {
              setSubscribing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Meal Subscriptions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Say Goodbye to Daily Ordering</Text>
          <Text style={styles.heroSubtitle}>
            Subscribe once and enjoy warm, mother's-touch breakfast, lunch or dinner cooked daily by
            local home chefs.
          </Text>
        </View>

        {/* User's Active Subscriptions */}
        {subscriptions.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionHeading}>My Active Plans</Text>
            {subscriptions.map((sub) => (
              <View key={sub._id} style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <Text style={styles.activePlanName}>{sub.planName}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{sub.status?.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.activeSub}>
                  Meals remaining: {sub.remainingDays || 7} days • Delivery slot: {sub.timeSlot}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Curated Plans List */}
        <Text style={styles.sectionHeading}>Curated Daily Plans</Text>

        {plans.map((p) => (
          <View key={p.id} style={styles.planCard}>
            <View style={styles.planTag}>
              <Text style={styles.planTagText}>{p.tag}</Text>
            </View>

            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planDesc}>{p.description}</Text>

            <View style={styles.planDivider} />

            <View style={styles.planFooter}>
              <View>
                <Text style={styles.planPrice}>₹{p.price}</Text>
                <Text style={styles.planDuration}>
                  {p.duration} • ₹{p.perMeal}/meal
                </Text>
              </View>

              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => handleSubscribe(p)}
                disabled={subscribing}
              >
                <Text style={styles.subscribeBtnText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  heroBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  heroSubtitle: { fontSize: 12, color: '#bbf7d0', marginTop: 4, lineHeight: 18 },
  activeSection: { marginBottom: 20 },
  sectionHeading: { fontSize: 15, fontWeight: '900', color: colors.text, marginBottom: 12 },
  activeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activePlanName: { fontSize: 13, fontWeight: '800', color: colors.text },
  activeBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: { fontSize: 9, fontWeight: 'bold', color: colors.primary },
  activeSub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  planTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  planTagText: { fontSize: 9, fontWeight: '900', color: colors.accentDark },
  planName: { fontSize: 16, fontWeight: '900', color: colors.text },
  planDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  planDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  planFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planPrice: { fontSize: 18, fontWeight: '900', color: colors.primary },
  planDuration: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  subscribeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subscribeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default MealSubscriptionsScreen;
