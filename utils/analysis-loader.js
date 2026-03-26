// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/analysis-loader.js
// Description: Load and normalize unified test results from disk for analysis
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../reports');

/**
 * Load a single test results file
 *
 * Business Purpose: Read test results from disk with error handling
 * and normalization
 *
 * @param {string} filePath - Absolute path to results file
 * @returns {Array} Array of individual test results (unwrapped from metadata wrapper)
 * @throws {Error} If file not found or invalid JSON
 *
 * @example
 * const results = loadResultsFromFile('reports/performance/2026-03-26/test-results-*.json');
 * console.log(results.length); // Number of individual test results
 */
export function loadResultsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const wrapper = JSON.parse(content);

    // Handle both new schema format (wrapper) and legacy format
    if (wrapper.results && Array.isArray(wrapper.results)) {
      return wrapper.results;
    }

    // If no wrapper, assume it's already an array
    if (Array.isArray(wrapper)) {
      return wrapper;
    }

    // If it's a single result, wrap in array
    return [wrapper];
  } catch (error) {
    throw new Error(`Failed to load results from ${filePath}: ${error.message}`);
  }
}

/**
 * Load all results from a specific date and test type
 *
 * Business Purpose: Batch load all results for a given date to analyze
 * a complete test run day
 *
 * @param {string} testType - Type of test ('performance', 'compliance', etc.)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Array} Combined array of all results from that date
 *
 * @example
 * const allPerformanceResults = loadResultsFromDate('performance', '2026-03-26');
 * console.log(`Loaded ${allPerformanceResults.length} results`);
 */
export function loadResultsFromDate(testType, dateString) {
  const dateDir = path.join(REPORTS_DIR, testType, dateString);

  if (!fs.existsSync(dateDir)) {
    return [];
  }

  const files = fs.readdirSync(dateDir)
    .filter(f => f.startsWith('test-results-') && f.endsWith('.json'))
    .map(f => path.join(dateDir, f));

  const allResults = [];
  for (const file of files) {
    try {
      const fileResults = loadResultsFromFile(file);
      allResults.push(...fileResults);
    } catch (error) {
      console.warn(`Skipped file ${file}: ${error.message}`);
    }
  }

  return allResults;
}

/**
 * Load results across a date range
 *
 * Business Purpose: Compare performance across multiple days to identify
 * trends and regressions
 *
 * @param {string} testType - Type of test ('performance', 'compliance', etc.)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format (inclusive)
 * @returns {Array} Combined array of all results in date range
 *
 * @example
 * const weekResults = loadResultsFromRange(
 *   'performance',
 *   '2026-03-20',
 *   '2026-03-26'
 * );
 * console.log(`Loaded ${weekResults.length} results from 7 days`);
 */
export function loadResultsFromRange(testType, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const allResults = [];

  // Iterate through date range
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayResults = loadResultsFromDate(testType, dateStr);
    allResults.push(...dayResults);

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return allResults;
}

/**
 * Load all results of a specific test type
 *
 * Business Purpose: Get complete dataset of a test type across all dates
 * for comprehensive analysis
 *
 * @param {string} testType - Type of test ('performance', 'compliance', etc.)
 * @returns {Array} All results of that test type
 *
 * @example
 * const allCompliance = loadAllResults('compliance');
 * console.log(`Loaded ${allCompliance.length} compliance results`);
 */
export function loadAllResults(testType) {
  const typeDir = path.join(REPORTS_DIR, testType);

  if (!fs.existsSync(typeDir)) {
    return [];
  }

  const allResults = [];
  const dateDirs = fs.readdirSync(typeDir).filter(f => {
    const full = path.join(typeDir, f);
    return fs.statSync(full).isDirectory();
  });

  for (const dateDir of dateDirs) {
    const dayResults = loadResultsFromDate(testType, dateDir);
    allResults.push(...dayResults);
  }

  return allResults;
}

/**
 * Get available test types
 *
 * Business Purpose: Discover what test result types exist for loading
 *
 * @returns {Array} List of test type directories that exist
 *
 * @example
 * const types = getAvailableTestTypes();
 * console.log(types); // ['performance', 'compliance']
 */
export function getAvailableTestTypes() {
  if (!fs.existsSync(REPORTS_DIR)) {
    return [];
  }

  return fs.readdirSync(REPORTS_DIR)
    .filter(f => {
      const full = path.join(REPORTS_DIR, f);
      return fs.statSync(full).isDirectory() && f !== 'prompts';
    });
}

/**
 * Get available dates for a test type
 *
 * Business Purpose: Show user what date ranges have data
 *
 * @param {string} testType - Type of test
 * @returns {Array} List of dates (YYYY-MM-DD) with results
 *
 * @example
 * const dates = getAvailableDates('performance');
 * console.log(dates); // ['2026-03-26', '2026-03-25', ...]
 */
export function getAvailableDates(testType) {
  const typeDir = path.join(REPORTS_DIR, testType);

  if (!fs.existsSync(typeDir)) {
    return [];
  }

  return fs.readdirSync(typeDir)
    .filter(f => {
      const full = path.join(typeDir, f);
      return fs.statSync(full).isDirectory();
    })
    .sort()
    .reverse(); // Most recent first
}

/**
 * Get metadata about loaded results
 *
 * Business Purpose: Understand composition of loaded result set
 *
 * @param {Array} results - Array of test results
 * @returns {Object} Metadata about the results
 *
 * @example
 * const results = loadResultsFromDate('performance', '2026-03-26');
 * const meta = getResultsMetadata(results);
 * console.log(meta);
 * // {
 * //   totalCount: 312,
 * //   models: ['phi3', 'mixtral', ...],
 * //   prompts: 52,
 * //   dateRange: { min: '2026-03-26T10:30:00Z', max: '2026-03-26T18:45:00Z' },
 * //   successCount: 310,
 * //   failureCount: 2
 * // }
 */
export function getResultsMetadata(results) {
  if (!results || results.length === 0) {
    return {
      totalCount: 0,
      models: [],
      prompts: [],
      standards: [],
      successCount: 0,
      failureCount: 0,
      dateRange: { min: null, max: null }
    };
  }

  const models = new Set();
  const prompts = new Set();
  const standards = new Set();
  let successCount = 0;
  let failureCount = 0;
  const timestamps = [];

  for (const result of results) {
    // Extract model
    if (result.modelConfig?.modelName) {
      models.add(result.modelConfig.modelName);
    }

    // Extract prompt
    if (result.input?.promptId) {
      prompts.add(result.input.promptId);
    }

    // Extract standard (if present)
    if (result.input?.promptId?.includes('GDPR')) {
      standards.add('GDPR');
    } else if (result.input?.promptId?.includes('ISO')) {
      standards.add('ISO-27001');
    }

    // Count successes/failures
    if (result.execution?.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Track timestamps
    if (result.metadata?.timestamp) {
      timestamps.push(result.metadata.timestamp);
    }
  }

  return {
    totalCount: results.length,
    models: Array.from(models).sort(),
    prompts: Array.from(prompts).sort(),
    standards: Array.from(standards).sort(),
    successCount,
    failureCount,
    successRate: (successCount / results.length).toFixed(4),
    dateRange: {
      min: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => new Date(t)))).toISOString() : null,
      max: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => new Date(t)))).toISOString() : null
    }
  };
}
