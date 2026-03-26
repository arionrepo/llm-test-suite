// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/prompts/helpers.js
// Description: Helper functions for multi-tier prompt assembly
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Utilities for combining TIER 1, 2, 3 prompts into complete LLM inputs

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
