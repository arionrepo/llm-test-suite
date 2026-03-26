// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/test-helpers.js
// Description: Shared utility functions for test suites - formatting, statistics, reporting, validation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import fs from 'fs';
import path from 'path';
import { validateTestResult, validateTestResultBatch, getValidationErrorReport } from './test-result-validator.js';

export function formatDuration(ms) {
  if (ms < 1000) return ms.toFixed(0) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

export function calculateStats(numbers) {
  if (numbers.length === 0) return null;
  
  const sorted = numbers.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  return { avg, median, min, max, count: numbers.length };
}

export function printTestHeader(testName) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + testName);
  console.log('='.repeat(60) + '\n');
}

export function printTestResult(testName, passed, details) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(status + ': ' + testName);
  if (details) console.log('  ' + details);
}

export function saveReport(testName, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = 'test-results-' + testName + '-' + timestamp + '.json';
  const filepath = path.join(process.cwd(), 'reports', filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));

  console.log('\n📊 Report saved: ' + filepath);
  return filepath;
}

/**
 * Save test results with schema validation and proper directory structure.
 *
 * Business Purpose: Ensure all test results are validated and stored in
 * organized, date-based directory structure for easy discovery and analysis.
 * Optionally tracks Docker configuration used during testing for benchmarking.
 *
 * Directory structure: reports/{testType}/{YYYY-MM-DD}/test-results-{runName}-{timestamp}.json
 *
 * @param {Array|Object} results - Test result(s) to save
 * @param {Object} options - Configuration options
 * @param {string} options.testType - Type of test (performance, accuracy, compliance, quality, custom)
 * @param {string} options.runName - Name of the test run (e.g., "multitier", "gdpr-compliance")
 * @param {string} options.timestamp - Optional override timestamp (defaults to now)
 * @param {boolean} options.validateSingle - If true, validate each result individually (default: true)
 * @param {Object} options.dockerConfig - Optional Docker configuration metadata to track with results
 *   Contains: profileName, description, purpose, threads, n_batch, n_parallel, memory_overhead_percent, concurrent_requests
 * @returns {Object} { filePath: string, validated: number, failed: number, errors: string[] }
 * @throws {Error} If validation fails and results cannot be saved
 *
 * Example:
 *   const results = [... test results ...];
 *   const saved = saveSchemaCompliantResults(results, {
 *     testType: 'performance',
 *     runName: 'multitier',
 *     dockerConfig: {
 *       profileName: 'balanced',
 *       description: 'Production-realistic',
 *       threads: 10,
 *       n_batch: 1024,
 *       n_parallel: 2
 *     }
 *   });
 *   console.log(`Saved ${saved.validated} results`);
 */
export function saveSchemaCompliantResults(results, options = {}) {
  const {
    testType = 'custom',
    runName = 'test-run',
    timestamp = new Date().toISOString(),
    validateSingle = true,
    dockerConfig = null
  } = options;

  // Validate options
  if (!testType || !runName) {
    throw new Error('REQUIRED: testType and runName must be provided');
  }

  // Convert single result to array
  const resultsArray = Array.isArray(results) ? results : [results];

  if (resultsArray.length === 0) {
    throw new Error('VALIDATION FAILED: No results to save');
  }

  // Validate results if requested
  let validationResult = null;
  if (validateSingle) {
    validationResult = validateTestResultBatch(resultsArray, runName);

    if (!validationResult.valid) {
      const report = getValidationErrorReport(validationResult);
      console.error(report);
      throw new Error(`VALIDATION FAILED: ${validationResult.failedResults}/${validationResult.totalResults} results failed validation`);
    }
  }

  // Create date-based directory structure: reports/{testType}/{YYYY-MM-DD}/
  const now = new Date(timestamp);
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const dirPath = path.join(process.cwd(), 'reports', testType, dateString);

  fs.mkdirSync(dirPath, { recursive: true });

  // Generate filename: test-results-{runName}-{timestamp}.json
  const iso = now.toISOString().replace(/[:.]/g, '').replace('Z', 'Z'); // Format: 20260326T103045123Z
  const filename = `test-results-${runName}-${iso}.json`;
  const filePath = path.join(dirPath, filename);

  // Prepare result wrapper with validation info AND Docker configuration
  const resultWrapper = {
    metadata: {
      timestamp: timestamp,
      testType: testType,
      runName: runName,
      resultCount: resultsArray.length,
      validationPassed: validationResult ? validationResult.valid : 'not-validated',
      savedAt: new Date().toISOString(),
      dockerConfig: dockerConfig ? {
        profileName: dockerConfig.profileName,
        description: dockerConfig.description,
        purpose: dockerConfig.purpose,
        threads: dockerConfig.threads,
        n_batch: dockerConfig.n_batch,
        n_parallel: dockerConfig.n_parallel,
        memory_overhead_percent: dockerConfig.memory_overhead_percent,
        concurrent_requests: dockerConfig.concurrent_requests
      } : null
    },
    results: resultsArray
  };

  // Write to disk
  fs.writeFileSync(filePath, JSON.stringify(resultWrapper, null, 2));

  console.log(`\n📊 Schema-compliant results saved:`);
  console.log(`   Path: ${filePath}`);
  console.log(`   Results: ${resultsArray.length}`);
  console.log(`   Validated: ${validationResult ? validationResult.summary : 'not-validated'}`);

  return {
    filePath,
    validated: validationResult ? resultsArray.length - validationResult.failedResults : 0,
    failed: validationResult ? validationResult.failedResults : 0,
    errors: validationResult ? validationResult.errors : []
  };
}

