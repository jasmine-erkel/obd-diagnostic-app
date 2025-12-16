import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VehiclesStackParamList} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {Button} from '../components/common/Button';
import {Card} from '../components/common/Card';
import {colors, spacing, typography} from '../constants/theme';

type VehicleDetailScreenRouteProp = RouteProp<VehiclesStackParamList, 'VehicleDetail'>;
type VehicleDetailScreenNavigationProp = NativeStackNavigationProp<VehiclesStackParamList, 'VehicleDetail'>;

interface VehicleDetailScreenProps {
  route: VehicleDetailScreenRouteProp;
  navigation: VehicleDetailScreenNavigationProp;
}

export const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({route, navigation}) => {
  const {vehicleId} = route.params;
  const {getVehicle, deleteVehicle} = useVehicles();
  const vehicle = getVehicle(vehicleId);

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vehicle not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.nickname || vehicle.make + ' ' + vehicle.model}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteVehicle(vehicle.id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete vehicle');
            }
          },
        },
      ],
    );
  };

  const handleConnectOBD = () => {
    Alert.alert('Connect OBD-II', 'OBD-II connection feature coming soon!');
  };

  const handleViewHistory = () => {
    Alert.alert('Diagnostic History', 'Diagnostic history feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Info Card */}
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          {vehicle.nickname && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nickname:</Text>
              <Text style={styles.infoValue}>{vehicle.nickname}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Make:</Text>
            <Text style={styles.infoValue}>{vehicle.make}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model:</Text>
            <Text style={styles.infoValue}>{vehicle.model}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>{vehicle.year}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VIN:</Text>
            <Text style={styles.infoValue}>{vehicle.vin}</Text>
          </View>

          {vehicle.color && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Color:</Text>
              <Text style={styles.infoValue}>{vehicle.color}</Text>
            </View>
          )}

          {vehicle.mileage !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mileage:</Text>
              <Text style={styles.infoValue}>{vehicle.mileage.toLocaleString()} miles</Text>
            </View>
          )}
        </Card>

        {/* Actions Card */}
        <Card variant="elevated" style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <Button
            title="Connect to OBD-II Device"
            onPress={handleConnectOBD}
            variant="primary"
            style={styles.actionButton}
          />

          <Button
            title="View Diagnostic History"
            onPress={handleViewHistory}
            variant="secondary"
            style={styles.actionButton}
          />

          <Button
            title="Delete Vehicle"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
          />
        </Card>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Added: {new Date(vehicle.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.metadataText}>
            Last Updated: {new Date(vehicle.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  actionsCard: {
    marginTop: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  metadata: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  metadataText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
});
