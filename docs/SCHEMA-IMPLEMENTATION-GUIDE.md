# Unified Test Result Schema - Implementation Guide for New Test Runners

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/SCHEMA-IMPLEMENTATION-GUIDE.md
**Description:** Step-by-step guide for implementing unified schema in new test runners
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-26

---

## Overview

This guide walks you through implementing the unified test result schema in a new test runner or existing test runner that needs updates.

---

## Step 1: Understand Your Test Runner's Output Format

### What You Need to Know

First, understand what your test runner currently outputs:

```javascript
// Example: Current output from your test runner
const currentOutput = {
  testId: 'test-1',
  question: 'What is GDPR?',
  response: 'GDPR is...',
  timingMs: 1234,
  tokensOut: 50,
  tokensIn: 10,
  modelUsed: 'phi3',
  passed: true
};
```

### Document Current Fields

Create a mapping table:

| Current Field | Type | Mapping to Schema |
|---------------|------|-------------------|
| `testId` | String | `input.promptId` |
| `question` | String | `input.fullPromptText` |
| `response` | String | `output.response` |
| `timingMs` | Number | `timing.totalMs` |
| `tokensOut` | Number | `output.responseTokens` |
| `tokensIn` | Number | `input.fullPromptTokens` |
| `modelUsed` | String | `modelConfig.modelName` |
| `passed` | Boolean | `execution.success` |

---

## Step 2: Create Conversion Function

### Basic Template

```javascript
/**
 * Convert test runner output to unified schema format.
 *
 * Business Purpose: Transform custom result format from test runner into
 * standardized unified schema format that can be validated and analyzed
 * across all test types.
 *
 * @param {Object} result - Custom result from your test runner
 * @param {number} runNumber - Sequential test run number
 * @param {string} runName - Human-readable run name
 * @returns {Object} Result in unified schema format
 *
 * Example:
 *   const result = { ... custom format ... };
 *   const schemaResult = convertToSchema(result, 1, 'PILOT');
 *   if (schemaResult.output.response) {
 *     // Result has required response text
 *   }
 */
function convertToSchema(result, runNumber, runName) {
  // Create timestamp (use result timestamp if available, otherwise current time)
  const timestamp = new Date(result.timestamp || new Date().toISOString()).toISOString();

  return {
    // ========== MANDATORY: METADATA ==========
    metadata: {
      timestamp: timestamp,
      testRunId: `test-run-${runNumber}-${runName.toLowerCase()}-${timestamp.split('T')[0]}`,
      runNumber: runNumber,
      runName: runName,
      runType: 'custom',  // Change to: 'performance', 'compliance', 'accuracy', 'quality'
      focus: 'your-focus' // What this test emphasizes
    },

    // ========== MANDATORY: INPUT ==========
    input: {
      promptId: result.testId || `test-${runNumber}`,
      fullPromptText: result.question || result.prompt || '',
      fullPromptTokens: result.tokensIn || result.inputTokens || 0
    },

    // ========== MANDATORY: MODEL CONFIG ==========
    modelConfig: {
      modelName: result.modelUsed || result.model || 'unknown',
      modelSize: result.modelSize || 'unknown',
      quantization: result.quantization || 'Q4_K_M'
    },

    // ========== MANDATORY: OUTPUT ==========
    output: {
      response: result.response || '',  // CRITICAL: Must capture response
      responseTokens: result.tokensOut || result.responseTokens || 0,
      responseCharacters: (result.response || '').length,
      completionFinishReason: result.finishReason || 'stop'
    },

    // ========== MANDATORY: TIMING ==========
    timing: {
      totalMs: result.timingMs || 0,
      tokensPerSecond: result.tokPerSec || 0,
      firstTokenMs: result.firstTokenMs,
      promptProcessingMs: result.promptMs,
      generationMs: result.generationMs
    },

    // ========== OPTIONAL: RESOURCES (if tracking) ==========
    // resources: {
    //   cpuUsagePercent: result.cpuUsage,
    //   memoryUsedMb: result.memory,
    //   gpuMemoryUsedMb: result.gpuMemory,
    //   gpuUtilizationPercent: result.gpuUsage
    // },

    // ========== OPTIONAL: QUALITY (if evaluating) ==========
    // quality: {
    //   relevanceScore: result.relevance,
    //   accuracyScore: result.accuracy,
    //   overallScore: result.score,
    //   topicAnalysis: {
    //     expectedTopics: result.expectedTopics,
    //     foundTopics: result.foundTopics,
    //     topicCoverage: result.topicCoverage
    //   }
    // },

    // ========== MANDATORY: EXECUTION ==========
    execution: {
      success: !result.error && result.response && result.response.trim() !== '',
      startTime: result.startTime || timestamp,
      endTime: result.endTime || timestamp,
      durationMs: result.timingMs || 0,

      modelStartVerified: result.modelStarted !== false,
      modelStopVerified: true,
      responseValidated: result.response && result.response.trim() !== '',

      errors: result.error ? [result.error] : [],
      warnings: result.warning ? [result.warning] : [],

      validationChecks: {
        responseNotEmpty: result.response && result.response.trim() !== '',
        responseWithinTokenLimit: (result.tokensOut || 0) <= 500,
        allTiersIncludedInPrompt: true,
        modelResponded: !!result.response,
        noConnectionErrors: !result.connectionError,
        noTimeouts: !result.timeout
      }
    }
  };
}
```

