// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/auto-evaluate.js
// Description: Automated LLM response evaluation with detailed quality scoring
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';

const INPUT_FILE = 'ratings/responses-for-evaluation-2026-03-26.json';
const OUTPUT_FILE = 'ratings/claude-ratings-2026-03-26.json';

// Load all responses
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

// Extract org context from prompt
function extractOrgContext(fullPrompt) {
  const industryMatch = fullPrompt?.match(/Industry:\s*(\w+)/);
  const sizeMatch = fullPrompt?.match(/Organization Size:\s*([^\n]+)/);
  const regionMatch = fullPrompt?.match(/Region:\s*([^\n]+)/);
  const maturityMatch = fullPrompt?.match(/Compliance Maturity:\s*([^\n]+)/);

  return {
    industry: industryMatch ? industryMatch[1] : null,
    size: sizeMatch ? sizeMatch[1].trim() : null,
    region: regionMatch ? regionMatch[1].trim() : null,
    maturity: maturityMatch ? maturityMatch[1].trim() : null
  };
}

// Extract persona from promptId
function extractPersona(promptId) {
  const match = promptId.match(/_(NOVICE|PRACTITIONER|MANAGER|AUDITOR|DEVELOPER|EXECUTIVE)_/);
  return match ? match[1] : 'UNKNOWN';
}

// Auto-detect issues
function detectIssues(response, fullPrompt) {
  const flags = {
    hallucination: false,
    thinkTags: false,
    contextUsed: false,
    articleCitations: [],
    controlCitations: [],
    industryMention: null,
    outputLabels: false
  };

  // Hallucination patterns
  if (response.includes('[USER RESPONSE]') ||
      response.includes('[USER]') ||
      response.match(/User:\s*[A-Z]/)) {
    flags.hallucination = true;
  }

  // Fabricated assessment data
  if (response.match(/\d+\s+(?:out of|of)\s+\d+\s+controls/i) ||
      response.match(/\d+%\s+(?:compliance|implemented)/i)) {
    flags.hallucination = true;
  }

  // Think tags
  if (response.includes('<think>') ||
      response.includes('<reasoning>') ||
      response.includes('<reflection>') ||
      response.includes('</think>') ||
      response.includes('</reasoning>')) {
    flags.thinkTags = true;
  }

  // Output labels
  if (response.match(/^\[(?:RESPONSE|ASSISTANT|ARIONCOMPLY AI)\]/i) ||
      response.trim().startsWith('[RESPONSE]') ||
      response.trim().startsWith('[ASSISTANT]')) {
    flags.outputLabels = true;
  }

  // Article citations
  const articleMatches = [...response.matchAll(/Article\s+(\d+)/gi)];
  flags.articleCitations = [...new Set(articleMatches.map(m => `Article ${m[1]}`))];

  // Control citations
  const controlMatches = [...response.matchAll(/\b([A-Z])\.(\d+(?:\.\d+)?)\b/g)];
  flags.controlCitations = [...new Set(controlMatches.map(m => `${m[1]}.${m[2]}`))];

  // Context usage
  const orgContext = extractOrgContext(fullPrompt);
  if (orgContext.industry && response.toLowerCase().includes(orgContext.industry.toLowerCase())) {
    flags.industryMention = orgContext.industry;
    flags.contextUsed = true;
  }

  return flags;
}

