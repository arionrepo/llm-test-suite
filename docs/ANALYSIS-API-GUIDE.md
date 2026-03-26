# Analysis API Guide - Query & Analyze Unified Test Results

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/ANALYSIS-API-GUIDE.md
**Description:** Complete guide for using the analysis layer to query and analyze test results
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Overview

The analysis layer provides three modules to transform raw test results into insights:

1. **analysis-loader.js** - Load results from disk
2. **analysis-filter.js** - Filter and select specific results
3. **analysis-aggregator.js** - Calculate metrics and aggregate data

---

## Quick Start (5 minutes)

### Basic Workflow

```javascript
import {
  loadResultsFromDate,
  getResultsMetadata
} from './utils/analysis-loader.js';

import {
  filterByModel,
  filterByStandard
} from './utils/analysis-filter.js';

import {
  aggregateByModel,
  calculateMetrics
} from './utils/analysis-aggregator.js';

// 1. Load results from a date
const results = loadResultsFromDate('performance', '2026-03-26');
console.log(`Loaded ${results.length} results`);

// 2. Check what we have
const meta = getResultsMetadata(results);
console.log(`Models: ${meta.models.join(', ')}`);
console.log(`Total prompts tested: ${meta.prompts.length}`);

// 3. Filter to specific model
const phi3Results = filterByModel(results, 'phi3');
console.log(`phi3 results: ${phi3Results.length}`);

// 4. Calculate metrics
const metrics = calculateMetrics(phi3Results);
console.log(`Average speed: ${metrics.speed.mean} tokens/sec`);
console.log(`Average latency: ${metrics.latency.mean}ms`);

// 5. Compare models
const byModel = aggregateByModel(results);
byModel.forEach(m => {
  console.log(`${m.model}: ${m.metrics.speed.mean} tok/s`);
});
```

---

## Module 1: analysis-loader.js

**Purpose:** Load test results from disk

### Functions

#### `loadResultsFromFile(filePath)`

Load a single test results file.

```javascript
import { loadResultsFromFile } from './utils/analysis-loader.js';

const results = loadResultsFromFile(
  'reports/performance/2026-03-26/test-results-run-1-tiny-2026-03-26T103045Z.json'
);

console.log(`Loaded ${results.length} individual test results`);
results.forEach(r => {
  console.log(`- Prompt: ${r.input.promptId}`);
  console.log(`  Model: ${r.modelConfig.modelName}`);
  console.log(`  Speed: ${r.timing.tokensPerSecond} tok/s`);
});
```

#### `loadResultsFromDate(testType, dateString)`

Load all results from a specific date.

```javascript
import { loadResultsFromDate } from './utils/analysis-loader.js';

// Performance tests from March 26
const perfResults = loadResultsFromDate('performance', '2026-03-26');

// Compliance tests from March 26
const complianceResults = loadResultsFromDate('compliance', '2026-03-26');

console.log(`Performance: ${perfResults.length} results`);
console.log(`Compliance: ${complianceResults.length} results`);
```

#### `loadResultsFromRange(testType, startDate, endDate)`

Load results across a date range to see trends.

```javascript
import { loadResultsFromRange } from './utils/analysis-loader.js';

// Load entire week
const weekData = loadResultsFromRange(
  'performance',
  '2026-03-20',
  '2026-03-26'
);

console.log(`Loaded ${weekData.length} results from 7 days`);

// Group by date to see daily trends
const byDate = {};
weekData.forEach(r => {
  const date = r.metadata.timestamp.split('T')[0];
  byDate[date] = (byDate[date] || 0) + 1;
});

Object.entries(byDate).forEach(([date, count]) => {
  console.log(`${date}: ${count} results`);
});
```

#### `loadAllResults(testType)`

Load all results of a test type across all dates.

```javascript
import { loadAllResults } from './utils/analysis-loader.js';

const allPerformance = loadAllResults('performance');
const allCompliance = loadAllResults('compliance');

console.log(`Total performance results: ${allPerformance.length}`);
console.log(`Total compliance results: ${allCompliance.length}`);
```