### Mapping Guidelines

**CRITICAL Fields:**
- `input.fullPromptText` - Must be complete prompt exactly as sent to LLM
- `output.response` - Must be full response exactly as received from LLM
- Both above must NOT be empty strings

**Timing Fields:**
- `timing.totalMs` - Total time from request to response
- `timing.tokensPerSecond` - Output generation speed
- At least these two mandatory

**Metadata Fields:**
- `metadata.timestamp` - When test ran (ISO 8601 format)
- `metadata.testRunId` - Unique identifier for entire test run
- `metadata.runNumber` - Sequential run number
- `metadata.runName` - Human-readable name

---

## Step 3: Validate Result Format

### Pre-Conversion Validation

Before converting, validate your test runner output:

```javascript
function validateInputFormat(result) {
  const errors = [];

  if (!result.testId && !result.promptId) {
    errors.push('Missing: testId or promptId');
  }

  if (!result.response) {
    errors.push('CRITICAL: Missing response from LLM');
  } else if (typeof result.response !== 'string') {
    errors.push('CRITICAL: Response is not a string');
  }

  if (!result.modelUsed && !result.model) {
    errors.push('Missing: model name');
  }

  if (typeof result.timingMs !== 'number') {
    errors.push('Missing: timing in milliseconds');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
const results = runTests();
results.forEach((result, i) => {
  const validation = validateInputFormat(result);
  if (!validation.valid) {
    console.warn(`Result ${i} has issues:`, validation.errors);
  }
});
```

---

## Step 4: Integrate Into Test Runner

### Pattern 1: Update Existing Test Runner

```javascript
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import { validateTestResultBatch } from './utils/test-result-validator.js';

async function runMyTests() {
  // Execute tests (existing code)
  const results = await executeTests();

  // STEP 1: Convert to schema
  const schemaResults = results.map((r, i) => convertToSchema(r, 1, 'MY_TEST'));

  // STEP 2: Validate batch
  const validation = validateTestResultBatch(schemaResults, 'My Test Run');
  if (!validation.valid) {
    console.error('Validation failed:');
    console.error(validation.summary);
    validation.errors.forEach(e => console.error(`  - ${e}`));
    // Decide: fix, skip, or fallback
    return;
  }

  // STEP 3: Save with validation
  try {
    const saved = saveSchemaCompliantResults(schemaResults, {
      testType: 'compliance',   // Change to appropriate type
      runName: 'my-test-run'
    });

    console.log(`✅ Saved ${saved.validated} results`);
    console.log(`   Path: ${saved.filePath}`);

    if (saved.failed > 0) {
      console.warn(`   ${saved.failed} results failed validation`);
    }
  } catch (error) {
    console.error('❌ Failed to save results:', error.message);
    // Handle error appropriately
  }
}
```

### Pattern 2: New Test Runner from Scratch

