// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/analysis-filter.js
// Description: Filter test results by various dimensions for targeted analysis
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

/**
 * Filter results by model name
 *
 * Business Purpose: Isolate results from a specific model for detailed analysis
 *
 * @param {Array} results - Array of test results
 * @param {string} modelName - Model to filter for
 * @returns {Array} Results from only that model
 *
 * @example
 * const phi3Results = filterByModel(allResults, 'phi3');
 * console.log(`${phi3Results.length} results for phi3`);
 */
export function filterByModel(results, modelName) {
  return results.filter(r =>
    r.modelConfig?.modelName?.toLowerCase() === modelName.toLowerCase()
  );
}

/**
 * Filter results by multiple models
 *
 * Business Purpose: Compare specific subset of models
 *
 * @param {Array} results - Array of test results
 * @param {Array<string>} modelNames - Models to include
 * @returns {Array} Results from any of those models
 *
 * @example
 * const compare = filterByModels(allResults, ['phi3', 'mixtral']);
 */
export function filterByModels(results, modelNames) {
  const normalized = modelNames.map(m => m.toLowerCase());
  return results.filter(r =>
    normalized.includes(r.modelConfig?.modelName?.toLowerCase())
  );
}

/**
 * Filter results by prompt ID (standard/category)
 *
 * Business Purpose: Analyze performance on specific compliance standard
 * or prompt category
 *
 * @param {Array} results - Array of test results
 * @param {string} standard - Standard name (GDPR, ISO-27001, etc.)
 * @returns {Array} Results containing that standard
 *
 * @example
 * const gdprResults = filterByStandard(allResults, 'GDPR');
 */
export function filterByStandard(results, standard) {
  return results.filter(r =>
    r.input?.promptId?.includes(standard.toUpperCase())
  );
}

/**
 * Filter results by multiple standards
 *
 * @param {Array} results - Array of test results
 * @param {Array<string>} standards - Standards to include
 * @returns {Array} Results from any of those standards
 *
 * @example
 * const compliance = filterByStandards(allResults, ['GDPR', 'HIPAA']);
 */
export function filterByStandards(results, standards) {
  const uppers = standards.map(s => s.toUpperCase());
  return results.filter(r =>
    uppers.some(standard => r.input?.promptId?.includes(standard))
  );
}

/**
 * Filter results by input prompt size (token count range)
 *
 * Business Purpose: Analyze how model performs with different input complexities
 *
 * @param {Array} results - Array of test results
 * @param {number} minTokens - Minimum input tokens (inclusive)
 * @param {number} maxTokens - Maximum input tokens (inclusive)
 * @returns {Array} Results with prompts in that size range
 *
 * @example
 * // Get results for large prompts (>2000 tokens)
 * const large = filterByPromptSize(allResults, 2000, 10000);
 */
export function filterByPromptSize(results, minTokens, maxTokens) {
  return results.filter(r => {
    const tokens = r.input?.fullPromptTokens;
    return tokens !== undefined && tokens >= minTokens && tokens <= maxTokens;
  });
}

/**
 * Filter results by execution success/failure
 *
 * Business Purpose: Analyze failures separately from successes
 *
 * @param {Array} results - Array of test results
 * @param {boolean} successOnly - If true, only successful results
 * @returns {Array} Filtered results
 *
 * @example
 * const successful = filterBySuccess(allResults, true);
 * const failures = filterBySuccess(allResults, false);
 */
export function filterBySuccess(results, successOnly = true) {
  return results.filter(r =>
    successOnly ? r.execution?.success : !r.execution?.success
  );
}

/**
 * Filter results by date range (by timestamp)
 *
 * Business Purpose: Analyze results from specific time period
 *
 * @param {Array} results - Array of test results
 * @param {string} startDate - Start date ISO string or YYYY-MM-DD
 * @param {string} endDate - End date ISO string or YYYY-MM-DD
 * @returns {Array} Results within date range
 *
 * @example
 * const dayResults = filterByDateRange(allResults, '2026-03-26', '2026-03-26');
 */
export function filterByDateRange(results, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If date-only provided, adjust end to include entire day
  if (endDate.length === 10) {
    end.setDate(end.getDate() + 1);
  }

  return results.filter(r => {
    const timestamp = new Date(r.metadata?.timestamp);
    return timestamp >= start && timestamp < end;
  });
}

/**
 * Filter results that have non-empty responses
 *
 * Business Purpose: Exclude cases where model didn't respond
 *
 * @param {Array} results - Array of test results
 * @returns {Array} Results with actual responses
 *
 * @example
 * const withResponses = filterWithResponses(allResults);
 */
export function filterWithResponses(results) {
  return results.filter(r => {
    const response = r.output?.response;
    return response && response.trim().length > 0;
  });
}

/**
 * Filter by response length (token count)
 *
 * Business Purpose: Analyze how verbosity affects interpretation
 *
 * @param {Array} results - Array of test results
 * @param {number} minTokens - Minimum response tokens
 * @param {number} maxTokens - Maximum response tokens
 * @returns {Array} Results with response sizes in range
 *
 * @example
 * const brief = filterByResponseSize(allResults, 0, 50);
 * const verbose = filterByResponseSize(allResults, 200, 5000);
 */
