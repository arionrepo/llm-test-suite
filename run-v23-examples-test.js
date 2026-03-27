// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-v23-examples-test.js
// Description: Test runner for v2.3.0 example prompts with ground truth validation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Purpose: Validate that v2.3.0 ground truth fields work correctly before
// applying pattern to all 239 existing prompts.

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { NEW_PROMPTS_V23_EXAMPLES } from './NEW-PROMPTS-V2.3-EXAMPLES.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import fs from 'fs';

/**
 * Validate response against v2.3.0 ground truth fields
 */
function validateWithGroundTruth(response, prompt) {
  const validation = {
    promptId: prompt.id,
    question: prompt.question,
    response: response,

    // Keyword matching (existing approach)
    keywordMatching: validateKeywords(response, prompt.expectedTopics),

    // Ground truth validation (NEW)
    groundTruth: {
      mustMentionCheck: null,
      mustNotMentionCheck: null,
      overallPass: false
    },

    scores: {
      keywordScore: 0,
      groundTruthScore: 0,
      combinedScore: 0
    }
  };

  // Validate mustMention
  if (prompt.mustMention) {
    const mentioned = prompt.mustMention.filter(fact => {
      // Handle OR logic (e.g., "effective 2018 OR May 2018")
      if (fact.includes(' OR ')) {
        const alternatives = fact.split(' OR ');
        return alternatives.some(alt => response.toLowerCase().includes(alt.toLowerCase()));
      }
      return response.toLowerCase().includes(fact.toLowerCase());
    });

    validation.groundTruth.mustMentionCheck = {
      required: prompt.mustMention,
      found: mentioned,
      missing: prompt.mustMention.filter(f => !mentioned.includes(f)),
      score: (mentioned.length / prompt.mustMention.length) * 100
    };
  }

  // Validate mustNotMention
  if (prompt.mustNotMention) {
    const misconceptions = prompt.mustNotMention.filter(error =>
      response.toLowerCase().includes(error.toLowerCase())
    );

    validation.groundTruth.mustNotMentionCheck = {
      prohibited: prompt.mustNotMention,
      found: misconceptions,
      passed: misconceptions.length === 0
    };
  }

  // Calculate overall ground truth score
  const mustMentionScore = validation.groundTruth.mustMentionCheck?.score || 0;
  const mustNotMentionPassed = validation.groundTruth.mustNotMentionCheck?.passed !== false;

  validation.groundTruth.overallPass =
    mustMentionScore >= 60 &&  // At least 60% of essential facts mentioned
    mustNotMentionPassed;       // No misconceptions present

  validation.scores.groundTruthScore = mustNotMentionPassed ? mustMentionScore : mustMentionScore * 0.5;

  // Calculate keyword score (existing)
  validation.scores.keywordScore = validation.keywordMatching.score;

  // Combined score (favor ground truth if available)
  validation.scores.combinedScore = validation.groundTruth.mustMentionCheck ?
    validation.scores.groundTruthScore :
    validation.scores.keywordScore;

  return validation;
}

/**
 * Existing keyword matching validation
 */
function validateKeywords(response, expectedTopics) {
  const found = expectedTopics.filter(topic =>
    response.toLowerCase().includes(topic.toLowerCase())
  );

  return {
    expectedTopics,
    found,
    missing: expectedTopics.filter(t => !found.includes(t)),
    score: (found.length / expectedTopics.length) * 100,
    passed: found.length / expectedTopics.length >= 0.5
  };
}

/**
 * Main test execution
 */