#### `getResultsMetadata(results)`

Understand composition of loaded results.

```javascript
import {
  loadResultsFromDate,
  getResultsMetadata
} from './utils/analysis-loader.js';

const results = loadResultsFromDate('performance', '2026-03-26');
const meta = getResultsMetadata(results);

console.log(`Total results: ${meta.totalCount}`);
console.log(`Models tested: ${meta.models.join(', ')}`);
console.log(`Unique prompts: ${meta.prompts.length}`);
console.log(`Success rate: ${(meta.successRate * 100).toFixed(1)}%`);
console.log(`Date range: ${meta.dateRange.min} to ${meta.dateRange.max}`);
```

#### `getAvailableTestTypes()`

Discover what test result types exist.

```javascript
import { getAvailableTestTypes } from './utils/analysis-loader.js';

const types = getAvailableTestTypes();
console.log(`Available test types: ${types.join(', ')}`);
// Output: Available test types: performance, compliance
```

#### `getAvailableDates(testType)`

See what dates have data for a test type.

```javascript
import { getAvailableDates } from './utils/analysis-loader.js';

const dates = getAvailableDates('performance');
console.log(`Performance tests available for:`);
dates.forEach(d => console.log(`  - ${d}`));

// Most recent first
console.log(`Most recent: ${dates[0]}`);
```

---

## Module 2: analysis-filter.js

**Purpose:** Filter results by various dimensions

### Filter Functions

#### `filterByModel(results, modelName)`

Get results from a specific model.

```javascript
import {
  loadResultsFromDate,
  getResultsMetadata
} from './utils/analysis-loader.js';
import { filterByModel } from './utils/analysis-filter.js';

const allResults = loadResultsFromDate('performance', '2026-03-26');
const meta = getResultsMetadata(allResults);

// Test each model independently
for (const model of meta.models) {
  const modelResults = filterByModel(allResults, model);
  console.log(`${model}: ${modelResults.length} results`);
}
```

#### `filterByModels(results, modelNames)`

Compare specific subset of models.

```javascript
import { filterByModels } from './utils/analysis-filter.js';

const toCompare = ['phi3', 'mixtral', 'neural-chat'];
const selected = filterByModels(allResults, toCompare);

console.log(`Results for top 3 models: ${selected.length}`);
```

#### `filterByStandard(results, standard)`

Analyze performance on specific compliance standard.

```javascript
import { filterByStandard } from './utils/analysis-filter.js';

const gdprResults = filterByStandard(allResults, 'GDPR');
console.log(`GDPR questions tested: ${gdprResults.length}`);

const hipaaResults = filterByStandard(allResults, 'HIPAA');
console.log(`HIPAA questions tested: ${hipaaResults.length}`);
```

#### `filterByPromptSize(results, minTokens, maxTokens)`

Analyze performance with different input complexities.

```javascript
import { filterByPromptSize } from './utils/analysis-filter.js';

const small = filterByPromptSize(allResults, 0, 500);
const medium = filterByPromptSize(allResults, 500, 2000);
const large = filterByPromptSize(allResults, 2000, 100000);

console.log(`Small prompts (0-500): ${small.length}`);
console.log(`Medium prompts (500-2000): ${medium.length}`);
console.log(`Large prompts (2000+): ${large.length}`);
```

#### `filterBySuccess(results, successOnly)`

Separate successful results from failures.

```javascript
import { filterBySuccess } from './utils/analysis-filter.js';

const successful = filterBySuccess(allResults, true);
const failures = filterBySuccess(allResults, false);

console.log(`Successful: ${successful.length}`);
console.log(`Failed: ${failures.length}`);
console.log(`Success rate: ${(successful.length / allResults.length * 100).toFixed(1)}%`);
```

#### `filterByDateRange(results, startDate, endDate)`

