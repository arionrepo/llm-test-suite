// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/test-result-validator.js
// Description: Validates test results against unified schema - enforces mandatory fields and data integrity
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

/**
 * Validates a single test result against the unified schema.
 *
 * Business Purpose: Ensure all test results capture complete data before
 * storing to disk. Prevents invalid/incomplete results from polluting test
 * data repository.
 *
 * @param {Object} result - The test result to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * Example:
 *   const result = { ... test data ... };
 *   const validation = validateTestResult(result);
 *   if (!validation.valid) {
 *     console.error('Validation failed:', validation.errors);
 *   }
 */
export function validateTestResult(result) {
  const errors = [];

  // ========== METADATA VALIDATION ==========
  if (!result.metadata) {
    errors.push('MISSING: metadata object');
  } else {
    if (!result.metadata.timestamp) {
      errors.push('MISSING: metadata.timestamp');
    }
    if (!result.metadata.testRunId) {
      errors.push('MISSING: metadata.testRunId');
    }
    if (result.metadata.runNumber === undefined || result.metadata.runNumber === null) {
      errors.push('MISSING: metadata.runNumber');
    }
  }

  // ========== INPUT VALIDATION ==========
  if (!result.input) {
    errors.push('MISSING: input object');
  } else {
    if (!result.input.promptId) {
      errors.push('MISSING: input.promptId');
    }
    if (!result.input.fullPromptText) {
      errors.push('MISSING: input.fullPromptText');
    } else if (result.input.fullPromptText.trim() === '') {
      errors.push('INVALID: input.fullPromptText is empty string');
    }
    if (!result.input.fullPromptTokens && result.input.fullPromptTokens !== 0) {
      errors.push('MISSING: input.fullPromptTokens');
    }
  }

  // ========== OUTPUT VALIDATION ==========
  if (!result.output) {
    errors.push('MISSING: output object');
  } else {
    if (!result.output.response) {
      errors.push('MISSING: output.response - THIS IS CRITICAL');
    } else if (result.output.response.trim() === '') {
      errors.push('INVALID: output.response is empty - THIS IS CRITICAL');
    }
    if (!result.output.responseTokens && result.output.responseTokens !== 0) {
      errors.push('MISSING: output.responseTokens');
    }
  }

  // ========== TIMING VALIDATION ==========
  if (!result.timing) {
    errors.push('MISSING: timing object');
  } else {
    if (!result.timing.totalMs && result.timing.totalMs !== 0) {
      errors.push('MISSING: timing.totalMs');
    }
    if (!result.timing.tokensPerSecond && result.timing.tokensPerSecond !== 0) {
      errors.push('MISSING: timing.tokensPerSecond');
    }
  }

  // ========== EXECUTION VALIDATION ==========
  if (!result.execution) {
    errors.push('MISSING: execution object');
  } else {
    if (result.execution.success === undefined || result.execution.success === null) {
      errors.push('MISSING: execution.success');
    }
    if (result.execution.responseValidated === undefined || result.execution.responseValidated === null) {
      errors.push('MISSING: execution.responseValidated');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    errorCount: errors.length,
    warningCount: 0
  };
}

/**
 * Validates an array of test results.
 *
 * Business Purpose: Batch validation before saving test run results.
 * Provides summary of any validation failures.
 *
 * @param {Array} results - Array of test results
 * @param {string} testRunName - Name of the test run (for error reporting)
 * @returns {Object} { valid: boolean, totalResults: number, failedResults: number, errors: string[] }
 *
 * Example:
 *   const results = [...test results...];
 *   const validation = validateTestResultBatch(results, 'Run 6 MULTITIER');
 *   if (!validation.valid) {
 *     console.error(`${validation.failedResults}/${validation.totalResults} results failed validation`);
 *   }
 */
export function validateTestResultBatch(results, testRunName = 'Test Run') {
  const batchErrors = [];
  let failedCount = 0;

  if (!Array.isArray(results)) {
    return {
      valid: false,
      totalResults: 0,
      failedResults: 0,
      errors: ['INVALID: Results is not an array'],
      testRunName
    };
  }

  results.forEach((result, index) => {
    const validation = validateTestResult(result);
    if (!validation.valid) {
      failedCount++;
      const resultId = result.input?.promptId || result.testId || `[${index}]`;
      batchErrors.push(`${testRunName} Result ${resultId}: ${validation.errors.join('; ')}`);
    }
  });

  return {
    valid: failedCount === 0,
    totalResults: results.length,
    failedResults: failedCount,
    errors: batchErrors,
    summary: `${results.length - failedCount}/${results.length} results passed validation`,
    testRunName
  };
}

/**
 * Checks if a result has all mandatory fields according to schema.
 *
 * @param {Object} result - The result to check
 * @returns {boolean} true if all mandatory fields present and non-empty
 */
export function hasMandatoryFields(result) {
  return result &&
    result.metadata && result.metadata.timestamp && result.metadata.testRunId &&
    (result.metadata.runNumber !== undefined && result.metadata.runNumber !== null) &&
    result.input && result.input.promptId && result.input.fullPromptText &&
    (result.input.fullPromptTokens !== undefined && result.input.fullPromptTokens !== null) &&
    result.output && result.output.response && result.output.response.trim() !== '' &&
    (result.output.responseTokens !== undefined && result.output.responseTokens !== null) &&
    result.timing && (result.timing.totalMs !== undefined && result.timing.totalMs !== null) &&
    (result.timing.tokensPerSecond !== undefined && result.timing.tokensPerSecond !== null) &&
    result.execution &&
    (result.execution.success !== undefined && result.execution.success !== null) &&
    (result.execution.responseValidated !== undefined && result.execution.responseValidated !== null);
}

/**
 * Gets detailed validation error report for display/logging.
 *
 * @param {Object} validation - Result from validateTestResult() or validateTestResultBatch()
 * @returns {string} Formatted error report
 */
export function getValidationErrorReport(validation) {
  const lines = [];

  if (validation.testRunName) {
    lines.push(`\nValidation Report: ${validation.testRunName}`);
    lines.push('='.repeat(70));
  }

  if (validation.totalResults !== undefined) {
    lines.push(`Total Results: ${validation.totalResults}`);
    lines.push(`Passed: ${validation.totalResults - validation.failedResults}`);
    lines.push(`Failed: ${validation.failedResults}`);
    lines.push(`Success Rate: ${((1 - validation.failedResults / validation.totalResults) * 100).toFixed(1)}%`);
    lines.push('');
  }

  if (validation.errors && validation.errors.length > 0) {
    lines.push('Errors:');
    validation.errors.forEach(error => {
      lines.push(`  ❌ ${error}`);
    });
  }

  return lines.join('\n');
}
