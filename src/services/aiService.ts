import {AIConfig, AIResponse} from '../types/ai';
import {Vehicle} from '../types/vehicle';
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
  async sendMessage(message: string, errorCode?: string, vehicle?: Vehicle | null): Promise<AIResponse> {
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
      let systemPrompt = `You are an expert automotive technician specializing in OBD-II diagnostics, helping users through a mobile car repair app.

CRITICAL: Your responses must be mobile-optimized, visually scannable, and actionable. Structure EVERY response exactly like this:

📋 TL;DR
One sentence summary. Make it scannable and actionable.
Example: "Likely a bad O2 sensor ($50-150 DIY, 1-2hrs) - safe to drive but fix soon."

🔍 Quick Assessment
1-2 sentences: How serious is this? Can they drive it or is it unsafe?

For CRITICAL SAFETY ISSUES, start with this:
⚠️ **SAFETY WARNING:** Do not drive this vehicle. [Explain danger]. Get it towed immediately.

Questions for You:
Ask 2-3 relevant questions:
• Are you planning to DIY this or take it to a mechanic?
• What symptoms are you noticing?
• [Other diagnostic questions]

🔧 Troubleshooting (Ranked by Likelihood)

IMPORTANT: If a vehicle is selected, mention if this is a known issue for that make/model/year.
Example: "This is actually common with 2006 Miatas - many owners report..."

**Most likely cause:** [Specific Part/Issue]
• *What to check:* [Simple explanation]
• *Parts needed:* [Part name] ($XX-XX)
• *Difficulty:* Easy/Moderate/Hard
• *Time:* Beginner: X hrs, Intermediate: X hrs, Expert: X min
• *If this is common for their vehicle:* [Mention it here!]

Steps to fix:
1. [First step]
2. [Second step]
3. [Third step]

**If that's not it, try:** [Second most likely]
[Same format]

**Less common possibility:** [Third option]
[Same format]

💰 Cost Breakdown
• DIY parts: $XX-XX
• Shop total: $XXX-XXX (parts + labor)

📺 Helpful Resources

*Video Tutorials:*
• [Video title] - [Link to video]
• [Another video] - [Link]

*Forums & Discussions:*
• [Forum/Thread title] - [Link to discussion]
• [Another helpful thread] - [Link]

✅ Next Steps
Try [most likely solution] first. If that doesn't work, come back and tell me what happened - we'll tackle the next most likely cause together.

FORMATTING RULES (Critical):
- Use emojis SPARINGLY for section headers (📋 🔍 🔧 💰 📺 ✅)
- Use ⚠️ for safety warnings ONLY
- Use **bold** for main ideas, key terms, and important parts
- Use *italics* for labels like "Parts needed:" or "Difficulty:"
- NO ## hashtags - use emojis and bold instead
- Keep paragraphs SHORT (2-3 sentences)
- Use bullet points (•) instead of dashes
- Sound like a helpful friend, not a manual
- Include specific part names and realistic prices

TONE:
- Helpful and reassuring
- Conversational but professional
- Don't overwhelm with technical jargon
- Be honest about difficulty levels
- Encourage them when appropriate`;



      // Enhance prompt with vehicle context if available
      if (vehicle) {
        const vehicleInfo = [vehicle.year, vehicle.make, vehicle.model, vehicle.vin]
          .filter(Boolean)
          .join(' ');

        if (vehicleInfo.trim()) {
          systemPrompt += `\n\n## VEHICLE-SPECIFIC CONTEXT
Current vehicle: ${vehicleInfo}

CRITICAL INSTRUCTIONS FOR THIS VEHICLE:
1. **Use your knowledge of this specific make/model/year** to identify common problems
2. If this vehicle is known to have the reported issue (e.g., "Mazda Miatas are known for rough idling due to X"), mention it upfront
3. Prioritize solutions that are SPECIFIC to this vehicle's common issues
4. Reference TSBs (Technical Service Bulletins) if this make/model has known fixes
5. Adjust cost estimates for this specific vehicle (luxury vs economy parts pricing)
6. Mention any recall information if relevant

Example: "This is actually a common issue with ${vehicle.year} ${vehicle.make} ${vehicle.model}s - many owners report..."`;
        }
      }

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
  async explainErrorCode(errorCode: string, vehicle?: Vehicle | null): Promise<AIResponse> {
    const message = `What does this error code mean? What are common causes and how can I fix it?`;
    return this.sendMessage(message, errorCode, vehicle);
  },

  // Mock response for when AI is not configured (for testing)
  getMockResponse(message: string, errorCode?: string): AIResponse {
    if (errorCode) {
      return {
        success: true,
        message: `## TL;DR
Likely faulty O2 sensor ($50-150 DIY, 1-2hrs) - safe to drive but fix soon to avoid catalytic converter damage.

## QUICK ASSESSMENT
This is a moderate severity issue. You can usually continue driving, but should address it soon to prevent potential damage and maintain fuel efficiency.

## CLARIFYING QUESTIONS
- Are you experiencing any symptoms like rough idling, poor acceleration, or check engine light?
- Are you planning to DIY this repair or take it to a mechanic?
- Have you noticed any decrease in fuel economy?

## TROUBLESHOOTING

**Most likely cause: Faulty Oxygen Sensor**
- What to check: The O2 sensor monitors exhaust gases and helps optimize fuel mixture
- Parts needed: Oxygen Sensor ($50-150 depending on location)
- DIY difficulty: Moderate
- Time estimate: Beginner: 1-2 hours, Intermediate: 45 min, Expert: 20 min

Quick steps:
1. Locate the sensor (upstream or downstream based on code)
2. Disconnect electrical connector
3. Use oxygen sensor socket to remove
4. Install new sensor with anti-seize compound

**If that's not it, next check: Catalytic Converter Issues**
- What to check: The catalyst may be failing or clogged
- Parts needed: Catalytic Converter ($400-1200)
- DIY difficulty: Hard
- Time estimate: Expert: 2-3 hours (requires lifting vehicle)

**Less common but possible: Wiring or ECU Issues**
- What to check: Damaged wiring or computer malfunction
- Parts needed: Varies ($50-500)
- DIY difficulty: Moderate to Hard
- Time estimate: 1-3 hours depending on location

## COST BREAKDOWN
- **DIY parts cost:** $50-150 (O2 sensor)
- **Shop estimate:** $150-300 parts + $100-200 labor = $250-500 total

## HELPFUL RESOURCES

**Video Tutorials:**
- [How to Replace O2 Sensor - Step by Step](https://youtube.com/watch?v=example1) - 15 min comprehensive guide
- [Diagnosing Oxygen Sensor Problems](https://youtube.com/watch?v=example2) - Learn to test before replacing

**Forums & Community Help:**
- [Reddit r/MechanicAdvice - O2 Sensor Replacement Guide](https://reddit.com/r/MechanicAdvice/example)
- [Vehicle-Specific Forum - Common O2 Issues Thread](https://forum.example.com/thread)

## NEXT STEPS
Try replacing the oxygen sensor first - it's the most common fix for this code. If that doesn't clear the code after 50-100 miles of driving, come back and tell me what happened. We'll look at the catalytic converter next.

*Note: This is a demo response. Configure your AI API key in settings for vehicle-specific diagnostics with real video and forum links.*`,
      };
    }

    return {
      success: true,
      message: `## TL;DR
AI diagnostic assistant ready to help - share your error code or symptoms for personalized troubleshooting.

## QUICK ASSESSMENT
I'm here to help with your car trouble! Let me know what specific symptoms you're experiencing or error codes you're seeing.

## HOW I CAN HELP
I can assist with:
- **Error code explanations** - Tell me the code and I'll break down what it means
- **Troubleshooting guidance** - Step-by-step diagnosis ranked by likelihood
- **Cost estimates** - Both DIY and shop pricing
- **Difficulty ratings** - Honest assessment of repair complexity

## NEXT STEPS
Share your error code or describe what's happening with your vehicle. The more details you give me (symptoms, sounds, when it happens), the better I can help!

*Note: This is demo mode. Add your AI API key in settings for full diagnostic assistance.*`,
    };
  },
};
