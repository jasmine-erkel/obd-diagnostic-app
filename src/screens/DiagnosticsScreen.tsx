import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator, Switch} from 'react-native';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';
import {DiagnosticsScreenProps} from '../navigation/types';
import {getErrorCodeDetails, MOCK_LIVE_DATA} from '../constants/obdCodes';
import {useAI} from '../context/AIContext';
import {useNavigation} from '@react-navigation/native';
import {ErrorCode} from '../types/vehicle';
import {bluetoothService, OBDDevice, OBDData} from '../services/bluetoothService';
import {mockOBDService} from '../services/mockOBDService';

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = () => {
  const {sendMessage} = useAI();
  const navigation = useNavigation();

  // Mode selection
  const [useMockMode, setUseMockMode] = useState(true); // Start with mock mode for easy testing

  // Bluetooth state
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<OBDDevice[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [liveData, setLiveData] = useState<OBDData>({});

  // Error codes (will be from OBD device when connected, otherwise mock)
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([
    getErrorCodeDetails('P0420')!,
    getErrorCodeDetails('P0171')!,
    getErrorCodeDetails('P0301')!,
  ]);

  // Poll live data when connected
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isConnected) {
      interval = setInterval(async () => {
        try {
          const data = useMockMode
            ? await mockOBDService.readLiveData()
            : await bluetoothService.readLiveData();
          setLiveData(data);
        } catch (error) {
          console.error('Error reading live data:', error);
        }
      }, 2000); // Update every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, useMockMode]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const handleErrorCodePress = async (errorCode: ErrorCode) => {
    Alert.alert(
      errorCode.code,
      `${errorCode.description}\n\nWould you like to ask AI about this error code?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Ask AI',
          onPress: async () => {
            // Navigate to AI Assistant tab and send message
            navigation.navigate('AIAssistantTab' as any);
            // Small delay to allow navigation to complete
            setTimeout(async () => {
              await sendMessage(`What does error code ${errorCode.code} mean and how can I fix it?`, errorCode.code);
            }, 500);
          },
        },
      ],
    );
  };

  const handleConnectOBD = async () => {
    if (isConnected) {
      // Disconnect
      Alert.alert(
        'Disconnect Device',
        `Are you sure you want to disconnect from the ${useMockMode ? 'mock' : 'OBD-II'} device?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              if (!useMockMode) {
                await bluetoothService.disconnect();
              }
              setIsConnected(false);
              setLiveData({});
              Alert.alert('Disconnected', `${useMockMode ? 'Mock' : 'OBD-II'} device disconnected successfully`);
            },
          },
        ],
      );
    } else {
      // Connect
      if (useMockMode) {
        // Mock mode - instant connection
        setIsConnected(true);
        mockOBDService.startEngine();
        Alert.alert('Connected', 'Mock OBD-II device connected. Switch "Simulate Driving" to see dynamic data!');

        // Read mock error codes
        try {
          const codes = await mockOBDService.readErrorCodes();
          if (codes.length > 0) {
            const errorCodeObjects = codes
              .map(code => getErrorCodeDetails(code))
              .filter((code): code is ErrorCode => code !== null);
            setErrorCodes(errorCodeObjects);
          } else {
            setErrorCodes([]);
          }
        } catch (error) {
          console.error('Error reading mock codes:', error);
        }
      } else {
        // Real Bluetooth mode - scan for devices
        setShowDeviceModal(true);
        setDiscoveredDevices([]);
        setIsScanning(true);

        try {
          await bluetoothService.scanForDevices(
            (device) => {
              setDiscoveredDevices(prev => {
                // Avoid duplicates
                if (!prev.find(d => d.id === device.id)) {
                  return [...prev, device];
                }
                return prev;
              });
            },
            10000, // Scan for 10 seconds
          );
        } catch (error) {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to scan for devices');
        } finally {
          setIsScanning(false);
        }
      }
    }
  };

  const handleDeviceSelect = async (device: OBDDevice) => {
    setShowDeviceModal(false);
    bluetoothService.stopScan();
    setIsScanning(false);

    Alert.alert('Connecting', `Connecting to ${device.name}...`);

    try {
      const connected = await bluetoothService.connectToDevice(device.id);

      if (connected) {
        setIsConnected(true);
        Alert.alert('Connected', `Successfully connected to ${device.name}`);

        // Read error codes from device
        try {
          const codes = await bluetoothService.readErrorCodes();
          if (codes.length > 0) {
            const errorCodeObjects = codes
              .map(code => getErrorCodeDetails(code))
              .filter((code): code is ErrorCode => code !== null);
            setErrorCodes(errorCodeObjects);
          } else {
            setErrorCodes([]);
          }
        } catch (error) {
          console.error('Error reading codes:', error);
        }
      } else {
        Alert.alert('Connection Failed', 'Could not connect to the device. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const handleClearCodes = () => {
    Alert.alert(
      'Clear Error Codes',
      'This will clear all stored error codes. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (isConnected) {
              try {
                const success = useMockMode
                  ? await mockOBDService.clearErrorCodes()
                  : await bluetoothService.clearErrorCodes();
                if (success) {
                  setErrorCodes([]);
                  Alert.alert('Success', 'Error codes cleared successfully');
                } else {
                  Alert.alert('Error', 'Failed to clear error codes');
                }
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to clear codes');
              }
            } else {
              // Not connected
              setErrorCodes([]);
              Alert.alert('Success', 'Error codes cleared');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mode Selection */}
      <View style={styles.modeCard}>
        <Text style={styles.modeTitle}>Testing Mode</Text>

        {/* Mock Mode Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Use Mock OBD Device</Text>
            <Text style={styles.toggleSubtext}>
              {useMockMode ? 'Testing with simulated data' : 'Connect to real Bluetooth device'}
            </Text>
          </View>
          <Switch
            value={useMockMode}
            onValueChange={(value) => {
              if (isConnected) {
                Alert.alert('Disconnect First', 'Please disconnect from the current device before changing modes.');
              } else {
                setUseMockMode(value);
              }
            }}
            trackColor={{false: colors.textSecondary, true: colors.primary}}
            thumbColor={colors.surface}
          />
        </View>

        {/* Driving Simulation Toggle (only visible in mock mode when connected) */}
        {useMockMode && isConnected && (
          <View style={[styles.toggleRow, {marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm}]}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Simulate Driving</Text>
              <Text style={styles.toggleSubtext}>
                {mockOBDService.getEngineState().isDriving ? 'Vehicle in motion (dynamic data)' : 'Vehicle at idle'}
              </Text>
            </View>
            <Switch
              value={mockOBDService.getEngineState().isDriving}
              onValueChange={(value) => {
                if (value) {
                  mockOBDService.startDriving();
                } else {
                  mockOBDService.stopDriving();
                }
              }}
              trackColor={{false: colors.textSecondary, true: colors.success}}
              thumbColor={colors.surface}
            />
          </View>
        )}
      </View>

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>OBD-II Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, {backgroundColor: isConnected ? colors.success : colors.textSecondary}]} />
          <Text style={styles.statusText}>
            {isConnected ? `Connected ${useMockMode ? '(Mock)' : '(Real)'}` : 'Not Connected'}
          </Text>
        </View>
        <TouchableOpacity style={styles.connectButton} onPress={handleConnectOBD}>
          <Text style={styles.connectButtonText}>{isConnected ? 'Disconnect' : 'Connect Device'}</Text>
        </TouchableOpacity>
      </View>

      {/* Error Codes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Error Codes ({errorCodes.length})</Text>
          {errorCodes.length > 0 && (
            <TouchableOpacity onPress={handleClearCodes}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {errorCodes.length > 0 ? (
          errorCodes.map((error, index) => (
            <TouchableOpacity
              key={index}
              style={styles.errorCard}
              onPress={() => handleErrorCodePress(error)}
              activeOpacity={0.7}>
              <View style={styles.errorHeader}>
                <Text style={[styles.errorCode, {color: getSeverityColor(error.severity)}]}>
                  {error.code}
                </Text>
                <View style={[styles.severityBadge, {backgroundColor: getSeverityColor(error.severity) + '20'}]}>
                  <Text style={[styles.severityText, {color: getSeverityColor(error.severity)}]}>
                    {error.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.errorDescription}>{error.description}</Text>
              <Text style={styles.tapHint}>Tap for AI assistance →</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No error codes detected</Text>
            <Text style={styles.emptyStateSubtext}>Connect your OBD-II device to scan for issues</Text>
          </View>
        )}
      </View>

      {/* Live Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Data</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>RPM</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.rpm ? Math.round(liveData.rpm) : MOCK_LIVE_DATA.rpm.value}</Text>
              <Text style={styles.dataUnit}>rpm</Text>
            </View>
          </View>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Speed</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.speed ? Math.round(liveData.speed) : MOCK_LIVE_DATA.speed.value}</Text>
              <Text style={styles.dataUnit}>km/h</Text>
            </View>
          </View>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Coolant Temp</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.coolantTemp ? Math.round(liveData.coolantTemp) : MOCK_LIVE_DATA.coolantTemp.value}</Text>
              <Text style={styles.dataUnit}>°C</Text>
            </View>
          </View>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Throttle Pos</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.throttlePos ? Math.round(liveData.throttlePos) : MOCK_LIVE_DATA.throttlePos.value}</Text>
              <Text style={styles.dataUnit}>%</Text>
            </View>
          </View>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Fuel Level</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.fuelLevel ? Math.round(liveData.fuelLevel) : MOCK_LIVE_DATA.fuelLevel.value}</Text>
              <Text style={styles.dataUnit}>%</Text>
            </View>
          </View>
          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Intake Temp</Text>
              <Text style={styles.dataValue}>{isConnected && liveData.intakeTemp ? Math.round(liveData.intakeTemp) : MOCK_LIVE_DATA.intakeTemp.value}</Text>
              <Text style={styles.dataUnit}>°C</Text>
            </View>
          </View>
        </View>
        {!isConnected && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📡 Connect OBD-II device to see real-time vehicle data
            </Text>
          </View>
        )}
      </View>

      {/* Chart Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Charts</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>📊</Text>
          <Text style={styles.chartPlaceholderLabel}>RPM & Speed Charts</Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Connect to OBD-II to see live data visualization
          </Text>
        </View>
      </View>

      {/* Device Scan Modal */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          bluetoothService.stopScan();
          setShowDeviceModal(false);
          setIsScanning(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select OBD-II Device</Text>

            {isScanning && (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.scanningText}>Scanning for devices...</Text>
              </View>
            )}

            <FlatList
              data={discoveredDevices}
              keyExtractor={(item) => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => handleDeviceSelect(item)}>
                  <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                  <Text style={styles.deviceId}>{item.id}</Text>
                  {item.rssi && <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isScanning ? (
                  <Text style={styles.emptyText}>No devices found. Make sure your OBD-II device is powered on.</Text>
                ) : null
              }
              style={styles.deviceList}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                bluetoothService.stopScan();
                setShowDeviceModal(false);
                setIsScanning(false);
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  modeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  toggleSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textSecondary,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  connectButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  clearButton: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  errorCode: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  errorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tapHint: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.info + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.info,
    textAlign: 'center',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  dataCardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  dataLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dataValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  dataUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...shadows.sm,
  },
  chartPlaceholderText: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  chartPlaceholderLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chartPlaceholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scanningContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  scanningText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  deviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  deviceId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  deviceRssi: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  cancelButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
});
