import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, Image, Modal} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VehiclesStackParamList} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {Button} from '../components/common/Button';
import {Card} from '../components/common/Card';
import {ImagePicker} from '../components/common/ImagePicker';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';

type VehicleDetailScreenRouteProp = RouteProp<VehiclesStackParamList, 'VehicleDetail'>;
type VehicleDetailScreenNavigationProp = NativeStackNavigationProp<VehiclesStackParamList, 'VehicleDetail'>;

interface VehicleDetailScreenProps {
  route: VehicleDetailScreenRouteProp;
  navigation: VehicleDetailScreenNavigationProp;
}

export const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({route, navigation}) => {
  const {vehicleId} = route.params;
  const {getVehicle, deleteVehicle, updateVehicle} = useVehicles();
  const vehicle = getVehicle(vehicleId);
  const [showImagePicker, setShowImagePicker] = useState(false);

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

  const handleUpdatePhoto = async (uri: string) => {
    const success = await updateVehicle(vehicle.id, {photo: uri});
    if (success) {
      setShowImagePicker(false);
    } else {
      Alert.alert('Error', 'Failed to update photo');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Photo */}
        <View style={styles.photoSection}>
          {vehicle.photo ? (
            <Image
              source={{uri: vehicle.photo}}
              style={styles.vehiclePhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>🚗</Text>
              <Text style={styles.photoPlaceholderLabel}>No photo</Text>
            </View>
          )}
        </View>

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
            title="Update Photo"
            onPress={() => setShowImagePicker(true)}
            variant="secondary"
            style={styles.actionButton}
          />

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
            title="Maintenance Records"
            onPress={() => navigation.navigate('MaintenanceRecords', {vehicleId: vehicle.id})}
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

      <Modal
        visible={showImagePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImagePicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Vehicle Photo</Text>
            <Button
              title="Cancel"
              onPress={() => setShowImagePicker(false)}
              variant="outline"
            />
          </View>
          <View style={styles.modalContent}>
            <ImagePicker
              onImageSelected={handleUpdatePhoto}
              currentImage={vehicle.photo}
            />
          </View>
        </View>
      </Modal>
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
  photoSection: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  vehiclePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 80,
    marginBottom: spacing.sm,
  },
  photoPlaceholderLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
});
