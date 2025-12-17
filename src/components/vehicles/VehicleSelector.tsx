import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {Vehicle} from '../../types/vehicle';
import {colors, spacing, typography, borderRadius, shadows} from '../../constants/theme';

interface VehicleSelectorProps {
  visible: boolean;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelect: (vehicleId: string | null) => void;
  onClose: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  visible,
  vehicles,
  selectedVehicleId,
  onSelect,
  onClose,
}) => {
  const handleSelect = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  const renderVehicleItem = useCallback(({item}: {item: Vehicle}) => {
    const isSelected = item.id === selectedVehicleId;
    const displayName = item.nickname || `${item.make || ''} ${item.model || ''}`.trim() || 'Unknown Vehicle';
    const details = [item.year, item.make, item.model].filter(Boolean).join(' ') || 'No details';

    return (
      <TouchableOpacity
        style={[styles.vehicleItem, isSelected && styles.vehicleItemSelected]}
        onPress={() => handleSelect(item.id)}
        activeOpacity={0.7}>
        <View style={styles.vehiclePhoto}>
          {item.photo ? (
            <Text style={styles.photoPlaceholder}>📷</Text>
          ) : (
            <Text style={styles.photoPlaceholder}>🚗</Text>
          )}
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.vehicleDetails} numberOfLines={1}>
            {details}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedVehicleId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Vehicle</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.vehicleItem,
                styles.noVehicleItem,
                selectedVehicleId === null && styles.vehicleItemSelected,
              ]}
              onPress={() => handleSelect(null)}
              activeOpacity={0.7}>
              <View style={styles.vehiclePhoto}>
                <Text style={styles.photoPlaceholder}>💬</Text>
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>No Vehicle</Text>
                <Text style={styles.vehicleDetails}>General automotive questions</Text>
              </View>
              {selectedVehicleId === null && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.md,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  noVehicleItem: {
    marginBottom: spacing.md,
  },
  vehiclePhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  photoPlaceholder: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  vehicleDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkmarkText: {
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
