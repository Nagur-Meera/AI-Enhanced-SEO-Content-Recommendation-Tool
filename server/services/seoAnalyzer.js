/**
 * SEO Analysis Helper Functions
 * Basic SEO metrics calculation without AI
 */

class SEOAnalyzer {
  /**
   * Calculate basic SEO metrics
   */
  analyzeBasicMetrics(title, content, targetKeywords = []) {
    const metrics = {
      wordCount: this.getWordCount(content),
      characterCount: content.length,
      sentenceCount: this.getSentenceCount(content),
      paragraphCount: this.getParagraphCount(content),
      readingTime: this.calculateReadingTime(content),
      keywordAnalysis: this.analyzeKeywords(content, targetKeywords),
      titleAnalysis: this.analyzeTitle(title, targetKeywords),
      readabilityScore: this.calculateReadability(content)
    };

    return metrics;
  }

  /**
   * Get word count
   */
  getWordCount(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get sentence count
   */
  getSentenceCount(text) {
    if (!text) return 0;
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  /**
   * Get paragraph count
   */
  getParagraphCount(text) {
    if (!text) return 0;
    return text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  }

  /**
   * Calculate reading time in minutes
   */
  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Analyze keyword usage
   */
  analyzeKeywords(content, keywords) {
    if (!content || keywords.length === 0) {
      return { density: 0, found: [], missing: keywords };
    }

    const contentLower = content.toLowerCase();
    const wordCount = this.getWordCount(content);
    const analysis = {
      found: [],
      missing: [],
      totalOccurrences: 0,
      density: 0
    };

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const regex = new RegExp(keywordLower, 'gi');
      const matches = contentLower.match(regex);
      const count = matches ? matches.length : 0;

      if (count > 0) {
        analysis.found.push({
          keyword,
          count,
          density: ((count / wordCount) * 100).toFixed(2)
        });
        analysis.totalOccurrences += count;
      } else {
        analysis.missing.push(keyword);
      }
    });

    analysis.density = ((analysis.totalOccurrences / wordCount) * 100).toFixed(2);
    return analysis;
  }

  /**
   * Analyze title for SEO
   */
  analyzeTitle(title, keywords) {
    if (!title) {
      return {
        length: 0,
        score: 0,
        issues: ['Title is missing'],
        suggestions: ['Add a descriptive title']
      };
    }

    const analysis = {
      length: title.length,
      score: 100,
      issues: [],
      suggestions: [],
      hasKeyword: false
    };

    // Check title length (optimal: 50-60 characters)
    if (title.length < 30) {
      analysis.issues.push('Title is too short');
      analysis.suggestions.push('Expand title to 50-60 characters');
      analysis.score -= 20;
    } else if (title.length > 60) {
      analysis.issues.push('Title may be truncated in search results');
      analysis.suggestions.push('Shorten title to under 60 characters');
      analysis.score -= 10;
    }

    // Check for keyword in title
    if (keywords.length > 0) {
      const titleLower = title.toLowerCase();
      const hasKeyword = keywords.some(kw => titleLower.includes(kw.toLowerCase()));
      analysis.hasKeyword = hasKeyword;
      
      if (!hasKeyword) {
        analysis.issues.push('Primary keyword not found in title');
        analysis.suggestions.push('Include your primary keyword in the title');
        analysis.score -= 25;
      }
    }

    // Check if title starts with a number or power word
    const startsWithNumber = /^\d/.test(title);
    const powerWords = ['ultimate', 'complete', 'essential', 'proven', 'best', 'top', 'how to', 'guide'];
    const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));

    if (!startsWithNumber && !hasPowerWord) {
      analysis.suggestions.push('Consider starting with a number or adding a power word');
    }

    return analysis;
  }

  /**
   * Calculate basic readability score (Flesch-Kincaid inspired)
   */
  calculateReadability(text) {
    if (!text || text.length === 0) return 0;

    const words = this.getWordCount(text);
    const sentences = this.getSentenceCount(text);
    const syllables = this.countSyllables(text);

    if (words === 0 || sentences === 0) return 0;

    // Simplified Flesch Reading Ease formula
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    let score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      level: this.getReadabilityLevel(score),
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2)
    };
  }

  /**
   * Count syllables in text (simplified)
   */
  countSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let count = 0;

    words.forEach(word => {
      // Simple syllable counting
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const syllables = word.match(/[aeiouy]{1,2}/g);
      count += syllables ? syllables.length : 1;
    });

    return count;
  }

  /**
   * Get readability level description
   */
  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College Graduate)';
  }

  /**
   * Generate SEO checklist
   */
  generateChecklist(title, content, metaDescription, keywords) {
    const checklist = [];
    const wordCount = this.getWordCount(content);

    // Title checks
    checklist.push({
      item: 'Title length (50-60 chars)',
      passed: title && title.length >= 50 && title.length <= 60,
      current: title ? `${title.length} characters` : 'No title'
    });

    checklist.push({
      item: 'Keyword in title',
      passed: keywords.some(kw => title?.toLowerCase().includes(kw.toLowerCase())),
      current: keywords.length > 0 ? 'Check keywords' : 'No keywords set'
    });

    // Meta description checks
    checklist.push({
      item: 'Meta description length (150-160 chars)',
      passed: metaDescription && metaDescription.length >= 150 && metaDescription.length <= 160,
      current: metaDescription ? `${metaDescription.length} characters` : 'No meta description'
    });

    // Content checks
    checklist.push({
      item: 'Minimum word count (300+ words)',
      passed: wordCount >= 300,
      current: `${wordCount} words`
    });

    checklist.push({
      item: 'Optimal word count (1000+ words)',
      passed: wordCount >= 1000,
      current: `${wordCount} words`
    });

    // Keyword density
    const keywordAnalysis = this.analyzeKeywords(content, keywords);
    checklist.push({
      item: 'Keyword density (1-3%)',
      passed: parseFloat(keywordAnalysis.density) >= 1 && parseFloat(keywordAnalysis.density) <= 3,
      current: `${keywordAnalysis.density}%`
    });

    return checklist;
  }
}

module.exports = new SEOAnalyzer();
