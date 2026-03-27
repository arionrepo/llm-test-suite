// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/prompts/helpers.js
// Description: Helper functions for multi-tier prompt assembly
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Utilities for combining TIER 1, 2, 3 prompts into complete LLM inputs

/**
 * Intent Classification - Value Keywords
 * Used to detect product value proposition questions
 */
const VALUE_KEYWORDS = [
  'why arioncomply',
  'why should i',
  'why use',
  'why choose',
  'what makes',
  'benefits of',
  'advantages',
  'compared to',
  'better than',
  'value of',
  'why this platform',
  'roi'
];

/**
 * Intent Classification - Product Keywords
 * Used to detect product functional questions
 */
const PRODUCT_KEYWORDS = [
  'arioncomply',
  'this platform',
  'this application',
  'how do i',
  'where is',
  'can i',
  'show me',
  'steps to',
  'what features',
  'how does',
  'navigate to',
  'find the'
];

/**
 * Check if message contains value keywords
 */
function containsValueKeywords(message) {
  if (!message) return false;
  const lowerMessage = message.toLowerCase();
  return VALUE_KEYWORDS.some(kw => lowerMessage.includes(kw));
}

/**
 * Check if message contains product keywords
 */
function containsProductKeywords(message) {
  if (!message) return false;
  const lowerMessage = message.toLowerCase();
  return PRODUCT_KEYWORDS.some(kw => lowerMessage.includes(kw));
}

/**
 * Get matched value keywords (for logging)
 */
export function getMatchedValueKeywords(message) {
  if (!message) return [];
  const lowerMessage = message.toLowerCase();
  return VALUE_KEYWORDS.filter(kw => lowerMessage.includes(kw));
}

/**
 * Get matched product keywords (for logging)
 */
export function getMatchedProductKeywords(message) {
  if (!message) return [];
  const lowerMessage = message.toLowerCase();
  return PRODUCT_KEYWORDS.filter(kw => lowerMessage.includes(kw));
}

/**
 * Select TIER 2 Prompt Based on Context (Intent Classification)
 *
 * Implements priority-based intent classification matching production behavior
 *
 * Priority:
 * 1. Assessment Mode (explicit flag)
 * 2. Framework-specific (GDPR, ISO 27001, etc.)
 * 3. Product Value (keywords: "why", "benefits", "roi")
 * 4. Product Functional (keywords: "how do i", "where is")
 * 5. General fallback
 *
 * @param {Object} context - Intent classification context
 * @param {boolean} context.assessmentMode - Explicit assessment mode flag
 * @param {string} context.frameworkHint - Framework name (GDPR, ISO_27001, etc.)
 * @param {string} context.currentMessage - User's message for keyword matching
 * @param {Object} tier2Prompts - TIER2_PROMPTS object from tier2-prompts.js
 * @returns {Object} Selected prompt and selection metadata
 */
export function selectTier2Prompt(context, tier2Prompts) {
  const result = {
    prompt: null,
    reason: 'unknown',
    keywordsMatched: []
  };

  // Priority 1: Assessment Mode
  if (context.assessmentMode) {
    result.prompt = tier2Prompts.ASSESSMENT;
    result.reason = 'assessment_mode_explicit';
    return result;
  }

  // Priority 2: Framework-specific
  if (context.frameworkHint) {
    const hint = context.frameworkHint.toUpperCase();

    if (hint === 'GDPR' && tier2Prompts.GDPR_FRAMEWORK) {
      result.prompt = tier2Prompts.GDPR_FRAMEWORK;
      result.reason = 'framework_hint_gdpr';
      return result;
    }

    if ((hint === 'ISO_27001' || hint === 'ISO27001') && tier2Prompts.ISO27001_FRAMEWORK) {
      result.prompt = tier2Prompts.ISO27001_FRAMEWORK;
      result.reason = 'framework_hint_iso27001';
      return result;
    }

    // Add more framework mappings as needed
  }

  // Priority 3: Product Value keywords
  if (context.currentMessage && containsValueKeywords(context.currentMessage)) {
    result.prompt = tier2Prompts.PRODUCT_VALUE;
    result.reason = 'value_keywords';
    result.keywordsMatched = getMatchedValueKeywords(context.currentMessage);
    return result;
  }

  // Priority 4: Product Functional keywords
  if (context.currentMessage && containsProductKeywords(context.currentMessage)) {
    result.prompt = tier2Prompts.PRODUCT_FEATURES;
    result.reason = 'product_keywords';
    result.keywordsMatched = getMatchedProductKeywords(context.currentMessage);
    return result;
  }

  // Priority 5: General fallback
  result.prompt = tier2Prompts.GENERAL;
  result.reason = 'general_fallback';
  return result;
}

