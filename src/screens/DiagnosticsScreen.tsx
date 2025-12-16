import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';
import {DiagnosticsScreenProps} from '../navigation/types';
import {getErrorCodeDetails, MOCK_LIVE_DATA} from '../constants/obdCodes';
import {useAI} from '../context/AIContext';
import {useNavigation} from '@react-navigation/native';
import {ErrorCode} from '../types/vehicle';

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = () => {
  const {sendMessage} = useAI();
  const navigation = useNavigation();

  // Mock error codes from OBD scanner (in real app, this would come from OBD device)
  const [errorCodes] = useState<ErrorCode[]>([
    getErrorCodeDetails('P0420')!,
    getErrorCodeDetails('P0171')!,
    getErrorCodeDetails('P0301')!,
  ]);

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

  const handleConnectOBD = () => {
    Alert.alert(
      'Connect OBD-II Device',
      'OBD-II Bluetooth connection feature coming soon!\n\nThis feature will allow you to:\n• Read real-time error codes\n• Monitor live engine data\n• Clear diagnostic codes\n• View freeze frame data',
    );
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
          onPress: () => {
            Alert.alert('Success', 'Error codes cleared (demo mode)');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>OBD-II Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Not Connected</Text>
        </View>
        <TouchableOpacity style={styles.connectButton} onPress={handleConnectOBD}>
          <Text style={styles.connectButtonText}>Connect Device</Text>
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
          {Object.entries(MOCK_LIVE_DATA).slice(0, 6).map(([key, data]) => (
            <View key={key} style={styles.dataCardWrapper}>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>{data.label}</Text>
                <Text style={styles.dataValue}>{data.value}</Text>
                <Text style={styles.dataUnit}>{data.unit}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📡 Connect OBD-II device to see real-time vehicle data
          </Text>
        </View>
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
});
