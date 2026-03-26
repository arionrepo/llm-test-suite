# Unified Test Result Schema - Usage Guide

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/SCHEMA-USAGE-GUIDE.md
**Description:** Complete guide to using the unified test result schema for result capture and validation
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-26

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Schema Structure](#schema-structure)
4. [Validation](#validation)
5. [Saving Results](#saving-results)
6. [Converting Results](#converting-results)
7. [Querying Results](#querying-results)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## Overview

The unified test result schema ensures that every test execution captures:
- **Complete input**: Full prompts exactly as sent to LLM
- **Complete output**: Full responses exactly as received from LLM
- **Complete metrics**: Performance, quality, resources, execution data
- **Complete metadata**: Timestamps, environment, configuration

### Philosophy: "Capture Everything, Focus Selectively"

Different test runs may focus analysis on different aspects (performance, accuracy, quality), but the underlying data **ALWAYS contains everything**. This enables:
- Post-hoc analysis of any metric without re-running tests
- Comparative analysis across test types
- Debugging and auditing of specific results
- Reproducibility and traceability

---

## Quick Start

### For Test Developers

If you're implementing a new test runner:

```javascript
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

// After test execution:
const results = runMyTests(); // returns array of results

// Convert to schema (if needed)
const schemaResults = results.map(r => convertToSchema(r));

// Validate and save
try {
  const saved = saveSchemaCompliantResults(schemaResults, {
    testType: 'performance',  // or 'compliance', 'accuracy', 'quality', 'custom'
    runName: 'my-test-run'
  });
  console.log(`Saved ${saved.validated} results to ${saved.filePath}`);
} catch (error) {
  console.error('Validation failed:', error.message);
  // Handle error - may want to skip saving or fallback to legacy format
}
```

### For Test Executors

Run updated tests with schema capture:

```bash
# Performance tests (all 6 runs)
node run-performance-tests.js

# Enterprise compliance tests
node run-enterprise-tests.js pilot
node run-enterprise-tests.js quick
node run-enterprise-tests.js standard
node run-enterprise-tests.js comprehensive
```

Results are automatically saved to `reports/{testType}/{YYYY-MM-DD}/` with validation.

### For Test Analyzers

Query saved results:

```javascript
import fs from 'fs';

// Load a result file
const file = fs.readFileSync(
  'reports/performance/2026-03-26/test-results-run-6-*.json',
  'utf8'
);
const wrapper = JSON.parse(file);

// Access individual results
wrapper.results.forEach(result => {
  console.log(`Model: ${result.modelConfig.modelName}`);
  console.log(`Speed: ${result.timing.tokensPerSecond} tok/s`);
  console.log(`Response: ${result.output.response.substring(0, 100)}...`);
});
```

---

## Schema Structure

### Root Level

```javascript
{
  "metadata": { ... },      // Test run metadata
  "input": { ... },         // Complete input/prompt
  "modelConfig": { ... },   // Model configuration
  "output": { ... },        // Complete LLM response
  "timing": { ... },        // Performance metrics
  "resources": { ... },     // Optional: CPU, memory, GPU usage
  "quality": { ... },       // Optional: accuracy, relevance, topic coverage
  "execution": { ... }      // Execution status and validation
}
```

### Mandatory Fields (ALWAYS Present)

These 6 sections are REQUIRED in every result:

#### 1. metadata
```javascript
"metadata": {
  "timestamp": "2026-03-26T10:30:45.123Z",    // When test ran
  "testRunId": "test-run-6-multitier-...",   // Unique run identifier
  "runNumber": 6,                             // Sequential run number
  "runName": "MULTITIER"                      // Human-readable name
}
```

#### 2. input
```javascript
"input": {
  "promptId": "ARION_MULTITIER_GDPR_1",      // Unique prompt identifier
  "fullPromptText": "...",                   // COMPLETE prompt (all tiers)
  "fullPromptTokens": 2585                   // Token count of full prompt
}
```

#### 3. output
```javascript
"output": {
  "response": "...",                         // COMPLETE LLM response
  "responseTokens": 187,                     // Token count of response
  "responseCharacters": 2156                 // Character count
}
```

#### 4. timing
```javascript
"timing": {
  "totalMs": 5234,                           // Total execution time
  "tokensPerSecond": 38.87                   // Output generation speed
}
```

#### 5. modelConfig
```javascript
"modelConfig": {
  "modelName": "phi3",                       // Model identifier
  "modelSize": "3.8B"                        // Model size (optional)
}
```

#### 6. execution
```javascript
"execution": {
  "success": true,                           // Did test complete successfully
  "responseValidated": true,                 // Was response non-empty
  "errors": [],                              // Any error messages
  "validationChecks": {
    "responseNotEmpty": true,
    "modelResponded": true,
    "noConnectionErrors": true,
    "noTimeouts": true
  }
}
```

### Optional Fields (As Applicable)

#### resources (if measuring system impact)
```javascript
"resources": {
  "cpuUsagePercent": 82.5,
  "memoryUsedMb": 4821,
  "gpuMemoryUsedMb": 3890,
  "gpuUtilizationPercent": 94
}
```

#### quality (if evaluating accuracy/relevance)
```javascript
"quality": {
  "relevanceScore": 0.92,
  "accuracyScore": 0.88,
  "overallScore": 0.90,
  "topicAnalysis": {
    "expectedTopics": ["regulation", "privacy", "EU"],
    "foundTopics": ["regulation", "privacy", "EU"],
    "topicCoverage": 1.0
  }
}
```

---

## Validation

### Schema Validation Module

Located in: `utils/test-result-validator.js`

#### validateTestResult(result)

Validates a single result against the schema.

```javascript
import { validateTestResult } from './utils/test-result-validator.js';

const result = { ... test result ... };
const validation = validateTestResult(result);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  console.error('Error count:', validation.errorCount);
}
```

**Returns:**
```javascript
{
  valid: boolean,           // true if all mandatory fields present/valid
  errors: string[],         // List of validation errors
  errorCount: number,       // Number of errors
  warningCount: number      // Number of warnings
}
```

**Validation Checks:**
- Metadata object exists and has timestamp, testRunId, runNumber
- Input object has promptId, fullPromptText, fullPromptTokens
- Input fullPromptText is not empty string
- Output object has response, responseTokens
- Output response is not empty string (CRITICAL)
- Timing has totalMs and tokensPerSecond
- Execution has success and responseValidated flags
- All numeric fields are numbers (not strings)

#### validateTestResultBatch(results, testRunName)

Validates multiple results with summary statistics.

```javascript
import { validateTestResultBatch } from './utils/test-result-validator.js';

const results = [ /* array of results */ ];
const validation = validateTestResultBatch(results, 'Run 6 MULTITIER');

if (!validation.valid) {
  console.log(`${validation.failedResults}/${validation.totalResults} results failed`);
  validation.errors.forEach(err => console.error(err));
}
```

**Returns:**
```javascript
{
  valid: boolean,           // true if ALL results valid
  totalResults: number,     // Total results checked
  failedResults: number,    // Number that failed validation
  errors: string[],         // Error list (one per failed result)
  summary: string,          // "X/Y results passed validation"
  testRunName: string       // Name provided
}
```

#### hasMandatoryFields(result)

Quick check if all mandatory fields are present (no detailed validation).

```javascript
import { hasMandatoryFields } from './utils/test-result-validator.js';

if (hasMandatoryFields(result)) {
  // Result has all required fields
} else {
  // Result is missing required fields
}
```

#### getValidationErrorReport(validation)

Format validation results for display/logging.

```javascript
import { getValidationErrorReport } from './utils/test-result-validator.js';

const report = getValidationErrorReport(validation);
console.error(report);
```

**Output Example:**
```
Validation Report: Run 6 MULTITIER
======================================================================
Total Results: 50
Passed: 47
Failed: 3
Success Rate: 94.0%

Errors:
  ❌ test-GDPR_1: MISSING: output.response - THIS IS CRITICAL
  ❌ test-ISO_5: INVALID: output.response is empty - THIS IS CRITICAL
  ❌ test-SOC2_3: MISSING: timing.tokensPerSecond
```

---

## Saving Results

### saveSchemaCompliantResults(results, options)

Located in: `utils/test-helpers.js`

Saves test results with validation and organized storage.

```javascript
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

// Save single result
try {
  const saved = saveSchemaCompliantResults(result, {
    testType: 'performance',
    runName: 'my-run'
  });
  console.log(`Saved to: ${saved.filePath}`);
  console.log(`Validated: ${saved.validated} results`);
} catch (error) {
  console.error('Failed to save:', error.message);
}

// Save multiple results
try {
  const saved = saveSchemaCompliantResults(results, {
    testType: 'compliance',
    runName: 'enterprise-pilot',
    timestamp: '2026-03-26T10:30:45.000Z'
  });
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

#### Options

```javascript
{
  testType: string,          // REQUIRED: performance|compliance|accuracy|quality|custom
  runName: string,           // REQUIRED: Unique test run name
  timestamp: string,         // OPTIONAL: ISO timestamp (defaults to now)
  validateSingle: boolean    // OPTIONAL: Validate before saving (defaults: true)
}
```

#### Returns

```javascript
{
  filePath: string,    // Full path where results were saved
  validated: number,   // Count of results that passed validation
  failed: number,      // Count of results that failed validation
  errors: string[]     // List of validation errors (if any)
}
```

#### File Organization

Results are saved in date-based directory structure:

```
reports/
├── {testType}/
│   └── {YYYY-MM-DD}/
│       └── test-results-{runName}-{timestamp}.json
```

**Examples:**
- `reports/performance/2026-03-26/test-results-run-6-multitier-20260326T103045Z.json`
- `reports/compliance/2026-03-26/test-results-enterprise-pilot-20260326T140230Z.json`

#### File Format

Results are wrapped in metadata:

```javascript
{
  "metadata": {
    "timestamp": "2026-03-26T10:30:45.000Z",
    "testType": "performance",
    "runName": "run-6-multitier",
    "resultCount": 50,
    "validationPassed": true,
    "savedAt": "2026-03-26T10:30:50.000Z"
  },
  "results": [
    { /* individual result 1 in schema */ },
    { /* individual result 2 in schema */ },
    // ... more results
  ]
}
```

#### Error Handling

```javascript
try {
  const saved = saveSchemaCompliantResults(results, {
    testType: 'performance',
    runName: 'my-test'
  });
  console.log('Success:', saved.filePath);
} catch (error) {
  // Validation failed - error message will detail which results failed
  console.error('Save failed:', error.message);

  // Option 1: Fix the results and retry
  // Option 2: Fall back to legacy saveReport() function
  // Option 3: Manual review and fix
}
```

---

## Converting Results

### Performance Test Conversion

Located in: `run-performance-tests.js`

```javascript
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
      fullPromptText: result.fullPromptText || '',
      fullPromptTokens: result.inputTokens || 0
    },
    // ... rest of schema
  };
}
```

**Input (from ResilientPerformanceTestRunner):**
```javascript
{
  runNumber: 6,
  modelName: 'phi3',
  promptId: 'PROMPT_ID',
  response: '...',
  responseLength: 2156,
  responseTokens: 187,
  inputTokens: 2585,
  totalTimeMs: 5234,
  outputTokPerSec: 38.87,
  timestamp: '...'
}
```

**Output (unified schema):**
```javascript
{
  metadata: { /* ... */ },
  input: { /* ... */ },
  modelConfig: { /* ... */ },
  output: { /* ... */ },
  timing: { /* ... */ },
  execution: { /* ... */ }
}
```

### Enterprise Test Conversion

Located in: `run-enterprise-tests.js`

```javascript
function convertEnterpriseResultsToSchema(enterpriseResults, testName) {
  const schemaResults = [];

  for (const [modelName, modelResults] of Object.entries(enterpriseResults.modelResults)) {
    modelResults.forEach(result => {
      if (result.success) {
        schemaResults.push({
          // Convert to unified schema
        });
      }
    });
  }

  return schemaResults;
}
```

**Custom Conversion Function Pattern:**

```javascript
// For any test runner
function convertMyResultsToSchema(results, testName) {
  return results.map(r => ({
    metadata: {
      timestamp: new Date().toISOString(),
      testRunId: `test-run-${testName}-...`,
      runNumber: 1,
      runName: testName.toUpperCase(),
      runType: 'custom'
    },
    input: {
      promptId: r.promptId,
      fullPromptText: r.prompt,
      fullPromptTokens: r.promptTokens
    },
    output: {
      response: r.response,
      responseTokens: r.responseTokens,
      responseCharacters: r.response.length
    },
    // ... complete all mandatory fields
    execution: {
      success: r.success,
      responseValidated: r.response && r.response.trim() !== '',
      errors: [],
      validationChecks: {
        responseNotEmpty: !!r.response,
        modelResponded: !!r.response
      }
    }
  }));
}
```

---

## Querying Results

### Loading and Analyzing Results

```javascript
import fs from 'fs';
import path from 'path';

// Load a single result file
function loadResults(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const wrapper = JSON.parse(content);
  return wrapper.results;
}

// Example: Load all performance results from a date
const date = '2026-03-26';
const dir = `reports/performance/${date}`;
const files = fs.readdirSync(dir);

files.forEach(file => {
  const results = loadResults(path.join(dir, file));

  results.forEach(result => {
    console.log(`Prompt: ${result.input.promptId}`);
    console.log(`Model: ${result.modelConfig.modelName}`);
    console.log(`Speed: ${result.timing.tokensPerSecond} tok/s`);
    console.log(`Response: ${result.output.response.substring(0, 100)}...`);
  });
});
```

### Querying by Standard/Category

```javascript
function findResultsByStandard(dir, standard) {
  const results = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const data = loadResults(path.join(dir, file));
    const filtered = data.filter(r =>
      r.input.promptId.includes(standard)
    );
    results.push(...filtered);
  });

  return results;
}