/**
 * Combine Multiple TIER 2 Prompts
 *
 * Useful for combining Assessment + Framework prompts
 *
 * @param {Array<string>} prompts - Array of TIER 2 prompt strings
 * @returns {string} Combined prompt
 */
export function combineTier2Prompts(...prompts) {
  return prompts.filter(Boolean).join('\n\n');
}

/**
 * Assemble Full Multi-Tier Prompt
 *
 * Combines all tiers into a single prompt ready for LLM consumption
 *
 * Structure:
 * [TIER 1 - Base System]
 * [TIER 2 - Situational Context]
 * [TIER 3 - Organization Context]
 * [CONVERSATION HISTORY] (if any)
 * [CURRENT USER MESSAGE]
 * [CONTEXT REMINDER] (Phase 2 optimization)
 *
 * Version: 2.0 (with Phase 2 optimizations)
 * Changes from v1.0:
 * - Added post-message context reminder (leverages recency bias)
 *
 * @param {string} tier1 - TIER 1 base system prompt
 * @param {string} tier2 - TIER 2 situational prompt (can be combined)
 * @param {string} tier3 - TIER 3 organization context
 * @param {Array} conversationHistory - Array of {role, content} message objects
 * @param {string} userQuery - Current user message
 * @returns {string} Complete assembled prompt
 */
