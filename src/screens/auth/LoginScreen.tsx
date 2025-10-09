import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  TextInput,
  Card,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse } from 'react-native-svg';

import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

/**
 * Rich Background with Gradient Overlay
 */
const BackgroundPattern = () => (
  <View style={styles.backgroundPatternContainer}>
    <Svg height={height} width={width} style={styles.backgroundSvg}>
      <Defs>
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.15" />
          <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.12" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      {/* Decorative floating orbs */}
      <G opacity="0.06">
        <Ellipse cx={width * 0.2} cy={height * 0.15} rx="120" ry="120" fill="#3B82F6" />
        <Ellipse cx={width * 0.85} cy={height * 0.25} rx="150" ry="150" fill="#6366F1" />
        <Ellipse cx={width * 0.5} cy={height * 0.85} rx="100" ry="100" fill="#1E40AF" />
      </G>
      
      {/* Subtle grid pattern */}
      <G opacity="0.03">
        {[...Array(15)].map((_, i) => (
          <React.Fragment key={i}>
            <Path
              d={`M0,${i * 80} L${width},${i * 80}`}
              stroke="#3B82F6"
              strokeWidth="0.5"
            />
            <Path
              d={`M${i * 80},0 L${i * 80},${height}`}
              stroke="#3B82F6"
              strokeWidth="0.5"
            />
          </React.Fragment>
        ))}
      </G>
    </Svg>
  </View>
);

/**
 * Login Screen Component
 * Provides authentication interface for real backend integration
 */
export function LoginScreen(): React.JSX.Element {
  const { login, state, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  // Clear error when user starts typing
  React.useEffect(() => {
    if (state.error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  return (
    <View style={styles.container}>
      {/* Rich Gradient Background */}
      <ExpoLinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#E0E7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Background Pattern Overlay */}
      <View style={styles.backgroundContainer}>
        <BackgroundPattern />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section with Enhanced Styling */}
            <View style={styles.header}>
              <View style={styles.brandContainer}>
                <Text variant="displayLarge" style={styles.brandText}>
                  MOTORSYNC
                </Text>
                <View style={styles.crmBadge}>
                  <Text style={styles.crmText}>CRM</Text>
                </View>
              </View>
              
              <Text variant="bodyLarge" style={styles.subtitle}>
                Welcome back to your dashboard
              </Text>
            </View>

            {/* Premium Login Form Card with Glass Effect */}
            <View style={styles.cardWrapper}>
              <Card style={styles.loginCard} elevation={0}>
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleLarge" style={styles.formTitle}>
                    Sign in to your account
                  </Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      mode="outlined"
                      label="Email address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      style={styles.input}
                      error={!!state.error}
                      outlineColor="#D1D5DB"
                      activeOutlineColor="#3B82F6"
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF',
                        },
                      }}
                    />

                    <TextInput
                      mode="outlined"
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                          color="#6B7280"
                        />
                      }
                      style={styles.input}
                      error={!!state.error}
                      outlineColor="#D1D5DB"
                      activeOutlineColor="#3B82F6"
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF',
                        },
                      }}
                    />
                  </View>

                  {state.error && (
                    <View style={styles.errorContainer}>
                      <Svg height="20" width="20" viewBox="0 0 24 24" style={styles.errorIcon}>
                        <Path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                          fill="#DC2626"
                        />
                      </Svg>
                      <Text variant="bodySmall" style={styles.errorText}>
                        {state.error}
                      </Text>
                    </View>
                  )}

                  <View style={styles.buttonWrapper}>
                    <Pressable
                      onPress={handleLogin}
                      disabled={state.isLoading}
                      style={({ pressed }) => [
                        styles.pressableButton,
                        pressed && styles.pressableButtonPressed,
                      ]}
                    >
                      <ExpoLinearGradient
                        colors={['#3B82F6', '#2563EB', '#1E40AF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                      >
                        <View style={styles.loginButtonContent}>
                          {state.isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.loginButtonLabel}>
                              SIGN IN
                            </Text>
                          )}
                        </View>
                      </ExpoLinearGradient>
                    </Pressable>
                  </View>

                  <View style={styles.securityBadge}>
                    <Svg height="18" width="18" viewBox="0 0 24 24" style={styles.lockIcon}>
                      <Path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill="#3B82F6"
                      />
                    </Svg>
                    <Text style={styles.securityText}>
                      Contact your admin for credentials
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Footer - Empty for cleaner design */}
            <View style={styles.footer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPatternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 1.5,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandText: {
    color: '#0F172A',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 42,
    letterSpacing: 4,
    textShadowColor: 'rgba(59, 130, 246, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: spacing.sm,
  },
  crmBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  crmText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    fontSize: 16,
  },
  cardWrapper: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    // Glass morphism effect
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  cardContent: {
    padding: spacing.xxl * 1.5,
    paddingBottom: spacing.xxl * 1.2,
  },
  formTitle: {
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: spacing.xl * 1.5,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: '#FAFBFC',
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  pressableButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  pressableButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradientButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonContent: {
    paddingVertical: spacing.md + 4,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#EFF6FF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  lockIcon: {
    marginRight: spacing.sm,
  },
  securityText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
  },
  footerText: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    fontSize: 14,
  },
});