```javascript
/**
 * File: run-my-tests.js
 * Description: My custom test runner with unified schema support
 */

import { saveSchemaCompliantResults } from './utils/test-helpers.js';

async function runMyTests() {
  console.log('Starting My Test Suite...');
  const startTime = Date.now();

  // Execute tests
  const results = [];
  for (const test of myTestSuite) {
    const result = await runSingleTest(test);
    results.push(result);
  }

  // Convert to schema
  const schemaResults = results.map((r, i) =>
    convertMyResultToSchema(r, 1, 'MY_RUN')
  );

  // Save with schema compliance
  try {
    const saved = saveSchemaCompliantResults(schemaResults, {
      testType: 'custom',
      runName: 'my-test-suite'
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Test suite complete in ${duration}s`);
    console.log(`   Results saved to: ${saved.filePath}`);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === 'file://' + process.argv[1]) {
  runMyTests().catch(console.error);
}
```

---

## Step 5: Handle Errors and Edge Cases

### Empty/Missing Response

```javascript
// In your conversion function:
if (!result.response || result.response.trim() === '') {
  // OPTION 1: Skip this result (best for large suites)
  return null;  // Then filter nulls after mapping

  // OPTION 2: Mark as failed
  return {
    ...schema,
    execution: {
      ...schema.execution,
      success: false,
      errors: ['No response from LLM']
    }
  };

  // OPTION 3: Provide fallback
  return {
    ...schema,
    output: {
      response: '[No response generated]',
      responseTokens: 0,
      responseCharacters: 25
    },
    execution: {
      ...schema.execution,
      success: false,
      errors: ['LLM returned empty response']
    }
  };
}
```

### Filter Out Invalid Results

```javascript
// After conversion
const schemaResults = results
  .map(r => convertToSchema(r, 1, 'TEST'))
  .filter(r => r !== null);  // Remove skipped results

if (schemaResults.length === 0) {
  console.error('No valid results to save');
  return;
}

const saved = saveSchemaCompliantResults(schemaResults, {
  testType: 'custom',
  runName: 'my-test'
});
```

### Graceful Validation Failure

```javascript
try {
  const saved = saveSchemaCompliantResults(schemaResults, {
    testType: 'custom',
    runName: 'my-test'
  });
  console.log('Success:', saved);
} catch (error) {
  // Option 1: Log and continue
  console.warn('Schema validation failed, skipping save');

  // Option 2: Use legacy format
  saveReport('my-test', results);

  // Option 3: Manual review
  const validation = validateTestResultBatch(schemaResults);
  console.error('Validation report:');
  console.error(getValidationErrorReport(validation));
  console.log('Please review and fix issues');
}
```

---

## Step 6: Testing Your Implementation

### Test with Small Dataset

```bash
# Run pilot test first
node run-my-tests.js --limit 5

# Check output
ls -lh reports/custom/2026-03-26/
cat reports/custom/2026-03-26/test-results-*.json | jq .
```

### Verify Schema Compliance

```javascript
import fs from 'fs';
import { hasMandatoryFields } from './utils/test-result-validator.js';

// Load saved file
const file = fs.readFileSync('reports/custom/2026-03-26/test-results-*.json', 'utf8');
const wrapper = JSON.parse(file);

// Check each result
wrapper.results.forEach((result, i) => {
  if (!hasMandatoryFields(result)) {
    console.error(`Result ${i} is missing mandatory fields`);
  }
});

console.log(`✅ All ${wrapper.results.length} results have mandatory fields`);
```

### Validate Individual Fields

```javascript
const result = wrapper.results[0];

// Check response
if (!result.output.response) {
  console.error('ERROR: Response is missing');
} else if (result.output.response.length === 0) {
  console.error('ERROR: Response is empty string');
} else {
  console.log(`✅ Response (${result.output.response.length} chars)`);
}

// Check metadata
console.log(`✅ Test ID: ${result.input.promptId}`);
console.log(`✅ Model: ${result.modelConfig.modelName}`);
console.log(`✅ Speed: ${result.timing.tokensPerSecond} tok/s`);
```

---

## Step 7: Documentation

### Add File Header

```javascript
// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-my-tests.js
// Description: My test runner - executes tests with unified schema result capture
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
```

### Document Conversion Function

```javascript
/**
 * Convert my test runner output to unified schema format.
 *
 * Business Purpose: Transform custom result format into standardized schema
 * that can be validated and compared with other test types.
 *
 * @param {Object} result - Custom result from my test runner
 * @param {number} runNumber - Sequential run number (1-N)
 * @param {string} runName - Human-readable run name (e.g., 'PILOT', 'FULL')
 * @returns {Object} Result in unified schema format
 *
 * Mandatory Fields Captured:
 *   - input.fullPromptText: Complete prompt sent to LLM
 *   - output.response: Complete response from LLM
 *   - timing.totalMs: Total execution time
 *   - metadata: Test run identification and timestamps
 *   - execution: Success status and validation checks
 *
 * Optional Fields (if applicable):
 *   - quality: Accuracy/relevance scores if evaluating
 *   - resources: CPU/memory/GPU usage if monitoring
 *
 * Example:
 *   const result = { testId: 'test-1', response: '...', timingMs: 1234 };
 *   const schemaResult = convertToSchema(result, 1, 'PILOT');
 *   const validation = validateTestResult(schemaResult);
 *   if (validation.valid) {
 *     const saved = saveSchemaCompliantResults([schemaResult], {
 *       testType: 'custom',
 *       runName: 'my-pilot'
 *     });
 *   }
 */
