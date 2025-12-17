import React, {ReactNode, memo} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors, spacing, borderRadius, shadows} from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = memo(({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <View style={[styles.card, styles[`variant_${variant}`], style]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  variant_default: {
    ...shadows.sm,
  },
  variant_elevated: {
    ...shadows.lg,
  },
  variant_outlined: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowOpacity: 0,
  },
});
