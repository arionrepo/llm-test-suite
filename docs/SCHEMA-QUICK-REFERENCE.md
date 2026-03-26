# Unified Test Result Schema - Quick Reference

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/SCHEMA-QUICK-REFERENCE.md
**Description:** Quick lookup for common schema tasks and commands
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Mandatory Fields (Always Required)

```javascript
result = {
  metadata: {
    timestamp: "2026-03-26T10:30:45.123Z",  // ISO 8601
    testRunId: "test-run-6-...",            // Unique ID
    runNumber: 6,                            // Sequential number
    runName: "MULTITIER"                     // Human-readable
  },
  input: {
    promptId: "PROMPT_ID",                  // Test identifier
    fullPromptText: "...",                  // COMPLETE prompt
    fullPromptTokens: 2585                  // Token count
  },
  output: {
    response: "...",                        // COMPLETE response
    responseTokens: 187                     // Token count
  },
  timing: {
    totalMs: 5234,                          // Execution time
    tokensPerSecond: 38.87                  // Generation speed
  },
  modelConfig: {
    modelName: "phi3"                       // Model identifier
  },
  execution: {
    success: true,                          // Did it work
    responseValidated: true,                // Response non-empty
    errors: [],                             // Error messages
    validationChecks: { /* ... */ }         // Validation results
  }
}
```

---

## Common Tasks

### Validate a Single Result
```javascript
import { validateTestResult } from './utils/test-result-validator.js';

const validation = validateTestResult(result);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

### Validate Multiple Results
```javascript
import { validateTestResultBatch } from './utils/test-result-validator.js';

const validation = validateTestResultBatch(results, 'My Test');
if (!validation.valid) {
  console.log(`Failed: ${validation.failedResults}/${validation.totalResults}`);
}
```

### Save Results with Validation
```javascript
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

try {
  const saved = saveSchemaCompliantResults(results, {
    testType: 'performance',
    runName: 'my-test'
  });
  console.log(`Saved to: ${saved.filePath}`);
} catch (error) {
  console.error('Save failed:', error.message);
}
```

### Load Results
```javascript
import fs from 'fs';

const file = fs.readFileSync('reports/performance/2026-03-26/test-results-*.json', 'utf8');
const wrapper = JSON.parse(file);
const results = wrapper.results;

results.forEach(r => {
  console.log(`Prompt: ${r.input.promptId}`);
  console.log(`Model: ${r.modelConfig.modelName}`);
  console.log(`Speed: ${r.timing.tokensPerSecond} tok/s`);
});
```

### Convert Results to Schema
```javascript
const schemaResult = {
  metadata: {
    timestamp: new Date().toISOString(),
    testRunId: `test-run-${date}`,
    runNumber: 1,
    runName: 'MY_RUN'
  },
  input: {
    promptId: oldResult.id,
    fullPromptText: oldResult.prompt,
    fullPromptTokens: oldResult.promptTokens
  },
  output: {
    response: oldResult.response,
    responseTokens: oldResult.responseTokens,
    responseCharacters: oldResult.response.length
  },
  timing: {
    totalMs: oldResult.timeMs,
    tokensPerSecond: oldResult.tokPerSec
  },
  modelConfig: { modelName: oldResult.model },
  execution: {
    success: !!oldResult.response,
    responseValidated: !!oldResult.response,
    errors: [],
    validationChecks: {
      responseNotEmpty: !!oldResult.response,
      modelResponded: !!oldResult.response
    }
  }
};
```

---

## File Operations

### Directory Structure
```
reports/
├── performance/        # Speed/throughput tests
├── compliance/         # Compliance/accuracy tests
├── quality/           # Quality evaluation tests
├── accuracy/          # Accuracy-focused tests
└── custom/            # Custom test types
    └── {YYYY-MM-DD}/  # Date-based organization
        └── test-results-{runName}-{timestamp}.json
```

### Run Tests and Save
```bash
# Performance (Runs 1-6)
node run-performance-tests.js

# Compliance
node run-enterprise-tests.js pilot
node run-enterprise-tests.js quick
node run-enterprise-tests.js standard
node run-enterprise-tests.js comprehensive
```

### Check Saved Results
```bash
# List all performance results for today
ls reports/performance/2026-03-26/

# View result file (pretty-printed)
cat reports/performance/2026-03-26/test-results-*.json | jq .

# Count results in file
cat reports/performance/2026-03-26/test-results-*.json | jq '.results | length'
```

---

## Error Messages

### "MISSING: output.response"
**Fix:** Ensure LLM response is captured in test runner
```javascript
// WRONG
return { timing: result.timing };

