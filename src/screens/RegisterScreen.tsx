import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button} from '../components/common/Button';
import {Input} from '../components/common/Input';
import {useAuth} from '../context/AuthContext';
import {colors, spacing, typography} from '../constants/theme';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {register} = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log('Starting registration with email:', email.trim());
    try {
      const result = await register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim()
      );
      console.log('Registration result:', JSON.stringify(result, null, 2));

      if (result.success) {
        // Check if user has a session (email confirmation disabled) or not (email confirmation enabled)
        if (result.session) {
          // Email confirmation is disabled - user is logged in immediately
          Alert.alert(
            'Success',
            'Your account has been created successfully!',
            [{text: 'OK'}]
          );
        } else {
          // Email confirmation is enabled - user needs to verify email
          Alert.alert(
            'Verify Your Email',
            'We sent a verification link to ' + email.trim() + '. Please check your email and click the link to activate your account.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to login screen
                  navigation.navigate('Login');
                },
              },
            ]
          );
        }
      } else {
        // Show detailed error message for debugging
        console.log('Registration error:', result.error);
        const errorDetails = result.error || 'Unknown error';
        Alert.alert(
          'Registration Failed',
          `Error: ${errorDetails}\n\nEmail: ${email.trim()}\nPlease take a screenshot of this message.`,
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join OBD Diagnostic today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) {
                setErrors({...errors, firstName: undefined});
              }
            }}
            error={errors.firstName}
            autoCapitalize="words"
            autoComplete="given-name"
            autoCorrect={false}
            required
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) {
                setErrors({...errors, lastName: undefined});
              }
            }}
            error={errors.lastName}
            autoCapitalize="words"
            autoComplete="family-name"
            autoCorrect={false}
            required
          />

          <Input
            label="Email"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({...errors, email: undefined});
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            required
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({...errors, password: undefined});
              }
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({...errors, confirmPassword: undefined});
              }
            }}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            required
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
