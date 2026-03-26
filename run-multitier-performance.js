import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

const topModels = ['smollm3', 'phi3', 'mistral', 'llama-3.1-8b', 'hermes-3-llama-8b'];
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

console.log('Running Multi-Tier Performance Test');
console.log('Models:', topModels.join(', '));
console.log(`Prompts: ${multiTierTests.length} multi-tier (2000+ tokens each)`);
console.log(`Total executions: ${multiTierTests.length} × 5 = ${multiTierTests.length * 5}`);
console.log(`📝 Log file: ${logFile}\n`);

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

// Run tests with incremental result saving via callback
const results = await runner.runPerformanceTests(prompts, 6, onModelComplete);

console.log('\n' + '='.repeat(80));
console.log('✅ All Multi-Tier Performance Tests Complete!');
console.log('='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`   Total results collected: ${results.length}`);
console.log(`   Expected: ${multiTierTests.length * 5}`);
console.log(`   📝 Detailed log: ${logFile}\n`);
