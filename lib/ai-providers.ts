import { connectToDatabase } from '@/utils/db';
import { StoryElements, AIResponse, AIAssessment } from '@/types/ai';
import mongoose from 'mongoose';

// AI Keys Model - Secure storage in MongoDB
const AIKeysSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'google'],
    required: true,
    unique: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  usage: {
    totalRequests: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const AIKeys = mongoose.models.AIKeys || mongoose.model('AIKeys', AIKeysSchema);

// AI Provider Interface
interface AIProvider {
  name: string;
  generateStory: (elements: StoryElements, userAge: number) => Promise<AIResponse>;
  assessStory: (content: string, elements: StoryElements, userAge: number) => Promise<AIAssessment>;
  getCost: (tokens: number) => number;
}

// Secure API key retrieval
async function getAPIKey(provider: string): Promise<string> {
  await connectToDatabase();
  
  const keyRecord = await AIKeys.findOne({ 
    provider, 
    isActive: true 
  });
  
  if (!keyRecord) {
    throw new Error(`API key not found for provider: ${provider}`);
  }
  
  // Update last used timestamp
  await AIKeys.updateOne(
    { _id: keyRecord._id },
    { 
      lastUsed: new Date(),
      $inc: { 'usage.totalRequests': 1 }
    }
  );
  
  return keyRecord.apiKey;
}

// Usage tracking
async function trackUsage(provider: string, tokens: number, cost: number) {
  await connectToDatabase();
  
  await AIKeys.updateOne(
    { provider, isActive: true },
    {
      $inc: {
        'usage.totalTokens': tokens,
        'usage.totalCost': cost,
      },
      updatedAt: new Date(),
    }
  );
}

// OpenAI Provider
class OpenAIProvider implements AIProvider {
  name = 'openai';

  async generateStory(elements: StoryElements, userAge: number): Promise<AIResponse> {
    const apiKey = await getAPIKey('openai');
    
    const prompt = this.buildGenerationPrompt(elements, userAge);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(userAge),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Track usage
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.getCost(tokens);
      await trackUsage('openai', tokens, cost);

      return this.parseResponse(content);
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error('Failed to generate story with OpenAI');
    }
  }

  async assessStory(content: string, elements: StoryElements, userAge: number): Promise<AIAssessment> {
    const apiKey = await getAPIKey('openai');
    
    const prompt = this.buildAssessmentPrompt(content, elements, userAge);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: this.getAssessmentSystemPrompt(userAge),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 600,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assessmentContent = data.choices[0]?.message?.content;
      
      if (!assessmentContent) {
        throw new Error('No assessment received from OpenAI');
      }

      // Track usage
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.getCost(tokens);
      await trackUsage('openai', tokens, cost);

      return this.parseAssessment(assessmentContent);
    } catch (error) {
      console.error('OpenAI assessment error:', error);
      throw new Error('Failed to assess story with OpenAI');
    }
  }

  getCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    // Simplified calculation - in production, track prompt vs completion tokens separately
    return (tokens / 1000) * 0.045; // Average cost
  }

  private getSystemPrompt(userAge: number): string {
    const ageGroup = this.getAgeGroup(userAge);
    return `You are a creative writing assistant for children aged ${userAge}. 
    Generate age-appropriate, engaging, and educational story content.
    Keep vocabulary and themes suitable for ${ageGroup} readers.
    Always encourage creativity and positive values.
    Respond in JSON format only.`;
  }

  private getAssessmentSystemPrompt(userAge: number): string {
    const ageGroup = this.getAgeGroup(userAge);
    return `You are an educational assessment AI for children aged ${userAge}.
    Assess stories for grammar, creativity, and overall quality.
    Provide encouraging feedback appropriate for ${ageGroup} learners.
    Focus on positive reinforcement while suggesting improvements.
    Respond in JSON format only.`;
  }

  private buildGenerationPrompt(elements: StoryElements, userAge: number): string {
    return `Create a story opening and complete response plan based on these elements:
    Genre: ${elements.genre}
    Setting: ${elements.setting}
    Character: ${elements.character}
    Mood: ${elements.mood}
    Conflict: ${elements.conflict}
    Theme: ${elements.theme}
    
    Age: ${userAge} years old
    
    Respond with JSON containing:
    {
      "opening": "2-3 sentence story opening",
      "responseTemplates": {
        "continue": ["3 different continuation prompts"],
        "twist": ["3 different plot twist prompts"],
        "character": ["3 different new character prompts"],
        "challenge": ["3 different challenge prompts"]
      },
      "wordCount": estimated_final_word_count
    }`;
  }

  private buildAssessmentPrompt(content: string, elements: StoryElements, userAge: number): string {
    return `Assess this story written by a ${userAge}-year-old:

    Story: "${content}"
    
    Original Elements:
    Genre: ${elements.genre}, Setting: ${elements.setting}, Character: ${elements.character}
    
    Respond with JSON containing:
    {
      "grammarScore": score_0_to_100,
      "creativityScore": score_0_to_100,
      "overallScore": score_0_to_100,
      "feedback": "encouraging paragraph about what they did well",
      "suggestions": ["2-3 specific improvement suggestions"],
      "strengths": ["2-3 things they did really well"],
      "improvements": ["2-3 areas to work on"],
      "readingLevel": "age-appropriate reading level assessment"
    }`;
  }

  private parseResponse(content: string): AIResponse {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        opening: content.substring(0, 200),
        responseTemplates: {
          continue: ["Continue your story..."],
          twist: ["Add an unexpected twist..."],
          character: ["Introduce a new character..."],
          challenge: ["Create a challenge for your character..."]
        },
        wordCount: 300
      };
    }
  }

  private parseAssessment(content: string): AIAssessment {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback assessment
      return {
        grammarScore: 75,
        creativityScore: 80,
        overallScore: 78,
        feedback: "Great job on your story! You showed wonderful creativity.",
        suggestions: ["Keep practicing your writing!", "Try adding more descriptive words."],
        strengths: ["Creative imagination", "Good story structure"],
        improvements: ["Sentence variety", "Spelling practice"],
        readingLevel: "Grade appropriate"
      };
    }
  }

  private getAgeGroup(age: number): string {
    if (age >= 2 && age <= 5) return 'early childhood';
    if (age >= 6 && age <= 8) return 'early elementary';
    if (age >= 9 && age <= 12) return 'late elementary';
    if (age >= 13 && age <= 15) return 'middle school';
    return 'high school';
  }
}

