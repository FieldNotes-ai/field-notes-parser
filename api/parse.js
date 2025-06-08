import Parser from '@postlight/parser';

export default async function handler(req, res) {
  // Enable CORS for Make.com to access this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle both GET and POST requests for URL parameter
  let url;
  if (req.method === 'POST') {
    // Handle POST request with JSON body
    const body = req.body;
    url = body?.url;
  } else {
    // Handle GET request with query parameter
    url = req.query.url;
  }
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL required',
      example: 'GET: https://your-app.vercel.app/api/parse?url=https://example.com/article OR POST: {"url": "https://example.com/article"}',
      method: req.method,
      received_query: req.query,
      received_body: req.body
    });
  }
  
  try {
    console.log('Parsing URL:', url, 'Method:', req.method);
    const result = await Parser.parse(url);
    
    // Field Notes Intelligence: Focus on creative industry + AI impact
    const content = (result.content || '').toLowerCase();
    const title = (result.title || '').toLowerCase();
    const fullText = content + ' ' + title;
    
    // Creative industry signals
    const creativitySignals = [
      'artist', 'designer', 'writer', 'musician', 'creative', 'content creator',
      'video editor', 'photographer', 'animator', 'illustrator', 'copywriter',
      'film', 'music production', 'graphic design', 'marketing creative',
      'game developer', 'web designer', 'art director', 'creative director',
      'journalist', 'blogger', 'screenwriter', 'producer', 'director'
    ];
    
    // AI technology signals
    const aiSignals = [
      'artificial intelligence', 'machine learning', 'ai', 'automation',
      'generative ai', 'chatgpt', 'gpt-4', 'midjourney', 'dall-e', 'stable diffusion',
      'neural network', 'algorithm', 'deepfake', 'claude', 'bard', 'copilot',
      'large language model', 'llm', 'text-to-image', 'text-to-video'
    ];
    
    // Job impact signals (what your audience cares about most)
    const jobImpactSignals = [
      'job', 'employment', 'workforce', 'replace', 'automate', 'future of work',
      'displacement', 'hiring', 'layoff', 'skills', 'career', 'industry',
      'human vs ai', 'obsolete', 'redundant', 'efficiency', 'productivity',
      'threat', 'opportunity', 'reskill', 'upskill', 'adapt'
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
    
    // Extract company mentions for future FOIA targeting
    const companies = ['openai', 'adobe', 'google', 'microsoft', 'meta', 'apple', 
                      'nvidia', 'stability ai', 'anthropic', 'midjourney', 'canva',
                      'figma', 'autodesk', 'unity', 'epic games', 'disney', 'netflix'];
    
    const companyMentions = companies.filter(company => 
      fullText.includes(company)
    );
    
    // Determine content category for Airtable organization
    let contentCategory = 'General Tech';
    if (creativityScore > 2 && aiScore > 2) {
      contentCategory = 'Direct Creative AI Impact';
    } else if (jobImpactScore > 3) {
      contentCategory = 'Workforce Changes';
    } else if (aiScore > 3 && creativityScore > 0) {
      contentCategory = 'AI Technology for Creatives';
    } else if (creativityScore > 1) {
      contentCategory = 'Creative Industry News';
    }
    
    // Calculate total relevance for auto-filtering
    const totalRelevance = creativityScore + aiScore + jobImpactScore;
    const isRelevant = (creativityScore > 0 && aiScore > 0) || 
                      (jobImpactScore > 2 && creativityScore > 0) ||
                      totalRelevance > 5;
    
    // Urgency indicators for prioritization
    const urgencyWords = ['breaking', 'announced', 'launches', 'releases', 
                         'new', 'first', 'major', 'significant', 'exclusive'];
    const urgencyCount = urgencyWords.filter(word => 
      fullText.includes(word)
    ).length;
    Yes! Add the entire code block right at line 116 (after the } and before the // Return Field Notes-specific structured data comment).
Here's exactly where to place it:
javascript// Line 115
    ).length;
}  // ← This closing brace is line 115

// ADD ALL THE NEW FUNCTIONS HERE (starting at line 116)

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
    high: ['replace', 'automate', 'eliminate', 'reduce workforce', 'layoffs'],
    medium: ['transform', 'change', 'adapt', 'reskill', 'evolve'],
    low: ['supplement', 'assist', 'enhance', 'support', 'augment']
  };
  
  for (const [level, keywords] of Object.entries(impactSignals)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return level;
    }
  }
  
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
      
      // Content categorization for Airtable
      content_category: contentCategory,
      company_mentions: companyMentions,
      urgency_score: urgencyCount,
      
      // Audience value assessment
      audience_value: {
        helps_anxious_creatives: creativityScore > 0 && (aiScore > 1 || jobImpactScore > 1),
        provides_actionable_info: jobImpactScore > 2 || urgencyCount > 1,
        relevant_for_career_planning: jobImpactScore > 1 && creativityScore > 0
      },
      
      // Future FOIA preparation
      foia_potential: companyMentions.length > 0 && totalRelevance > 4,
      needs_deeper_research: aiScore > 3 && creativityScore > 2,
      
      // Debug info
      debug: {
        method_used: req.method,
        url_received: url
      }
    });
    
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Parse failed', 
      details: error.message,
      url: url,
      method: req.method
    });
  }
}
