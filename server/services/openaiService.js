const openai = require('../config/openai');

class OpenAIService {
  /**
   * Check if OpenAI is available
   */
  isAvailable() {
    return openai !== null;
  }

  /**
   * Analyze content for SEO optimization using OpenAI
   */
  async analyzeContent(title, content, targetKeywords = []) {
    if (!this.isAvailable()) {
      return this.getMockAnalysis(title, content, targetKeywords);
    }

    const prompt = `You are an expert SEO analyst. Analyze the following content for SEO optimization and provide a detailed analysis.

Title: ${title}

Content:
${content}

Target Keywords: ${targetKeywords.length > 0 ? targetKeywords.join(', ') : 'Not specified'}

Provide your analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": <number 0-100>,
  "scores": {
    "keywordDensity": <number 0-100>,
    "readability": <number 0-100>,
    "titleOptimization": <number 0-100>,
    "metaDescription": <number 0-100>,
    "headingStructure": <number 0-100>,
    "contentLength": <number 0-100>,
    "keywordPlacement": <number 0-100>
  },
  "suggestedKeywords": [
    {
      "keyword": "<keyword>",
      "relevance": <number 0-100>,
      "searchVolume": "<high|medium|low>",
      "difficulty": "<easy|medium|hard>"
    }
  ],
  "improvements": [
    {
      "category": "<Title|Meta Description|Content|Keywords|Structure|Readability>",
      "suggestion": "<specific actionable suggestion>",
      "priority": "<high|medium|low>",
      "impact": <number 1-10>
    }
  ],
  "aiInsights": "<2-3 sentences of overall insights and recommendations>",
  "suggestedTitle": "<optimized title suggestion>",
  "suggestedMetaDescription": "<optimized meta description under 160 characters>"
}

Important guidelines:
- Be specific and actionable in your suggestions
- Consider keyword placement in title, first paragraph, and throughout
- Evaluate readability for general audience (aim for 8th grade level)
- Suggest 5-8 relevant keywords
- Provide 4-6 improvement suggestions
- Keep meta description under 160 characters`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst. Always respond with valid JSON only, no additional text or markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const analysisText = response.choices[0].message.content.trim();
      
      // Parse JSON response
      let analysis;
      try {
        // Remove any markdown code blocks if present
        const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
        analysis = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        throw new Error('Failed to parse AI analysis response');
      }

      return analysis;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Generate improved content based on suggestions
   */
  async generateImprovedContent(originalContent, suggestion, category) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file to use AI features.');
    }

