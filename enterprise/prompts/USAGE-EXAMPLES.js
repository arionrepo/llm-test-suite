// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/prompts/USAGE-EXAMPLES.js
// Description: Examples showing how to use centralized prompts with and without intent classification
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import { TIER1_BASE_SYSTEM } from './tier1-base-system.js';
import { TIER2_PROMPTS } from './tier2-prompts.js';
import { ORG_PROFILES, buildTier3Context } from './org-profiles.js';
import {
  assembleFullPrompt,
  selectTier2Prompt,
  combineTier2Prompts,
  estimateTokens
} from './helpers.js';

/**
 * ==================================================================================
 * APPROACH 1: EXPLICIT TIER 2 SELECTION
 * ==================================================================================
 *
 * Use when: Testing specific prompt content, validating prompt quality
 * Advantage: Full control over which TIER 2 prompt is used
 * Use case: Controlled test scenarios, A/B testing
 */

export function example1_ExplicitSelection() {
  console.log('\n=== Example 1: Explicit TIER 2 Selection ===\n');

  // Manually choose TIER 2 prompts
  const tier2 = TIER2_PROMPTS.ASSESSMENT + '\n\n' + TIER2_PROMPTS.GDPR_FRAMEWORK;

  // Build TIER 3
  const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);

  // Assemble full prompt
  const fullPrompt = assembleFullPrompt(
    TIER1_BASE_SYSTEM,
    tier2,
    tier3,
    [], // no conversation history
    "I want to assess my GDPR compliance"
  );

  console.log(`Prompt assembled: ${estimateTokens(fullPrompt)} tokens`);
  console.log(`TIER 2 selected: ASSESSMENT + GDPR_FRAMEWORK (explicit)`);

  return fullPrompt;
}

/**
 * ==================================================================================
 * APPROACH 2: INTENT CLASSIFICATION
 * ==================================================================================
 *
 * Use when: End-to-end testing, production-like behavior validation
 * Advantage: Realistic intent detection, matches production behavior
 * Use case: System testing, intent detection accuracy tests
 */

export function example2_IntentClassification() {
  console.log('\n=== Example 2: Intent Classification ===\n');

  const userMessage = "Why should we use ArionComply instead of spreadsheets?";

  // Let intent classification select TIER 2
  const tier2Selection = selectTier2Prompt(
    {
      assessmentMode: false,
      frameworkHint: null,
      currentMessage: userMessage
    },
    TIER2_PROMPTS
  );

  console.log(`Intent detected: ${tier2Selection.reason}`);
  console.log(`Keywords matched: ${tier2Selection.keywordsMatched.join(', ')}`);

  // Build TIER 3
  const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);

  // Assemble full prompt
  const fullPrompt = assembleFullPrompt(
    TIER1_BASE_SYSTEM,
    tier2Selection.prompt,
    tier3,
    [],
    userMessage
  );

  console.log(`Prompt assembled: ${estimateTokens(fullPrompt)} tokens`);

  return fullPrompt;
}

/**
 * ==================================================================================
 * APPROACH 3: HYBRID (Assessment Mode + Framework Intent)
 * ==================================================================================
 *
 * Use when: Testing assessment workflows with auto-detected framework
 * Advantage: Combines explicit mode with automatic framework detection
 */

export function example3_HybridApproach() {
  console.log('\n=== Example 3: Hybrid Approach ===\n');

  const userMessage = "I want to assess my GDPR compliance";

  // Assessment mode is explicit, but let it detect GDPR
  const tier2Selection = selectTier2Prompt(
    {
      assessmentMode: true,      // Explicitly set
      frameworkHint: 'GDPR',     // Could be detected from message parsing
      currentMessage: userMessage
    },
    TIER2_PROMPTS
  );

  console.log(`Intent detected: ${tier2Selection.reason}`);

  // For assessments, combine Assessment + Framework prompts
  const tier2Combined = combineTier2Prompts(
    TIER2_PROMPTS.ASSESSMENT,
    TIER2_PROMPTS.GDPR_FRAMEWORK
  );

  // Build TIER 3
  const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);

  // Assemble full prompt
  const fullPrompt = assembleFullPrompt(
    TIER1_BASE_SYSTEM,
    tier2Combined,
    tier3,
    [],
    userMessage
  );

  console.log(`TIER 2: ASSESSMENT + GDPR_FRAMEWORK`);
  console.log(`Prompt assembled: ${estimateTokens(fullPrompt)} tokens`);

  return fullPrompt;
}