Analyze specific time period.

```javascript
import { filterByDateRange } from './utils/analysis-filter.js';

const today = filterByDateRange(allResults, '2026-03-26', '2026-03-26');
const thisWeek = filterByDateRange(allResults, '2026-03-20', '2026-03-26');

console.log(`Today: ${today.length} results`);
console.log(`This week: ${thisWeek.length} results`);
```

#### `applyFilters(results, filterSpecs)`

Apply multiple filters together.

```javascript
import { applyFilters } from './utils/analysis-filter.js';

const filtered = applyFilters(allResults, [
  { type: 'model', value: 'phi3' },        // Only phi3
  { type: 'standard', value: 'GDPR' },     // Only GDPR
  { type: 'promptSize', min: 1000, max: 3000 }, // Medium-large
  { type: 'success', value: true }         // Only successes
]);

console.log(`Found ${filtered.length} matching results`);
```

---

## Module 3: analysis-aggregator.js

**Purpose:** Calculate metrics and aggregate results

### Aggregation Functions

#### `aggregateByModel(results)`

Compare metrics across models.

```javascript
import { aggregateByModel } from './utils/analysis-aggregator.js';

const byModel = aggregateByModel(allResults);

console.log('Model Performance Ranking:');
byModel.forEach((m, idx) => {
  console.log(`${idx + 1}. ${m.model}`);
  console.log(`   Speed: ${m.metrics.speed.mean} tok/s (±${m.metrics.speed.stdDev})`);
  console.log(`   Latency: ${m.metrics.latency.mean}ms (±${m.metrics.latency.stdDev})`);
  console.log(`   Success rate: ${(m.successRate * 100).toFixed(1)}%`);
  console.log(`   Results: ${m.count}`);
});
```

Output:
```
Model Performance Ranking:
1. neural-chat
   Speed: 47.3 tok/s (±8.2)
   Latency: 2850ms (±450)
   Success rate: 100.0%
   Results: 52
2. mixtral
   Speed: 42.1 tok/s (±6.5)
   Latency: 3200ms (±520)
   Success rate: 98.1%
   Results: 52
3. phi3
   Speed: 38.7 tok/s (±7.1)
   Latency: 3850ms (±580)
   Success rate: 100.0%
   Results: 52
```

#### `aggregateByStandard(results)`

Compare performance across compliance standards.

```javascript
import { aggregateByStandard } from './utils/analysis-aggregator.js';

const byStandard = aggregateByStandard(allResults);

console.log('Standard Coverage:');
byStandard.forEach(s => {
  console.log(`\n${s.standard}:`);
  console.log(`  Tested: ${s.count} questions`);
  console.log(`  Avg response length: ${s.metrics.avgResponseLength} tokens`);
  console.log(`  Most common model: ${s.metrics.mostCommonModel}`);
});
```

#### `groupByPromptSize(results)`

Analyze impact of prompt complexity.

```javascript
import { groupByPromptSize } from './utils/analysis-aggregator.js';

const bySize = groupByPromptSize(allResults);

console.log('Performance by Prompt Size:');
bySize.forEach(group => {
  console.log(`\n${group.label}:`);
  console.log(`  Results: ${group.count}`);

  // Calculate metrics for this size
  const metrics = calculateMetrics(group.results);
  console.log(`  Avg speed: ${metrics.speed.mean} tok/s`);
  console.log(`  Avg latency: ${metrics.latency.mean}ms`);
});
```

#### `calculateMetrics(results)`

Get performance metrics for any group.