// Usage
const gdprResults = findResultsByStandard('reports/compliance/2026-03-26', 'GDPR');
console.log(`Found ${gdprResults.length} GDPR compliance tests`);
```

### Comparative Analysis

```javascript
function compareModels(results) {
  const byModel = {};

  results.forEach(r => {
    if (!byModel[r.modelConfig.modelName]) {
      byModel[r.modelConfig.modelName] = [];
    }
    byModel[r.modelConfig.modelName].push(r);
  });

  // Calculate statistics per model
  for (const [model, modelResults] of Object.entries(byModel)) {
    const speeds = modelResults.map(r => r.timing.tokensPerSecond);
    const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;

    console.log(`${model}: ${avgSpeed.toFixed(1)} tok/s average`);
  }
}
```

---

## Troubleshooting

### Problem: "MISSING: output.response - THIS IS CRITICAL"

**Cause:** Test result doesn't have response text captured.

**Solution:**
1. Ensure test runner captures response from LLM client
2. Check that LLM client returns `result.response` field
3. Verify response is not being discarded in intermediate processing

**Example Fix:**
```javascript
// WRONG - response is discarded
const result = await client.chatCompletion(messages);
return { timing: result.timing }; // Missing response!

// CORRECT - response is captured
const result = await client.chatCompletion(messages);
return {
  response: result.response,  // Captured here
  timing: result.timing
};
```

### Problem: "INVALID: output.response is empty"

**Cause:** Response was captured but is empty string or whitespace only.

**Solution:**
1. Check that LLM actually returned content
2. Verify response isn't being trimmed to empty
3. Check for connection/timeout issues during generation

**Diagnosis:**
```javascript
const result = await client.chatCompletion(messages);
console.log('Response length:', result.response.length);
console.log('Response (first 100 chars):', result.response.substring(0, 100));