// Anthropic Provider
class AnthropicProvider implements AIProvider {
  name = 'anthropic';

  async generateStory(elements: StoryElements, userAge: number): Promise<AIResponse> {
    const apiKey = await getAPIKey('anthropic');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 800,
          messages: [
            {
              role: 'user',
              content: this.buildGenerationPrompt(elements, userAge),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Anthropic');
      }

      // Track usage
      const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0;
      const cost = this.getCost(tokens);
      await trackUsage('anthropic', tokens, cost);

      return this.parseResponse(content);
    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw new Error('Failed to generate story with Anthropic');
    }
  }

  async assessStory(content: string, elements: StoryElements, userAge: number): Promise<AIAssessment> {
    const apiKey = await getAPIKey('anthropic');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: this.buildAssessmentPrompt(content, elements, userAge),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assessmentContent = data.content[0]?.text;
      
      if (!assessmentContent) {
        throw new Error('No assessment received from Anthropic');
      }

      // Track usage
      const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0;
      const cost = this.getCost(tokens);
      await trackUsage('anthropic', tokens, cost);

      return this.parseAssessment(assessmentContent);
    } catch (error) {
      console.error('Anthropic assessment error:', error);
      throw new Error('Failed to assess story with Anthropic');
    }
  }

  getCost(tokens: number): number {
    // Claude-3 Sonnet pricing: $0.003 per 1K input tokens, $0.015 per 1K output tokens
    // Simplified calculation
    return (tokens / 1000) * 0.009; // Average cost
  }

  private buildGenerationPrompt(elements: StoryElements, userAge: number): string {
    return `You are a creative writing assistant for children aged ${userAge}. Create a story plan based on these elements:

Genre: ${elements.genre}
Setting: ${elements.setting}
Character: ${elements.character}
Mood: ${elements.mood}
Conflict: ${elements.conflict}
Theme: ${elements.theme}

Respond ONLY with valid JSON in this exact format:
{
  "opening": "2-3 sentence story opening appropriate for age ${userAge}",
  "responseTemplates": {
    "continue": ["prompt 1", "prompt 2", "prompt 3"],
    "twist": ["twist 1", "twist 2", "twist 3"],
    "character": ["character 1", "character 2", "character 3"],
    "challenge": ["challenge 1", "challenge 2", "challenge 3"]
  },
  "wordCount": estimated_word_count_number
}`;
  }

  private buildAssessmentPrompt(content: string, elements: StoryElements, userAge: number): string {
    return `Assess this story written by a ${userAge}-year-old child. Be encouraging and constructive.

Story: "${content}"

Respond ONLY with valid JSON in this exact format:
{
  "grammarScore": number_between_0_and_100,
  "creativityScore": number_between_0_and_100,
  "overallScore": number_between_0_and_100,
  "feedback": "positive encouraging paragraph",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "readingLevel": "reading level description"
}`;
  }

  private parseResponse(content: string): AIResponse {
    try {
      return JSON.parse(content);
    } catch {
      return {
        opening: content.substring(0, 200),
        responseTemplates: {
          continue: ["Continue your adventure..."],
          twist: ["Something unexpected happens..."],
          character: ["A new friend appears..."],
          challenge: ["Your character faces a challenge..."]
        },
        wordCount: 300
      };
    }
  }

  private parseAssessment(content: string): AIAssessment {
    try {
      return JSON.parse(content);
    } catch {
      return {
        grammarScore: 75,
        creativityScore: 80,
        overallScore: 78,
        feedback: "Wonderful creativity in your story!",
        suggestions: ["Keep practicing!", "Try more descriptive words."],
        strengths: ["Great imagination", "Good story flow"],
        improvements: ["Grammar practice", "Sentence variety"],
        readingLevel: "Age appropriate"
      };
    }
  }
}