    const prompt = `You are an expert content editor specializing in SEO optimization.

Original Content:
${originalContent}

Improvement Suggestion:
Category: ${category}
Suggestion: ${suggestion}

Apply the suggestion to improve the content. Return ONLY the improved content, maintaining the original tone and style while incorporating the SEO improvement.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content editor. Apply the given SEO suggestion to improve the content. Return only the improved content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Generate keyword suggestions for a topic
   */
  async generateKeywordSuggestions(topic, existingKeywords = []) {
    if (!this.isAvailable()) {
      // Return mock keywords when OpenAI is not available
      return {
        keywords: [
          { keyword: `${topic} guide`, relevance: 85, searchVolume: 'medium', difficulty: 'medium', type: 'primary' },
          { keyword: `${topic} tips`, relevance: 80, searchVolume: 'high', difficulty: 'easy', type: 'secondary' },
          { keyword: `how to ${topic}`, relevance: 78, searchVolume: 'high', difficulty: 'medium', type: 'long-tail' },
          { keyword: `${topic} best practices`, relevance: 75, searchVolume: 'medium', difficulty: 'medium', type: 'secondary' },
          { keyword: `${topic} examples`, relevance: 70, searchVolume: 'medium', difficulty: 'easy', type: 'long-tail' }
        ]
      };
    }

    const prompt = `Generate SEO keyword suggestions for the following topic.

Topic: ${topic}
Existing Keywords: ${existingKeywords.length > 0 ? existingKeywords.join(', ') : 'None'}

Provide 10 keyword suggestions in the following JSON format ONLY:
{
  "keywords": [
    {
      "keyword": "<keyword phrase>",
      "relevance": <number 0-100>,
      "searchVolume": "<high|medium|low>",
      "difficulty": "<easy|medium|hard>",
      "type": "<primary|secondary|long-tail>"
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO keyword research expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const text = response.choices[0].message.content.trim();
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Generate content outline based on keywords
   */
  async generateContentOutline(topic, keywords) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file to use AI features.');
    }

    const prompt = `Create an SEO-optimized content outline for the following:

Topic: ${topic}
Target Keywords: ${keywords.join(', ')}

Provide the outline in JSON format:
{
  "suggestedTitle": "<SEO-optimized title>",
  "metaDescription": "<under 160 characters>",
  "outline": [
    {
      "heading": "<H2 heading>",
      "subheadings": ["<H3>", "<H3>"],
      "keyPoints": ["<point>", "<point>"]
    }
  ],
  "estimatedWordCount": <number>,
  "keywordPlacement": {
    "title": "<keyword to include>",
    "introduction": ["<keywords>"],
    "body": ["<keywords>"],
    "conclusion": ["<keywords>"]
  }
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO content strategist. Create detailed content outlines optimized for search engines. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const text = response.choices[0].message.content.trim();
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Generate mock analysis when OpenAI is not available
   */
  getMockAnalysis(title, content, targetKeywords) {
    const wordCount = content.split(/\s+/).length;
    const hasTitle = title.length > 0;
    const hasKeywords = targetKeywords.length > 0;
    
    // Calculate basic scores
    const titleScore = hasTitle ? (title.length >= 30 && title.length <= 60 ? 80 : 60) : 20;
    const contentScore = wordCount > 1000 ? 85 : wordCount > 500 ? 70 : wordCount > 200 ? 55 : 40;
    const keywordScore = hasKeywords ? 70 : 40;
    
    const overallScore = Math.round((titleScore + contentScore + keywordScore) / 3);

    return {
      overallScore,
      scores: {
        keywordDensity: keywordScore,
        readability: 65,
        titleOptimization: titleScore,
        metaDescription: 50,
        headingStructure: 60,
        contentLength: contentScore,
        keywordPlacement: hasKeywords ? 65 : 40
      },
      suggestedKeywords: [
        { keyword: 'content optimization', relevance: 85, searchVolume: 'medium', difficulty: 'medium' },
        { keyword: 'SEO best practices', relevance: 80, searchVolume: 'high', difficulty: 'hard' },
        { keyword: 'digital content', relevance: 75, searchVolume: 'medium', difficulty: 'easy' },
        { keyword: 'search ranking', relevance: 70, searchVolume: 'medium', difficulty: 'medium' },
        { keyword: 'content strategy', relevance: 68, searchVolume: 'high', difficulty: 'medium' }
      ],
      improvements: [
        { category: 'Content', suggestion: 'Add more detailed examples and case studies to increase engagement', priority: 'high', impact: 8 },
        { category: 'Keywords', suggestion: 'Include target keywords in the first 100 words', priority: 'high', impact: 7 },
        { category: 'Structure', suggestion: 'Add more subheadings (H2, H3) to improve readability', priority: 'medium', impact: 6 },
        { category: 'Meta Description', suggestion: 'Create a compelling meta description under 160 characters', priority: 'medium', impact: 5 },
        { category: 'Title', suggestion: 'Consider adding a number or power word to the title', priority: 'low', impact: 4 }
      ],
      aiInsights: '⚠️ This is a basic analysis (OpenAI API key not configured). For detailed AI-powered insights, please add your OPENAI_API_KEY to the .env file. Basic SEO metrics have been calculated based on content length, title, and keyword presence.',
      suggestedTitle: title || 'Add a compelling, keyword-rich title',
      suggestedMetaDescription: 'Configure OpenAI API for AI-generated meta description suggestions tailored to your content.'
    };
  }
}

module.exports = new OpenAIService();
