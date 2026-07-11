import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../utils/theme';
import { Button, Input } from '../components';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, loginWithPhone } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email format';
      }
    } else {
      if (!phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone = 'Invalid phone number';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (loginMethod === 'email') {
        await login(email, password);
      } else {
        await loginWithPhone(phone, password);
      }
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    Alert.alert(
      'Coming Soon',
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be available soon`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>Z</Text>
            </View>
            <Text style={styles.title}>Welcome to Zeyora</Text>
            <Text style={styles.subtitle}>
              Order food, groceries, and more with ease
            </Text>
          </View>

          {/* Login Method Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'email' && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'phone' && styles.toggleTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {loginMethod === 'email' ? (
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email}
              />
            ) : (
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                error={errors.phone}
              />
            )}

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          {/* Social Login */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('google')}
            >
              <Ionicons name="logo-google" size={24} color={colors.error} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('apple')}
            >
              <Ionicons name="logo-apple" size={24} color={colors.text} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  form: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    gap: spacing.sm,
  },
  socialButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