/**
 * ==================================================================================
 * APPROACH 4: CONVERSATION HISTORY
 * ==================================================================================
 *
 * Use when: Testing mid-conversation scenarios
 * Advantage: Simulates realistic multi-turn conversations
 */

export function example4_WithConversationHistory() {
  console.log('\n=== Example 4: With Conversation History ===\n');

  const conversationHistory = [
    { role: "assistant", content: "Let's assess ISO 27001 control A.8.24 (Use of cryptography). Do you use cryptography to protect the confidentiality and integrity of information?" }
  ];

  const userMessage = "Yes, we have implemented encryption for data at rest using AES-256";

  // Explicit TIER 2 for assessment + ISO 27001
  const tier2 = combineTier2Prompts(
    TIER2_PROMPTS.ASSESSMENT,
    TIER2_PROMPTS.ISO27001_FRAMEWORK
  );

  // Build TIER 3
  const tier3 = buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM);

  // Assemble with history
  const fullPrompt = assembleFullPrompt(
    TIER1_BASE_SYSTEM,
    tier2,
    tier3,
    conversationHistory,
    userMessage
  );

  console.log(`Conversation turns: ${conversationHistory.length + 1}`);
  console.log(`Prompt assembled: ${estimateTokens(fullPrompt)} tokens`);

  return fullPrompt;
}

/**
 * ==================================================================================
 * APPROACH 5: TESTING INTENT CLASSIFICATION ACCURACY
 * ==================================================================================
 *
 * Use when: Validating that intent classification works correctly
 * Advantage: Tests the selection logic itself
 */

export function example5_TestIntentClassification() {
  console.log('\n=== Example 5: Testing Intent Classification Accuracy ===\n');

  const testCases = [
    {
      message: "I want to assess my GDPR compliance",
      expected: 'assessment_mode_explicit',
      context: { assessmentMode: true, frameworkHint: 'GDPR' }
    },
    {
      message: "Why should we use ArionComply?",
      expected: 'value_keywords',
      context: { currentMessage: "Why should we use ArionComply?" }
    },
    {
      message: "How do I upload evidence?",
      expected: 'product_keywords',
      context: { currentMessage: "How do I upload evidence?" }
    },
    {
      message: "What are the GDPR legal bases?",
      expected: 'framework_hint_gdpr',
      context: { frameworkHint: 'GDPR' }
    },
    {
      message: "What is compliance?",
      expected: 'general_fallback',
      context: { currentMessage: "What is compliance?" }
    }
  ];

  const results = testCases.map(testCase => {
    const selection = selectTier2Prompt(testCase.context, TIER2_PROMPTS);

    const passed = selection.reason === testCase.expected;

    return {
      message: testCase.message,
      expected: testCase.expected,
      actual: selection.reason,
      passed,
      keywordsMatched: selection.keywordsMatched
    };
  });

  console.log('Intent Classification Test Results:');
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} "${r.message.substring(0, 40)}..."`);
    console.log(`   Expected: ${r.expected}, Got: ${r.actual}`);
    if (r.keywordsMatched?.length > 0) {
      console.log(`   Keywords: ${r.keywordsMatched.join(', ')}`);
    }
  });

  const passRate = results.filter(r => r.passed).length / results.length;
  console.log(`\nPass rate: ${(passRate * 100).toFixed(0)}%`);

  return results;
}

/**
 * ==================================================================================
 * RUN ALL EXAMPLES
 * ==================================================================================
 */

export function runAllExamples() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Centralized Prompt Usage Examples                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  example1_ExplicitSelection();
  example2_IntentClassification();
  example3_HybridApproach();
  example4_WithConversationHistory();
  example5_TestIntentClassification();

  console.log('\n✅ All examples completed');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
