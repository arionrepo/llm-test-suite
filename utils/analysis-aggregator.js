// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/analysis-aggregator.js
// Description: Aggregate and calculate metrics from test results
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

/**
 * Calculate mean (average) of values
 *
 * @param {Array<number>} values - Numbers to average
 * @returns {number} Average value
 * @private
 */
function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation of values
 *
 * @param {Array<number>} values - Numbers to analyze
 * @returns {number} Standard deviation
 * @private
 */
function stdDev(values) {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate percentile of values
 *
 * @param {Array<number>} values - Sorted numbers
 * @param {number} percentile - Percentile to find (0-100)
 * @returns {number} Value at that percentile
 * @private
 */
function percentile(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Aggregate results by model
 *
 * Business Purpose: Compare metrics across different models
 *
 * @param {Array} results - Array of test results
 * @returns {Array<Object>} Array of aggregations, one per model
 *
 * @example
 * const byModel = aggregateByModel(allResults);
 * // [
 * //   {
 * //     model: 'phi3',
 * //     count: 52,
 * //     metrics: {
 * //       avgSpeed: 38.7,
 * //       avgLatency: 3200,
 * //       p50Latency: 3100,
 * //       p95Latency: 4500,
 * //       successRate: 0.98
 * //     }
 * //   },
 * //   ...
 * // ]
 */
export function aggregateByModel(results) {
  const byModel = {};

  // Group by model
  for (const result of results) {
    const model = result.modelConfig?.modelName || 'unknown';
    if (!byModel[model]) {
      byModel[model] = [];
    }
    byModel[model].push(result);
  }

  // Calculate metrics for each model
  return Object.entries(byModel).map(([model, modelResults]) => {
    const speeds = modelResults
      .map(r => r.timing?.tokensPerSecond)
      .filter(s => typeof s === 'number' && s > 0);
    const latencies = modelResults
      .map(r => r.timing?.totalMs)
      .filter(l => typeof l === 'number' && l > 0);
    const responseLengths = modelResults
      .map(r => r.output?.responseTokens)
      .filter(l => typeof l === 'number' && l > 0);

    const successCount = modelResults.filter(r => r.execution?.success).length;

    return {
      model,
      count: modelResults.length,
      successCount,
      failureCount: modelResults.length - successCount,
      successRate: (successCount / modelResults.length).toFixed(4),
      metrics: {
        speed: {
          mean: mean(speeds).toFixed(2),
          stdDev: stdDev(speeds).toFixed(2),
          min: Math.min(...speeds).toFixed(2),
          max: Math.max(...speeds).toFixed(2),
          p50: percentile(speeds, 50).toFixed(2),
          p95: percentile(speeds, 95).toFixed(2),
          p99: percentile(speeds, 99).toFixed(2)
        },
        latency: {
          mean: mean(latencies).toFixed(0),
          stdDev: stdDev(latencies).toFixed(0),
          min: Math.min(...latencies),
          max: Math.max(...latencies),
          p50: Math.round(percentile(latencies, 50)),
          p95: Math.round(percentile(latencies, 95)),
          p99: Math.round(percentile(latencies, 99))
        },
        responseLength: {
          mean: mean(responseLengths).toFixed(0),
          stdDev: stdDev(responseLengths).toFixed(0),
          min: Math.min(...responseLengths),
          max: Math.max(...responseLengths)
        }
      },
      results: modelResults
    };
  }).sort((a, b) => parseFloat(b.metrics.speed.mean) - parseFloat(a.metrics.speed.mean));
}

/**
 * Aggregate results by compliance standard/category
 *
 * Business Purpose: Compare model performance across different standards
 *
 * @param {Array} results - Array of test results
 * @returns {Array<Object>} Array of aggregations, one per standard
 *
 * @example
 * const byStandard = aggregateByStandard(allResults);
 * // [
 * //   {
 * //     standard: 'GDPR',
 * //     count: 78,
 * //     metrics: {
 * //       avgResponseLength: 245,
 * //       mostCommonModel: 'mixtral'
 * //     }
 * //   },
 * //   ...
 * // ]
 */
export function aggregateByStandard(results) {
  const byStandard = {};

  // Group by standard (extract from promptId)
  for (const result of results) {
    const promptId = result.input?.promptId || '';
    let standard = 'other';

    if (promptId.includes('GDPR')) standard = 'GDPR';
    else if (promptId.includes('ISO')) standard = 'ISO-27001';
    else if (promptId.includes('HIPAA')) standard = 'HIPAA';
    else if (promptId.includes('SOC2')) standard = 'SOC2';
    else if (promptId.includes('CCPA')) standard = 'CCPA';

    if (!byStandard[standard]) {
      byStandard[standard] = [];
    }
    byStandard[standard].push(result);
  }

  // Calculate metrics for each standard
  return Object.entries(byStandard).map(([standard, stdResults]) => {
    const responseLengths = stdResults
      .map(r => r.output?.responseTokens)
      .filter(l => typeof l === 'number' && l > 0);
    const speeds = stdResults
      .map(r => r.timing?.tokensPerSecond)
      .filter(s => typeof s === 'number' && s > 0);

    // Most common model
    const modelCounts = {};
    for (const result of stdResults) {
      const model = result.modelConfig?.modelName || 'unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    }
    const mostCommonModel = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';

    return {
      standard,
      count: stdResults.length,
      metrics: {
        avgResponseLength: mean(responseLengths).toFixed(0),
        responseVariance: stdDev(responseLengths).toFixed(0),
        avgSpeed: mean(speeds).toFixed(2),
        speedVariance: stdDev(speeds).toFixed(2),
        mostCommonModel
      },
      results: stdResults
    };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Aggregate results by run (test run number/name)
 *
 * Business Purpose: Compare metrics across different test runs
 *
 * @param {Array} results - Array of test results
 * @returns {Array<Object>} Array of aggregations, one per run
 *
 * @example
 * const byRun = aggregateByRun(allResults);
 */
export function aggregateByRun(results) {
  const byRun = {};

  // Group by run
  for (const result of results) {
    const runName = result.metadata?.runName || 'unknown';
    const runNum = result.metadata?.runNumber || 0;
    const runKey = `${runNum}-${runName}`;

    if (!byRun[runKey]) {
      byRun[runKey] = {
        runNumber: runNum,
        runName,
        results: []
      };
    }
    byRun[runKey].results.push(result);
  }

  // Calculate metrics for each run
  return Object.values(byRun).map(run => {
    const speeds = run.results
      .map(r => r.timing?.tokensPerSecond)
      .filter(s => typeof s === 'number' && s > 0);
    const latencies = run.results
      .map(r => r.timing?.totalMs)
      .filter(l => typeof l === 'number' && l > 0);

    return {
      runNumber: run.runNumber,
      runName: run.runName,
      count: run.results.length,
      metrics: {
        avgSpeed: mean(speeds).toFixed(2),
        avgLatency: mean(latencies).toFixed(0),
        totalPrompts: new Set(run.results.map(r => r.input?.promptId)).size
      },
      results: run.results
    };
  }).sort((a, b) => a.runNumber - b.runNumber);
}

/**
 * Group results by input prompt size buckets
 *
 * Business Purpose: Analyze how model performance changes with prompt complexity
 *
 * @param {Array} results - Array of test results
 * @param {Array<number>} boundaries - Size boundaries (default: [500, 2000])
 * @returns {Array<Object>} Array of size buckets with results
 *
 * @example
 * const bySize = groupByPromptSize(allResults);
 * // [
 * //   { size: 'small (0-500)', results: [...], count: 20 },
 * //   { size: 'medium (500-2000)', results: [...], count: 20 },
 * //   { size: 'large (2000+)', results: [...], count: 12 }
 * // ]
 */
export function groupByPromptSize(results, boundaries = [500, 2000]) {
  const groups = {
    small: [],
    medium: [],
    large: []
  };

  for (const result of results) {
    const tokens = result.input?.fullPromptTokens || 0;
    if (tokens <= boundaries[0]) {
      groups.small.push(result);
    } else if (tokens <= boundaries[1]) {
      groups.medium.push(result);
    } else {
      groups.large.push(result);
    }
  }

  return [
    {
      label: `small (0-${boundaries[0]})`,
      size: 'small',
      results: groups.small,
      count: groups.small.length
    },
    {
      label: `medium (${boundaries[0]}-${boundaries[1]})`,
      size: 'medium',
      results: groups.medium,
      count: groups.medium.length
    },
    {
      label: `large (${boundaries[1]}+)`,
      size: 'large',
      results: groups.large,
      count: groups.large.length
    }
  ].filter(g => g.count > 0);
}

/**
 * Calculate performance metrics for grouped results
 *
 * Business Purpose: Get summary metrics for any grouping of results
 *
 * @param {Array} results - Array of test results
 * @returns {Object} Summary metrics
 *
 * @example
 * const metrics = calculateMetrics(phi3Results);
 * console.log(metrics.speed.mean); // Average tokens/sec
 */
export function calculateMetrics(results) {
  if (results.length === 0) {
    return {
      count: 0,
      speed: { mean: 0, stdDev: 0, min: 0, max: 0 },
      latency: { mean: 0, stdDev: 0, min: 0, max: 0 },
      responseLength: { mean: 0, stdDev: 0 }
    };
  }

  const speeds = results
    .map(r => r.timing?.tokensPerSecond)
    .filter(s => typeof s === 'number' && s > 0);
  const latencies = results
    .map(r => r.timing?.totalMs)
    .filter(l => typeof l === 'number' && l > 0);
  const lengths = results
    .map(r => r.output?.responseTokens)
    .filter(l => typeof l === 'number' && l > 0);

  return {
    count: results.length,
    speed: {
      mean: mean(speeds).toFixed(2),
      stdDev: stdDev(speeds).toFixed(2),
      min: Math.min(...speeds).toFixed(2),
      max: Math.max(...speeds).toFixed(2)
    },
    latency: {
      mean: Math.round(mean(latencies)),
      stdDev: Math.round(stdDev(latencies)),
      min: Math.min(...latencies),
      max: Math.max(...latencies)
    },
    responseLength: {
      mean: Math.round(mean(lengths)),
      stdDev: Math.round(stdDev(lengths)),
      min: Math.min(...lengths),
      max: Math.max(...lengths)
    }
  };
}

/**
 * Compare metrics between two result sets
 *
 * Business Purpose: Side-by-side comparison of two groups
 *
 * @param {Array} results1 - First result set
 * @param {Array} results2 - Second result set
 * @param {string} label1 - Label for first set
 * @param {string} label2 - Label for second set
 * @returns {Object} Comparison with deltas
 *
 * @example
 * const comparison = compareGroups(
 *   filterByModel(results, 'phi3'),
 *   filterByModel(results, 'mixtral'),
 *   'phi3',
 *   'mixtral'
 * );
 * console.log(comparison.speedDelta); // How much faster/slower
 */
export function compareGroups(results1, results2, label1 = 'Group 1', label2 = 'Group 2') {
  const metrics1 = calculateMetrics(results1);
  const metrics2 = calculateMetrics(results2);

  const speedDelta = (parseFloat(metrics2.speed.mean) - parseFloat(metrics1.speed.mean)).toFixed(2);
  const speedDeltaPct = ((speedDelta / parseFloat(metrics1.speed.mean)) * 100).toFixed(1);
  const latencyDelta = metrics2.latency.mean - metrics1.latency.mean;
  const latencyDeltaPct = ((latencyDelta / metrics1.latency.mean) * 100).toFixed(1);

  return {
    group1: { label: label1, metrics: metrics1 },
    group2: { label: label2, metrics: metrics2 },
    comparison: {
      speedDelta: parseFloat(speedDelta),
      speedDeltaPct: parseFloat(speedDeltaPct),
      speedWinner: speedDelta > 0 ? label2 : label1,
      latencyDelta: latencyDelta,
      latencyDeltaPct: parseFloat(latencyDeltaPct),
      latencyWinner: latencyDelta < 0 ? label2 : label1
    }
  };
}

/**
 * Calculate percentiles for a metric
 *
 * Business Purpose: Understand distribution of a metric
 *
 * @param {Array} results - Array of test results
 * @param {string} metric - Metric name ('speed', 'latency', 'responseLength')
 * @param {Array<number>} percentiles - Percentiles to calculate (default: [50, 95, 99])
 * @returns {Object} Percentile values
 *
 * @example
 * const perc = calculatePercentiles(results, 'speed');
 * console.log(perc.p95); // 95th percentile speed
 */
export function calculatePercentiles(results, metric, percentiles = [50, 95, 99]) {
  let values = [];

  switch (metric) {
    case 'speed':
    case 'tokensPerSecond':
      values = results
        .map(r => r.timing?.tokensPerSecond)
        .filter(v => typeof v === 'number' && v > 0);
      break;
    case 'latency':
    case 'totalMs':
      values = results
        .map(r => r.timing?.totalMs)
        .filter(v => typeof v === 'number' && v > 0);
      break;
    case 'responseLength':
    case 'responseTokens':
      values = results
        .map(r => r.output?.responseTokens)
        .filter(v => typeof v === 'number' && v > 0);
      break;
    default:
      return {};
  }

  if (values.length === 0) return {};

  const result = {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: parseFloat(mean(values).toFixed(2))
  };

  for (const p of percentiles) {
    result[`p${p}`] = parseFloat(percentile(values, p).toFixed(2));
  }

  return result;
}

/**
 * Find outliers in results (values beyond N standard deviations)
 *
 * Business Purpose: Detect unusual results that might indicate issues
 *
 * @param {Array} results - Array of test results
 * @param {string} metric - Metric to analyze ('speed', 'latency')
 * @param {number} stdDevs - Number of standard deviations for outlier threshold
 * @returns {Array} Outlier results
 *
 * @example
 * const outliers = findOutliers(allResults, 'speed', 2);
 */
export function findOutliers(results, metric, stdDevs = 2) {
  let values = [];

  switch (metric) {
    case 'speed':
      values = results.map(r => r.timing?.tokensPerSecond).filter(v => typeof v === 'number' && v > 0);
      break;
    case 'latency':
      values = results.map(r => r.timing?.totalMs).filter(v => typeof v === 'number' && v > 0);
      break;
    default:
      return [];
  }

  const avg = mean(values);
  const std = stdDev(values);
  const threshold = std * stdDevs;

  return results.filter(r => {
    const val = metric === 'speed' ? r.timing?.tokensPerSecond : r.timing?.totalMs;
    return Math.abs(val - avg) > threshold;
  });
}
