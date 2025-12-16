import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Vehicle} from '../../types/vehicle';
import {colors, spacing, typography, borderRadius, shadows} from '../../constants/theme';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({vehicle, onPress}) => {
  const displayName = vehicle.nickname || `${vehicle.make} ${vehicle.model}`;
  const hasFullInfo = vehicle.make !== 'Unknown' && vehicle.vin !== 'N/A';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.accentBar} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.titleContainer}>
              <Text style={styles.nickname} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.vehicleInfo}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
            </View>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          {vehicle.vin && vehicle.vin !== 'N/A' && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VIN</Text>
              <Text style={styles.detailValue}>{vehicle.vin.substring(0, 8)}...</Text>
            </View>
          )}

          {vehicle.color && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{vehicle.color}</Text>
            </View>
          )}

          {vehicle.mileage !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Mileage</Text>
              <Text style={styles.detailValue}>{vehicle.mileage.toLocaleString()} mi</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={[styles.statusBadge, !hasFullInfo && styles.statusBadgeWarning]}>
            <View style={[styles.statusDot, !hasFullInfo && styles.statusDotWarning]} />
            <Text style={styles.statusText}>
              {hasFullInfo ? 'Ready to connect' : 'Incomplete info'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  cardContent: {
    padding: spacing.md,
    paddingLeft: spacing.md + 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  nickname: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  vehicleInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  chevronText: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: '300',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  detailItem: {
    minWidth: 80,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  statusBadgeWarning: {
    backgroundColor: colors.warning + '15',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  statusDotWarning: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
});
