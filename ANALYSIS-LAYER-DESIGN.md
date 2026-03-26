# Analysis Layer Design - Unified Test Result Query & Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/ANALYSIS-LAYER-DESIGN.md
**Description:** Design specification for query/analysis layer enabling insights from unified test results
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Purpose

Transform raw unified test results into actionable insights through:
- **Query Interface:** Filter and retrieve specific test results
- **Aggregation Tools:** Combine results across multiple dimensions
- **Analysis Functions:** Calculate metrics, trends, comparisons
- **Reporting:** Generate summary reports and visualizations

---

## Core Analytical Questions

### Performance Analysis
**Questions the analysis layer must answer:**

1. **Model Comparison**
   - "Which model is fastest?" → tokens/second comparison
   - "How do models compare on large inputs?" → performance vs prompt size
   - "Which model has best throughput?" → tokens/second ranking

2. **Prompt Complexity**
   - "Does prompt size affect response quality?" → correlation analysis
   - "What prompt sizes do models handle well?" → performance by input size
   - "Are there sweet spots for each model?" → optimal input range

3. **Consistency**
   - "Is model performance stable?" → variance across runs
   - "Which prompts are consistently answered well?" → reliability metrics
   - "Are there outliers?" → anomaly detection

4. **Resource Usage**
   - "What's the memory footprint?" → resource consumption patterns
   - "How does load affect performance?" → degradation curves
   - "When does a model become resource-constrained?" → saturation points

### Compliance Analysis
**Questions:**

1. **Standard Coverage**
   - "Which standards do models understand well?" → pass rate by standard
   - "Where are compliance gaps?" → failing standard categories
   - "How comprehensive are model responses?" → coverage scoring

2. **Accuracy**
   - "How often are responses correct?" → accuracy by standard
   - "What types of errors occur?" → error categorization
   - "Are some standards harder than others?" → difficulty ranking

3. **Consistency**
   - "Do models give consistent answers?" → response variance
   - "Are variations due to prompt wording?" → sensitivity analysis
   - "Is information consistent across different contexts?" → fact consistency

### Tier-Based Analysis
**Questions:**

1. **Prompt Tier Impact**
   - "Does TIER 1 vs TIER 3 matter?" → impact by tier
   - "What's the value of multi-tier prompts?" → quality improvement
   - "Which tier has biggest impact?" → tier contribution analysis

2. **Organization Context**
   - "Does org context affect accuracy?" → personalization impact
   - "Which context variables matter most?" → variable importance
   - "How does org size affect responses?" → scale sensitivity

3. **Framework-Specific**
   - "Is a model good at GDPR?" → GDPR-specific accuracy
   - "How does model handle ISO 27001?" → framework-specific performance
   - "Are responses framework-aware?" → framework integration

---

## Analysis Dimensions

### Primary Dimensions (Always Available)

```javascript
// Results can be analyzed/grouped by any of these dimensions:

{
  model: "phi3, mixtral, neural-chat, etc.",
  standard: "GDPR, ISO-27001, HIPAA, etc.",
  promptSize: "small (0-500), medium (500-2000), large (2000+)",
  promptType: "factual, multi-tier, context-aware, etc.",
  tier: 1, 2, or 3,
  runType: "performance, compliance, accuracy, quality",
  timestamp: "ISO 8601 datetime",
  dateRange: "2026-03-20 to 2026-03-26"
}
```

### Derived Metrics (Calculated)

```javascript
// Computed from raw results:

{
  // Performance
  tokensPerSecond: calculated from tokens/timing,
  averageLatencyMs: mean execution time,
  p50Latency: median execution time,
  p95Latency: 95th percentile,
  p99Latency: 99th percentile,

  // Quality
  responseLength: response token count,
  responseLengthVariance: how much it varies,
  completenessScore: estimated from response length,

  // Accuracy
  correctAnswers: count of correct responses,
  accuracy: correctAnswers / totalResponses,
  falsePositives: claimed knowledge not present,
  falseNegatives: missed knowledge,

  // Consistency
  responseVariance: std dev of response lengths,
  inconsistencyScore: measure of inconsistency
}
```

---

## Storage-Aware Design

### Result File Structure (Already Defined)

```
reports/
├── performance/
│   └── 2026-03-26/
│       ├── test-results-run-1-tiny-2026-03-26T...json
│       ├── test-results-run-2-small-2026-03-26T...json
│       └── ... (6 runs total)
├── compliance/
│   └── 2026-03-26/
│       ├── test-results-enterprise-pilot-2026-03-26T...json
│       ├── test-results-enterprise-quick-2026-03-26T...json
│       └── ...
└── [other types]/
    └── 2026-03-26/
        └── test-results-*.json
```

### Result Wrapper Structure