```

### Add Usage Documentation

```javascript
/**
 * Execute all my tests and save results with schema validation.
 *
 * Features:
 * - Runs test suite against all configured models
 * - Converts results to unified schema format
 * - Validates all mandatory fields before saving
 * - Saves to organized directory structure: reports/{type}/{date}/
 * - Provides detailed validation error reporting
 *
 * Usage:
 *   node run-my-tests.js              # Run full test suite
 *   node run-my-tests.js --limit 5   # Run with 5 tests (pilot)
 *   node run-my-tests.js --help      # Show all options
 *
 * Output:
 *   - Console: Progress, timing, and results summary
 *   - Files: results/custom/2026-03-26/test-results-*.json
 *   - Validation: All results checked before saving
 *
 * Requirements:
 *   - LLM models must be running and accessible
 *   - Node.js 16+ with ES modules support
 *   - Write permissions to reports/ directory
 */
```

---

## Step 8: Integration Checklist

Before considering implementation complete:

- [ ] Conversion function handles all result fields
- [ ] Response text is always captured (not empty)
- [ ] All mandatory metadata fields are set
- [ ] Validation passes on test data
- [ ] File headers added with proper format
- [ ] Functions documented with JSDoc comments
- [ ] Usage examples provided in documentation
- [ ] Error cases handled gracefully
- [ ] Small dataset tested successfully (pilot)
- [ ] Directory structure created correctly
- [ ] Files wrapped in metadata properly
- [ ] Timestamps in ISO 8601 format
- [ ] Test runner executes without errors
- [ ] Results can be loaded and analyzed
- [ ] Documentation added to SCHEMA-USAGE-GUIDE.md

---

## Complete Example Implementation

### Minimal Implementation

```javascript
// run-simple-test.js
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

async function runTests() {
  const results = [];

  // Execute tests
  for (let i = 1; i <= 10; i++) {
    const response = await queryLLM(`Test question ${i}`);
    results.push({
      id: `test-${i}`,
      question: `Test question ${i}`,
      response,
      time: 1234
    });
  }

  // Convert to schema
  const schemaResults = results.map(r => ({
    metadata: {
      timestamp: new Date().toISOString(),
      testRunId: 'test-run-simple-2026-03-26',
      runNumber: 1,
      runName: 'SIMPLE'
    },
    input: {
      promptId: r.id,
      fullPromptText: r.question,
      fullPromptTokens: 10
    },
    modelConfig: { modelName: 'test-model' },
    output: {
      response: r.response,
      responseTokens: 50,
      responseCharacters: r.response.length
    },
    timing: {
      totalMs: r.time,
      tokensPerSecond: 50 / (r.time / 1000)
    },
    execution: {
      success: !!r.response,
      responseValidated: !!r.response,
      errors: [],
      validationChecks: {
        responseNotEmpty: !!r.response,
        modelResponded: !!r.response
      }
    }
  }));

  // Save
  const saved = saveSchemaCompliantResults(schemaResults, {
    testType: 'custom',
    runName: 'simple-test'
  });

  console.log(`Saved ${saved.validated} results to ${saved.filePath}`);
}

runTests().catch(console.error);
```

---

## References

- **Schema Definition:** TEST-RESULT-SCHEMA.md
- **Usage Guide:** docs/SCHEMA-USAGE-GUIDE.md
- **Validator API:** utils/test-result-validator.js
- **Helper Functions:** utils/test-helpers.js
- **Performance Example:** run-performance-tests.js
- **Compliance Example:** run-enterprise-tests.js

---

**Questions?** Contact: libor@arionetworks.com
