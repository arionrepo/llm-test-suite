// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-llamabench-example.js
// Description: Example usage of llama-bench client for authoritative performance benchmarking
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-27
//
// Purpose: Demonstrates how to use LlamaBenchClient for speed-focused performance testing
// Use Case: Ideal for Runs 1-5 where we only need speed metrics (tokens/sec, latency)
//          NOT suitable for Run 6 where we need actual response text for quality evaluation

import { LlamaBenchClient } from './utils/llama-bench-client.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

/**
 * Example 1: Single Model Benchmark
 *
 * Run authoritative performance benchmark on a single model with multiple prompt sizes
 */
async function exampleSingleModel() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 1: Single Model Benchmark (phi3)');
  console.log('='.repeat(80));

  const bench = new LlamaBenchClient();

  // Check if llama-bench is available
  const available = await bench.isAvailable();
  if (!available) {
    console.error('❌ llama-bench not found at /opt/homebrew/bin/llama-bench');
    console.error('   Install with: brew install llama.cpp');
    return;
  }

  // Run benchmark with multiple prompt sizes and generation lengths
  const results = await bench.benchmark('phi3', {
    promptSizes: [512, 1024, 2048],     // Test with 3 different prompt sizes
    generations: [128, 256],            // Test 2 generation lengths
    threads: [8],                       // Use 8 threads
    gpuLayers: 35,                      // Offload 35 layers to GPU
    repetitions: 5,                     // 5 repetitions for statistical validity
    batchSize: 2048,                    // Batch size
    runNumber: 1                        // Run number for schema
  });

  console.log(`\n📊 Results: ${results.length} benchmark runs completed`);
  console.log(`   Results are already in schema-compliant format`);

  // Save results (already schema-compliant)
  const saveResult = await saveSchemaCompliantResults(results, {
    testType: 'performance',
    runName: 'llamabench-phi3-example',
    validateSingle: true
  });

  console.log(`\n✅ Saved: ${saveResult.filePath}`);
  console.log(`   Validated: ${saveResult.validated}/${results.length} results`);
}

/**
 * Example 2: Multiple Models Benchmark
 *
 * Run benchmarks on multiple models sequentially (ideal for comprehensive comparison)
 */
async function exampleMultipleModels() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 2: Multiple Models Benchmark');
  console.log('='.repeat(80));

  const bench = new LlamaBenchClient();

  // Benchmark first 4 models with consistent settings
  const models = ['smollm3', 'phi3', 'mistral', 'llama-3.1-8b'];

  const results = await bench.benchmarkMultiple(models, {
    promptSizes: [512, 2048],           // Quick test with 2 sizes
    generations: [128],                 // Single generation length
    threads: [8],
    gpuLayers: 35,
    repetitions: 3,                     // 3 reps for speed
    runNumber: 2
  });

  console.log(`\n📊 Total Results: ${results.length} benchmark runs`);
  console.log(`   Average per model: ${results.length / models.length} runs`);

  // Save all results
  const saveResult = await saveSchemaCompliantResults(results, {
    testType: 'performance',
    runName: 'llamabench-multmodel-example',
    validateSingle: true
  });

  console.log(`\n✅ Saved: ${saveResult.filePath}`);
}

/**
 * Example 3: Custom Configuration
 *
 * Advanced usage with custom thread counts and GPU layer configurations
 */
async function exampleCustomConfig() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 3: Custom Configuration');
  console.log('='.repeat(80));

  const bench = new LlamaBenchClient();

  // Test how different thread counts affect performance
  const results = await bench.benchmark('phi3', {
    promptSizes: [1024],
    generations: [128],
    threads: [4, 8, 16],                // Test 3 different thread counts
    gpuLayers: 35,
    repetitions: 5,
    runNumber: 3
  });

  console.log(`\n📊 Thread Count Impact:`);

  // Group by thread count
  const byThreads = {};
  results.forEach(r => {
    const threads = r.modelConfig.parameters.threads;
    if (!byThreads[threads]) byThreads[threads] = [];
    byThreads[threads].push(r);
  });

  Object.entries(byThreads).forEach(([threads, runs]) => {
    const avgSpeed = runs.reduce((sum, r) => sum + r.timing.tokensPerSecond, 0) / runs.length;
    console.log(`   ${threads} threads: ${avgSpeed.toFixed(2)} tokens/sec (avg)`);
  });
}

/**
 * Example 4: When to Use llama-bench vs Custom Runner
 */
function exampleUsageGuidance() {
  console.log('\n' + '='.repeat(80));
  console.log('USAGE GUIDANCE: llama-bench vs Custom Runner');
  console.log('='.repeat(80));

  console.log('\n✅ USE llama-bench when:');
  console.log('   - Testing pure performance (speed, throughput)');
  console.log('   - Runs 1-5 (framework knowledge tests)');
  console.log('   - Need authoritative metrics without HTTP overhead');
  console.log('   - Comparing raw model performance');
  console.log('   - Testing different hardware configurations');

  console.log('\n❌ DON\'T USE llama-bench when:');
  console.log('   - Need actual response text for quality evaluation');
  console.log('   - Run 6 (ArionComply multi-tier prompts) - MUST use custom runner');
  console.log('   - Testing hallucination, think tags, context usage');
  console.log('   - Validating suggestion format compliance');
  console.log('   - Need to analyze response content');

  console.log('\n💡 HYBRID APPROACH (Recommended):');
  console.log('   - Runs 1-5: Use llama-bench for speed metrics');
  console.log('   - Run 6: Use custom runner (performance-test-runner.js)');
  console.log('   - Both produce schema-compliant results');
  console.log('   - Results can be compared/analyzed together');
}

// Run examples
async function main() {
  const example = process.argv[2] || 'guidance';

  switch (example) {
    case '1':
    case 'single':
      await exampleSingleModel();
      break;
    case '2':
    case 'multiple':
      await exampleMultipleModels();
      break;
    case '3':
    case 'custom':
      await exampleCustomConfig();
      break;
    case 'guidance':
    default:
      exampleUsageGuidance();
      console.log('\nRun examples with:');
      console.log('  node run-llamabench-example.js 1        # Single model');
      console.log('  node run-llamabench-example.js 2        # Multiple models');
      console.log('  node run-llamabench-example.js 3        # Custom config');
      console.log('  node run-llamabench-example.js guidance # This help');
      break;
  }
}

main().catch(console.error);