// Google Provider
class GoogleProvider implements AIProvider {
  name = 'google';

  async generateStory(elements: StoryElements, userAge: number): Promise<AIResponse> {
    const apiKey = await getAPIKey('google');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: this.buildGenerationPrompt(elements, userAge),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Google');
      }

      // Track usage (Google doesn't provide token counts in the same way)
      const estimatedTokens = Math.ceil(content.length / 4); // Rough estimation
      const cost = this.getCost(estimatedTokens);
      await trackUsage('google', estimatedTokens, cost);

      return this.parseResponse(content);
    } catch (error) {
      console.error('Google generation error:', error);
      throw new Error('Failed to generate story with Google');
    }
  }

  async assessStory(content: string, elements: StoryElements, userAge: number): Promise<AIAssessment> {
    const apiKey = await getAPIKey('google');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: this.buildAssessmentPrompt(content, elements, userAge),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 600,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assessmentContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!assessmentContent) {
        throw new Error('No assessment received from Google');
      }

      // Track usage
      const estimatedTokens = Math.ceil(assessmentContent.length / 4);
      const cost = this.getCost(estimatedTokens);
      await trackUsage('google', estimatedTokens, cost);

      return this.parseAssessment(assessmentContent);
    } catch (error) {
      console.error('Google assessment error:', error);
      throw new Error('Failed to assess story with Google');
    }
  }

  getCost(tokens: number): number {
    // Gemini Pro pricing: $0.0005 per 1K characters (roughly $0.001 per 1K tokens)
    return (tokens / 1000) * 0.001;
  }

  private buildGenerationPrompt(elements: StoryElements, userAge: number): string {
    return `You are a creative writing assistant for children aged ${userAge}. Create a story plan based on these elements:

Genre: ${elements.genre}
Setting: ${elements.setting}
Character: ${elements.character}
Mood: ${elements.mood}
Conflict: ${elements.conflict}
Theme: ${elements.theme}

Respond ONLY with valid JSON in this exact format:
{
  "opening": "2-3 sentence story opening appropriate for age ${userAge}",
  "responseTemplates": {
    "continue": ["prompt 1", "prompt 2", "prompt 3"],
    "twist": ["twist 1", "twist 2", "twist 3"],
    "character": ["character 1", "character 2", "character 3"],
    "challenge": ["challenge 1", "challenge 2", "challenge 3"]
  },
  "wordCount": estimated_word_count_number
}`;
  }

  private buildAssessmentPrompt(content: string, elements: StoryElements, userAge: number): string {
    return `Assess this story written by a ${userAge}-year-old child. Be encouraging and constructive.

Story: "${content}"

Respond ONLY with valid JSON in this exact format:
{
  "grammarScore": number_between_0_and_100,
  "creativityScore": number_between_0_and_100,
  "overallScore": number_between_0_and_100,
  "feedback": "positive encouraging paragraph",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "readingLevel": "reading level description"
}`;
  }

  private parseResponse(content: string): AIResponse {
    try {
      return JSON.parse(content);
    } catch {
      return {
        opening: content.substring(0, 200),
        responseTemplates: {
          continue: ["Continue your story..."],
          twist: ["Add a surprise..."],
          character: ["Meet someone new..."],
          challenge: ["Face a new challenge..."]
        },
        wordCount: 300
      };
    }
  }

  private parseAssessment(content: string): AIAssessment {
    try {
      return JSON.parse(content);
    } catch {
      return {
        grammarScore: 75,
        creativityScore: 80,
        overallScore: 78,
        feedback: "Great job on your creative story!",
        suggestions: ["Keep writing!", "Try new words."],
        strengths: ["Creativity", "Story structure"],
        improvements: ["Grammar", "Details"],
        readingLevel: "Age appropriate"
      };
    }
  }
}

