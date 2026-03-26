import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';
import fs from 'fs';

const topModels = ['smollm3', 'phi3', 'mistral', 'llama-3.1-8b', 'hermes-3-llama-8b'];
const multiTierTests = Object.values(AI_BACKEND_MULTI_TIER_TESTS).slice(0, 10);

const prompts = multiTierTests.map(t => ({
  id: t.id,
  input: t.fullPrompt,
  estimatedTokens: t.estimatedTokens
}));

const runner = new ResilientPerformanceTestRunner();

console.log('Running Multi-Tier Performance Test');
console.log('Models:', topModels.join(', '));
console.log('Prompts: 10 multi-tier (2000+ tokens each)');
console.log('Total executions:', 10 * 5, '= 50\n');

const results = await runner.runPerformanceTests(prompts, 6);

fs.writeFileSync('./reports/performance-run-6-multitier.json', JSON.stringify({
  runNumber: 6,
  runName: 'MULTITIER_REAL',
  description: 'True multi-tier prompts with TIER 1+2+3 content (2000+ tokens)',
  models: topModels,
  results
}, null, 2));

console.log('\nMulti-tier performance test complete!');
console.log('Report: reports/performance-run-6-multitier.json');
