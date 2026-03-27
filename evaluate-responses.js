// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/evaluate-responses.js
// Description: Comprehensive LLM response evaluation for multi-tier compliance tests
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';

const INPUT_FILES = [
  'reports/performance/2026-03-26/test-results-multitier-phi3-split-25-run1-2026-03-26T153232299Z.json',
  'reports/performance/2026-03-26/test-results-multitier-phi3-split-25-run2-2026-03-26T154119506Z.json',
  'reports/performance/2026-03-26/test-results-multitier-smollm3-split-25-run1-2026-03-26T153432907Z.json',
  'reports/performance/2026-03-26/test-results-multitier-smollm3-split-25-run2-2026-03-26T154333186Z.json',
  'reports/performance/2026-03-26/test-results-multitier-mistral-split-25-run1-2026-03-26T153734424Z.json',
  'reports/performance/2026-03-26/test-results-multitier-mistral-split-25-run2-2026-03-26T154657787Z.json'
];

const OUTPUT_FILE = 'ratings/claude-ratings-2026-03-26.json';

// Extract all responses with metadata
function extractAllResponses() {
  const allResponses = [];

  INPUT_FILES.forEach(filePath => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const runNumber = filePath.includes('run1') ? 1 : 2;

    data.results.forEach(result => {
      allResponses.push({
        promptId: result.input.promptId,
        modelName: result.modelName,
        runNumber: runNumber,
        response: result.output.response,
        fullPrompt: result.input.fullPromptText
      });
    });
  });

  return allResponses;
}

// Auto-detect issues in response
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

  // Check for hallucination patterns
  if (response.includes('[USER RESPONSE]') ||
      response.includes('[USER]') ||
      response.match(/User:\s*[A-Z]/)) {
    flags.hallucination = true;
  }

  // Check for fabricated assessment data
  if (response.match(/\d+\s+(?:out of|of)\s+\d+\s+controls/i) ||
      response.match(/\d+%\s+(?:compliance|implemented)/i)) {
    flags.hallucination = true;
  }

  // Check for think tags
  if (response.includes('<think>') ||
      response.includes('<reasoning>') ||
      response.includes('<reflection>')) {
    flags.thinkTags = true;
  }

  // Check for output labels
  if (response.match(/^\[(?:RESPONSE|ASSISTANT|ARIONCOMPLY AI)\]/i)) {
    flags.outputLabels = true;
  }

  // Extract article citations
  const articleMatches = response.matchAll(/Article\s+(\d+)/gi);
  flags.articleCitations = [...new Set([...articleMatches].map(m => `Article ${m[1]}`))];

  // Extract control citations (ISO/NIST format)
  const controlMatches = response.matchAll(/\b([A-Z])\.(\d+(?:\.\d+)?)\b/g);
  flags.controlCitations = [...new Set([...controlMatches].map(m => `${m[1]}.${m[2]}`))];

  // Extract org context from fullPrompt
  const industryMatch = fullPrompt?.match(/Industry:\s*(\w+)/);
  if (industryMatch) {
    const industry = industryMatch[1];
    if (response.toLowerCase().includes(industry.toLowerCase())) {
      flags.industryMention = industry;
      flags.contextUsed = true;
    }
  }

  return flags;
}

// Main evaluation function - outputs to separate file for manual rating
function prepareForEvaluation() {
  const responses = extractAllResponses();

  console.log(`Total responses to evaluate: ${responses.length}`);

  // Create output directory
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create evaluation template file
  const template = {
    rater: "Claude Sonnet 4.5 (LLM Judge)",
    evaluationDate: "2026-03-26",
    totalRatings: responses.length,
    evaluationCriteria: {
      readability: "Structure, formatting, clarity, professionalism (1-5)",
      understandability: "Appropriate for persona, clear concepts, jargon usage (1-5)",
      accuracy: "Correct compliance info, valid citations, legally sound (1-5)"
    },
    overallRatingScale: {
      "-1": "Harmful - dangerous advice that could cause compliance failures",
      "0": "Unacceptable - hallucination, fabricated data, completely wrong",
      "1": "Poor - significant issues, inaccurate, unhelpful",
      "2": "Below Average - notable problems, limited value",
      "3": "Acceptable - correct but generic, doesn't use organizational context",
      "4": "Good - accurate, uses context appropriately, professional",
      "5": "Excellent - comprehensive, highly contextual, exemplary quality"
    },
    responses: responses,
    ratings: []
  };

  // Save template for review
  const templateFile = 'ratings/responses-for-evaluation-2026-03-26.json';
  fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));
  console.log(`\nSaved ${responses.length} responses to: ${templateFile}`);
  console.log(`\nEach response includes:`);
  console.log(`  - promptId, modelName, runNumber`);
  console.log(`  - response text (to evaluate)`);
  console.log(`  - fullPrompt (for context extraction)`);

  return { responses, templateFile };
}

// Run preparation
const result = prepareForEvaluation();

console.log(`\n=== Response Breakdown ===`);
const byModel = {};
result.responses.forEach(r => {
  if (!byModel[r.modelName]) byModel[r.modelName] = 0;
  byModel[r.modelName]++;
});

Object.keys(byModel).forEach(model => {
  console.log(`${model}: ${byModel[model]} responses`);
});
