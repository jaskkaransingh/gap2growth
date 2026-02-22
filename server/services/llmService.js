const { GoogleGenerativeAI } = require('@google/generative-ai');

// Order of models to try — each has its own free-tier quota
const MODELS_TO_TRY = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const analyzeResume = async (resumeText, marketData = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const resumeSnippet = resumeText.substring(0, 12000);
  const marketContext = Object.keys(marketData).length > 0
    ? `\nMarket Data (current demand for skills):\n${JSON.stringify(marketData, null, 2)}`
    : '';

  const prompt = `You are an expert ATS system and technical career coach.
Analyze the resume text below and return a JSON object with detailed technical analysis.

Resume Text:
"""
${resumeSnippet}
"""
${marketContext}

CRITICAL: Output ONLY a raw JSON object with NO markdown, NO code fences, NO explanation.
The JSON must follow this EXACT structure:
{
  "personalInfo": {
    "name": "Full name from resume",
    "email": "email address",
    "phone": "phone number"
  },
  "skills": {
    "languages": ["list of programming languages found — e.g. Python, JavaScript, Java"],
    "frameworks": ["list of frameworks/libraries — e.g. React, Django, Spring Boot"],
    "tools": ["list of tools/platforms/databases — e.g. Docker, AWS, PostgreSQL, Git"],
    "softSkills": ["leadership", "communication", etc.]
  },
  "metrics": {
    "skillHealth": 75,
    "marketRelevance": 80,
    "experienceLevel": "Mid-Level"
  },
  "gaps": ["missing skill 1", "missing skill 2"],
  "recommendations": [
    { "title": "Learn X", "reason": "Because Y is in high demand" }
  ]
}

Rules:
- skillHealth: integer 0-100, based on depth and breadth of technical skills  
- marketRelevance: integer 0-100, based on how relevant the skills are to current job market
- experienceLevel: must be one of "Junior", "Mid-Level", "Senior", "Lead"
- gaps: 3-5 specific skills the candidate is missing for their apparent role
- recommendations: 3-5 actionable steps to improve employability
- ALL integers must be plain numbers, NOT strings`;

  // Try each model in order
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[LLM] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log(`[LLM] Got response from ${modelName}, length: ${text.length}`);

      // Strip markdown fences
      text = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      // Ensure metrics are numbers
      if (parsed.metrics) {
        parsed.metrics.skillHealth = parseInt(parsed.metrics.skillHealth) || 0;
        parsed.metrics.marketRelevance = parseInt(parsed.metrics.marketRelevance) || 0;
        parsed.metrics.experienceLevel = parsed.metrics.experienceLevel || 'Unknown';
      }

      console.log(`[LLM] ✅ Success with ${modelName}. Metrics:`, JSON.stringify(parsed.metrics));
      return parsed;

    } catch (err) {
      const is429 = err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Too Many Requests'));
      const is404 = err.message && err.message.includes('404');
      const is403 = err.message && (err.message.includes('403') || err.message.includes('Forbidden') || err.message.includes('leaked') || err.message.includes('API key'));
      console.warn(`[LLM] Model ${modelName} failed: ${is429 ? 'QUOTA EXCEEDED' : is404 ? 'NOT FOUND' : is403 ? 'KEY BLOCKED/LEAKED' : err.message}`);

      if (!is429 && !is404 && !is403) {
        // Non-quota, non-404, non-403 error — throw immediately (JSON parse errors etc.)
        throw new Error(`LLM API Error: ${err.message}`);
      }
      // Otherwise try the next model
    }
  }

  // All models failed — use intelligent regex-based fallback
  console.warn('[LLM] All Gemini models exhausted quota. Using text-analysis fallback.');
  return buildFallbackAnalysis(resumeText);
};

/**
 * Smart regex-based resume analysis when all LLM models are quota-limited.
 * Extracts real data from the resume text rather than returning hardcoded mocks.
 */
const buildFallbackAnalysis = (text) => {
  const lower = text.toLowerCase();

  // Detect programming languages
  const langMap = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'dart'];
  const languages = langMap.filter(l => lower.includes(l)).map(l => l.charAt(0).toUpperCase() + l.slice(1));

  // Detect frameworks
  const fwMap = ['react', 'angular', 'vue', 'next.js', 'nuxt', 'django', 'flask', 'fastapi', 'spring', 'express', 'nest.js', 'laravel', 'rails', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy'];
  const frameworks = fwMap.filter(f => lower.includes(f.toLowerCase())).map(f => {
    return f.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('.');
  });

  // Detect tools
  const toolMap = ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'terraform', 'ansible', 'jenkins', 'github actions', 'linux', 'nginx'];
  const tools = toolMap.filter(t => lower.includes(t.toLowerCase())).map(t => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

  // Estimate experience level from keywords
  const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  let experienceLevel = 'Junior';
  if (years >= 8 || lower.includes('principal') || lower.includes('staff engineer') || lower.includes('director')) experienceLevel = 'Lead';
  else if (years >= 5 || lower.includes('senior') || lower.includes('sr.')) experienceLevel = 'Senior';
  else if (years >= 2 || lower.includes('mid') || lower.includes('associate')) experienceLevel = 'Mid-Level';

  // Compute a basic score based on skill breadth
  const totalSkills = languages.length + frameworks.length + tools.length;
  const skillHealth = Math.min(95, 40 + totalSkills * 4);
  const marketRelevance = Math.min(95, 35 + frameworks.length * 5 + tools.length * 3);

  // Determine gaps based on what's missing
  const gaps = [];
  if (!lower.includes('docker') && !lower.includes('kubernetes')) gaps.push('Containerization (Docker/Kubernetes)');
  if (!lower.includes('aws') && !lower.includes('azure') && !lower.includes('gcp')) gaps.push('Cloud Platform (AWS/Azure/GCP)');
  if (!lower.includes('typescript')) gaps.push('TypeScript');
  if (!lower.includes('ci/cd') && !lower.includes('devops')) gaps.push('CI/CD Pipelines');
  if (!lower.includes('sql') && !lower.includes('database') && !lower.includes('postgresql')) gaps.push('Database Design');

  // Extract name/email from text
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const nameLines = text.split(/\n/)[0]?.trim() || 'Candidate';

  return {
    personalInfo: {
      name: nameLines.substring(0, 40),
      email: emailMatch ? emailMatch[0] : '',
      phone: ''
    },
    skills: { languages, frameworks, tools, softSkills: [] },
    metrics: {
      skillHealth,
      marketRelevance,
      experienceLevel,
    },
    gaps: gaps.slice(0, 5),
    recommendations: [
      { title: 'Enhance Cloud Skills', reason: 'Cloud expertise (AWS/GCP/Azure) is critical for modern engineering roles.' },
      { title: 'Adopt TypeScript', reason: 'TypeScript is now standard across frontend and backend development.' },
      { title: 'Build a Portfolio Project', reason: 'Demonstrating applied skills increases interview conversion rates significantly.' },
      { title: 'Practice System Design', reason: 'Senior+ roles consistently evaluate system design thinking.' },
    ],
  };
};

module.exports = { analyzeResume };