```javascript
{
  metadata: {
    timestamp: "2026-03-26T...",
    testType: "performance",
    runName: "run-1-tiny",
    resultCount: 52,
    validationPassed: true,
    savedAt: "2026-03-26T..."
  },
  results: [
    // Array of individual test results following unified schema
    {
      metadata: { timestamp, testRunId, runNumber, runName, runType, focus },
      input: { promptId, fullPromptText, fullPromptTokens, tier?, promptName? },
      output: { response, responseTokens, responseCharacters },
      timing: { totalMs, tokensPerSecond },
      modelConfig: { modelName },
      execution: { success, responseValidated, errors, validationChecks }
    },
    // ... more results
  ]
}
```

---

## Module Architecture

### Layer 1: Loading (File I/O)

**Module:** `utils/analysis-loader.js`

**Functions:**
- `loadResultsFromFile(filePath)` - Load single result file
- `loadResultsFromDate(testType, date)` - Load all results for a date
- `loadResultsFromRange(testType, startDate, endDate)` - Load date range
- `loadAllResults(testType?)` - Load all results of a type

**Output:** Normalized array of results

### Layer 2: Filtering & Selection

**Module:** `utils/analysis-filter.js`

**Functions:**
- `filterByModel(results, modelName)` - Get results for specific model
- `filterByStandard(results, standard)` - Get results for specific standard
- `filterByPromptSize(results, minTokens, maxTokens)` - Get results by size
- `filterByDateRange(results, startDate, endDate)` - Get results in date range
- `chainFilters(results, filterFunctions)` - Combine multiple filters

**Output:** Filtered results subset

### Layer 3: Aggregation & Metrics

**Module:** `utils/analysis-aggregator.js`

**Functions:**
- `aggregateByModel(results)` - Group and summarize by model
- `aggregateByStandard(results)` - Group and summarize by standard
- `calculatePercentiles(values, percentiles)` - Calculate p50, p95, p99
- `calculateVariance(values)` - Variance and std dev
- `compareModels(results)` - Side-by-side model comparison
- `compareStandards(results)` - Side-by-side standard comparison

**Output:** Aggregated metrics objects

### Layer 4: Analysis & Insights

**Module:** `utils/analysis-insights.js`

**Functions:**
- `findBestModel(results, metric)` - Which model wins on metric?
- `findConsistentModel(results)` - Most reliable model?
- `findDifficultStandards(results)` - Which standards are hard?
- `detectAnomalies(results, threshold)` - Find unusual results
- `compareTierImpact(results)` - How much do tiers matter?
- `identifyCorrelations(results)` - What factors predict performance?

**Output:** Analysis summaries and insights

### Layer 5: Reporting

**Module:** `utils/analysis-reporter.js`

**Functions:**
- `generateSummaryReport(results)` - Overview of all results
- `generateModelReport(results, model)` - Deep dive on one model
- `generateStandardReport(results, standard)` - Deep dive on one standard
- `generateComparisonReport(results, models)` - Compare specific models
- `generateTrendReport(results)` - Show trends over time
- `formatAsJSON(data)` - Format for programmatic use
- `formatAsMarkdown(data)` - Format for reading/documentation
- `formatAsCSV(data)` - Format for spreadsheet import

**Output:** Formatted reports ready for display/analysis

---

## Specific Analysis Patterns

### Pattern 1: Model Performance Ranking

```javascript
// Query: Which model is fastest?

const results = await loadResultsFromDate('performance', '2026-03-26');
const byModel = aggregateByModel(results);
const ranked = byModel
  .map(m => ({ model: m.model, avgSpeed: m.metrics.tokensPerSecond }))
  .sort((a, b) => b.avgSpeed - a.avgSpeed);

// Result:
// [
//   { model: 'neural-chat', avgSpeed: 47.3 },
//   { model: 'mixtral', avgSpeed: 42.1 },
//   { model: 'phi3', avgSpeed: 38.2 }
// ]
```

### Pattern 2: Compliance Standard Difficulty

```javascript
// Query: Which standards do models struggle with?

const results = await loadResultsFromDate('compliance', '2026-03-26');
const byStandard = aggregateByStandard(results);
const difficulty = byStandard
  .map(s => ({
    standard: s.standard,
    accuracy: s.correctCount / s.totalCount,
    difficulty: 1 - (s.correctCount / s.totalCount)
  }))
  .sort((a, b) => b.difficulty - a.difficulty);

// Result:
// [
//   { standard: 'HIPAA', difficulty: 0.35, accuracy: 0.65 },
//   { standard: 'SOC2', difficulty: 0.28, accuracy: 0.72 },
//   { standard: 'GDPR', difficulty: 0.12, accuracy: 0.88 }
// ]
```

### Pattern 3: Prompt Size Impact

