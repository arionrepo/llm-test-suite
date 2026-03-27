// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-validation-test.js
// Description: Validation test runner for Phase 1 & 2 prompt optimizations
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Purpose: Validate that prompt improvements eliminate phi3 hallucination,
// smollm3 think tags, and improve context usage across all models
//
// Test Set: 15 prompts (5 assessment + 5 factual + 5 context-heavy)
// Models: First 4 (smollm3, phi3, mistral, qwen2.5-32b)
// Focus: Quality improvements, not performance

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import { hasSuggestions, extractSuggestions, validateSuggestions } from './enterprise/prompts/helpers.js';
import { transformPerformanceResults } from './utils/schema-transformer.js';

/**
 * VALIDATION TEST CONFIGURATION
 */
const VALIDATION_MODELS = ['smollm3', 'phi3', 'mistral', 'qwen2.5-32b']; // First 4 models

/**
 * Select 15 validation prompts:
 * - 5 assessment mode (test phi3 hallucination fix)
 * - 5 factual knowledge (test overall quality)
 * - 5 context-heavy (test context usage improvement)
 */
const allTests = AI_BACKEND_MULTI_TIER_TESTS;

const VALIDATION_PROMPTS = [
  // ========================================================================
  // ASSESSMENT MODE TESTS (5 prompts - test phi3 hallucination fix)
  // ========================================================================
  allTests.ASSESSMENT_START_GDPR_NOVICE_1,           // "I want to assess my GDPR compliance"
  allTests.ASSESSMENT_GAP_QUESTION_GDPR_MANAGER_1,   // "What are my biggest GDPR compliance gaps?"
  allTests.ASSESSMENT_COMPLETE_SUMMARY_ISO27001_MANAGER_1, // "Can you summarize our assessment results?"
  allTests.ASSESSMENT_SKIP_REQUEST_ISO27001_PRACTITIONER_3, // "Can we skip physical security controls?"
  allTests.ASSESSMENT_TIMELINE_QUESTION_GDPR_MANAGER_3,     // "How long will this assessment take?"

  // ========================================================================
  // FACTUAL KNOWLEDGE TESTS (5 prompts - test overall quality)
  // ========================================================================
  allTests.GDPR_ARTICLE6_LEGAL_BASIS_PRACTITIONER_1,     // "What are legal bases for processing?"
  allTests.GDPR_PROCESSOR_VS_CONTROLLER_NOVICE_2,        // "What's difference controller/processor?"
  allTests.ISO27001_CONTROL_A82_PRACTITIONER_1,          // "What are requirements for A.8.2?"
  allTests.ISO27001_CERTIFICATION_PROCESS_EXECUTIVE_1,   // "What's involved in getting certified?"
  allTests.GDPR_BREACH_NOTIFICATION_PRACTITIONER_2,      // "What are breach notification timelines?"

  // ========================================================================
  // CONTEXT-HEAVY TESTS (5 prompts - test context usage improvement)
  // ========================================================================
  allTests.ISO27001_ISMS_SCOPE_MANAGER_1,           // Should mention Technology industry
  allTests.ISO27001_RISK_ASSESSMENT_PRACTITIONER_2, // Should mention Healthcare industry
  allTests.ISO27001_ACCESS_CONTROL_DEVELOPER_1,     // Should mention Technology industry
  allTests.GDPR_ROPA_CREATION_PRACTITIONER_3,       // Should mention Healthcare industry
  allTests.GENERAL_FRAMEWORK_SELECTION_MANAGER_1    // Should mention Healthcare + EU context
];

/**
 * Convert test objects to prompt format for runner
 */
const prompts = VALIDATION_PROMPTS.map(t => ({
  id: t.id,
  input: t.fullPrompt,
  estimatedTokens: t.estimatedTokens,
  fullPromptText: t.fullPrompt,
  originalTest: t
}));

const runner = new ResilientPerformanceTestRunner();

// Initialize logger
const logFile = runner.initializeLogger('validation-phase1-phase2');