```javascript
import { calculateMetrics } from './utils/analysis-aggregator.js';
import { filterByModel } from './utils/analysis-filter.js';

const phi3Results = filterByModel(allResults, 'phi3');
const metrics = calculateMetrics(phi3Results);

console.log(`phi3 Performance:`);
console.log(`  Speed:`);
console.log(`    Mean: ${metrics.speed.mean} tok/s`);
console.log(`    Min: ${metrics.speed.min} tok/s`);
console.log(`    Max: ${metrics.speed.max} tok/s`);
console.log(`  Latency:`);
console.log(`    Mean: ${metrics.latency.mean}ms`);
console.log(`    P95: ${calculatePercentiles(phi3Results, 'latency', [95]).p95}ms`);
console.log(`    P99: ${calculatePercentiles(phi3Results, 'latency', [99]).p99}ms`);
```

#### `compareGroups(results1, results2, label1, label2)`

Side-by-side comparison.

```javascript
import {
  compareGroups,
  filterByModel,
  loadResultsFromDate
} from './utils/analysis-*';

const results = loadResultsFromDate('performance', '2026-03-26');
const phi3 = filterByModel(results, 'phi3');
const mixtral = filterByModel(results, 'mixtral');

const comparison = compareGroups(phi3, mixtral, 'phi3', 'mixtral');

console.log(`Comparison: ${comparison.group1.label} vs ${comparison.group2.label}`);
console.log(`\nSpeed:`);
console.log(`  phi3: ${comparison.group1.metrics.speed.mean} tok/s`);
console.log(`  mixtral: ${comparison.group2.metrics.speed.mean} tok/s`);
console.log(`  Delta: ${comparison.comparison.speedDelta} tok/s (${comparison.comparison.speedDeltaPct}%)`);
console.log(`  Winner: ${comparison.comparison.speedWinner}`);

console.log(`\nLatency:`);
console.log(`  phi3: ${comparison.group1.metrics.latency.mean}ms`);
console.log(`  mixtral: ${comparison.group2.metrics.latency.mean}ms`);
console.log(`  Delta: ${comparison.comparison.latencyDelta}ms`);
console.log(`  Winner: ${comparison.comparison.latencyWinner}`);
```

#### `calculatePercentiles(results, metric, percentiles)`

Understand distribution of metrics.

```javascript
import { calculatePercentiles } from './utils/analysis-aggregator.js';

const speedDist = calculatePercentiles(phi3Results, 'speed', [25, 50, 75, 95, 99]);

console.log('Speed Distribution (phi3):');
console.log(`  Min: ${speedDist.min} tok/s`);
console.log(`  P25: ${speedDist.p25} tok/s`);
console.log(`  Median (P50): ${speedDist.p50} tok/s`);
console.log(`  P75: ${speedDist.p75} tok/s`);
console.log(`  P95: ${speedDist.p95} tok/s`);
console.log(`  P99: ${speedDist.p99} tok/s`);
console.log(`  Max: ${speedDist.max} tok/s`);
```

#### `findOutliers(results, metric, stdDevs)`

Detect unusual results.

```javascript
import { findOutliers } from './utils/analysis-aggregator.js';

// Find results more than 2 std devs from mean
const outliers = findOutliers(phi3Results, 'speed', 2);

console.log(`Found ${outliers.length} speed outliers`);
outliers.forEach(o => {
  console.log(`  Prompt: ${o.input.promptId}`);
  console.log(`  Speed: ${o.timing.tokensPerSecond} tok/s (unusual!)`);
});
```

---

## Complete Example: Model Comparison Report

