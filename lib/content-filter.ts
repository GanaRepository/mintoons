// File 101: lib/content-filter.ts - Advanced Content Filtering
import OpenAI from 'openai';

interface ContentModerationResult {
  isAppropriate: boolean;
  flaggedCategories: string[];
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

export class ContentFilter {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async moderateContent(content: string): Promise<ContentModerationResult> {
    try {
      // OpenAI Moderation API
      const moderation = await this.openai.moderations.create({
        input: content,
      });

      const result = moderation.results[0];
      const flaggedCategories: string[] = [];
      
      Object.entries(result.categories).forEach(([category, flagged]) => {
        if (flagged) flaggedCategories.push(category);
      });

      // Custom child-safety checks
      const customChecks = await this.performCustomChecks(content);
      
      return {
        isAppropriate: !result.flagged && customChecks.isAppropriate,
        flaggedCategories: [...flaggedCategories, ...customChecks.flaggedCategories],
        severity: this.determineSeverity(result.category_scores),
        suggestions: customChecks.suggestions,
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      return {
        isAppropriate: false,
        flaggedCategories: ['system_error'],
        severity: 'high',
      };
    }
  }

  private async performCustomChecks(content: string) {
    // Age-appropriate language checks
    const inappropriateWords = [
      // Add age-inappropriate words for children
    ];
    
    const flaggedCategories: string[] = [];
    const suggestions: string[] = [];
    
    // Check for inappropriate words
    inappropriateWords.forEach(word => {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        flaggedCategories.push('inappropriate_language');
        suggestions.push(`Consider replacing "${word}" with more age-appropriate language`);
      }
    });

    // Check for personal information
    const personalInfoPatterns = [
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
      /\b\d{1,5}\s[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd)\b/i, // Addresses
    ];

    personalInfoPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        flaggedCategories.push('personal_information');
        suggestions.push('Remove personal information to protect privacy');
      }
    });

    return {
      isAppropriate: flaggedCategories.length === 0,
      flaggedCategories,
      suggestions,
    };
  }

  private determineSeverity(scores: any): 'low' | 'medium' | 'high' {
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0.8) return 'high';
    if (maxScore > 0.5) return 'medium';
    return 'low';
  }
}