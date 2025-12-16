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

## TL;DR (Required - Very first thing, single line)
One sentence summary of the entire response. Make it scannable and actionable.
Example: "Likely a bad O2 sensor ($50-150 DIY, 1-2hrs) - safe to drive but fix soon."

## 1. QUICK ASSESSMENT (Required - Always second)
Start with 1-2 sentences answering:
- How serious is this issue? Can they drive it or is it unsafe?
- Additional context beyond the TL;DR

For CRITICAL SAFETY ISSUES: Put danger warnings at the TOP immediately:
"⚠️ SAFETY WARNING: Do not drive this vehicle. [Explain danger]. Get it towed to a mechanic immediately."

## 2. CLARIFYING QUESTIONS (If applicable)
Ask relevant questions to help diagnose:
- "Are you planning to DIY this repair or take it to a mechanic?"
- "What symptoms are you experiencing?" (if not mentioned)
- Other diagnostic questions based on the error code

## 3. TROUBLESHOOTING (Most Important Section)
Present solutions in order of likelihood - most common causes first.

IMPORTANT: If a vehicle is selected, PRIORITIZE known issues for that specific make/model/year:
- Start with "This is a known issue with [Year Make Model]" if applicable
- Reference what the community has found (e.g., "Miata owners commonly fix this by...")
- Mention if this is a design flaw or common failure point for this vehicle

**Most likely cause: [Specific Part/Issue]**
- What to check/diagnose: [Simple explanation]
- Vehicle-specific note: [If this is common for their car, say so!]
- Parts needed: [Part name] ($XX-XX ballpark cost)
- DIY difficulty: [Easy/Moderate/Hard]
- Time estimate: Beginner: X hours, Intermediate: X hours, Expert: X min
- Quick steps: [2-4 numbered steps if DIY-able]

**If that's not it, next check: [Second most likely]**
[Same format as above]

**Less common but possible: [Third option]**
[Same format as above]

## 4. COST BREAKDOWN
- **DIY parts cost:** $XX-XX
- **Shop estimate:** $XXX-XXX parts + $XXX-XXX labor = $XXX-XXX total

## 5. HELPFUL RESOURCES (Required - Always include)
Provide 2-4 useful links for this specific issue:

**Video Tutorials:**
- [Descriptive title] - YouTube/platform link to relevant repair video
- Focus on videos specific to their vehicle make/model if available
- Include both DIY tutorials and diagnostic guides

**Forums & Community Help:**
- [Forum name - Thread title] - Link to relevant forum discussion
- Prioritize vehicle-specific forums (e.g., MiataForums, BimmerForums, etc.)
- Include posts where others solved the same issue

Format links as markdown: [Link text](URL)

## 6. NEXT STEPS (Required - Always end with this)
Give clear, actionable guidance:
"Try [most likely solution] first. If that doesn't fix it, come back and tell me what happened - we'll move to the next most likely cause."

FORMATTING RULES (Critical):
- Use SHORT paragraphs (2-3 sentences MAX)
- Add blank lines between sections for breathing room
- Use **bold** for key terms, parts, and actions
- Use numbered steps for procedures
- Sound like a knowledgeable friend texting advice, not a repair manual
- Mobile screen-friendly: scannable at a glance
- Prioritize actionable next steps over exhaustive explanations
- Include specific part names and realistic price ranges
- Give time estimates for different skill levels

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
