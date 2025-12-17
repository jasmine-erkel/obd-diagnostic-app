import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Skeleton} from '../common/Skeleton';
import {colors, spacing, borderRadius, shadows} from '../../constants/theme';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Skeleton width={56} height={56} borderRadius={28} style={styles.photo} />
          <View style={styles.headerLeft}>
            <Skeleton width="80%" height={20} style={styles.titleSkeleton} />
            <Skeleton width="60%" height={16} style={styles.subtitleSkeleton} />
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Skeleton width={80} height={32} />
          <Skeleton width={80} height={32} />
          <Skeleton width={80} height={32} />
        </View>

        <View style={styles.footer}>
          <Skeleton width={120} height={20} />
        </View>
      </View>
    </View>
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  photo: {
    marginRight: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  titleSkeleton: {
    marginBottom: spacing.xs,
  },
  subtitleSkeleton: {
    marginTop: spacing.xs / 2,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