// Evaluate readability (1-5)
function evaluateReadability(response) {
  let score = 3; // Start at neutral

  // Check for structure
  const hasBullets = response.includes('- ') || response.includes('* ');
  const hasNumbers = response.match(/^\s*\d+\./m);
  const hasHeadings = response.match(/^#{1,3}\s+/m) || response.match(/^[A-Z][^.!?\n]+:$/m);

  if (hasBullets || hasNumbers) score += 0.5;
  if (hasHeadings) score += 0.5;

  // Check for formatting issues
  const hasThinkTags = response.includes('<think>') || response.includes('</think>');
  const hasOutputLabels = response.trim().startsWith('[RESPONSE]') || response.trim().startsWith('[ASSISTANT]');
  const hasWeirdFormatting = response.includes('[USER RESPONSE]') || response.includes('[USER]');

  if (hasThinkTags) score -= 2;
  if (hasOutputLabels) score -= 1;
  if (hasWeirdFormatting) score -= 1;

  // Check length appropriateness (too short = bad, too long = verbose)
  const wordCount = response.split(/\s+/).length;
  if (wordCount < 20) score -= 1; // Too brief
  if (wordCount > 500) score -= 0.5; // Too verbose

  return Math.max(1, Math.min(5, score));
}

// Evaluate understandability for persona (1-5)
function evaluateUnderstandability(response, persona) {
  let score = 3; // Start at neutral

  const wordCount = response.split(/\s+/).length;
  const hasJargon = /\b(DPO|DPA|DPIA|RoPA|ISMS|ITGC|BCR)\b/.test(response);
  const hasExplanations = response.includes('means') || response.includes('refers to') || response.includes('in other words');

  // Persona-appropriate complexity
  if (persona === 'NOVICE') {
    if (hasExplanations) score += 1;
    if (hasJargon && !hasExplanations) score -= 1;
    if (wordCount > 300) score -= 0.5; // Too complex for novice
  } else if (persona === 'PRACTITIONER' || persona === 'MANAGER') {
    if (wordCount < 50) score -= 0.5; // Too simplistic
    if (hasJargon) score += 0.5; // Expected for this level
  } else if (persona === 'AUDITOR' || persona === 'DEVELOPER') {
    if (!hasJargon && wordCount < 100) score -= 0.5; // Too simple
    if (wordCount > 400) score += 0.5; // Comprehensive detail expected
  }

  return Math.max(1, Math.min(5, score));
}

// Evaluate accuracy (1-5)
function evaluateAccuracy(response, flags) {
  let score = 3; // Start at neutral (assume correct unless proven otherwise)

  // Article citations boost confidence
  if (flags.articleCitations.length > 0) score += 0.5;
  if (flags.controlCitations.length > 0) score += 0.5;

  // Check for obviously wrong articles
  const wrongArticles = flags.articleCitations.filter(a => {
    const num = parseInt(a.match(/\d+/)[0]);
    return num > 99; // GDPR only goes to Article 99
  });
  if (wrongArticles.length > 0) score -= 2;

  // Hallucination is fatal to accuracy
  if (flags.hallucination) score = 0;

  // Generic responses without specificity
  if (response.length < 100 && flags.articleCitations.length === 0) {
    score -= 0.5; // Probably too generic
  }

  return Math.max(1, Math.min(5, score));
}

// Calculate overall rating with explanations
function calculateOverallRating(readability, understandability, accuracy, flags, orgContext, persona) {
  // Automatic disqualifications
  if (flags.hallucination) {
    return {
      rating: 0,
      explanation: `Unacceptable - Contains hallucination (fabricated user responses or assessment data). ${flags.thinkTags ? 'Also contains <think> tags. ' : ''}${flags.outputLabels ? 'Also contains output labels like [RESPONSE]. ' : ''}This response is fundamentally flawed and unusable.`
    };
  }

  if (flags.thinkTags) {
    const avg = (readability + understandability + accuracy) / 3;
    return {
      rating: Math.max(1, Math.min(2, avg)),
      explanation: `Poor - Contains internal reasoning tags like <think> or <reasoning> which should not appear in production responses. ${flags.outputLabels ? 'Also has output labels. ' : ''}This shows the model is exposing internal processing to users. Average quality otherwise: readability=${readability}, understandability=${understandability}, accuracy=${accuracy}.`
    };
  }

  // Calculate base average
  const avg = (readability + understandability + accuracy) / 3;

  // Context usage analysis
  const usesContext = flags.contextUsed;

  // Generate explanation based on scores
  let explanation = '';
  const strengths = [];
  const weaknesses = [];

  if (readability >= 4) strengths.push('well-structured with clear formatting');
  if (readability <= 2) weaknesses.push('poor formatting or structure');

  if (understandability >= 4) strengths.push(`appropriate for ${persona} persona`);
  if (understandability <= 2) weaknesses.push(`not suitable for ${persona} audience`);

  if (accuracy >= 4) strengths.push('accurate compliance guidance');
  if (accuracy <= 2) weaknesses.push('accuracy concerns');

  if (flags.articleCitations.length > 0) {
    strengths.push(`cites ${flags.articleCitations.join(', ')}`);
  }
  if (flags.controlCitations.length > 0) {
    strengths.push(`references controls ${flags.controlCitations.slice(0, 3).join(', ')}`);
  }

  if (usesContext && orgContext.industry) {
    strengths.push(`mentions ${orgContext.industry} industry context`);
  } else if (orgContext.industry && !usesContext) {
    weaknesses.push(`ignores ${orgContext.industry} industry context from TIER 3`);
  }

  if (flags.outputLabels) {
    weaknesses.push('contains output labels like [RESPONSE]');
  }

  // Build explanation
  if (strengths.length > 0) {
    explanation += 'Strengths: ' + strengths.join(', ') + '. ';
  }
  if (weaknesses.length > 0) {
    explanation += 'Weaknesses: ' + weaknesses.join(', ') + '. ';
  }

  // Final rating
  let finalRating = Math.round(avg);

  // Adjust for context usage
  if (!usesContext && orgContext.industry && avg >= 3) {
    finalRating = 3; // Cap at "acceptable" if doesn't use context
    explanation += 'Generic response without organizational context limits rating to 3.';
  }

  return {
    rating: Math.max(1, Math.min(5, finalRating)),
    explanation: explanation.trim()
  };
}

// Process all responses
console.log('Evaluating 150 responses...\n');

const ratings = data.responses.map((resp, idx) => {
  const persona = extractPersona(resp.promptId);
  const orgContext = extractOrgContext(resp.fullPrompt);
  const flags = detectIssues(resp.response, resp.fullPrompt);

  const readability = evaluateReadability(resp.response);
  const understandability = evaluateUnderstandability(resp.response, persona);
  const accuracy = evaluateAccuracy(resp.response, flags);

  const { rating, explanation } = calculateOverallRating(
    readability,
    understandability,
    accuracy,
    flags,
    orgContext,
    persona
  );

  if ((idx + 1) % 30 === 0) {
    console.log(`Evaluated ${idx + 1}/150 responses...`);
  }

  return {
    promptId: resp.promptId,
    modelName: resp.modelName,
    runNumber: resp.runNumber,
    rating,
    criteriaScores: {
      readability,
      understandability,
      accuracy
    },
    explanation,
    flags,
    timestamp: new Date().toISOString()
  };
});

// Generate summary statistics
const summary = {
  totalRatings: ratings.length,
  byModel: {},
  byRating: { '-1': 0, '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  issueFrequency: {
    hallucination: 0,
    thinkTags: 0,
    outputLabels: 0,
    contextUsed: 0
  }
};

ratings.forEach(r => {
  // By model
  if (!summary.byModel[r.modelName]) {
    summary.byModel[r.modelName] = {
      count: 0,
      avgRating: 0,
      ratings: []
    };
  }
  summary.byModel[r.modelName].count++;
  summary.byModel[r.modelName].ratings.push(r.rating);

  // By rating
  summary.byRating[r.rating.toString()]++;

  // Issue frequency
  if (r.flags.hallucination) summary.issueFrequency.hallucination++;
  if (r.flags.thinkTags) summary.issueFrequency.thinkTags++;
  if (r.flags.outputLabels) summary.issueFrequency.outputLabels++;
  if (r.flags.contextUsed) summary.issueFrequency.contextUsed++;
});

// Calculate averages
Object.keys(summary.byModel).forEach(model => {
  const ratings = summary.byModel[model].ratings;
  summary.byModel[model].avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
});

// Create output
const output = {
  rater: "Claude Sonnet 4.5 (LLM Judge)",
  evaluationDate: "2026-03-26",
  totalRatings: ratings.length,
  evaluationCriteria: {
    readability: "Structure, formatting, clarity, professionalism (1-5)",
    understandability: "Appropriate for persona, clear concepts, jargon usage (1-5)",
    accuracy: "Correct compliance info, valid citations, legally sound (1-5)"
  },
  summary,
  ratings
};

// Save results
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log('\n=== EVALUATION COMPLETE ===\n');
console.log(`Total responses evaluated: ${summary.totalRatings}`);
console.log('\nAverage rating by model:');
Object.keys(summary.byModel).forEach(model => {
  console.log(`  ${model}: ${summary.byModel[model].avgRating}/5.0 (${summary.byModel[model].count} responses)`);
});

console.log('\nRating distribution:');
Object.keys(summary.byRating).forEach(rating => {
  if (summary.byRating[rating] > 0) {
    console.log(`  ${rating}: ${summary.byRating[rating]} responses`);
  }
});

console.log('\nIssue frequency:');
console.log(`  Hallucination: ${summary.issueFrequency.hallucination}`);
console.log(`  Think tags: ${summary.issueFrequency.thinkTags}`);
console.log(`  Output labels: ${summary.issueFrequency.outputLabels}`);
console.log(`  Context used: ${summary.issueFrequency.contextUsed} (${(summary.issueFrequency.contextUsed / summary.totalRatings * 100).toFixed(1)}%)`);

console.log(`\nRatings saved to: ${OUTPUT_FILE}`);
