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

console.log('Running Multi-Tier Performance Test');
console.log('Models:', topModels.join(', '));
console.log(`Prompts: ${multiTierTests.length} multi-tier (2000+ tokens each)`);
console.log(`Total executions: ${multiTierTests.length} × 5 = ${multiTierTests.length * 5}\n`);

const results = await runner.runPerformanceTests(prompts, 6);

// Enrich results with full prompt text for schema compliance
const promptMap = Object.fromEntries(prompts.map(p => [p.id, p]));
const enrichedResults = results.map(result => ({
  ...result,
  fullPromptText: promptMap[result.promptId]?.fullPromptText || '',
  promptTokens: promptMap[result.promptId]?.estimatedTokens || 0
}));

// Save with schema validation and proper directory structure
try {
  const saveResult = await saveSchemaCompliantResults(enrichedResults, {
    testType: 'performance',
    runName: `multitier-comprehensive-${multiTierTests.length}prompts`,
    validateSingle: true
  });

  console.log('\n✅ Multi-tier performance test complete!');
  console.log(`📊 Results saved to: ${saveResult.filePath}`);
  console.log(`   Validated: ${saveResult.validated} results`);
  if (saveResult.failed > 0) {
    console.log(`   ⚠️  Failed validation: ${saveResult.failed}`);
  }
} catch (error) {
  console.error('\n❌ Error saving results:');
  console.error(error.message);
  process.exit(1);
}
