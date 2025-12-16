import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Vehicle} from '../../types/vehicle';
import {colors, spacing, typography, borderRadius, shadows} from '../../constants/theme';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({vehicle, onPress}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.nickname}>
          {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        </Text>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>

      <Text style={styles.vehicleInfo}>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </Text>

      {vehicle.vin && (
        <Text style={styles.vin}>VIN: {vehicle.vin}</Text>
      )}

      {vehicle.mileage !== undefined && (
        <Text style={styles.mileage}>{vehicle.mileage.toLocaleString()} miles</Text>
      )}

      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Ready to connect</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nickname: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronText: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  vehicleInfo: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  vin: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  mileage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