console.log('\n' + '='.repeat(80));
console.log('PROMPT OPTIMIZATION VALIDATION TEST');
console.log('='.repeat(80));
console.log('\nPurpose: Validate Phase 1 & 2 prompt optimizations');
console.log('\nWhat we\'re testing:');
console.log('  ✓ Phase 1: phi3 hallucination elimination (no fake dialogues)');
console.log('  ✓ Phase 1: smollm3 think tag elimination (clean output)');
console.log('  ✓ Phase 2: Context usage improvement (industry-specific examples)');
console.log('  ✓ Production: Suggestion format compliance (5 suggestions with markers)');
console.log('\nTest Configuration:');
console.log(`  Models (${VALIDATION_MODELS.length}): ${VALIDATION_MODELS.join(', ')}`);
console.log(`  Prompts: ${prompts.length} (5 assessment + 5 factual + 5 context-heavy)`);
console.log(`  Total executions: ${prompts.length} × ${VALIDATION_MODELS.length} = ${prompts.length * VALIDATION_MODELS.length} tests`);
console.log(`\n📝 Logging: ENABLED`);
console.log(`💾 Incremental saving: ENABLED (per-model)`);
console.log(`📄 Log file: ${logFile}\n`);

// Prompt map for enrichment
const promptMap = Object.fromEntries(prompts.map(p => [p.id, p]));

/**
 * Callback for incremental saving per model
 */
async function onModelComplete(modelName, modelResults) {
  if (!modelResults || modelResults.length === 0) {
    console.log(`⚠️  No results for ${modelName}`);
    return;
  }

  console.log(`\n📊 Analyzing ${modelName} responses for quality improvements...`);

  // Transform to schema-compliant format first
  const schemaResults = transformPerformanceResults(modelResults, {
    testRunId: `validation-run-6-${modelName}`,
    runName: `VALIDATION_RUN6_${modelName.toUpperCase()}`
  }, promptMap);

  // Add validation-specific metrics to schema results
  const enrichedResults = schemaResults.map((schemaResult, idx) => {
    const result = modelResults[idx];
    const enriched = { ...schemaResult };

    // Add validation metrics
    if (result.response) {
      // Check for hallucination markers (phi3)
      enriched.hasUserResponseLabel = result.response.includes('[USER RESPONSE]');
      enriched.hasAssistantLabel = result.response.includes('[ARIONCOMPLY AI]');
      enriched.hasFabricatedDialogue = enriched.hasUserResponseLabel || enriched.hasAssistantLabel;

      // Check for think tags (smollm3)
      enriched.hasThinkTags = result.response.includes('<think>');

      // Check for suggestions
      enriched.suggestionsValidation = validateSuggestions(result.response);

      // Context usage scoring
      const originalTest = promptMap[result.promptId]?.originalTest;
      if (originalTest?.orgProfile) {
        const industry = originalTest.orgProfile.industry;
        const size = originalTest.orgProfile.org_size;
        const maturity = originalTest.orgProfile.maturity_level;

        enriched.contextUsage = {
          mentionsIndustry: result.response.toLowerCase().includes(industry.toLowerCase()),
          mentionsSize: result.response.includes(size),
          mentionsMaturity: result.response.toLowerCase().includes(maturity.toLowerCase()),
          score: 0
        };

        // Calculate score
        if (enriched.contextUsage.mentionsIndustry) enriched.contextUsage.score += 2;
        if (enriched.contextUsage.mentionsSize) enriched.contextUsage.score += 1;
        if (enriched.contextUsage.mentionsMaturity) enriched.contextUsage.score += 1;
      }
    }

    return enriched;
  });

  // Calculate metrics for this model
  const metrics = {
    totalResponses: enrichedResults.length,
    hallucination: {
      count: enrichedResults.filter(r => r.hasFabricatedDialogue).length,
      rate: 0
    },
    thinkTags: {
      count: enrichedResults.filter(r => r.hasThinkTags).length,
      rate: 0
    },
    suggestions: {
      validCount: enrichedResults.filter(r => r.suggestionsValidation?.valid).length,
      rate: 0
    },
    contextUsage: {
      averageScore: 0,
      highScoreCount: enrichedResults.filter(r => r.contextUsage?.score >= 3).length
    }
  };

  metrics.hallucination.rate = (metrics.hallucination.count / metrics.totalResponses * 100).toFixed(1);
  metrics.thinkTags.rate = (metrics.thinkTags.count / metrics.totalResponses * 100).toFixed(1);
  metrics.suggestions.rate = (metrics.suggestions.validCount / metrics.totalResponses * 100).toFixed(1);

  const contextScores = enrichedResults.map(r => r.contextUsage?.score || 0).filter(s => s > 0);
  if (contextScores.length > 0) {
    metrics.contextUsage.averageScore = (contextScores.reduce((a, b) => a + b, 0) / contextScores.length).toFixed(1);
  }

  console.log(`\n${modelName} Quality Metrics:`);
  console.log(`  Hallucination rate: ${metrics.hallucination.rate}% (${metrics.hallucination.count}/${metrics.totalResponses})`);
  console.log(`  Think tags: ${metrics.thinkTags.rate}% (${metrics.thinkTags.count}/${metrics.totalResponses})`);
  console.log(`  Valid suggestions: ${metrics.suggestions.rate}% (${metrics.suggestions.validCount}/${metrics.totalResponses})`);
  console.log(`  Context usage score: ${metrics.contextUsage.averageScore}/4 avg`);

  // Save results
  try {
    const saveResult = await saveSchemaCompliantResults(enrichedResults, {
      testType: 'validation',
      runName: `validation-${modelName}-15tests`,
      validateSingle: true,
      metadata: {
        validationMetrics: metrics,
        phase: 'phase1-phase2-validation',
        promptVersion: 'v2.1'
      }
    });

    console.log(`\n✅ ${modelName} results saved: ${saveResult.filePath}`);
  } catch (error) {
    console.error(`❌ Error saving ${modelName} results:`, error.message);
  }
}

