/**
 * MANDATORY TESTING STANDARDS FOR ALL TEST RUNS
 * ============================================
 * 1. Logger initialization required - NO EXCEPTIONS
 * 2. Per-prompt logging with timestamps - REQUIRED
 * 3. Incremental result saving per model - NO WAITING UNTIL END
 * 4. onModelComplete callback MUST be provided - NO EXCEPTIONS
 * 5. Results saved to schema-compliant format - VALIDATED BEFORE SAVE
 *
 * These standards ensure:
 * - Complete visibility into test execution timeline
 * - No data loss if execution fails mid-run
 * - Comprehensive metrics for analysis and debugging
 * - Consistent data format across all test runs
 */

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

// MANDATORY: Only use first 3 models for test runs
// This prevents extremely long execution times while still providing meaningful data
// All future test runs MUST follow this pattern
const topModels = ['smollm3', 'phi3', 'mistral']; // First 3 models only
const multiTierTests = Object.values(AI_BACKEND_MULTI_TIER_TESTS); // All 50 prompts

const prompts = multiTierTests.map(t => ({
  id: t.id,
  input: t.fullPrompt,
  estimatedTokens: t.estimatedTokens,
  fullPromptText: t.fullPrompt,  // Store original prompt for schema
  originalTest: t                 // Store original test object for metadata
}));

const runner = new ResilientPerformanceTestRunner();

// Initialize logger for this test run
const logFile = runner.initializeLogger('multitier-comprehensive');

console.log('\n' + '='.repeat(80));
console.log('MULTI-TIER PERFORMANCE TEST (First 3 Models)');
console.log('='.repeat(80));
console.log(`Models (${topModels.length}):`, topModels.join(', '));
console.log(`Prompts: ${multiTierTests.length} multi-tier (2000+ tokens each)`);
console.log(`Total executions: ${multiTierTests.length} prompts × ${topModels.length} models = ${multiTierTests.length * topModels.length} tests`);
console.log(`\n📝 Logging enabled: YES (timestamps for all events)`);
console.log(`💾 Incremental saving: YES (per-model results saved immediately)`);
console.log(`📄 Log file: ${logFile}\n`);

// Prompt map for enrichment
const promptMap = Object.fromEntries(prompts.map(p => [p.id, p]));

/**
 * Callback executed when each model completes
 * Saves results incrementally instead of waiting for all tests
 */
async function onModelComplete(modelName, modelResults) {
  if (!modelResults || modelResults.length === 0) {
    console.log(`⚠️  No results for ${modelName}`);
    return;
  }

  // Enrich results with full prompt text for schema compliance
  const enrichedResults = modelResults.map(result => ({
    ...result,
    fullPromptText: promptMap[result.promptId]?.fullPromptText || '',
    promptTokens: promptMap[result.promptId]?.estimatedTokens || 0
  }));

  // Save incrementally per model
  try {
    const saveResult = await saveSchemaCompliantResults(enrichedResults, {
      testType: 'performance',
      runName: `multitier-${modelName}-${modelResults.length}tests`,
      validateSingle: true
    });

    console.log(`\n✅ ${modelName} results saved!`);
    console.log(`   Path: ${saveResult.filePath}`);
    console.log(`   Validated: ${saveResult.validated}/${modelResults.length} results`);
    if (saveResult.failed > 0) {
      console.log(`   ⚠️  Failed validation: ${saveResult.failed}`);
    }
  } catch (error) {
    console.error(`❌ Error saving ${modelName} results:`);
    console.error(error.message);
  }
}

// Run tests with incremental result saving via callback (filter to first 3 models)
const results = await runner.runPerformanceTests(prompts, 6, onModelComplete, topModels);

console.log('\n' + '='.repeat(80));
console.log('✅ All Multi-Tier Performance Tests Complete!');
console.log('='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`   Total results collected: ${results.length}`);
console.log(`   Expected: ${multiTierTests.length} prompts × ${topModels.length} models = ${multiTierTests.length * topModels.length} tests`);
console.log(`   ✅ Logging: ENABLED (timestamps for all events)`);
console.log(`   ✅ Incremental saving: ENABLED (per-model results saved immediately)`);
console.log(`   📝 Complete event log: ${logFile}`);
console.log(`   📁 Individual model results: reports/performance/{YYYY-MM-DD}/test-results-multitier-{model}-*.json\n`);