if (!result.response || result.response.trim() === '') {
  console.error('ERROR: Empty response from LLM');
  // Investigate why LLM didn't generate content
}
```

### Problem: "MISSING: metadata.testRunId"

**Cause:** Test result missing required metadata field.

**Solution:** When converting results to schema, ensure all metadata fields are set:

```javascript
const result = {
  metadata: {
    timestamp: new Date().toISOString(),     // SET THIS
    testRunId: `test-run-${name}-${date}`,  // SET THIS
    runNumber: 6,                             // SET THIS
    runName: 'MULTITIER'                      // SET THIS
  },
  // ... other fields
};
```

### Problem: Validation Fails on Entire Batch

**Cause:** One or more results invalid, preventing entire batch from saving.

**Solution:**

Option 1: Fix the invalid results
```javascript
const validation = validateTestResultBatch(results);
console.error(validation.errors); // See which results failed

// Fix those results
const fixedResults = results.map(r => {
  if (r.output.response === '') {
    r.output.response = 'No response captured';
  }
  return r;
});

// Retry
const saved = saveSchemaCompliantResults(fixedResults, options);
```

Option 2: Filter out invalid results
```javascript
const validation = validateTestResultBatch(results);
const validResults = results.filter(r => {
  const rv = validateTestResult(r);
  return rv.valid;
});