```javascript
import {
  loadResultsFromDate,
  getResultsMetadata,
  getAvailableDates
} from './utils/analysis-loader.js';

import {
  filterByModel,
  filterBySuccess,
  applyFilters
} from './utils/analysis-filter.js';

import {
  aggregateByModel,
  calculateMetrics,
  compareGroups,
  calculatePercentiles
} from './utils/analysis-aggregator.js';

async function generateModelComparisonReport() {
  // Load results
  const date = '2026-03-26';
  const results = loadResultsFromDate('performance', date);

  if (results.length === 0) {
    console.log('No results found for', date);
    return;
  }

  const meta = getResultsMetadata(results);

  // Header
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     Model Performance Comparison Report             ║');
  console.log('║     Date: ' + date + '                          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`Total Results: ${meta.totalCount}`);
  console.log(`Models: ${meta.models.join(', ')}`);
  console.log(`Success Rate: ${(meta.successRate * 100).toFixed(1)}%\n`);

  // Aggregate by model
  const byModel = aggregateByModel(results);

  console.log('┌─ Performance Ranking ─────────────────────────────┐');
  byModel.forEach((m, idx) => {
    console.log(`│ ${idx + 1}. ${m.model.padEnd(30)} │`);
    console.log(`│    Speed: ${m.metrics.speed.mean.padStart(6)} tok/s        │`);
    console.log(`│    Latency: ${m.metrics.latency.mean.toString().padStart(5)}ms           │`);
    console.log(`│    Success: ${(m.successRate * 100).toFixed(1)}%              │`);
    console.log(`│    Samples: ${m.count.toString().padStart(3)}              │`);
    if (idx < byModel.length - 1) console.log('│');
  });
  console.log('└───────────────────────────────────────────────────┘\n');

  // Detailed metrics for top 3
  console.log('┌─ Detailed Analysis ───────────────────────────────┐');
  for (let i = 0; i < Math.min(3, byModel.length); i++) {
    const m = byModel[i];
    const speedDist = calculatePercentiles(m.results, 'speed');

    console.log(`│ ${m.model.toUpperCase()}`);
    console.log(`│ Speed Distribution:`);
    console.log(`│   P50 (median): ${speedDist.p50} tok/s`);
    console.log(`│   P95: ${speedDist.p95} tok/s`);
    console.log(`│   P99: ${speedDist.p99} tok/s`);
    console.log(`│   Consistency: ${(m.metrics.speed.stdDev / m.metrics.speed.mean * 100).toFixed(1)}% variance`);
    if (i < Math.min(3, byModel.length) - 1) console.log('│');
  }
  console.log('└───────────────────────────────────────────────────┘');
}

// Run the report
generateModelComparisonReport();
```

---

## Integration with Node.js Scripts

### Example: test-analysis.js

```javascript
#!/usr/bin/env node

// Run with: node test-analysis.js [date] [testType]

import {
  loadResultsFromDate,
  getResultsMetadata
} from './utils/analysis-loader.js';

import {
  aggregateByModel,
  calculateMetrics
} from './utils/analysis-aggregator.js';

const args = process.argv.slice(2);
const date = args[0] || new Date().toISOString().split('T')[0];
const testType = args[1] || 'performance';

console.log(`Analyzing ${testType} results for ${date}...\n`);

const results = loadResultsFromDate(testType, date);
if (results.length === 0) {
  console.error(`No results found for ${testType} on ${date}`);
  process.exit(1);
}

const meta = getResultsMetadata(results);
console.log(`Loaded ${results.length} results from ${meta.models.length} models\n`);

const byModel = aggregateByModel(results);
byModel.forEach(m => {
  console.log(`${m.model}:`);
  console.log(`  Count: ${m.count}`);
  console.log(`  Speed: ${m.metrics.speed.mean} ± ${m.metrics.speed.stdDev} tok/s`);
  console.log(`  Latency: ${m.metrics.latency.mean} ± ${m.metrics.latency.stdDev}ms`);
  console.log(`  Success: ${(m.successRate * 100).toFixed(1)}%`);
  console.log();
});
```

---

## Performance Notes

- **Loading:** 100-1000 results loads in <100ms
- **Filtering:** 1000 results filtered in <10ms
- **Aggregation:** 1000 results aggregated in <50ms
- **Percentiles:** Calculated on-the-fly, <5ms

---

## Next Steps

1. Run analysis on your test data: `node test-analysis.js`
2. Create custom reports for specific questions
3. Export results to CSV for spreadsheet analysis
4. Set up automated daily analysis runs

---

**Questions?** See [ANALYSIS-LAYER-DESIGN.md](../ANALYSIS-LAYER-DESIGN.md) for architecture details.

