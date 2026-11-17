import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Missing Fields', 'Please fill in all details');
      return;
    }
    const res = await register({ name, email, phone, password, role });
    if (res.success) {
      Alert.alert('Registration Successful', `Welcome to SmartBite as a ${role}!`);
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Registration Failed', res.message || 'Error occurred');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={38} color={colors.accent} />
          <Text style={styles.title}>Join SmartBite</Text>
          <Text style={styles.subtitle}>Discover homemade flavours or sell your cooking</Text>
        </View>

        {/* Role Picker */}
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'seller' && styles.roleBtnActive]}
            onPress={() => setRole('seller')}
          >
            <Text style={[styles.roleBtnText, role === 'seller' && styles.roleBtnTextActive]}>
              Home Chef
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Kumar"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ramesh@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.cream },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 4,
    borderRadius: 14,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 5 },
  input: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginText: { fontSize: 12, color: colors.textMuted },
});

export default RegisterScreen;