```javascript
// Query: Does prompt size affect model performance?

const results = await loadResultsFromDate('performance', '2026-03-26');
const phi3Results = filterByModel(results, 'phi3');
const bySize = groupByPromptSize(phi3Results);
const impactAnalysis = bySize.map(size => ({
  size: size.label,
  avgSpeed: mean(size.results.map(r => r.timing.tokensPerSecond)),
  avgLatency: mean(size.results.map(r => r.timing.totalMs)),
  count: size.results.length
}));

// Result:
// [
//   { size: 'small', avgSpeed: 45.2, avgLatency: 2100, count: 20 },
//   { size: 'medium', avgSpeed: 38.7, avgLatency: 3200, count: 20 },
//   { size: 'large', avgSpeed: 32.1, avgLatency: 5100, count: 12 }
// ]
```

### Pattern 4: Model Consistency

```javascript
// Query: Which model gives most consistent results?

const results = await loadResultsFromDate('performance', '2026-03-26');
const byModel = aggregateByModel(results);
const consistency = byModel.map(m => ({
  model: m.model,
  avgSpeed: m.metrics.avgSpeed,
  speedVariance: calculateVariance(m.results.map(r => r.timing.tokensPerSecond)),
  speedStdDev: calculateStdDev(m.results.map(r => r.timing.tokensPerSecond)),
  avgLatency: m.metrics.avgLatency,
  latencyVariance: calculateVariance(m.results.map(r => r.timing.totalMs))
})).sort((a, b) => a.speedVariance - b.speedVariance);

// Result shows which model has tightest performance envelope
```

### Pattern 5: Tier Impact Analysis

```javascript
// Query: Does multi-tier prompting improve quality?

const results = await loadResultsFromDate('compliance', '2026-03-26');
const tier1 = filterByTier(results, 1);
const tier3 = filterByTier(results, 3);

const tier1Accuracy = calculateAccuracy(tier1);
const tier3Accuracy = calculateAccuracy(tier3);
const improvement = ((tier3Accuracy - tier1Accuracy) / tier1Accuracy) * 100;

// Result:
// tier1Accuracy: 0.67
// tier3Accuracy: 0.84
// improvement: +25.4%
```

---

## Query Interface (High-Level API)

```javascript
import AnalysisEngine from './utils/analysis-engine.js';

const engine = new AnalysisEngine();

// 1. Load results
const performance = await engine.load('performance', { date: '2026-03-26' });
const compliance = await engine.load('compliance', { dateRange: ['2026-03-20', '2026-03-26'] });

// 2. Filter
const phi3 = performance.filter({ model: 'phi3' });
const largePrompts = phi3.filter({ promptSize: 'large' });

// 3. Aggregate
const byModel = performance.aggregate('model');
const byStandard = compliance.aggregate('standard');

// 4. Analyze
const bestModel = performance.analyze.findBest('tokensPerSecond');
const hardestStandard = compliance.analyze.findDifficult();
const modelComparison = performance.analyze.compare(['phi3', 'mixtral']);

// 5. Report
const report = performance.report.summary();
const markdown = performance.report.asMarkdown();
const csv = performance.report.asCSV();
```

---

## Implementation Priority

### Phase 1: Core Infrastructure (Foundation)
1. Analysis loader (file I/O)
2. Basic filtering
3. Aggregation by model/standard
4. Calculate performance metrics (mean, variance, percentiles)

### Phase 2: Analysis & Insights
1. Model comparison logic
2. Difficulty/reliability detection
3. Anomaly detection
4. Correlation analysis

### Phase 3: Reporting & Visualization
1. Markdown report generation
2. JSON formatting for tools
3. CSV export for spreadsheets
4. ASCII tables for CLI output

### Phase 4: Advanced Features
1. Trend analysis over time
2. Predictive analysis
3. Statistical significance testing
4. Visualization generation (SVG, HTML)

---

## Success Criteria

✅ **Phase 1 Complete When:**
- Can load results from any date/range
- Can filter by model, standard, size, tier
- Can calculate performance metrics
- Can compare two models side-by-side

✅ **Phase 2 Complete When:**
- Can identify best/worst performers
- Can detect outliers
- Can measure consistency
- Can rank difficulties

✅ **Phase 3 Complete When:**
- Can generate readable summary reports
- Can export data in multiple formats
- Can highlight key findings
- Can compare multiple entities

✅ **Full Completion When:**
- All 5 types of analysis questions can be answered
- Reports generated in <1 second
- No manual data manipulation needed
- Non-technical users can run analyses

---

## Notes

- Analysis layer is READ-ONLY (never modifies results)
- Works with unified schema format (all results standardized)
- Storage-agnostic (works with any file organization)
- Can scale to 1000+ results without performance issues
- Designed for extensibility (easy to add new metrics/analysis types)

---

**Next Steps:**
1. Implement Phase 1 (core infrastructure)
2. Test with actual performance test results
3. Implement Phase 2 (insights)
4. Get user feedback on analysis output
5. Implement Phases 3-4 based on priorities