const saved = saveSchemaCompliantResults(validResults, options);
console.log(`Saved ${saved.validated} valid results, skipped ${results.length - validResults.length} invalid`);
```

Option 3: Fallback to legacy format
```javascript
try {
  const saved = saveSchemaCompliantResults(results, options);
} catch (error) {
  console.warn('Schema validation failed, using legacy format');
  saveReport('my-test', results); // Legacy function
}
```

### Problem: "No valid results found to convert to schema format"

**Cause:** Conversion function returned empty array.

**Solution:** Verify input data structure matches what conversion function expects:

```javascript
// Debug the conversion
const results = enterpriseResults.modelResults;
console.log('Number of models:', Object.keys(results).length);

for (const [model, modelResults] of Object.entries(results)) {
  console.log(`Model ${model}: ${modelResults ? modelResults.length : 0} results`);
  if (modelResults) {
    console.log('First result:', modelResults[0]);
  }
}

// Verify results have expected fields
modelResults.forEach((r, i) => {
  if (!r.response) console.warn(`Result ${i} missing response`);
  if (!r.success) console.warn(`Result ${i} marked as failed`);
});
```

---

## API Reference

### Validator Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `validateTestResult(result)` | Object | `{valid, errors, errorCount}` | Validate single result |
| `validateTestResultBatch(results, name)` | Array, String | `{valid, totalResults, failedResults, errors, summary}` | Validate batch |
| `hasMandatoryFields(result)` | Object | Boolean | Quick field check |
| `getValidationErrorReport(validation)` | Object | String | Format errors for display |

### Storage Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `saveSchemaCompliantResults(results, options)` | Array/Object, Options | `{filePath, validated, failed, errors}` | Save with validation |
| `saveReport(testName, results)` | String, Object | String (path) | Legacy save (no validation) |

### Conversion Functions (Per Test Runner)

| File | Function | Input | Output |
|------|----------|-------|--------|
| `run-performance-tests.js` | `convertToSchema(result, runNum, runName)` | Performance result | Schema result |
| `run-enterprise-tests.js` | `convertEnterpriseResultsToSchema(results, name)` | Enterprise results | Schema results array |

---

## Integration Checklist

For implementing schema compliance in a new test runner:

- [ ] Import validator functions
- [ ] Import `saveSchemaCompliantResults` from test-helpers
- [ ] Create `convertToSchema()` function for your result format
- [ ] After test execution, convert results to schema
- [ ] Call `validateTestResultBatch()` to check results
- [ ] Call `saveSchemaCompliantResults()` to save validated results
- [ ] Handle validation errors (fix, skip, or fallback)
- [ ] Document your conversion function with examples
- [ ] Add file headers with proper format (see TEST-RESULT-SCHEMA.md)
- [ ] Add comments explaining non-obvious logic
- [ ] Test with small data set first (pilot test)

---

## References

- **Schema Definition:** TEST-RESULT-SCHEMA.md
- **Implementation Overview:** SCHEMA-IMPLEMENTATION-SUMMARY.md
- **Project Guidelines:** CLAUDE.md (Unified Test Result Schema section)
- **Validator Source:** utils/test-result-validator.js
- **Helper Functions:** utils/test-helpers.js

---

**Questions?** Contact: libor@arionetworks.com
