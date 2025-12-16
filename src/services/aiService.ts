import {AIConfig, AIResponse} from '../types/ai';
import {config} from '../config.local';

// AI Service for OBD Diagnostics
// This is ready to integrate with OpenAI, Claude, or other AI APIs
// Simply add your API key in src/config.local.ts

const DEFAULT_CONFIG: AIConfig = {
  apiKey: config.anthropicApiKey,
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-haiku-20240307',
  maxTokens: 1024,
  temperature: 0.7,
};

export const aiService = {
  config: {...DEFAULT_CONFIG},

  // Update AI configuration
  setConfig(newConfig: Partial<AIConfig>) {
    this.config = {...this.config, ...newConfig};
  },

  // Check if AI is configured
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  },

  // Send a message to the AI
  async sendMessage(message: string, errorCode?: string): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'AI is not configured. Please add your API key in the settings.',
        error: 'NO_API_KEY',
      };
    }

    // Try real API first, fall back to mock if credits issue
    try {
      // Build the system prompt for OBD diagnostics
      const systemPrompt = `You are an expert automotive technician specializing in OBD-II diagnostics.
Provide clear, concise explanations of error codes and practical advice for resolving issues.
Always consider safety and recommend professional help when necessary.`;

      // Build the user message
      let userMessage = message;
      if (errorCode) {
        userMessage = `I have error code ${errorCode}. ${message}`;
      }

      // Make API call (Claude format)
      const requestBody = {
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [
          {role: 'user', content: userMessage},
        ],
      };

      console.log('AI Request:', {
        url: this.config.apiUrl,
        model: this.config.model,
        hasApiKey: !!this.config.apiKey,
      });

      const response = await fetch(this.config.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AI Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI API Error:', errorData);
        console.error('Full Error Details:', JSON.stringify(errorData, null, 2));

        // Extract meaningful error message
        let errorMessage = 'API request failed';
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error?.type) {
          errorMessage = `${errorData.error.type}: ${JSON.stringify(errorData.error)}`;
        }

        // Show full error in UI for debugging
        throw new Error(`${errorMessage}\n\nFull error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // Extract message from response (Claude format)
      const aiMessage = data.content?.[0]?.text || 'No response from AI';

      return {
        success: true,
        message: aiMessage,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Temporarily disabled mock fallback to see real error
      // if (errorMessage.toLowerCase().includes('credit balance')) {
      //   console.log('Credit error detected, using mock response');
      //   return this.getMockResponse(message, errorCode);
      // }

      return {
        success: false,
        message: `AI Error: ${errorMessage}\n\nYour new API key: ${this.config.apiKey?.substring(0, 20)}...\n\nPlease verify your API key has credits at console.anthropic.com/settings/billing`,
        error: errorMessage,
      };
    }
  },

  // Get explanation for a specific OBD error code
  async explainErrorCode(errorCode: string): Promise<AIResponse> {
    const message = `What does this error code mean? What are common causes and how can I fix it?`;
    return this.sendMessage(message, errorCode);
  },

  // Mock response for when AI is not configured (for testing)
  getMockResponse(message: string, errorCode?: string): AIResponse {
    if (errorCode) {
      return {
        success: true,
        message: `This is a mock response for error code ${errorCode}.\n\n` +
          `${errorCode} typically indicates a potential issue with your vehicle's system. ` +
          `Common causes include faulty sensors, wiring issues, or component failures.\n\n` +
          `Recommended actions:\n` +
          `1. Check for loose connections\n` +
          `2. Inspect related components\n` +
          `3. Clear the code and monitor if it returns\n` +
          `4. Consult a professional mechanic for diagnosis\n\n` +
          `Note: This is a mock response. Configure your AI API key for real diagnostics.`,
      };
    }

    return {
      success: true,
      message: `This is a mock response to your question: "${message}"\n\n` +
        `I'm here to help you with OBD-II diagnostics and vehicle troubleshooting. ` +
        `However, AI is not currently configured. Add your API key to enable real AI assistance.\n\n` +
        `In the meantime, I can still provide general automotive advice and explain common error codes.`,
    };
  },
};
