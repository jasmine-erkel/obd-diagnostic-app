import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, typography, shadows} from '../constants/theme';
import {VehicleListScreenProps} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {VehicleCard} from '../components/vehicles/VehicleCard';

export const VehicleListScreen: React.FC<VehicleListScreenProps> = ({navigation}) => {
  const {vehicles, loading, refreshVehicles} = useVehicles();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVehicles();
    setRefreshing(false);
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate('VehicleDetail', {vehicleId});
  };

  if (loading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <Text style={styles.headerSubtitle}>{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VehicleCard vehicle={item} onPress={() => handleVehiclePress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button below to add your first vehicle
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 120}
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 100}]}
        onPress={handleAddVehicle}
        activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    padding: spacing.md,
  },
  emptyContainer: {
    marginTop: spacing.xxl * 2,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 40,
    color: colors.textLight,
    fontWeight: '600',
  },
});
