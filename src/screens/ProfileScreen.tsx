import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';
import {ProfileScreenProps} from '../navigation/types';
import {useUser} from '../context/UserContext';
import {useVehicles} from '../context/VehicleContext';

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const {profile, stats, loading, signOut, updateStats, initializeProfile} = useUser();
  const {vehicles} = useVehicles();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Initialize default profile if none exists
  useEffect(() => {
    if (!loading && !profile) {
      initializeProfile({
        id: Date.now().toString(),
        firstName: 'Jasmine',
        lastName: 'Erkel',
        email: 'jasmine@erkel.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [loading, profile]);

  // Update vehicle count when vehicles change
  useEffect(() => {
    if (vehicles && stats.vehicleCount !== vehicles.length) {
      updateStats({vehicleCount: vehicles.length});
    }
  }, [vehicles]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            const success = await signOut();
            setIsSigningOut(false);
            if (success) {
              Alert.alert('Success', 'You have been signed out successfully.');
            } else {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleSettingPress = (label: string) => {
    Alert.alert(label, `${label} feature coming soon!`);
  };

  const settingsItems = [
    {label: 'Account Settings', icon: '⚙️', onPress: () => handleSettingPress('Account Settings')},
    {label: 'Notifications', icon: '🔔', onPress: () => handleSettingPress('Notifications')},
    {label: 'Help & Support', icon: '❓', onPress: () => handleSettingPress('Help & Support')},
    {label: 'About', icon: 'ℹ️', onPress: () => handleSettingPress('About')},
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!profile) return 'User';
    return `${profile.firstName} ${profile.lastName}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.profileName}>{getFullName()}</Text>
        <Text style={styles.profileEmail}>{profile?.email || 'user@email.com'}</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.vehicleCount}</Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.scanCount}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.issuesResolvedCount}</Text>
          <Text style={styles.statLabel}>Issues Resolved</Text>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={item.onPress}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        activeOpacity={0.8}
        onPress={handleSignOut}
        disabled={isSigningOut}>
        <Text style={styles.signOutText}>
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.sm,
  },
  settingsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  chevron: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  signOutButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  signOutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