export function validateResponse(response, criteria) {
  const results = [];
  
  if (criteria.minLength && response.length < criteria.minLength) {
    results.push({ 
      passed: false, 
      test: 'minLength', 
      expected: criteria.minLength, 
      actual: response.length 
    });
  }
  
  if (criteria.contains) {
    for (const text of criteria.contains) {
      const passed = response.toLowerCase().includes(text.toLowerCase());
      results.push({ passed, test: 'contains', expected: text });
    }
  }
  
  if (criteria.notContains) {
    for (const text of criteria.notContains) {
      const passed = !response.toLowerCase().includes(text.toLowerCase());
      results.push({ passed, test: 'notContains', expected: text });
    }
  }
  
  return {
    allPassed: results.every(r => r.passed),
    results,
  };
}

/**
 * Convert test runner result format to unified schema format
 *
 * Business Purpose: Transforms performance test runner output (simple format)
 * into the comprehensive unified schema format required for consistent data storage.
 *
 * @param {Object} runnerResult - Result from performance test runner
 * @param {string} fullPromptText - Complete prompt text (all tiers)
 * @param {number} fullPromptTokens - Total input tokens
 * @returns {Object} Result in unified schema format with all mandatory sections
 */
export function convertRunnerResultToSchema(runnerResult, fullPromptText = '', fullPromptTokens = 0) {
  if (!runnerResult) {
    throw new Error('Runner result is required for schema conversion');
  }

  const timestamp = new Date().toISOString();

  return {
    // MANDATORY: Metadata section
    metadata: {
      timestamp: runnerResult.timestamp || timestamp,
      testRunId: `test-run-${runnerResult.runNumber}-${runnerResult.modelName}`,
      runNumber: runnerResult.runNumber || 0
    },

    // MANDATORY: Input section (what was sent)
    input: {
      promptId: runnerResult.promptId || 'unknown',
      fullPromptText: fullPromptText || '',
      fullPromptTokens: fullPromptTokens || runnerResult.inputTokens || 0
    },

    // MANDATORY: Output section (what was received)
    output: {
      response: runnerResult.response || '',
      responseTokens: runnerResult.responseTokens || runnerResult.outputTokens || 0,
      completionFinishReason: 'length',
      truncated: false
    },

    // MANDATORY: Timing section (how long it took)
    timing: {
      totalMs: runnerResult.totalTimeMs || 0,
      promptProcessingMs: runnerResult.promptProcessingMs || 0,
      generationMs: runnerResult.generationMs || 0,
      tokensPerSecond: runnerResult.outputTokPerSec || 0
    },

    // MANDATORY: Execution section (did it work?)
    execution: {
      success: !!runnerResult.response && runnerResult.response.trim().length > 0,
      responseValidated: true
    },

    // Additional fields from runner
    modelName: runnerResult.modelName || 'unknown',
    testNumber: runnerResult.testNumber || 0,
    totalTests: runnerResult.totalTests || 0
  };
}