// CORRECT
return { response: result.response, timing: result.timing };
```

### "INVALID: output.response is empty"
**Fix:** Check that LLM actually generated content
```javascript
if (!result.response || result.response.trim() === '') {
  console.error('LLM returned no content');
  // Investigate why
}
```

### "MISSING: metadata.testRunId"
**Fix:** Set all metadata fields
```javascript
metadata: {
  timestamp: new Date().toISOString(),    // ← Required
  testRunId: `test-run-${name}-${date}`,  // ← Required
  runNumber: 1,                           // ← Required
  runName: 'MY_RUN'                       // ← Required
}
```

### Validation Fails (entire batch)
**Fix:** Filter or fix invalid results
```javascript
// Filter out invalid
const valid = results.filter(r => r.response && r.response.trim() !== '');
const saved = saveSchemaCompliantResults(valid, options);
```

---

## API Quick Reference

### Validation Functions
```javascript
validateTestResult(result)
  → { valid: boolean, errors: string[], errorCount: number }

validateTestResultBatch(results, name)
  → { valid: boolean, totalResults, failedResults, errors, summary }

hasMandatoryFields(result)
  → boolean

getValidationErrorReport(validation)
  → string (formatted for display)
```

### Storage Functions
```javascript
saveSchemaCompliantResults(results, { testType, runName, timestamp?, validateSingle? })
  → { filePath: string, validated: number, failed: number, errors: string[] }

saveReport(testName, results)  // Legacy (no validation)
  → string (file path)
```

---

## Test Types

| Type | Purpose | Focus | Example |
|------|---------|-------|---------|
| `performance` | Speed/throughput | tokens/sec | Run 1-6 |
| `compliance` | Regulatory accuracy | correctness | Enterprise tests |
| `accuracy` | Quality of answers | precision | GDPR assessment |
| `quality` | Overall quality | completeness | Multi-tier tests |
| `custom` | Any custom test | variable | New test runners |

---

## Conversion Function Template

```javascript
function convertToSchema(result, runNumber, runName) {
  const timestamp = new Date(result.timestamp || new Date()).toISOString();

  return {
    metadata: {
      timestamp,
      testRunId: `test-run-${runNumber}-${runName.toLowerCase()}-${timestamp.split('T')[0]}`,
      runNumber,
      runName,
      runType: 'custom',
      focus: 'performance'
    },
    input: {
      promptId: result.id,
      fullPromptText: result.prompt,
      fullPromptTokens: result.inTokens
    },
    modelConfig: { modelName: result.model },
    output: {
      response: result.response,
      responseTokens: result.outTokens,
      responseCharacters: result.response.length
    },
    timing: {
      totalMs: result.timeMs,
      tokensPerSecond: result.tokPerSec
    },
    execution: {
      success: !!result.response,
      responseValidated: !!result.response,
      errors: result.error ? [result.error] : [],
      validationChecks: {
        responseNotEmpty: !!result.response,
        modelResponded: !!result.response
      }
    }
  };
}
```

---

## Document Locations

| What | Where |
|------|-------|
| **Full Schema Spec** | TEST-RESULT-SCHEMA.md |
| **Implementation Summary** | SCHEMA-IMPLEMENTATION-SUMMARY.md |
| **Usage Guide** | docs/SCHEMA-USAGE-GUIDE.md |
| **Implementation Guide** | docs/SCHEMA-IMPLEMENTATION-GUIDE.md |
| **This Quick Ref** | docs/SCHEMA-QUICK-REFERENCE.md |
| **Validator Code** | utils/test-result-validator.js |
| **Storage Code** | utils/test-helpers.js |
| **Performance Tests** | run-performance-tests.js |
| **Enterprise Tests** | run-enterprise-tests.js |

---

## Common Commands

```bash
# Run tests with schema capture
node run-performance-tests.js
node run-enterprise-tests.js quick

# View saved results
cat reports/performance/2026-03-26/test-results-*.json | jq '.results[0]'

# Count results
cat reports/compliance/2026-03-26/test-results-*.json | jq '.metadata.resultCount'

# Find GDPR tests
cat reports/compliance/2026-03-26/test-results-*.json | jq '.results[] | select(.input.promptId | contains("GDPR"))'

# Calculate average speed per model
cat reports/performance/2026-03-26/test-results-*.json | jq '
  .results[]
  | group_by(.modelConfig.modelName)
  | map({model: .[0].modelConfig.modelName, avgSpeed: (map(.timing.tokensPerSecond) | add / length)})
'
```

---

## When Something Goes Wrong

1. **Check if response captured:** `grep -l "response" results/*/`
2. **View validation errors:** `jq '.metadata.validationPassed' results/*/`
3. **Check file format:** `jq . results/*/test-results-*.json | head`
4. **Count results:** `jq '.metadata.resultCount' results/*/test-results-*.json`
5. **Validate manually:** Import and call `validateTestResult()`

---

**Questions?** See full guides or contact: libor@arionetworks.com
