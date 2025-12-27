require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Content = require('../models/Content');
const Revision = require('../models/Revision');
const SEOAnalysis = require('../models/SEOAnalysis');

const sampleContent = [
  {
    title: "The Complete Guide to Content Marketing in 2024",
    content: `Content marketing has evolved significantly over the years, becoming one of the most effective strategies for businesses of all sizes. In this comprehensive guide, we'll explore the key principles, strategies, and best practices that will help you succeed in content marketing.

What is Content Marketing?

Content marketing is a strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience. Unlike traditional advertising, content marketing aims to provide value to your audience rather than directly promoting your products or services.

Why Content Marketing Matters

In today's digital landscape, consumers are bombarded with advertisements and promotional messages. Content marketing cuts through this noise by offering something of value. Here are some key benefits:

1. Builds Trust and Authority: By consistently providing valuable content, you establish your brand as a thought leader in your industry.

2. Improves SEO: Quality content helps improve your search engine rankings, making it easier for potential customers to find you.

3. Generates Leads: Effective content attracts qualified leads who are genuinely interested in what you have to offer.

4. Cost-Effective: Compared to traditional advertising, content marketing delivers a higher ROI over time.

Content Marketing Strategies

To succeed in content marketing, you need a well-defined strategy. Here are the essential components:

Know Your Audience: Understanding your target audience is crucial. Create detailed buyer personas to guide your content creation.

Set Clear Goals: Define what you want to achieve with your content marketing efforts. Whether it's brand awareness, lead generation, or customer retention, having clear goals helps measure success.

Create a Content Calendar: Plan your content in advance to ensure consistency and alignment with your marketing objectives.

Diversify Your Content: Use various content formats including blog posts, videos, infographics, podcasts, and social media posts to reach different audience segments.

Measuring Success

Track key metrics to evaluate your content marketing performance:
- Website traffic and engagement
- Social media shares and comments
- Lead generation and conversion rates
- Search engine rankings
- Brand mentions and awareness

Conclusion

Content marketing is not just a trend; it's a fundamental shift in how businesses connect with their audiences. By providing value through quality content, you can build lasting relationships with your customers and drive sustainable business growth.`,
    metaDescription: "Learn the essential strategies and best practices for content marketing success in 2024. A comprehensive guide for marketers.",
    targetKeywords: ["content marketing", "digital marketing", "marketing strategy", "SEO", "lead generation"],
    status: "optimized",
    currentSEOScore: 75
  },
  {
    title: "10 SEO Best Practices Every Website Owner Should Know",
    content: `Search Engine Optimization (SEO) is essential for any website looking to increase its visibility and attract organic traffic. Whether you're running a small blog or a large e-commerce site, these SEO best practices will help you improve your search rankings.

1. Keyword Research and Optimization

The foundation of good SEO starts with understanding what your audience is searching for. Use tools like Google Keyword Planner, SEMrush, or Ahrefs to identify relevant keywords with good search volume and manageable competition.

When optimizing for keywords:
- Include your primary keyword in the title, first paragraph, and throughout the content
- Use related keywords and synonyms naturally
- Avoid keyword stuffing, which can hurt your rankings

2. Create High-Quality Content

Search engines prioritize content that provides value to users. Focus on creating comprehensive, well-researched content that answers your audience's questions.

Tips for quality content:
- Write in-depth articles (1000+ words for competitive topics)
- Use clear headings and subheadings
- Include relevant images and multimedia
- Update content regularly to keep it fresh

3. Optimize Page Titles and Meta Descriptions

Your page title and meta description are often the first things users see in search results. Make them compelling and include your target keywords.

Best practices:
- Keep titles under 60 characters
- Write meta descriptions between 150-160 characters
- Make them actionable and engaging

4. Improve Site Speed

Page speed is a crucial ranking factor. Users expect pages to load quickly, and search engines reward fast-loading sites.

How to improve speed:
- Compress images
- Enable browser caching
- Use a content delivery network (CDN)
- Minimize CSS and JavaScript

5. Mobile Optimization

With mobile-first indexing, ensuring your site works well on mobile devices is more important than ever.

6. Build Quality Backlinks

Backlinks from reputable sites signal to search engines that your content is valuable and trustworthy.

7. Use Internal Linking

Internal links help search engines understand your site structure and distribute page authority throughout your site.

8. Optimize Images

Use descriptive file names and alt text for all images. This helps with image search and accessibility.

9. Secure Your Site with HTTPS

Security is a ranking factor. Ensure your site uses HTTPS encryption.

10. Monitor and Analyze

Use Google Analytics and Search Console to track your performance and identify areas for improvement.

Implementing these SEO best practices takes time and effort, but the results are worth it. Start with the basics and gradually implement more advanced techniques as you grow.`,
    metaDescription: "Discover 10 essential SEO best practices to improve your website's search rankings and drive more organic traffic.",
    targetKeywords: ["SEO best practices", "search engine optimization", "website ranking", "organic traffic", "keyword optimization"],
    status: "optimized",
    currentSEOScore: 82
  },
  {
    title: "How to Write Compelling Blog Posts That Engage Readers",
    content: `Writing blog posts that capture and hold your readers' attention is both an art and a science. In this article, we'll explore proven techniques to create engaging content that keeps readers coming back for more.

The Power of Headlines

Your headline is the first impression readers get of your content. A compelling headline can mean the difference between a click and a scroll-past.

Tips for writing effective headlines:
- Use numbers and lists (e.g., "7 Ways to...")
- Create curiosity
- Promise a benefit
- Keep it concise but descriptive

Crafting an Engaging Introduction

The first few sentences of your post are crucial. You need to hook readers immediately and convince them to keep reading.

Effective opening techniques:
- Start with a surprising statistic
- Ask a thought-provoking question
- Share a brief, relevant story
- Address a common problem or pain point

Structure for Readability

Online readers scan content before deciding to read in full. Make your posts easy to scan with:

- Short paragraphs (2-3 sentences)
- Descriptive subheadings
- Bullet points and numbered lists
- Bold text for key points
- Relevant images to break up text

Write Like You Talk

Conversational writing feels more personal and engaging. While maintaining professionalism, aim for a friendly, approachable tone.

Add Value with Every Post

Every piece of content you publish should provide real value to your readers. Ask yourself: "What will readers gain from this post?"

Include a Clear Call to Action

End your posts with a clear next step for readers. Whether it's leaving a comment, sharing the post, or signing up for a newsletter, guide your readers on what to do next.

Edit and Polish

Great writing is rewriting. Always edit your posts before publishing:
- Check for grammar and spelling errors
- Improve clarity and flow
- Remove unnecessary words
- Read aloud to catch awkward phrasing

By implementing these techniques, you'll create blog posts that not only attract readers but keep them engaged from start to finish.`,
    metaDescription: "Learn how to write blog posts that capture attention and keep readers engaged. Tips for headlines, structure, and content.",
    targetKeywords: ["blog writing", "engaging content", "content creation", "blogging tips", "writing techniques"],
    status: "draft",
    currentSEOScore: 58
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Content.deleteMany({});
    await Revision.deleteMany({});
    await SEOAnalysis.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword
    });
    console.log('Created demo user: demo@example.com / demo123');

    // Create sample content
    for (const contentData of sampleContent) {
      const content = await Content.create({
        userId: user._id,
        ...contentData
      });

      // Create initial revision
      const revision = await Revision.create({
        contentId: content._id,
        version: 1,
        title: content.title,
        content: content.content,
        seoScore: content.currentSEOScore,
        changes: 'Initial draft created',
        wordCount: content.wordCount
      });

      // Create sample SEO analysis for optimized content
      if (content.status === 'optimized') {
        const analysis = await SEOAnalysis.create({
          contentId: content._id,
          revisionId: revision._id,
          overallScore: content.currentSEOScore,
          scores: {
            keywordDensity: Math.floor(Math.random() * 30) + 60,
            readability: Math.floor(Math.random() * 30) + 60,
            titleOptimization: Math.floor(Math.random() * 30) + 60,
            metaDescription: Math.floor(Math.random() * 30) + 60,
            headingStructure: Math.floor(Math.random() * 30) + 60,
            contentLength: Math.floor(Math.random() * 30) + 60,
            keywordPlacement: Math.floor(Math.random() * 30) + 60
          },
          suggestedKeywords: [
            { keyword: 'digital strategy', relevance: 85, searchVolume: 'high', difficulty: 'medium' },
            { keyword: 'online marketing', relevance: 78, searchVolume: 'high', difficulty: 'hard' },
            { keyword: 'brand awareness', relevance: 72, searchVolume: 'medium', difficulty: 'easy' },
            { keyword: 'marketing tips', relevance: 68, searchVolume: 'medium', difficulty: 'easy' },
            { keyword: 'business growth', relevance: 65, searchVolume: 'high', difficulty: 'medium' }
          ],
          improvements: [
            { category: 'Title', suggestion: 'Add power words to make the title more compelling', priority: 'medium', impact: 6 },
            { category: 'Content', suggestion: 'Add more internal links to related articles', priority: 'high', impact: 8 },
            { category: 'Keywords', suggestion: 'Include target keyword in the first 100 words', priority: 'high', impact: 7 },
            { category: 'Structure', suggestion: 'Add a table of contents for better navigation', priority: 'low', impact: 4 }
          ],
          aiInsights: 'This content demonstrates good SEO fundamentals with room for improvement. Consider adding more specific examples and case studies to increase engagement. The keyword distribution is good but could be more naturally integrated throughout the content.',
          suggestedTitle: 'The Ultimate Guide to Content Marketing: Strategies That Work in 2024',
          suggestedMetaDescription: 'Master content marketing with our comprehensive 2024 guide. Learn proven strategies, best practices, and tips to grow your audience and boost engagement.'
        });

        // Update content and revision with analysis reference
        content.latestAnalysis = analysis._id;
        await content.save();

        revision.analysis = analysis._id;
        await revision.save();
      }

      // Update content with revision reference
      content.revisions.push(revision._id);
      await content.save();

      console.log(`Created sample content: "${content.title}"`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Account:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