// Run validation tests
console.log('Starting validation test run...\n');

const results = await runner.runPerformanceTests(prompts, 6, onModelComplete, VALIDATION_MODELS);

console.log('\n' + '='.repeat(80));
console.log('✅ VALIDATION TEST COMPLETE');
console.log('='.repeat(80));

// Summary metrics across all models
const allMetrics = {
  totalTests: results.length,
  expectedTests: prompts.length * VALIDATION_MODELS.length,
  hallucinationInstances: 0,
  thinkTagInstances: 0,
  validSuggestions: 0
};

results.forEach(r => {
  if (r.response) {
    if (r.response.includes('[USER RESPONSE]') || r.response.includes('[ARIONCOMPLY AI]')) {
      allMetrics.hallucinationInstances++;
    }
    if (r.response.includes('<think>')) {
      allMetrics.thinkTagInstances++;
    }
    const sugVal = validateSuggestions(r.response);
    if (sugVal.valid) {
      allMetrics.validSuggestions++;
    }
  }
});

console.log(`\n📊 Overall Results:`);
console.log(`   Total tests: ${allMetrics.totalTests}/${allMetrics.expectedTests}`);
console.log(`   Hallucination instances: ${allMetrics.hallucinationInstances} (Target: 0)`);
console.log(`   Think tag instances: ${allMetrics.thinkTagInstances} (Target: 0)`);
console.log(`   Valid suggestions: ${allMetrics.validSuggestions}/${allMetrics.totalTests} (${(allMetrics.validSuggestions/allMetrics.totalTests*100).toFixed(1)}%)`);

if (allMetrics.hallucinationInstances === 0) {
  console.log(`\n✅ SUCCESS: Phase 1 hallucination fix VERIFIED (0 hallucinations)`);
} else {
  console.log(`\n⚠️  WARNING: ${allMetrics.hallucinationInstances} hallucinations still detected`);
}

if (allMetrics.thinkTagInstances === 0) {
  console.log(`✅ SUCCESS: Phase 1 think tag fix VERIFIED (0 think tags)`);
} else {
  console.log(`⚠️  WARNING: ${allMetrics.thinkTagInstances} think tag instances still detected`);
}

console.log(`\n📄 Log file: ${logFile}`);
console.log(`📁 Results saved to: reports/validation/2026-03-26/\n`);
