import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button} from '../components/common/Button';
import {colors, spacing, typography, borderRadius} from '../constants/theme';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.title}>OBD Diagnostic</Text>
          <Text style={styles.subtitle}>
            Your complete vehicle diagnostic companion
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>
              Scan and diagnose engine codes
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureText}>
              Sync your data across all devices
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>
              AI-powered diagnostic assistance
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          size="large"
          style={styles.button}
        />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl + spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl + 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  features: {
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
