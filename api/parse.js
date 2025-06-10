import Parser from '@postlight/parser';

export default async function handler(req, res) {
  // Enable CORS for Make.com to access this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle both GET and POST requests
  let url;
  if (req.method === 'POST') {
    const body = req.body;
    url = body.url;
  } else {
    url = req.query.url;
  }

  if (!url) {
    return res.status(400).json({
      error: 'URL required',
      example: 'GET: https://your-app.vercel.app/api/parse?url=https://example.com/article OR POST: {"url": "https://example.com/article"}',
      method: req.method,
      received_query: req.query,
      received_body: req.body || {}
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({
      error: 'Invalid URL format',
      details: e.message,
      url: url
    });
  }

  try {
    // Parse the article
    let result;
    try {
      result = await Parser.parse(url);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse article',
        details: parseError.message,
        url: url
      });
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Parser returned empty result',
        url: url
      });
    }

    // Safely extract content with defaults
    const content = (result.content || '').toLowerCase();
    const title = (result.title || '').toLowerCase();
    const fullText = content + ' ' + title;

    // Content relevance signals for creative industry focus - comprehensive list
    const creativitySignals = [
      // Visual Design
      'designer', 'graphic design', 'visual design', 'ui design', 'ux design', 'ui/ux',
      'web design', 'branding', 'creative director', 'art director', 'illustrator',
      
      // 3D & Motion
      'animator', '3d artist', 'motion graphics', 'vfx artist', 'cgi', 'visual effects',
      
      // Architecture & Spatial
      'architect', 'interior designer', 'architectural', 'spatial design',
      
      // Fashion & Product
      'fashion designer', 'textile designer', 'product designer', 'industrial designer',
      
      // Photography & Video
      'photographer', 'photo editor', 'videographer', 'video editor', 'filmmaker',
      'cinematographer', 'director', 'post-production', 'colorist',
      
      // Audio & Music
      'musician', 'music producer', 'songwriter', 'composer', 'sound designer',
      'audio engineer', 'voice actor', 'voice over', 'podcast',
      
      // Writing & Content
      'writer', 'copywriter', 'content creator', 'journalist', 'author', 'editor',
      'content writer', 'creative writer', 'screenwriter', 'publisher',
      
      // Marketing & Advertising
      'marketing creative', 'advertising', 'social media', 'content strategist',
      
      // Games & Interactive
      'game designer', 'game developer', 'game artist', 'level designer',
      
      // General Creative Terms
      'artist', 'creative', 'creative professional', 'creative industry'
    ];

    const aiSignals = [
      'artificial intelligence', 'machine learning', 'ai', 'automation',
      'generative ai', 'chatgpt', 'midjourney', 'dall-e', 'stable diffusion',
      'neural network', 'algorithm', 'deepfake', 'llm', 'gpt', 'claude',
      'runway', 'leonardo', 'firefly', 'copilot', 'gemini'
    ];

    const jobImpactSignals = [
      'job', 'employment', 'workforce', 'replace', 'automate', 'future of work',
      'displacement', 'hiring', 'layoff', 'skills', 'career', 'industry',
      'freelance', 'gig economy', 'contract', 'income', 'livelihood'
    ];

    // Calculate relevance scores
    const creativityScore = creativitySignals.filter(signal =>
      fullText.includes(signal)
    ).length;

    const aiScore = aiSignals.filter(signal =>
      fullText.includes(signal)
    ).length;

    const jobImpactScore = jobImpactSignals.filter(signal =>
      fullText.includes(signal)
    ).length;

    // Calculate total relevance for auto-filtering
    const totalRelevance = creativityScore + aiScore + jobImpactScore;
    const isRelevant = (creativityScore > 0 && aiScore > 0) ||
                      (jobImpactScore > 2 && creativityScore > 0) ||
                      totalRelevance > 5;

    // Company mentions for tracking - comprehensive list
    const companies = [
      // AI Leaders
      'OpenAI', 'Anthropic', 'Google', 'Microsoft', 'Meta', 'Apple', 'Nvidia',
      // AI Creative Tools
      'Midjourney', 'Stability AI', 'Runway', 'Pika', 'Leonardo AI', 'Ideogram',
      'Eleven Labs', 'ElevenLabs', 'Suno', 'Udio', 'Perplexity',
      // Creative Software
      'Adobe', 'Canva', 'Figma', 'Sketch', 'Autodesk', 'Affinity', 'DaVinci Resolve',
      // Game/3D
      'Unity', 'Epic Games', 'Unreal Engine',
      // Content Platforms  
      'Spotify', 'Netflix', 'YouTube', 'TikTok', 'Instagram', 'Vimeo', 'Substack',
      // Creative Marketplaces
      'Behance', 'Dribbble', 'Shutterstock', 'Getty Images', 'Unsplash', 
      'Etsy', 'Patreon', 'Fiverr', 'Upwork'
    ];
    const companyMentions = companies.filter(company => {
      const lowerCompany = company.toLowerCase();
      return fullText.includes(lowerCompany);
    });

    // Urgency indicators for prioritization
    const urgencyWords = ['breaking', 'announced', 'launches', 'releases',
                         'new', 'first', 'major', 'significant', 'exclusive',
                         'just', 'today', 'yesterday'];
    const urgencyCount = urgencyWords.filter(word =>
      fullText.includes(word)
    ).length;

    // Cross-Industry Creative Sector Detection - comprehensive and consistent
    function detectCreativeSector(content, title) {
      const sectors = {
        design: [
          'designer', 'graphic design', 'visual design', 'branding', 
          'creative director', 'art director', 'illustrator', 'web design'
        ],
        ux_ui: [
          'ui design', 'ux design', 'ui/ux', 'user experience', 'user interface',
          'product designer', 'interaction design'
        ],
        architecture: [
          'architect', 'interior designer', 'architectural', 'spatial design',
          'interior design', 'architectural visualization'
        ],
        fashion: [
          'fashion designer', 'textile designer', 'fashion', 'apparel design',
          'costume designer', 'styling'
        ],
        three_d_motion: [
          'animator', '3d artist', 'motion graphics', 'vfx artist', 'cgi',
          'visual effects', '3d design', 'animation'
        ],
        photography: [
          'photographer', 'photo editor', 'photoshoot', 'camera', 'photography',
          'photo retoucher', 'photo manipulation'
        ],
        video_film: [
          'filmmaker', 'video editor', 'videographer', 'director', 'cinematographer',
          'post-production', 'colorist', 'film', 'video production'
        ],
        music_audio: [
          'musician', 'music producer', 'songwriter', 'composer', 'sound designer',
          'audio engineer', 'music production', 'voice actor', 'voice over',
          'podcast', 'audio production'
        ],
        writing_content: [
          'writer', 'copywriter', 'content creator', 'journalist', 'author',
          'editor', 'content writer', 'creative writer', 'screenwriter',
          'publisher', 'editorial', 'blogging'
        ],
        marketing: [
          'marketing creative', 'advertising', 'social media', 'content strategist',
          'brand strategist', 'creative strategist', 'campaign'
        ],
        gaming: [
          'game designer', 'game developer', 'game artist', 'level designer',
          'game design', 'gaming industry', 'video game'
        ]
      };
      
      const text = ((content || '') + ' ' + (title || '')).toLowerCase();
      const detectedSectors = [];
      
      for (const [sector, keywords] of Object.entries(sectors)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          detectedSectors.push(sector);
        }
      }
      
      // If no specific sector detected but has general creative signals
      if (detectedSectors.length === 0 && 
          ['creative', 'artist', 'creative professional', 'creative industry'].some(term => text.includes(term))) {
        return ['general_creative'];
      }
      
      return detectedSectors.length > 0 ? detectedSectors : ['none'];
    }

    // Career Impact Analysis
    function analyzeCareerImpact(content, title) {
      const text = ((content || '') + ' ' + (title || '')).toLowerCase();
      
      const impactSignals = {
        high: ['replace', 'automate', 'eliminate', 'reduce workforce', 'layoffs', 'obsolete'],
        medium: ['transform', 'change', 'adapt', 'reskill', 'evolve', 'shift'],
        low: ['supplement', 'assist', 'enhance', 'support', 'augment', 'help']
      };
      
      for (const [level, keywords] of Object.entries(impactSignals)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          return level;
        }
      }
      
      return 'unknown';
    }

    // Timeline Detection (optimized with pre-compiled patterns)
    function extractTimeline(content, title) {
      const text = (content || '') + ' ' + (title || '');
      const timelineMatches = [];
      
      // Year patterns
      const yearMatches = text.match(/\b(20\d{2})\b/g);
      if (yearMatches) timelineMatches.push(...yearMatches);
      
      // Relative time patterns
      const relativePatterns = [
        /next \d+ (?:months?|years?)/gi,
        /within \d+ (?:months?|years?)/gi,
        /by (?:end of )?20\d{2}/gi,
        /coming (?:months?|years?)/gi,
        /(?:immediate|soon|near-term|long-term)/gi
      ];
      
      relativePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) timelineMatches.push(...matches);
      });
      
      // Return unique matches, limited to 3
      return [...new Set(timelineMatches)].slice(0, 3);
    }

    function determineIntelligenceCategory(content, title) {
      const text = ((content || '') + ' ' + (title || '')).toLowerCase();
      
      if (text.includes('earnings') || text.includes('sec filing') || text.includes('quarterly')) {
        return 'Corporate Strategy';
      }
      if (text.includes('ceo') || text.includes('executive') || text.includes('leadership')) {
        return 'Executive Signal';
      }
      if (text.includes('skills') || text.includes('jobs') || text.includes('career')) {
        return 'Career Impact';
      }
      if (text.includes('tool') || text.includes('feature') || text.includes('update')) {
        return 'Tool Update';
      }
      
      return 'Industry Development';
    }

    function determineCategory(creativity, ai, jobImpact) {
      if (creativity > 2 && ai > 2) return 'Direct Creative AI Impact';
      if (jobImpact > 3) return 'Workforce Changes';
      if (ai > 3) return 'AI Technology Development';
      if (creativity > 1) return 'Creative Industry News';
      return 'General Tech';
    }

    // Extract potential company names from text
    function extractCapitalizedPhrases(text) {
      // Find potential company names (2-3 word capitalized phrases)
      const matches = text.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+){0,2}\b/g) || [];
      
      // Common words to exclude
      const excludeWords = [
        'The', 'This', 'That', 'These', 'Those', 'Many', 'Some', 'Most',
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December',
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ];
      
      return [...new Set(matches)]
        .filter(match => 
          !excludeWords.includes(match) &&
          match.length > 3 &&
          !match.match(/^[A-Z]+$/) // Exclude all-caps acronyms
        )
        .slice(0, 10); // Limit to 10 to keep response size reasonable
    }

    // Determine the type of article for pattern analysis
    function determineArticleType(text) {
      const lowerText = text.toLowerCase();
      
      if (/(?:funding|series [A-Z]|raises|raised \$|seed round|venture capital)/.test(text)) {
        return 'funding_news';
      }
      if (/(?:launches|debuts|ships|releases|unveils|introduces)/.test(lowerText)) {
        return 'product_launch';
      }
      if (/(?:acquires|acquired|merger|acquisition|buys|bought)/.test(lowerText)) {
        return 'acquisition';
      }
      if (/(?:partnership|partners with|collaboration|teams up|joins forces)/.test(lowerText)) {
        return 'partnership';
      }
      if (/(?:layoffs|cuts|downsizing|reduces workforce)/.test(lowerText)) {
        return 'workforce_reduction';
      }
      if (/(?:expands|expansion|grows|hiring|recruitment)/.test(lowerText)) {
        return 'expansion';
      }
      
      return 'general_news';
    }

    // Return Field Notes-specific structured data
    res.json({
      success: true,
      title: result.title || '',
      author: result.author || '',
      content: result.content || '',
      excerpt: result.excerpt || '',
      url: result.url || url,
      domain: result.domain || new URL(url).hostname,
      published_date: result.date_published || null,
      word_count: result.word_count || 0,
      lead_image: result.lead_image_url || null,

      // Field Notes Intelligence Analysis
      relevance_analysis: {
        creativity_signals: creativityScore,
        ai_signals: aiScore,
        job_impact_signals: jobImpactScore,
        total_relevance_score: totalRelevance,
        is_relevant_to_mission: isRelevant
      },

      // Enhanced Intelligence Fields (matching Airtable field names)
      creative_sectors: detectCreativeSector(result.content, result.title),
      'Career Impact Level': analyzeCareerImpact(result.content, result.title), // Match Airtable field name
      timeline_mentions: extractTimeline(result.content, result.title),
      cross_industry_potential: creativityScore > 1 && aiScore > 1,
      intelligence_category: determineIntelligenceCategory(result.content, result.title),

      // Content Classification
      content_category: determineCategory(creativityScore, aiScore, jobImpactScore),
      company_mentions: companyMentions,
      urgency_score: urgencyCount,

      // Audience Value Assessment
      audience_value: {
        helps_anxious_creatives: isRelevant && (creativityScore > 0 || jobImpactScore > 1),
        provides_actionable_info: jobImpactScore > 0 || urgencyCount > 2,
        relevant_for_career_planning: jobImpactScore > 1 || creativityScore > 2
      },

      // Future Intelligence Capabilities
      foia_potential: companyMentions.length > 0 || 
                     fullText.includes('policy') || 
                     fullText.includes('regulation') ||
                     fullText.includes('government'),
      needs_deeper_research: totalRelevance > 7 || urgencyCount > 3,

      // Discovery Metadata - helps identify emerging companies
      discovery_metadata: {
        contains_company_launch: /(?:launches|debuts|introduces|unveils)/.test(fullText),
        names_competitors: (fullText.match(/(?:competes with|alternative to|better than|unlike) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/gi) || [])
          .map(match => match.replace(/^(?:competes with|alternative to|better than|unlike)\s+/i, ''))
          .slice(0, 5),
        has_product_announcement: /(?:announces|announced|revealing|revealed)/.test(fullText),
        capitalized_entities: extractCapitalizedPhrases(fullText),
        article_type: determineArticleType(fullText),
        needs_entity_extraction: (
          totalRelevance > 5 && 
          !companyMentions.length &&
          (creativityScore > 0 || aiScore > 0)
        )
      },

      // Emerging Company Indicators
      emerging_company_indicators: {
        is_likely_new_player: (
          fullText.includes('startup') && 
          (aiScore > 0 || creativityScore > 0)
        ),
        mentions_competitor_to: companies.filter(company => {
          const pattern = new RegExp(`(?:alternative to|competes with|rival to|challenges?) ${company}`, 'i');
          return pattern.test(fullText);
        }),
        has_funding_news: /(?:raises|raised|funding|series [A-Z]|\$\d+[MBK]?\s*(?:million|billion)?)/i.test(fullText),
        has_launch_news: /(?:launches|launched|debuts|unveils)/i.test(fullText),
        has_acquisition: /(?:acquires|acquired|acquisition|buys)/i.test(fullText),
        mentions_startup: /(?:startup|new company|founded)/i.test(fullText),
        competitive_language: /(?:competes with|alternative to|rival|challenger|disrupting)/i.test(fullText)
      },

      // Parsing Metadata
      parsing_metadata: {
        parsed_at: new Date().toISOString(),
        parser_version: '1.0',
        content_length: result.content ? result.content.length : 0,
        has_content: !!result.content,
        has_title: !!result.title
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      url: url
    });
  }
}