import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';
import {DiagnosticsScreenProps} from '../navigation/types';
import {getErrorCodeDetails} from '../constants/obdCodes';
import {useAI} from '../context/AIContext';
import {useOBD} from '../context/OBDContext';
import {useNavigation} from '@react-navigation/native';
import {ErrorCode} from '../types/vehicle';

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = () => {
  const {sendMessage} = useAI();
  const navigation = useNavigation();
  const {
    connected,
    engineRunning,
    liveData,
    errorCodes: obdErrorCodes,
    connect,
    disconnect,
    refreshErrorCodes,
    clearErrorCodes,
    startEngine,
    stopEngine,
    checkServerConnection,
  } = useOBD();

  // Convert OBD error codes to app format
  const errorCodes: ErrorCode[] = obdErrorCodes.map(obdCode => {
    const details = getErrorCodeDetails(obdCode.code);
    return details || {
      code: obdCode.code,
      description: 'Unknown error code',
      severity: 'warning' as const,
      status: 'active' as const,
    };
  });

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
            navigation.navigate('AIAssistantTab' as any);
            setTimeout(async () => {
              await sendMessage(`What does error code ${errorCode.code} mean and how can I fix it?`, errorCode.code);
            }, 500);
          },
        },
      ],
    );
  };

  const handleConnectOBD = async () => {
    // Check if server is reachable first
    const serverReachable = await checkServerConnection();

    if (!serverReachable) {
      Alert.alert(
        'Server Not Found',
        'Cannot reach the mock OBD server.\n\nMake sure:\n1. Mock server is running (npm start in mock-obd-server/)\n2. Server URL is correct in src/services/obdService.ts\n3. Your phone and Mac are on the same network',
        [{text: 'OK'}],
      );
      return;
    }

    const result = await connect();

    if (result.success) {
      Alert.alert('Connected', result.message, [
        {text: 'OK'},
        {
          text: 'Start Engine',
          onPress: async () => {
            const engineResult = await startEngine();
            if (!engineResult.success) {
              Alert.alert('Error', engineResult.message);
            }
          },
        },
      ]);
    } else {
      Alert.alert('Connection Failed', result.message);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert('Disconnect', 'Disconnect from OBD device?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          await disconnect();
        },
      },
    ]);
  };

  const handleClearCodes = async () => {
    Alert.alert('Clear Error Codes', 'This will clear all stored error codes. Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const result = await clearErrorCodes();
          if (result.success) {
            Alert.alert('Success', 'Error codes cleared');
          } else {
            Alert.alert('Error', result.message);
          }
        },
      },
    ]);
  };

  const handleEngineToggle = async () => {
    if (engineRunning) {
      const result = await stopEngine();
      if (!result.success) {
        Alert.alert('Error', result.message);
      }
    } else {
      const result = await startEngine();
      if (!result.success) {
        Alert.alert('Error', result.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusLabel}>OBD-II Status</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, {backgroundColor: connected ? colors.success : colors.textSecondary}]} />
              <Text style={styles.statusText}>{connected ? 'Connected' : 'Not Connected'}</Text>
            </View>
            {connected && (
              <View style={styles.statusRow}>
                <View
                  style={[styles.statusDot, {backgroundColor: engineRunning ? colors.success : colors.warning}]}
                />
                <Text style={styles.statusTextSmall}>
                  Engine: {engineRunning ? 'Running' : 'Off'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!connected ? (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectOBD}>
            <Text style={styles.connectButtonText}>Connect Device</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.secondaryButton]}
              onPress={handleEngineToggle}>
              <Text style={styles.secondaryButtonText}>{engineRunning ? 'Stop' : 'Start'} Engine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.dangerButton]} onPress={handleDisconnect}>
              <Text style={styles.dangerButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Error Codes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Error Codes ({errorCodes.length})</Text>
          {connected && errorCodes.length > 0 && (
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
            <Text style={styles.emptyStateText}>
              {connected ? 'No error codes detected' : 'Connect to scan for errors'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {connected ? '✅ Your vehicle is running clean!' : 'Connect your OBD-II device to scan for issues'}
            </Text>
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
              <Text style={styles.dataValue}>{liveData?.rpm.toLocaleString() || '---'}</Text>
              <Text style={styles.dataUnit}>rpm</Text>
            </View>
          </View>

          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Speed</Text>
              <Text style={styles.dataValue}>{liveData?.speed || '---'}</Text>
              <Text style={styles.dataUnit}>mph</Text>
            </View>
          </View>

          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Coolant Temp</Text>
              <Text style={styles.dataValue}>{liveData?.coolantTemp || '---'}</Text>
              <Text style={styles.dataUnit}>°F</Text>
            </View>
          </View>

          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Fuel Level</Text>
              <Text style={styles.dataValue}>{liveData?.fuelLevel || '---'}</Text>
              <Text style={styles.dataUnit}>%</Text>
            </View>
          </View>

          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Engine Load</Text>
              <Text style={styles.dataValue}>{liveData?.engineLoad || '---'}</Text>
              <Text style={styles.dataUnit}>%</Text>
            </View>
          </View>

          <View style={styles.dataCardWrapper}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Throttle</Text>
              <Text style={styles.dataValue}>{liveData?.throttlePosition || '---'}</Text>
              <Text style={styles.dataUnit}>%</Text>
            </View>
          </View>
        </View>

        {!connected && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📡 Connect OBD-II device to see real-time vehicle data</Text>
          </View>
        )}

        {connected && engineRunning && (
          <View style={[styles.infoBox, {backgroundColor: colors.success + '15', borderColor: colors.success + '30'}]}>
            <Text style={[styles.infoText, {color: colors.success}]}>
              ✅ Receiving live data from mock OBD server
            </Text>
          </View>
        )}
      </View>
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
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statusHeader: {
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  statusTextSmall: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
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
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  dangerButtonText: {
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
});
