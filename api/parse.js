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

  try {
    const result = await Parser.parse(url);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse article',
        url: url
      });
    }

    // Content relevance signals for creative industry focus
    const content = result.content?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';
    const fullText = content + ' ' + title;

    const creativitySignals = [
      'artist', 'designer', 'writer', 'musician', 'creative', 'content creator',
      'video editor', 'photographer', 'animator', 'illustrator', 'copywriter',
      'film', 'music production', 'graphic design', 'marketing creative'
    ];

    const aiSignals = [
      'artificial intelligence', 'machine learning', 'ai', 'automation',
      'generative ai', 'chatgpt', 'midjourney', 'dall-e', 'stable diffusion',
      'neural network', 'algorithm', 'deepfake'
    ];

    const jobImpactSignals = [
      'job', 'employment', 'workforce', 'replace', 'automate', 'future of work',
      'displacement', 'hiring', 'layoff', 'skills', 'career', 'industry'
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

    // Company mentions for tracking
    const companies = ['OpenAI', 'Adobe', 'Google', 'Microsoft', 'Meta', 'Apple',
                      'Nvidia', 'Stability AI', 'Anthropic', 'Midjourney'];
    const companyMentions = companies.filter(company =>
      fullText.includes(company.toLowerCase())
    );

    // Urgency indicators for prioritization
    const urgencyWords = ['breaking', 'announced', 'launches', 'releases',
                         'new', 'first', 'major', 'significant', 'exclusive'];
    const urgencyCount = urgencyWords.filter(word =>
      fullText.includes(word)
    ).length;

    // Cross-Industry Creative Sector Detection
    function detectCreativeSector(content, title) {
      const sectors = {
        design: ['designer', 'graphic design', 'visual design', 'UI/UX', 'branding', 'creative director'],
        music: ['musician', 'music producer', 'songwriter', 'audio', 'streaming', 'record label'],
        film: ['filmmaker', 'video editor', 'director', 'cinematographer', 'post-production', 'VFX'],
        marketing: ['copywriter', 'content creator', 'social media', 'advertising', 'marketing creative'],
        writing: ['writer', 'journalist', 'content writer', 'editor', 'publisher', 'author']
      };
      
      const text = (content + ' ' + title).toLowerCase();
      const detectedSectors = [];
      
      for (const [sector, keywords] of Object.entries(sectors)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          detectedSectors.push(sector);
        }
      }
      
      return detectedSectors.length > 0 ? detectedSectors : ['general'];
    }

    // Career Impact Analysis
    function analyzeCareerImpact(content, title) {
  const text = (content + ' ' + title).toLowerCase();
  
  const impactSignals = {
    high: [
      // Direct displacement
      'replace', 'automate', 'eliminate', 'reduce workforce', 'layoffs',
      // Market disruption  
      'disrupts', 'threatens', 'challenges traditional', 'makes obsolete',
      // Major shifts
      'fundamental change', 'industry transformation', 'new era'
    ],
    medium: [
      // Adaptation required
      'transform', 'change', 'adapt', 'reskill', 'evolve', 'shift',
      // New tools/processes
      'new workflow', 'changes how', 'different approach', 'updated skills',
      // Competitive pressure
      'competitive advantage', 'stay relevant', 'keep up'
    ],
    low: [
      // Assistance/enhancement
      'supplement', 'assist', 'enhance', 'support', 'augment', 'helps with',
      // Optional tools
      'option for', 'available to', 'can use', 'might help'
    ]
  };
  
  // Score each level
  let highScore = 0, mediumScore = 0, lowScore = 0;
  
  for (const keyword of impactSignals.high) {
    if (text.includes(keyword)) highScore++;
  }
  for (const keyword of impactSignals.medium) {
    if (text.includes(keyword)) mediumScore++;
  }
  for (const keyword of impactSignals.low) {
    if (text.includes(keyword)) lowScore++;
  }
  
  // Return highest scoring category
  if (highScore > 0) return 'high';
  if (mediumScore > 0) return 'medium';
  if (lowScore > 0) return 'low';
  
  return 'unknown';

    }

    // Timeline Detection
    function extractTimeline(content, title) {
      const text = content + ' ' + title;
      const timelinePatterns = [
        /(\d{4})/g,
        /(next \d+ months?)/gi,
        /(within \d+ years?)/gi,
        /(by \d{4})/gi,
        /(coming months?)/gi,
        /(immediate|soon|near-term|long-term)/gi
      ];
      
      const timelines = [];
      timelinePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) timelines.push(...matches);
      });
      
      return timelines.slice(0, 3);
    }

    function determineIntelligenceCategory(content, title) {
      const text = (content + ' ' + title).toLowerCase();
      
      if (text.includes('earnings') || text.includes('sec filing') || text.includes('quarterly')) {
        return 'Corporate Strategy';
      }
      if (text.includes('ceo') || text.includes('executive') || text.includes('leadership')) {
        return 'Executive Signal';
      }
      if (text.includes('skills') || text.includes('jobs') || text.includes('career')) {
        return 'Career Impact';
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

    // Return Field Notes-specific structured data
    res.json({
      success: true,
      title: result.title,
      author: result.author,
      content: result.content,
      excerpt: result.excerpt,
      url: result.url,
      domain: result.domain,
      published_date: result.date_published,
      word_count: result.word_count,
      lead_image: result.lead_image_url,

      // Field Notes Intelligence Analysis
      relevance_analysis: {
        creativity_signals: creativityScore,
        ai_signals: aiScore,
        job_impact_signals: jobImpactScore,
        total_relevance_score: totalRelevance,
        is_relevant_to_mission: isRelevant
      },

      // Enhanced Intelligence Fields
      creative_sectors: detectCreativeSector(result.content || '', result.title || ''),
      career_impact_level: analyzeCareerImpact(result.content || '', result.title || ''),
      timeline_mentions: extractTimeline(result.content || '', result.title || ''),
      cross_industry_potential: creativityScore > 1 && aiScore > 1,
      intelligence_category: determineIntelligenceCategory(result.content || '', result.title || ''),

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
                     fullText.includes('regulation'),
      needs_deeper_research: totalRelevance > 7 || urgencyCount > 3,

      // Debug Information
      debug: {
        method_used: req.method,
        url_received: url,
        creativity_keywords_found: creativityScore,
        ai_keywords_found: aiScore,
        job_impact_keywords_found: jobImpactScore
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Parse failed',
      details: error.message,
      url: url
    });
  }
}
