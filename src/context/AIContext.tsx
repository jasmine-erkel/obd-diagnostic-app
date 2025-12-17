import React, {createContext, useContext, useState, ReactNode, useMemo, useCallback} from 'react';
import {ChatMessage, AIConfig} from '../types/ai';
import {Vehicle} from '../types/vehicle';
import {aiService} from '../services/aiService';
import {generateUUID} from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_HISTORY_KEY = '@obd_chat_history';
const AI_CONFIG_KEY = '@obd_ai_config';

interface AIContextType {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (content: string, errorCode?: string, vehicle?: Vehicle | null) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
  updateConfig: (config: Partial<AIConfig>) => Promise<void>;
  getConfig: () => AIConfig;
  isConfigured: () => boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load chat history from storage
  const loadHistory = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (data) {
        setMessages(JSON.parse(data));
      }

      // Load AI config
      const configData = await AsyncStorage.getItem(AI_CONFIG_KEY);
      if (configData) {
        const config = JSON.parse(configData);
        aiService.setConfig(config);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save chat history to storage
  const saveHistory = useCallback(async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, errorCode?: string, vehicle?: Vehicle | null) => {
    if (!content.trim()) {
      return;
    }

    setLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      errorCode,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveHistory(updatedMessages);

    try {
      // Get AI response (or mock if not configured)
      const response = aiService.isConfigured()
        ? await aiService.sendMessage(content, errorCode, vehicle)
        : aiService.getMockResponse(content, errorCode);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        errorCode,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveHistory(finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: generateUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  }, [messages, saveHistory]);

  // Clear chat history
  const clearHistory = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  // Update AI configuration
  const updateConfig = useCallback(async (config: Partial<AIConfig>) => {
    aiService.setConfig(config);
    await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(aiService.config));
  }, []);

  // Get current configuration
  const getConfig = useCallback((): AIConfig => {
    return aiService.config;
  }, []);

  // Check if AI is configured
  const isConfigured = useCallback((): boolean => {
    return aiService.isConfigured();
  }, []);

  const value = useMemo(
    () => ({
      messages,
      loading,
      sendMessage,
      clearHistory,
      loadHistory,
      updateConfig,
      getConfig,
      isConfigured,
    }),
    [messages, loading, sendMessage, clearHistory, loadHistory, updateConfig, getConfig, isConfigured]
  );

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