async function runV23ExamplesTest() {
  console.log('='.repeat(80));
  console.log('v2.3.0 EXAMPLE PROMPTS TEST - Ground Truth Validation');
  console.log('='.repeat(80));
  console.log('Prompts: 15 example prompts with ground truth fields');
  console.log('Model: phi3 (local)');
  console.log('Purpose: Validate v2.3.0 pattern before applying to all 239 prompts');
  console.log('llama-bench: DISABLED (HTTP testing only)');
  console.log('='.repeat(80));

  const runner = new ResilientPerformanceTestRunner();

  // MANDATORY: Initialize logger
  const logFile = runner.initializeLogger('v23-examples');
  console.log(`\n📝 Logging to: ${logFile}\n`);

  // Use only phi3 for quick validation (don't need all models for pattern validation)
  const modelName = 'phi3';
  const prompts = NEW_PROMPTS_V23_EXAMPLES;

  console.log(`\nStarting test with ${prompts.length} prompts...\n`);

  // CRITICAL: Ensure no llama-bench conflicts
  console.log('Pre-flight check: Ensuring clean state...');
  await runner.forceStopAllModels();

  // Start model
  console.log('Starting model:', modelName);
  const started = await runner.startModelWithRetry(modelName);

  if (!started) {
    console.error('❌ Failed to start model');
    return;
  }

  runner.logEvent('MODEL_STARTED', { model: modelName });

  // Run each prompt
  const results = [];
  const port = runner.managerClient.getModelPort(modelName);
  const { LLMClient } = await import('./utils/llm-client.js');
  const client = new LLMClient(`http://127.0.0.1:${port}`);

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n[${ i+1}/${prompts.length}] Testing: ${prompt.id}`);
    console.log(`  Question: ${prompt.question.substring(0, 80)}...`);

    runner.logEvent('TEST_START', { promptId: prompt.id, testNumber: i + 1 });

    try {
      const result = await client.chatCompletion([
        { role: 'user', content: prompt.question }
      ], {
        max_tokens: 500,
        temperature: 0.3
      });

      if (result.success && result.response) {
        console.log(`  Response: ${result.response.substring(0, 100)}...`);
        console.log(`  Tokens: ${result.timing.completionTokens} | Speed: ${result.timing.tokensPerSec.toFixed(1)} tok/s`);

        // Validate with ground truth
        const validation = validateWithGroundTruth(result.response, prompt);

        console.log(`  Keyword score: ${validation.scores.keywordScore.toFixed(0)}%`);
        if (validation.groundTruth.mustMentionCheck) {
          console.log(`  Ground truth score: ${validation.scores.groundTruthScore.toFixed(0)}%`);
          console.log(`  mustMention: ${validation.groundTruth.mustMentionCheck.found.length}/${validation.groundTruth.mustMentionCheck.required.length} facts`);
        }
        console.log(`  Overall: ${validation.groundTruth.overallPass ? '✅ PASS' : '❌ FAIL'}`);

        results.push({
          promptId: prompt.id,
          prompt,
          response: result.response,
          timing: result.timing,
          validation
        });

        runner.logEvent('TEST_COMPLETE', {
          promptId: prompt.id,
          keywordScore: validation.scores.keywordScore,
          groundTruthScore: validation.scores.groundTruthScore,
          passed: validation.groundTruth.overallPass
        });

      } else {
        console.log(`  ❌ Failed: ${result.error || 'No response'}`);
        runner.logEvent('TEST_FAILED', { promptId: prompt.id, error: result.error });
      }

    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`);
      runner.logEvent('TEST_ERROR', { promptId: prompt.id, error: error.message });
    }
  }

  // Stop model
  await runner.stopModelWithRetry(modelName);
  runner.logEvent('MODEL_STOPPED', { model: modelName });

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE - GENERATING REPORT');
  console.log('='.repeat(80));

  const report = generateReport(results);

  // Save results
  const timestamp = new Date().toISOString();
  const reportPath = `reports/v23-validation/v23-examples-test-${timestamp.split('T')[0]}.json`;

  fs.mkdirSync('reports/v23-validation', { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 Report saved to:', reportPath);

  printSummary(report);

  return report;
}

/**
 * Generate comprehensive validation report
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalPrompts: results.length,
    model: 'phi3',
    purpose: 'Validate v2.3.0 ground truth pattern',

    results,

    summary: {
      keywordValidation: {
        avgScore: 0,
        passed: 0,
        failed: 0
      },
      groundTruthValidation: {
        avgScore: 0,
        passed: 0,
        failed: 0,
        withMustMention: 0,
        withMustNotMention: 0
      },
      improvement: {
        keywordVsGroundTruth: 0
      }
    },

    insights: [],
    recommendations: []
  };

  // Calculate statistics
  results.forEach(r => {
    const val = r.validation;

    // Keyword stats
    report.summary.keywordValidation.avgScore += val.scores.keywordScore;
    if (val.keywordMatching.passed) report.summary.keywordValidation.passed++;
    else report.summary.keywordValidation.failed++;

    // Ground truth stats
    if (val.groundTruth.mustMentionCheck) {
      report.summary.groundTruthValidation.withMustMention++;
      report.summary.groundTruthValidation.avgScore += val.scores.groundTruthScore;
      if (val.groundTruth.overallPass) report.summary.groundTruthValidation.passed++;
      else report.summary.groundTruthValidation.failed++;
    }

    if (val.groundTruth.mustNotMentionCheck) {
      report.summary.groundTruthValidation.withMustNotMention++;
    }
  });

  // Calculate averages
  const count = results.length;
  report.summary.keywordValidation.avgScore /= count;
  report.summary.groundTruthValidation.avgScore /=
    (report.summary.groundTruthValidation.withMustMention || 1);

  // Calculate improvement
  report.summary.improvement.keywordVsGroundTruth =
    report.summary.groundTruthValidation.avgScore - report.summary.keywordValidation.avgScore;

  // Generate insights
  if (report.summary.improvement.keywordVsGroundTruth < 0) {
    report.insights.push({
      type: 'CONCERN',
      message: 'Ground truth validation scored LOWER than keyword matching',
      detail: `Difference: ${report.summary.improvement.keywordVsGroundTruth.toFixed(1)}%`,
      action: 'Review mustMention criteria - may be too strict'
    });
  } else if (report.summary.improvement.keywordVsGroundTruth > 20) {
    report.insights.push({
      type: 'SUCCESS',
      message: 'Ground truth validation significantly more accurate than keywords',
      detail: `Improvement: +${report.summary.improvement.keywordVsGroundTruth.toFixed(1)}%`,
      action: 'Pattern validated - apply to all prompts'
    });
  }

  // Identify prompts that failed ground truth but passed keywords
  const falsePositives = results.filter(r =>
    r.validation.keywordMatching.passed &&
    !r.validation.groundTruth.overallPass
  );

  if (falsePositives.length > 0) {
    report.insights.push({
      type: 'VALIDATION_IMPROVEMENT',
      message: `${falsePositives.length} prompts passed keyword but failed ground truth`,
      detail: 'Ground truth caught issues keyword matching missed',
      examples: falsePositives.slice(0, 3).map(r => r.promptId)
    });
  }

  return report;
}

/**
 * Print summary to console
 */
function printSummary(report) {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  console.log('\nKeyword Matching (existing approach):');
  console.log('  Average score:', report.summary.keywordValidation.avgScore.toFixed(1) + '%');
  console.log('  Passed:', report.summary.keywordValidation.passed + '/' + report.totalPrompts);
  console.log('  Failed:', report.summary.keywordValidation.failed + '/' + report.totalPrompts);

  console.log('\nGround Truth Validation (v2.3.0 approach):');
  console.log('  Prompts with mustMention:', report.summary.groundTruthValidation.withMustMention);
  console.log('  Average score:', report.summary.groundTruthValidation.avgScore.toFixed(1) + '%');
  console.log('  Passed:', report.summary.groundTruthValidation.passed + '/' + report.summary.groundTruthValidation.withMustMention);
  console.log('  Failed:', report.summary.groundTruthValidation.failed + '/' + report.summary.groundTruthValidation.withMustMention);

  console.log('\nImprovement:');
  const improvement = report.summary.improvement.keywordVsGroundTruth;
  console.log('  Ground truth vs keywords:',
    improvement > 0 ? '+' + improvement.toFixed(1) + '% ✅' : improvement.toFixed(1) + '%');

  if (report.insights.length > 0) {
    console.log('\nKey Insights:');
    report.insights.forEach(insight => {
      console.log(`  [${insight.type}] ${insight.message}`);
      console.log(`    ${insight.detail}`);
      if (insight.examples) {
        console.log(`    Examples: ${insight.examples.join(', ')}`);
      }
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('Next Step: Review detailed results in report JSON');
  console.log('If validation works well, apply pattern to all 239 prompts');
  console.log('='.repeat(80));
}

// Run test
runV23ExamplesTest().catch(console.error);
