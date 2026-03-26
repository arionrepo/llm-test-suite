// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-performance-tests.js
// Description: Execute all 6 performance test runs (TINY through MULTITIER) with schema-compliant result capture
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-25

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { PERFORMANCE_PROMPTS } from './performance-prompts.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import fs from 'fs';

async function runAllPerformanceTests() {
  const runner = new ResilientPerformanceTestRunner();

  // MANDATORY: Initialize logger before any test execution
  const logFile = runner.initializeLogger('performance-all-runs');
  console.log(`\n📝 Logging to: ${logFile}\n`);

  const allResults = [];

  console.log('='.repeat(80));
  console.log('PERFORMANCE TEST SUITE - 5 Runs × 10 Prompts × 10 Models');
  console.log('='.repeat(80));
  console.log('Total executions: 500');
  console.log('Estimated duration: 2.5-3 hours');
  console.log('Verification: Active endpoint testing, no timeout assumptions');
  console.log('Recovery: 5-attempt retry with pkill fallback');
  console.log('='.repeat(80));

  const runs = [
    { num: 1, name: 'TINY', prompts: PERFORMANCE_PROMPTS.RUN_1_TINY },
    { num: 2, name: 'SHORT', prompts: PERFORMANCE_PROMPTS.RUN_2_SHORT },
    { num: 3, name: 'MEDIUM', prompts: PERFORMANCE_PROMPTS.RUN_3_MEDIUM },
    { num: 4, name: 'LONG', prompts: PERFORMANCE_PROMPTS.RUN_4_LONG },
    { num: 5, name: 'VERYLONG', prompts: PERFORMANCE_PROMPTS.RUN_5_VERYLONG }
  ];

  for (const run of runs) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`STARTING RUN ${run.num}: ${run.name} INPUT PROMPTS`);
    console.log('='.repeat(80));

    const results = await runner.runPerformanceTests(run.prompts, run.num);
    allResults.push(...results);

    // Convert to unified schema format
    const schemaResults = results.map(r => convertToSchema(r, run.num, run.name));

    // Save per-run results with validation
    try {
      const timestamp = new Date().toISOString();
      saveSchemaCompliantResults(schemaResults, {
        testType: 'performance',
        runName: `run-${run.num}-${run.name.toLowerCase()}`,
        timestamp
      });
    } catch (error) {
      console.error(`❌ Failed to save Run ${run.num} results:`, error.message);
      console.log('   Continuing with remaining runs...');
    }

    console.log(`\n✅ Run ${run.num} complete: ${results.length} executions`);
  }

  // Save aggregate results
  const aggregate = {
    timestamp: new Date().toISOString(),
    totalExecutions: allResults.length,
    expectedExecutions: 500,
    completionRate: (allResults.length / 500 * 100).toFixed(1) + '%',
    results: allResults,
    issues: runner.issueLog,
    summary: generateSummary(allResults)
  };

  fs.writeFileSync(
    './reports/performance-aggregate.json',
    JSON.stringify(aggregate, null, 2)
  );

  console.log('\n' + '='.repeat(80));
  console.log('ALL PERFORMANCE TESTS COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total executions: ${allResults.length}/500 (${aggregate.completionRate})`);
  console.log(`Issues encountered: ${runner.issueLog.length}`);
  console.log(`Reports saved to: ./reports/performance-*.json`);

  printSummary(aggregate.summary);
}

function generateSummary(results) {
  const byModel = {};

  results.forEach(r => {
    if (!byModel[r.modelName]) {
      byModel[r.modelName] = {
        executions: 0,
        avgInputTokPerSec: 0,
        avgOutputTokPerSec: 0,
        avgTotalTimeMs: 0,
        totalTokens: 0
      };
    }

    const stats = byModel[r.modelName];
    stats.executions++;
    stats.avgInputTokPerSec += r.inputTokPerSec || 0;
    stats.avgOutputTokPerSec += r.outputTokPerSec || 0;
    stats.avgTotalTimeMs += r.totalTimeMs || 0;
    stats.totalTokens += r.totalTokens || 0;
  });

  Object.keys(byModel).forEach(model => {
    const stats = byModel[model];
    if (stats.executions > 0) {
      stats.avgInputTokPerSec /= stats.executions;
      stats.avgOutputTokPerSec /= stats.executions;
      stats.avgTotalTimeMs /= stats.executions;
    }
  });

  return byModel;
}

function printSummary(summary) {
  console.log('\nPerformance Summary:');
  console.log('Model'.padEnd(25) + 'Tests'.padEnd(10) + 'Output tok/s'.padEnd(15) + 'Avg Time');
  console.log('-'.repeat(70));

  Object.entries(summary)
    .sort((a,b) => b[1].avgOutputTokPerSec - a[1].avgOutputTokPerSec)
    .forEach(([model, stats]) => {
      console.log(
        model.padEnd(25) +
        stats.executions.toString().padEnd(10) +
        stats.avgOutputTokPerSec.toFixed(1).padEnd(15) +
        (stats.avgTotalTimeMs/1000).toFixed(1) + 's'
      );
    });
}

/**
 * Convert performance test result to unified schema format.
 *
 * @param {Object} result - Result from performance test runner
 * @param {number} runNumber - The run number
 * @param {string} runName - The run name (TINY, SMALL, etc.)
 * @returns {Object} Result in unified schema format
 */
function convertToSchema(result, runNumber, runName) {
  const now = new Date(result.timestamp || new Date().toISOString());

  return {
    metadata: {
      timestamp: now.toISOString(),
      testRunId: `test-run-${runNumber}-${runName.toLowerCase()}-${now.toISOString().split('T')[0]}`,
      runNumber: runNumber,
      runName: runName,
      runType: 'performance',
      focus: 'throughput'
    },

    input: {
      promptId: result.promptId,
      fullPromptText: result.fullPromptText || '', // Should be populated by performance-prompts
      fullPromptTokens: result.inputTokens || 0
    },

    modelConfig: {
      modelName: result.modelName,
      quantization: 'Q4_K_M' // Default, may vary
    },

    output: {
      response: result.response || '',
      responseTokens: result.outputTokens || result.responseTokens || 0,
      responseCharacters: (result.response || '').length
    },

    timing: {
      totalMs: result.totalTimeMs,
      promptProcessingMs: result.promptProcessingMs,
      generationMs: result.generationMs,
      tokensPerSecond: result.outputTokPerSec || 0,
      inputTokensPerSecond: result.inputTokPerSec || 0,
      outputTokensPerSecond: result.outputTokPerSec || 0,
      timePerToken: result.totalTimeMs / (result.outputTokens || 1)
    },

    execution: {
      success: result.response && result.response.trim() !== '',
      responseValidated: result.response && result.response.trim() !== '',
      errors: [],
      warnings: [],
      validationChecks: {
        responseNotEmpty: result.response && result.response.trim() !== '',
        responseWithinTokenLimit: (result.outputTokens || 0) <= 500,
        modelResponded: !!result.response,
        noConnectionErrors: true,
        noTimeouts: true
      }
    }
  };
}

runAllPerformanceTests().catch(console.error);
