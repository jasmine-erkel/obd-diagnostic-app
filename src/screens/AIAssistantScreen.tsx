import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {colors, spacing, typography, borderRadius, shadows} from '../constants/theme';
import {AIAssistantScreenProps} from '../navigation/types';
import {useAI} from '../context/AIContext';
import {useVehicles} from '../context/VehicleContext';
import {ChatMessage} from '../types/ai';
import {VehicleSelector} from '../components/vehicles/VehicleSelector';

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = () => {
  const {messages, loading, sendMessage, loadHistory, isConfigured, clearHistory} = useAI();
  const {vehicles, selectedVehicle, selectedVehicleId, selectVehicle} = useVehicles();
  const [inputText, setInputText] = useState('');
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) {
      return;
    }

    const message = inputText.trim();
    setInputText('');
    await sendMessage(message, undefined, selectedVehicle);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {item.errorCode && (
            <Text style={styles.errorCodeBadge}>{item.errorCode}</Text>
          )}
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>AI Diagnostic Assistant</Text>
      <Text style={styles.emptySubtitle}>
        {isConfigured()
          ? 'Ask me about error codes, symptoms, or vehicle issues'
          : 'AI is running in demo mode. Add your API key to enable full functionality.'}
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSuggestedQuestion(question)}>
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isConfigured() && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            💡 Configure your AI API key in settings to get real-time diagnostic assistance
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={84}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.vehicleHeader}>
        {selectedVehicle ? (
          <View style={styles.selectedVehicleContainer}>
            <View style={styles.vehicleIcon}>
              <Text style={styles.vehicleIconText}>🚗</Text>
            </View>
            <View style={styles.vehicleInfoCompact}>
              <Text style={styles.vehicleNameCompact} numberOfLines={1}>
                {selectedVehicle.nickname ||
                  [selectedVehicle.year, selectedVehicle.make, selectedVehicle.model]
                    .filter(Boolean)
                    .join(' ') || 'Unknown Vehicle'}
              </Text>
              <Text style={styles.vehicleDetailsCompact} numberOfLines={1}>
                {[selectedVehicle.year, selectedVehicle.make, selectedVehicle.model]
                  .filter(Boolean)
                  .join(' ') || 'No details'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeVehicleButton}
              onPress={() => setShowVehicleSelector(true)}>
              <Text style={styles.changeVehicleButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noVehicleContainer}>
            <Text style={styles.noVehicleText}>No vehicle selected</Text>
            <Text style={styles.noVehicleSubtext}>General automotive questions</Text>
            <TouchableOpacity
              style={styles.selectVehicleButton}
              onPress={() => setShowVehicleSelector(true)}>
              <Text style={styles.selectVehicleButtonText}>Select Vehicle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={renderEmptyState}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about error codes or issues..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}>
          <Text style={styles.sendButtonText}>{loading ? '...' : '→'}</Text>
        </TouchableOpacity>
      </View>

      <VehicleSelector
        visible={showVehicleSelector}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelect={selectVehicle}
        onClose={() => setShowVehicleSelector(false)}
      />
    </KeyboardAvoidingView>
  );
};

const SUGGESTED_QUESTIONS = [
  'What does error code P0420 mean?',
  'My check engine light is on, what should I do?',
  'How serious is error code P0171?',
  'What causes rough idling?',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  clearButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  messagesContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  warningBanner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: colors.surface,
  },
  errorCodeBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.surface,
  },
  aiMessageText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.surface + 'CC',
  },
  aiTimestamp: {
    color: colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: '600',
  },
  vehicleHeader: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedVehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  vehicleIconText: {
    fontSize: 20,
  },
  vehicleInfoCompact: {
    flex: 1,
  },
  vehicleNameCompact: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  vehicleDetailsCompact: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeVehicleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
  },
  changeVehicleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  noVehicleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  noVehicleText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  noVehicleSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  selectVehicleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  selectVehicleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
});
