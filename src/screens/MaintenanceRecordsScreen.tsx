import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VehiclesStackParamList} from '../navigation/types';
import {useVehicles} from '../context/VehicleContext';
import {Button} from '../components/common/Button';
import {Card} from '../components/common/Card';
import {
  MaintenanceRecord,
  MaintenanceTypeLabels,
  MaintenanceTypeIcons,
} from '../types/maintenance';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';

type MaintenanceRecordsScreenRouteProp = RouteProp<VehiclesStackParamList, 'MaintenanceRecords'>;
type MaintenanceRecordsScreenNavigationProp = NativeStackNavigationProp<
  VehiclesStackParamList,
  'MaintenanceRecords'
>;

interface MaintenanceRecordsScreenProps {
  route: MaintenanceRecordsScreenRouteProp;
  navigation: MaintenanceRecordsScreenNavigationProp;
}

// Mock data for testing
const MOCK_RECORDS: MaintenanceRecord[] = [
  {
    id: '1',
    vehicleId: 'mock',
    date: '2024-12-01',
    mileage: 45230,
    type: 'oil_change',
    title: 'Oil Change & Filter Replacement',
    description: 'Full synthetic oil change with OEM filter',
    cost: 89.99,
    servicedBy: "Joe's Auto Service",
    parts: ['Full Synthetic 5W-30 Oil (5qt)', 'Oil Filter'],
    notes: 'Next oil change recommended at 48,230 miles',
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: '2',
    vehicleId: 'mock',
    date: '2024-11-15',
    mileage: 44850,
    type: 'tire_rotation',
    title: 'Tire Rotation & Balance',
    description: 'Rotated all four tires and balanced',
    cost: 49.99,
    servicedBy: 'Quick Tire Shop',
    parts: [],
    notes: 'Tire pressure adjusted to 35 PSI',
    createdAt: '2024-11-15T14:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },
  {
    id: '3',
    vehicleId: 'mock',
    date: '2024-10-20',
    mileage: 44200,
    type: 'brake_service',
    title: 'Front Brake Pad Replacement',
    description: 'Replaced front brake pads and resurfaced rotors',
    cost: 345.00,
    servicedBy: "Joe's Auto Service",
    parts: ['Brake Pads (Front)', 'Brake Cleaner'],
    notes: 'Rear brakes still in good condition',
    createdAt: '2024-10-20T09:15:00Z',
    updatedAt: '2024-10-20T09:15:00Z',
  },
  {
    id: '4',
    vehicleId: 'mock',
    date: '2024-09-05',
    mileage: 43100,
    type: 'inspection',
    title: 'Annual State Inspection',
    description: 'Passed annual safety and emissions inspection',
    cost: 25.00,
    servicedBy: 'State Inspection Center',
    parts: [],
    notes: 'Valid until September 2025',
    createdAt: '2024-09-05T11:45:00Z',
    updatedAt: '2024-09-05T11:45:00Z',
  },
  {
    id: '5',
    vehicleId: 'mock',
    date: '2024-08-12',
    mileage: 42500,
    type: 'battery',
    title: 'Battery Replacement',
    description: 'Old battery failed load test, replaced with new',
    cost: 189.99,
    servicedBy: 'AutoZone',
    parts: ['Interstate MT-35 Battery'],
    notes: '36-month warranty',
    createdAt: '2024-08-12T16:20:00Z',
    updatedAt: '2024-08-12T16:20:00Z',
  },
];

export const MaintenanceRecordsScreen: React.FC<MaintenanceRecordsScreenProps> = ({
  route,
  navigation,
}) => {
  const {vehicleId} = route.params;
  const {getVehicle} = useVehicles();
  const vehicle = getVehicle(vehicleId);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // In a real app, this would fetch records from storage
  const records = MOCK_RECORDS;

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vehicle not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const handleAddRecord = () => {
    Alert.alert(
      'Add Maintenance Record',
      'This feature will be implemented soon!',
      [{text: 'OK'}],
    );
  };

  const totalSpent = records.reduce((sum, record) => sum + (record.cost || 0), 0);

  const renderRecord = ({item}: {item: MaintenanceRecord}) => {
    const icon = MaintenanceTypeIcons[item.type];
    const typeLabel = MaintenanceTypeLabels[item.type];

    return (
      <Card variant="elevated" style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordIconContainer}>
            <Text style={styles.recordIcon}>{icon}</Text>
          </View>
          <View style={styles.recordHeaderInfo}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordType}>{typeLabel}</Text>
          </View>
          <View style={styles.recordCost}>
            {item.cost !== undefined && (
              <Text style={styles.recordCostText}>${item.cost.toFixed(2)}</Text>
            )}
          </View>
        </View>

        <View style={styles.recordDetails}>
          <View style={styles.recordDetailRow}>
            <Text style={styles.recordDetailLabel}>Date:</Text>
            <Text style={styles.recordDetailValue}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          {item.mileage !== undefined && (
            <View style={styles.recordDetailRow}>
              <Text style={styles.recordDetailLabel}>Mileage:</Text>
              <Text style={styles.recordDetailValue}>
                {item.mileage.toLocaleString()} mi
              </Text>
            </View>
          )}
          {item.servicedBy && (
            <View style={styles.recordDetailRow}>
              <Text style={styles.recordDetailLabel}>Serviced By:</Text>
              <Text style={styles.recordDetailValue}>{item.servicedBy}</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.recordDescription}>{item.description}</Text>
        )}

        {item.parts && item.parts.length > 0 && (
          <View style={styles.partsSection}>
            <Text style={styles.partsSectionTitle}>Parts Used:</Text>
            {item.parts.map((part, index) => (
              <Text key={index} style={styles.partItem}>
                • {part}
              </Text>
            ))}
          </View>
        )}

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>Notes:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </Card>
    );
  };

  const renderPrintPreview = () => (
    <Modal
      visible={showPrintPreview}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowPrintPreview(false)}>
      <SafeAreaView style={styles.printModal}>
        <View style={styles.printHeader}>
          <Text style={styles.printHeaderTitle}>Print Preview</Text>
          <View style={styles.printHeaderButtons}>
            <Button
              title="Print"
              onPress={() => {
                Alert.alert(
                  'Print',
                  'Print functionality will be implemented soon. This will generate a PDF that can be shared or printed.',
                  [{text: 'OK'}],
                );
              }}
              variant="primary"
              style={styles.printHeaderButton}
            />
            <Button
              title="Close"
              onPress={() => setShowPrintPreview(false)}
              variant="outline"
            />
          </View>
        </View>

        <ScrollView style={styles.printContent} contentContainerStyle={styles.printContentContainer}>
          {/* Print Format */}
          <View style={styles.printDocument}>
            <Text style={styles.printDocumentTitle}>Maintenance Records</Text>

            {/* Vehicle Info */}
            <View style={styles.printSection}>
              <Text style={styles.printSectionTitle}>Vehicle Information</Text>
              <Text style={styles.printText}>
                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') ||
                  'Vehicle'}
              </Text>
              {vehicle.vin && <Text style={styles.printText}>VIN: {vehicle.vin}</Text>}
            </View>

            {/* Summary */}
            <View style={styles.printSection}>
              <Text style={styles.printSectionTitle}>Summary</Text>
              <Text style={styles.printText}>Total Records: {records.length}</Text>
              <Text style={styles.printText}>
                Total Spent: ${totalSpent.toFixed(2)}
              </Text>
              <Text style={styles.printText}>
                Report Generated: {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/* Records */}
            <View style={styles.printSection}>
              <Text style={styles.printSectionTitle}>Maintenance History</Text>
              {records.map((record, index) => (
                <View key={record.id} style={styles.printRecordItem}>
                  <View style={styles.printRecordHeader}>
                    <Text style={styles.printRecordTitle}>
                      {index + 1}. {record.title}
                    </Text>
                    {record.cost !== undefined && (
                      <Text style={styles.printRecordCost}>${record.cost.toFixed(2)}</Text>
                    )}
                  </View>
                  <Text style={styles.printRecordMeta}>
                    {new Date(record.date).toLocaleDateString()}
                    {record.mileage && ` • ${record.mileage.toLocaleString()} mi`}
                    {record.servicedBy && ` • ${record.servicedBy}`}
                  </Text>
                  {record.description && (
                    <Text style={styles.printRecordDescription}>{record.description}</Text>
                  )}
                  {record.parts && record.parts.length > 0 && (
                    <View style={styles.printRecordParts}>
                      <Text style={styles.printRecordPartsTitle}>Parts:</Text>
                      {record.parts.map((part, partIndex) => (
                        <Text key={partIndex} style={styles.printRecordPart}>
                          • {part}
                        </Text>
                      ))}
                    </View>
                  )}
                  {record.notes && (
                    <Text style={styles.printRecordNotes}>Note: {record.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Maintenance Records</Text>
          <Text style={styles.headerSubtitle}>
            {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') ||
              'Vehicle'}
          </Text>
        </View>
      </View>

      {/* Summary Card */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Total Records</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Print Records"
          onPress={handlePrint}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="Add Record"
          onPress={handleAddRecord}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* Records List */}
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No maintenance records yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first record to track vehicle maintenance
            </Text>
          </View>
        }
      />

      {renderPrintPreview()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
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
  summaryCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  recordCard: {
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  recordIcon: {
    fontSize: 24,
  },
  recordHeaderInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  recordType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  recordCost: {
    alignItems: 'flex-end',
  },
  recordCostText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  recordDetails: {
    paddingLeft: 48 + spacing.sm,
    marginBottom: spacing.sm,
  },
  recordDetailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs / 2,
  },
  recordDetailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    width: 100,
  },
  recordDetailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  recordDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  partsSection: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  partsSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  partItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  notesSection: {
    backgroundColor: colors.info + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  notesSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.info,
    marginBottom: spacing.xs / 2,
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Print Preview Styles
  printModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  printHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  printHeaderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  printHeaderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  printHeaderButton: {
    marginRight: spacing.xs,
  },
  printContent: {
    flex: 1,
  },
  printContentContainer: {
    padding: spacing.lg,
  },
  printDocument: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.lg,
  },
  printDocumentTitle: {
    fontSize: typography.fontSize.xxl + 4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  printSection: {
    marginBottom: spacing.lg,
  },
  printSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  printText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  printRecordItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  printRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  printRecordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  printRecordCost: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  printRecordMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  printRecordDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  printRecordParts: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  printRecordPartsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  printRecordPart: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  printRecordNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