export function assembleFullPrompt(tier1, tier2, tier3, conversationHistory, userQuery) {
  let prompt = `[TIER 1 - Base System Prompt]\n${tier1}\n\n`;
  prompt += `[TIER 2 - Situational Context]\n${tier2}\n\n`;
  prompt += `[TIER 3 - Organization Context]\n${tier3}\n\n`;

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `[CONVERSATION HISTORY]\n`;
    conversationHistory.forEach((msg, idx) => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  prompt += `[CURRENT USER MESSAGE]\n${userQuery}`;

  // Phase 2 optimization: Post-message context reminder
  // Leverages recency bias - last thing model reads before generating response
  const industryMatch = tier3.match(/Industry: ([^\n]+)/);
  const sizeMatch = tier3.match(/Organization Size: ([^\n]+)/);
  const maturityMatch = tier3.match(/Compliance Maturity: ([^\n]+)/);

  if (industryMatch && sizeMatch && maturityMatch) {
    const industry = industryMatch[1];
    const size = sizeMatch[1];
    const maturity = maturityMatch[1];

    prompt += `\n\n────────────────────────────────────────────────────────────\n`;
    prompt += `CONTEXT: ${industry} | ${size} | ${maturity} maturity\n`;
    prompt += `Tailor your response to this organizational context.\n`;
    prompt += `────────────────────────────────────────────────────────────`;
  }

  return prompt;
}

/**
 * Count tokens in a prompt (approximate)
 * Uses simple heuristic: ~4 characters per token
 *
 * @param {string} prompt - Prompt text
 * @returns {number} Estimated token count
 */
export function estimateTokens(prompt) {
  return Math.ceil(prompt.length / 4);
}

/**
 * Validate prompt structure
 * Ensures all required tiers are present
 *
 * @param {string} prompt - Assembled prompt
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
export function validatePromptStructure(prompt) {
  const errors = [];

  if (!prompt.includes('[TIER 1 - Base System Prompt]')) {
    errors.push('Missing TIER 1');
  }

  if (!prompt.includes('[TIER 2 - Situational Context]')) {
    errors.push('Missing TIER 2');
  }

  if (!prompt.includes('[TIER 3 - Organization Context]')) {
    errors.push('Missing TIER 3');
  }

  if (!prompt.includes('[CURRENT USER MESSAGE]')) {
    errors.push('Missing user message');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract metadata from assembled prompt
 * Useful for logging and analysis
 *
 * @param {string} prompt - Assembled prompt
 * @returns {Object} Metadata {industry, size, maturity, estimatedTokens}
 */
export function extractPromptMetadata(prompt) {
  const industryMatch = prompt.match(/Industry: ([^\n]+)/);
  const sizeMatch = prompt.match(/Organization Size: ([^\n]+)/);
  const maturityMatch = prompt.match(/Compliance Maturity: ([^\n]+)/);

  return {
    industry: industryMatch ? industryMatch[1] : null,
    size: sizeMatch ? sizeMatch[1] : null,
    maturity: maturityMatch ? maturityMatch[1] : null,
    estimatedTokens: estimateTokens(prompt),
    hasTier1: prompt.includes('[TIER 1'),
    hasTier2: prompt.includes('[TIER 2'),
    hasTier3: prompt.includes('[TIER 3'),
    hasHistory: prompt.includes('[CONVERSATION HISTORY]'),
    hasContextReminder: prompt.includes('CONTEXT:') && prompt.includes('────')
  };
}

/**
 * ==================================================================================
 * SUGGESTION VALIDATION HELPERS
 * ==================================================================================
 *
 * These functions validate and extract suggestions from LLM responses.
 * TIER 1 includes instructions for LLM to output suggestions in this format:
 *
 * ---SUGGESTIONS---
 * 1. [action text]
 * 2. [action text]
 * ...
 * ---END---
 */

/**
 * Check if response contains suggestion markers
 *
 * @param {string} response - LLM response text
 * @returns {boolean} True if contains both markers
 */
export function hasSuggestions(response) {
  return response.includes('---SUGGESTIONS---') && response.includes('---END---');
}

/**
 * Extract suggestions from LLM response
 * Mimics frontend parsing logic
 *
 * @param {string} response - LLM response text
 * @returns {Array<string>} Array of suggestion texts (empty if not found)
 */
export function extractSuggestions(response) {
  const startMarker = '---SUGGESTIONS---';
  const endMarker = '---END---';

  const startIdx = response.indexOf(startMarker);
  const endIdx = response.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return [];
  }

  const suggestionsText = response.substring(startIdx + startMarker.length, endIdx);
  const lines = suggestionsText.split('\n').filter(l => l.trim());

  // Extract numbered items (1. Text, 2. Text, etc.)
  const suggestions = lines
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(text => text.length > 0);

  return suggestions;
}

/**
 * Validate suggestion format in response
 * Ensures LLM followed the suggestion formatting instructions
 *
 * @param {string} response - LLM response text
 * @returns {Object} Validation result {valid, hasMarkers, count, suggestions, errors}
 */
export function validateSuggestions(response) {
  const result = {
    valid: false,
    hasMarkers: false,
    suggestionCount: 0,
    suggestions: [],
    errors: []
  };

  // Check for markers
  result.hasMarkers = hasSuggestions(response);
  if (!result.hasMarkers) {
    result.errors.push('Missing ---SUGGESTIONS--- or ---END--- markers');
    return result;
  }

  // Extract suggestions
  result.suggestions = extractSuggestions(response);
  result.suggestionCount = result.suggestions.length;

  // Validate count (should be exactly 5)
  if (result.suggestionCount !== 5) {
    result.errors.push(`Expected 5 suggestions, got ${result.suggestionCount}`);
  }

  // Validate each suggestion has meaningful content
  result.suggestions.forEach((sugg, idx) => {
    if (sugg.length < 5) {
      result.errors.push(`Suggestion ${idx + 1} too short: "${sugg}"`);
    }
    if (sugg.length > 100) {
      result.errors.push(`Suggestion ${idx + 1} too long (${sugg.length} chars)`);
    }
  });

  result.valid = result.errors.length === 0;

  return result;
}
