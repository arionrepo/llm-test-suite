/**
 * Split Multi-Tier Performance Test (2 runs of 25 prompts each)
 * File: run-multitier-split-25.js
 * Description: Run multi-tier tests in 2 batches to track trends and allow analysis
 * Author: Libor Ballaty <libor@arionetworks.com>
 * Created: 2026-03-26
 *
 * Test Structure:
 * - 3 models: smollm3, phi3, mistral
 * - 50 prompts total (split into 2 runs)
 * - Run 1: prompts 0-24 (25 prompts)
 * - Run 2: prompts 25-49 (25 prompts)
 * - Per run: 25 prompts × 3 models = 75 test executions
 * - Total: 150 test executions
 *
 * Mandatory Standards (enforced in code):
 * ✅ Logging with timestamps - REQUIRED
 * ✅ Incremental result saving - REQUIRED
 * ✅ Per-model callbacks - REQUIRED
 * ✅ Schema validation - REQUIRED
 */

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';
import { saveSchemaCompliantResults, convertRunnerResultToSchema } from './utils/test-helpers.js';

// MANDATORY: Only first 3 models
const topModels = ['smollm3', 'phi3', 'mistral'];
const allMultiTierTests = Object.values(AI_BACKEND_MULTI_TIER_TESTS); // All 50 prompts

// Split configuration: 2 runs of 25 prompts each
const runs = [
  {
    runNumber: 1,
    name: 'split-25-run1',
    startIdx: 0,
    endIdx: 24,  // Inclusive (0-24 = 25 prompts)
    description: 'Multi-tier batch 1 (prompts 1-25)'
  },
  {
    runNumber: 2,
    name: 'split-25-run2',
    startIdx: 25,
    endIdx: 49,  // Inclusive (25-49 = 25 prompts)
    description: 'Multi-tier batch 2 (prompts 26-50)'
  }
];

/**
 * Execute a single test run with specified prompts
 */
async function executeTestRun(runConfig) {
  const promptsForRun = allMultiTierTests.slice(runConfig.startIdx, runConfig.endIdx + 1);
  const prompts = promptsForRun.map(t => ({
    id: t.id,
    input: t.fullPrompt,
    estimatedTokens: t.estimatedTokens,
    fullPromptText: t.fullPrompt,
    originalTest: t
  }));

  const runner = new ResilientPerformanceTestRunner();
  const logFile = runner.initializeLogger(runConfig.name);

  console.log('\n' + '='.repeat(80));
  console.log(`RUN ${runConfig.runNumber}/2: ${runConfig.description}`);
  console.log('='.repeat(80));
  console.log(`Models (${topModels.length}):`, topModels.join(', '));
  console.log(`Prompts: ${prompts.length} (batch ${runConfig.runNumber}: prompts ${runConfig.startIdx + 1}-${runConfig.endIdx + 1})`);
  console.log(`Total executions: ${prompts.length} prompts × ${topModels.length} models = ${prompts.length * topModels.length} tests`);
  console.log(`\n📝 Logging: YES (timestamps for all events)`);
  console.log(`💾 Incremental saving: YES (per-model results saved immediately)`);
  console.log(`📄 Log file: ${logFile}\n`);

  // Prompt map for enrichment
  const promptMap = Object.fromEntries(prompts.map(p => [p.id, p]));

  /**
   * Callback for incremental per-model result saving
   */
  async function onModelComplete(modelName, modelResults) {
    if (!modelResults || modelResults.length === 0) {
      console.log(`⚠️  No results for ${modelName}`);
      return;
    }

    // Convert results to schema-compliant format with full prompt text
    const enrichedResults = modelResults.map(result =>
      convertRunnerResultToSchema(
        result,
        promptMap[result.promptId]?.fullPromptText || '',
        promptMap[result.promptId]?.estimatedTokens || 0
      )
    );

    // Save incrementally per model
    try {
      const saveResult = await saveSchemaCompliantResults(enrichedResults, {
        testType: 'performance',
        runName: `multitier-${modelName}-${runConfig.name}`,
        validateSingle: true
      });

      console.log(`\n✅ ${modelName} results saved (Run ${runConfig.runNumber})!`);
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

  // Execute test run with mandatory logging, callbacks, and model filter
  const results = await runner.runPerformanceTests(prompts, runConfig.runNumber, onModelComplete, topModels);

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Run ${runConfig.runNumber}/2 Complete`);
  console.log('='.repeat(80));
  console.log(`   Total results: ${results.length}/${prompts.length * topModels.length} tests`);
  console.log(`   📝 Log file: ${logFile}\n`);

  return results;
}

/**
 * Execute all runs sequentially
 */
async function executeAllRuns() {
  console.log('\n' + '='.repeat(80));
  console.log('SPLIT MULTI-TIER PERFORMANCE TEST (3 Models × 50 Prompts in 2 Runs)');
  console.log('='.repeat(80));
  console.log(`Total tests: 25 prompts/run × 3 models × 2 runs = 150 test executions`);
  console.log(`\nRunning tests with MANDATORY STANDARDS:`);
  console.log(`  ✅ Comprehensive timestamped logging`);
  console.log(`  ✅ Incremental per-model result saving`);
  console.log(`  ✅ Schema validation for all results`);
  console.log(`  ✅ Real-time progress visibility\n`);

  const allResults = [];

  // Run 1: Prompts 0-24
  console.log('Starting Run 1 of 2...');
  const run1Results = await executeTestRun(runs[0]);
  allResults.push(...run1Results);

  // Run 2: Prompts 25-49
  console.log('Starting Run 2 of 2...');
  const run2Results = await executeTestRun(runs[1]);
  allResults.push(...run2Results);

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL SPLIT TESTS COMPLETE');
  console.log('='.repeat(80));
  console.log(`\n📊 Final Summary:`);
  console.log(`   Run 1 results: ${run1Results.length}`);
  console.log(`   Run 2 results: ${run2Results.length}`);
  console.log(`   Total results: ${allResults.length}`);
  console.log(`   Expected: ${50 * topModels.length} (50 prompts × ${topModels.length} models)`);
  console.log(`\n✅ Logging: ENABLED (timestamps for all events)`);
  console.log(`✅ Incremental saving: ENABLED (results saved per-model, per-run)`);
  console.log(`📁 Results location: reports/performance/{YYYY-MM-DD}/test-results-multitier-*.json`);
  console.log(`📝 Log files: logs/test-run-split-25-run{1,2}-*.log\n`);

  return allResults;
}

// Execute
await executeAllRuns();
