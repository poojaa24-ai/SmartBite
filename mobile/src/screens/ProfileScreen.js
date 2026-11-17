import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from SmartBite?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.guestIconWrap}>
          <Ionicons name="person-circle-outline" size={72} color={colors.primary} />
        </View>
        <Text style={styles.guestTitle}>Welcome to SmartBite</Text>
        <Text style={styles.guestSub}>
          Sign in to track orders, manage daily meal plans, and save favorite kitchens.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Home Chef Cross-Promo Banner if customer */}
        {user.role === 'customer' && (
          <TouchableOpacity
            style={styles.sellerBanner}
            onPress={() =>
              Alert.alert(
                'Become a Home Chef',
                'Share your culinary passion and earn from home. You can switch or register your kitchen on the SmartBite web portal or mobile!'
              )
            }
          >
            <Ionicons name="restaurant" size={24} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerBannerTitle}>Cook & Earn with SmartBite</Text>
              <Text style={styles.sellerBannerSub}>Register your home kitchen in 3 simple steps</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Menu Navigation Group */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="receipt-outline" size={18} color="#0284c7" />
            </View>
            <Text style={styles.menuLabel}>My Orders</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MealSubscriptions')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="calendar-outline" size={18} color="#d97706" />
            </View>
            <Text style={styles.menuLabel}>Daily Meal Subscriptions</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('FoodRescue')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ffedd5' }]}>
              <Ionicons name="leaf-outline" size={18} color={colors.accent} />
            </View>
            <Text style={styles.menuLabel}>Food Rescue Deals</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Saved Addresses',
                '1. Flat 402, Green Glen Layout, Bellandur, Bengaluru (Default)\n2. 5th Cross, Indiranagar, Bengaluru'
              )
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="location-outline" size={18} color="#16a34a" />
            </View>
            <Text style={styles.menuLabel}>Saved Delivery Addresses</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Support & Policies */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Customer Support',
                'SmartBite Care Hotline: 1800-419-BITE\nEmail: support@smartbite.com\nAvailable 7:00 AM - 11:00 PM daily.'
              )
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="headset-outline" size={18} color="#9333ea" />
            </View>
            <Text style={styles.menuLabel}>Help & Customer Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'About SmartBite',
                'SmartBite v1.0.0 – Smart Food Ordering and Homemade Food Marketplace.\nDeveloped with MERN Stack + React Native Expo.'
              )
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f1f5f9' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#475569" />
            </View>
            <Text style={styles.menuLabel}>About SmartBite</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 16, fontWeight: '900', color: colors.text },
  userEmail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: { fontSize: 9, fontWeight: '800', color: colors.primary },
  sellerBanner: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sellerBannerTitle: { fontSize: 13, fontWeight: '900', color: '#fff' },
  sellerBannerSub: { fontSize: 10, color: '#ffedd5', marginTop: 2 },
  menuGroup: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 6,
  },
  logoutText: { color: colors.error, fontWeight: 'bold', fontSize: 13 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  guestIconWrap: { marginBottom: 16 },
  guestTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  guestSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: colors.creamDark,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontWeight: 'bold', fontSize: 14 },
});

export default ProfileScreen;
