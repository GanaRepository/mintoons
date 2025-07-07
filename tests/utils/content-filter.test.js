import { describe, it, expect } from '@jest/globals';
import { 
  filterInappropriateContent, 
  checkContentSafety, 
  validateAgeAppropriate,
  detectBullying,
  checkSpelling,
  suggestImprovements
} from '../utils/content-filter';

describe('Content Filter Utilities', () => {
  describe('filterInappropriateContent', () => {
    it('filters out inappropriate words', () => {
      const inappropriateText = 'This is bad content with inappropriate words.';
      const filteredText = filterInappropriateContent(inappropriateText);
      
      expect(filteredText).not.toContain('bad');
      expect(filteredText).toContain('***');
    });

    it('preserves appropriate content', () => {
      const appropriateText = 'This is a wonderful story about friendship and adventure.';
      const filteredText = filterInappropriateContent(appropriateText);
      
      expect(filteredText).toBe(appropriateText);
    });

    it('handles multiple inappropriate words', () => {
      const text = 'Some bad words and terrible content here.';
      const filteredText = filterInappropriateContent(text);
      
      expect(filteredText).toContain('***');
      expect(filteredText).not.toContain('bad');
      expect(filteredText).not.toContain('terrible');
    });

    it('handles case insensitive filtering', () => {
      const text = 'BAD words and Bad content.';
      const filteredText = filterInappropriateContent(text);
      
      expect(filteredText).toContain('***');
      expect(filteredText).not.toContain('BAD');
      expect(filteredText).not.toContain('Bad');
    });

    it('preserves word boundaries', () => {
      const text = 'The badge was badminton related.';
      const filteredText = filterInappropriateContent(text);
      
      // Should not filter "badge" or "badminton" as they contain "bad"
      expect(filteredText).toContain('badge');
      expect(filteredText).toContain('badminton');
    });
  });

  describe('checkContentSafety', () => {
    it('returns safe for appropriate content', () => {
      const safeContent = 'Once upon a time, there was a brave knight who helped everyone.';
      const result = checkContentSafety(safeContent);
      
      expect(result.isSafe).toBe(true);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.flags).toHaveLength(0);
    });

    it('flags violent content', () => {
      const violentContent = 'The character fought with weapons and caused harm.';
      const result = checkContentSafety(violentContent);
      
      expect(result.isSafe).toBe(false);
      expect(result.flags).toContain('violence');
      expect(result.score).toBeLessThan(0.5);
    });

    it('flags inappropriate language', () => {
      const inappropriateContent = 'This contains profanity and bad words.';
      const result = checkContentSafety(inappropriateContent);
      
      expect(result.isSafe).toBe(false);
      expect(result.flags).toContain('language');
    });

    it('flags adult themes', () => {
      const adultContent = 'This story contains mature themes not suitable for children.';
      const result = checkContentSafety(adultContent);
      
      expect(result.isSafe).toBe(false);
      expect(result.flags).toContain('mature');
    });

    it('provides confidence scores', () => {
      const content = 'A simple children\'s story about friendship.';
      const result = checkContentSafety(content);
      
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('validateAgeAppropriate', () => {
    it('validates content for different age groups', () => {
      const simpleStory = 'The cat sat on the mat.';
      
      expect(validateAgeAppropriate(simpleStory, '4-6')).toBe(true);
      expect(validateAgeAppropriate(simpleStory, '7-9')).toBe(true);
      expect(validateAgeAppropriate(simpleStory, '10-12')).toBe(true);
    });

    it('rejects complex content for younger ages', () => {
      const complexStory = 'The philosophical implications of quantum mechanics affected the protagonist\'s worldview.';
      
      expect(validateAgeAppropriate(complexStory, '4-6')).toBe(false);
      expect(validateAgeAppropriate(complexStory, '7-9')).toBe(false);
      expect(validateAgeAppropriate(complexStory, '13-15')).toBe(true);
    });

    it('checks vocabulary complexity', () => {
      const advancedVocab = 'The perspicacious detective elucidated the enigmatic circumstances.';
      
      expect(validateAgeAppropriate(advancedVocab, '7-9')).toBe(false);
      expect(validateAgeAppropriate(advancedVocab, '13-15')).toBe(true);
    });

    it('checks sentence complexity', () => {
      const complexSentence = 'Although the weather was inclement, and despite the fact that the roads were treacherous due to the unprecedented snowfall that had occurred overnight, the intrepid explorer decided to embark upon his journey.';
      
      expect(validateAgeAppropriate(complexSentence, '4-6')).toBe(false);
      expect(validateAgeAppropriate(complexSentence, '10-12')).toBe(false);
      expect(validateAgeAppropriate(complexSentence, '16-18')).toBe(true);
    });

    it('considers emotional maturity requirements', () => {
      const emotionalContent = 'The character dealt with feelings of loss and grief after losing a family member.';
      
      expect(validateAgeAppropriate(emotionalContent, '4-6')).toBe(false);
      expect(validateAgeAppropriate(emotionalContent, '13-15')).toBe(true);
    });
  });

  describe('detectBullying', () => {
    it('detects bullying language', () => {
      const bullyingText = 'You are stupid and nobody likes you.';
      const result = detectBullying(bullyingText);
      
      expect(result.isBullying).toBe(true);
      expect(result.severity).toBeGreaterThan(0.7);
      expect(result.types).toContain('name-calling');
    });

    it('detects exclusionary behavior', () => {
      const exclusionText = 'You can\'t play with us. Go away.';
      const result = detectBullying(exclusionText);
      
      expect(result.isBullying).toBe(true);
      expect(result.types).toContain('exclusion');
    });

    it('detects threatening language', () => {
      const threatText = 'I\'m going to hurt you if you don\'t give me your lunch money.';
      const result = detectBullying(threatText);
      
      expect(result.isBullying).toBe(true);
      expect(result.types).toContain('threats');
      expect(result.severity).toBeGreaterThan(0.8);
    });

    it('allows assertive but not aggressive language', () => {
      const assertiveText = 'I don\'t agree with you, but I respect your opinion.';
      const result = detectBullying(assertiveText);
      
      expect(result.isBullying).toBe(false);
    });

    it('detects cyberbullying patterns', () => {
      const cyberbullyingText = 'Everyone thinks you\'re weird. #loser';
      const result = detectBullying(cyberbullyingText);
      
      expect(result.isBullying).toBe(true);
      expect(result.types).toContain('social-aggression');
    });
  });

  describe('checkSpelling', () => {
    it('identifies common spelling errors', () => {
      const text = 'The childern went to the libary to reed books.';
      const result = checkSpelling(text);
      
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].word).toBe('childern');
      expect(result.errors[0].suggestions).toContain('children');
      expect(result.errors[1].word).toBe('libary');
      expect(result.errors[1].suggestions).toContain('library');
      expect(result.errors[2].word).toBe('reed');
      expect(result.errors[2].suggestions).toContain('read');
    });

    it('provides multiple suggestions', () => {
      const text = 'The gril was happi.';
      const result = checkSpelling(text);
      
      expect(result.errors[0].suggestions).toContain('girl');
      expect(result.errors[0].suggestions).toContain('grill');
      expect(result.errors[1].suggestions).toContain('happy');
    });

    it('handles proper nouns correctly', () => {
      const text = 'Sarah went to McDonald\'s with her friend.';
      const result = checkSpelling(text);
      
      expect(result.errors).toHaveLength(0);
    });

    it('provides confidence scores for suggestions', () => {
      const text = 'The elefant was huge.';
      const result = checkSpelling(text);
      
      expect(result.errors[0].suggestions[0].confidence).toBeGreaterThan(0.8);
      expect(result.errors[0].suggestions[0].word).toBe('elephant');
    });
  });

  describe('suggestImprovements', () => {
    it('suggests vocabulary improvements', () => {
      const text = 'The thing was very big and very good.';
      const result = suggestImprovements(text);
      
      expect(result.vocabulary.length).toBeGreaterThan(0);
      expect(result.vocabulary[0].original).toBe('thing');
      expect(result.vocabulary[0].suggestions).toContain('object');
      expect(result.vocabulary[1].original).toBe('big');
      expect(result.vocabulary[1].suggestions).toContain('enormous');
    });

    it('suggests sentence structure improvements', () => {
      const text = 'The cat was black. The cat was fluffy. The cat was sleeping.';
      const result = suggestImprovements(text);
      
      expect(result.structure.length).toBeGreaterThan(0);
      expect(result.structure[0].type).toBe('repetitive');
      expect(result.structure[0].suggestion).toContain('combine');
    });

    it('suggests grammar improvements', () => {
      const text = 'Me and him went to the store yesterday.';
      const result = suggestImprovements(text);
      
      expect(result.grammar.length).toBeGreaterThan(0);
      expect(result.grammar[0].type).toBe('pronoun-case');
      expect(result.grammar[0].correction).toBe('He and I went to the store yesterday.');
    });

    it('suggests style improvements', () => {
      const text = 'It was a dark and stormy night. It was really dark. The storm was bad.';
      const result = suggestImprovements(text);
      
      expect(result.style.length).toBeGreaterThan(0);
      expect(result.style[0].type).toBe('show-dont-tell');
    });

    it('provides age-appropriate suggestions', () => {
      const text = 'The dog was happy.';
      const result = suggestImprovements(text, '7-9');
      
      // Should not suggest overly complex vocabulary for younger ages
      expect(result.vocabulary[0].suggestions).not.toContain('euphoric');
      expect(result.vocabulary[0].suggestions).toContain('joyful');
    });

    it('rates improvement urgency', () => {
      const text = 'There going to they\'re house over their.';
      const result = suggestImprovements(text);
      
      expect(result.grammar[0].urgency).toBe('high');
      expect(result.grammar[1].urgency).toBe('high');
    });
  });

  describe('Content Analysis Integration', () => {
    it('provides comprehensive content analysis', () => {
      const text = 'The childern had a grate advanture in the forrest.';
      const safety = checkContentSafety(text);
      const spelling = checkSpelling(text);
      const improvements = suggestImprovements(text);
      
      expect(safety.isSafe).toBe(true);
      expect(spelling.errors.length).toBeGreaterThan(0);
      expect(improvements.vocabulary.length).toBeGreaterThan(0);
    });

    it('handles edge cases gracefully', () => {
      const emptyText = '';
      const shortText = 'Hi.';
      const longText = 'word '.repeat(1000);
      
      expect(() => checkContentSafety(emptyText)).not.toThrow();
      expect(() => checkSpelling(shortText)).not.toThrow();
      expect(() => suggestImprovements(longText)).not.toThrow();
    });

    it('provides consistent scoring across functions', () => {
      const text = 'A wonderful story about friendship and adventure.';
      
      const safety = checkContentSafety(text);
      const ageAppropriate = validateAgeAppropriate(text, '7-9');
      const bullying = detectBullying(text);
      
      expect(safety.isSafe).toBe(true);
      expect(ageAppropriate).toBe(true);
      expect(bullying.isBullying).toBe(false);
    });
  });

  describe('Performance and Scalability', () => {
    it('processes content efficiently', () => {
      const largeText = 'This is a test sentence. '.repeat(100);
      const startTime = Date.now();
      
      checkContentSafety(largeText);
      checkSpelling(largeText);
      suggestImprovements(largeText);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('handles special characters and formatting', () => {
      const textWithFormatting = 'The story had **bold** text and *italic* text with émojis 😊.';
      
      expect(() => checkContentSafety(textWithFormatting)).not.toThrow();
      expect(() => checkSpelling(textWithFormatting)).not.toThrow();
    });

    it('processes multilingual content appropriately', () => {
      const multilingualText = 'Hello world. Hola mundo. Bonjour le monde.';
      const result = checkContentSafety(multilingualText);
      
      expect(result.isSafe).toBe(true);
      expect(result.language).toBe('mixed');
    });
  });
});