// Provider Manager
class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider = 'openai';

  constructor() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('google', new GoogleProvider());
  }

  async getProvider(providerName?: string): Promise<AIProvider> {
    const name = providerName || await this.getDefaultProvider();
    const provider = this.providers.get(name);
    
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    
    return provider;
  }

  async getDefaultProvider(): Promise<string> {
    // Check which providers have active API keys and return the best available
    await connectToDatabase();
    
    const activeProviders = await AIKeys.find({ isActive: true }).sort({ 'usage.totalCost': 1 });
    
    if (activeProviders.length === 0) {
      throw new Error('No active AI providers configured');
    }
    
    // Return the provider with lowest cost usage
    return activeProviders[0].provider;
  }

  async switchProvider(newProvider: string): Promise<void> {
    if (!this.providers.has(newProvider)) {
      throw new Error(`Provider ${newProvider} not supported`);
    }
    
    // Verify the provider has an active API key
    await getAPIKey(newProvider);
    this.defaultProvider = newProvider;
  }

  async getProviderStats(): Promise<any[]> {
    await connectToDatabase();
    return await AIKeys.find({}).select('-apiKey');
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// AI Service Functions
const aiManager = new AIProviderManager();

export async function generateStory(
  elements: StoryElements, 
  userAge: number, 
  providerName?: string
): Promise<AIResponse> {
  try {
    const provider = await aiManager.getProvider(providerName);
    return await provider.generateStory(elements, userAge);
  } catch (error) {
    console.error('Story generation failed:', error);
    
    // Try fallback provider
    if (providerName) {
      try {
        const fallbackProvider = await aiManager.getProvider();
        return await fallbackProvider.generateStory(elements, userAge);
      } catch (fallbackError) {
        console.error('Fallback provider also failed:', fallbackError);
      }
    }
    
    throw new Error('All AI providers failed to generate story');
  }
}

export async function assessStory(
  content: string,
  elements: StoryElements,
  userAge: number,
  providerName?: string
): Promise<AIAssessment> {
  try {
    const provider = await aiManager.getProvider(providerName);
    return await provider.assessStory(content, elements, userAge);
  } catch (error) {
    console.error('Story assessment failed:', error);
    
    // Try fallback provider
    if (providerName) {
      try {
        const fallbackProvider = await aiManager.getProvider();
        return await fallbackProvider.assessStory(content, elements, userAge);
      } catch (fallbackError) {
        console.error('Fallback provider also failed:', fallbackError);
      }
    }
    
    throw new Error('All AI providers failed to assess story');
  }
}

// Admin functions for managing AI keys
export async function setAPIKey(provider: string, apiKey: string): Promise<void> {
  await connectToDatabase();
  
  await AIKeys.findOneAndUpdate(
    { provider },
    {
      provider,
      apiKey,
      isActive: true,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

export async function deactivateProvider(provider: string): Promise<void> {
  await connectToDatabase();
  
  await AIKeys.updateOne(
    { provider },
    { 
      isActive: false,
      updatedAt: new Date(),
    }
  );
}

export async function getProviderUsage(): Promise<any[]> {
  return await aiManager.getProviderStats();
}

export async function switchDefaultProvider(provider: string): Promise<void> {
  await aiManager.switchProvider(provider);
}

export { aiManager };