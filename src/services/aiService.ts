import {AIConfig, AIResponse} from '../types/ai';

// AI Service for OBD Diagnostics
// This is ready to integrate with OpenAI, Claude, or other AI APIs
// Simply add your API key in the config to enable

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '', // Add your API key here
  apiUrl: 'https://api.openai.com/v1/chat/completions', // or Claude API URL
  model: 'gpt-4', // or 'claude-3-sonnet-20240229'
  maxTokens: 500,
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

      // Make API call (OpenAI format - adjust for Claude if needed)
      const response = await fetch(this.config.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userMessage},
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract message from response (OpenAI format)
      const aiMessage = data.choices?.[0]?.message?.content || 'No response from AI';

      return {
        success: true,
        message: aiMessage,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        message: 'Failed to get AI response. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
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
