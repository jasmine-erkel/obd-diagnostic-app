import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator} from 'react-native';
import {colors, spacing, typography, shadows} from '../constants/theme';
import {VehicleListScreenProps} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {VehicleCard} from '../components/vehicles/VehicleCard';

export const VehicleListScreen: React.FC<VehicleListScreenProps> = ({navigation}) => {
  const {vehicles, loading, refreshVehicles} = useVehicles();
  const [refreshing, setRefreshing] = React.useState(false);

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VehicleCard vehicle={item} onPress={() => handleVehiclePress(item.id)} />
        )}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>My Vehicles</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button below to add your first vehicle
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddVehicle} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
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
  listContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    alignItems: 'center',
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
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 100,
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
    color: colors.surface,
    fontWeight: '600',
  },
});
