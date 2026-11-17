import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Login Failed', res.message || 'Invalid credentials');
    }
  };

  const fillDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('smartbite123');
    const res = await login(demoEmail, 'smartbite123');
    if (res.success) {
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Error', res.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="restaurant" size={40} color={colors.accent} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to order authentic homemade food</Text>
      </View>

      {/* Demo shortcuts */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>QUICK DEMO SIGN IN</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => fillDemo('customer@smartbite.com')}
          >
            <Text style={styles.demoBtnText}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => fillDemo('seller@smartbite.com')}
          >
            <Text style={styles.demoBtnText}>Home Chef</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  demoBox: { backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  demoTitle: { fontSize: 10, fontWeight: '800', color: colors.textMuted, textAlign: 'center', marginBottom: 8 },
  demoRow: { flexDirection: 'row', gap: 8 },
  demoBtn: { flex: 1, backgroundColor: colors.creamDark, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  demoBtnText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.cream, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerText: { fontSize: 12, color: colors.textMuted },
});

export default LoginScreen;