export function filterByResponseSize(results, minTokens, maxTokens) {
  return results.filter(r => {
    const tokens = r.output?.responseTokens;
    return tokens !== undefined && tokens >= minTokens && tokens <= maxTokens;
  });
}

/**
 * Filter by run name or run number
 *
 * Business Purpose: Compare specific test runs
 *
 * @param {Array} results - Array of test results
 * @param {string|number} runIdentifier - Run name or number
 * @returns {Array} Results from that run
 *
 * @example
 * const run1Results = filterByRun(allResults, 1);
 * const tinyResults = filterByRun(allResults, 'TINY');
 */
export function filterByRun(results, runIdentifier) {
  const identifier = String(runIdentifier).toLowerCase();
  return results.filter(r => {
    const runName = r.metadata?.runName?.toLowerCase();
    const runNum = r.metadata?.runNumber;
    return runName === identifier || String(runNum) === identifier;
  });
}

/**
 * Filter by response validation status
 *
 * Business Purpose: Find results that passed/failed validation
 *
 * @param {Array} results - Array of test results
 * @param {boolean} validOnly - If true, only validated results
 * @returns {Array} Filtered results
 *
 * @example
 * const valid = filterByValidation(allResults, true);
 * const invalid = filterByValidation(allResults, false);
 */
export function filterByValidation(results, validOnly = true) {
  return results.filter(r =>
    validOnly ? r.execution?.responseValidated : !r.execution?.responseValidated
  );
}

/**
 * Chain multiple filters together
 *
 * Business Purpose: Apply complex filtering without repeated loops
 *
 * @param {Array} results - Array of test results
 * @param {Array<Function>} filters - Array of filter functions
 * @returns {Array} Results matching all filters
 *
 * @example
 * const filtered = chainFilters(allResults, [
 *   r => filterByModel(r, 'phi3'),
 *   r => filterByStandard(r, 'GDPR'),
 *   r => filterBySuccess(r, true)
 * ]);
 *
 * // Or more elegantly:
 * const filtered = applyFilters(allResults, [
 *   { type: 'model', value: 'phi3' },
 *   { type: 'standard', value: 'GDPR' },
 *   { type: 'success', value: true }
 * ]);
 */
export function chainFilters(results, filters) {
  return filters.reduce((acc, filter) => filter(acc), results);
}

/**
 * Apply multiple filters using configuration objects
 *
 * Business Purpose: Declarative filtering approach easier to use
 *
 * @param {Array} results - Array of test results
 * @param {Array<Object>} filterSpecs - Array of filter specifications
 * @returns {Array} Filtered results
 *
 * @example
 * const filtered = applyFilters(allResults, [
 *   { type: 'model', value: 'phi3' },
 *   { type: 'standard', value: 'GDPR' },
 *   { type: 'success', value: true },
 *   { type: 'promptSize', min: 1000, max: 3000 }
 * ]);
 */
export function applyFilters(results, filterSpecs) {
  let filtered = results;

  for (const spec of filterSpecs) {
    switch (spec.type) {
      case 'model':
        filtered = filterByModel(filtered, spec.value);
        break;
      case 'models':
        filtered = filterByModels(filtered, spec.value);
        break;
      case 'standard':
        filtered = filterByStandard(filtered, spec.value);
        break;
      case 'standards':
        filtered = filterByStandards(filtered, spec.value);
        break;
      case 'promptSize':
        filtered = filterByPromptSize(filtered, spec.min, spec.max);
        break;
      case 'responseSize':
        filtered = filterByResponseSize(filtered, spec.min, spec.max);
        break;
      case 'success':
        filtered = filterBySuccess(filtered, spec.value);
        break;
      case 'dateRange':
        filtered = filterByDateRange(filtered, spec.start, spec.end);
        break;
      case 'validation':
        filtered = filterByValidation(filtered, spec.value);
        break;
      case 'run':
        filtered = filterByRun(filtered, spec.value);
        break;
      default:
        console.warn(`Unknown filter type: ${spec.type}`);
    }
  }

  return filtered;
}

/**
 * Create a filter function from specification
 *
 * Business Purpose: Reusable filter definitions
 *
 * @param {Object} spec - Filter specification
 * @returns {Function} Filter function
 *
 * @example
 * const filterPhi3 = createFilter({ type: 'model', value: 'phi3' });
 * const phi3Results = allResults.filter(filterPhi3);
 */
export function createFilter(spec) {
  return (result) => {
    switch (spec.type) {
      case 'model':
        return result.modelConfig?.modelName?.toLowerCase() === spec.value.toLowerCase();
      case 'standard':
        return result.input?.promptId?.includes(spec.value.toUpperCase());
      case 'promptSize':
        return result.input?.fullPromptTokens >= spec.min && result.input?.fullPromptTokens <= spec.max;
      case 'success':
        return spec.value ? result.execution?.success : !result.execution?.success;
      default:
        return true;
    }
  };
}
