# Test Runner Creation Requirements - Complete Reference

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/TEST-RUNNER-REQUIREMENTS.md
**Description:** Complete mandatory requirements for all test runners
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-27

---

## Mandatory Requirements (ENFORCED - NO EXCEPTIONS)

All test runners MUST implement these 5 requirements:

### 1. Logging (MANDATORY)

✅ **REQUIRED:**
- Initialize logger before ANY test execution
- Log EVERY event with ISO8601 timestamp
- Save logs to file: `logs/test-run-{name}-{timestamp}.log`

❌ **FORBIDDEN:**
- Running tests without logging
- Logs that are only in-memory (must persist to file)

**Events that MUST be logged:**
```javascript
- TEST_START: When test runner begins
- MODEL_START: When model startup begins
- HEALTH_CHECK: When health endpoint responds
- TESTS_START: When test suite begins for model
- TEST_PROMPT_START: Before each prompt
- TEST_PROMPT_COMPLETE: After each prompt (with tokens/sec)
- MODEL_COMPLETE: When model tests finish
- TEST_COMPLETE: When entire test run finishes
```

**Implementation Pattern:**
```javascript
// Option A: Using ResilientPerformanceTestRunner (has built-in logger)
const runner = new ResilientPerformanceTestRunner();
const logFile = runner.initializeLogger('test-name');
// Logger is now active, all events logged automatically

// Option B: Custom logger (for standalone test runners)
import fs from 'fs';
import path from 'path';

const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, `test-run-{name}-${timestamp}.log`);

function logEvent(eventType, details = {}) {
  const now = new Date().toISOString();
  const entry = `[${now}] ${eventType} | ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFile, entry);
}

logEvent('TEST_START', { testType: 'my-test' });
```

---

### 2. Incremental Result Saving (MANDATORY)

✅ **REQUIRED:**
- Save results immediately when each model completes
- Do NOT accumulate all results until the very end
- Each model's results saved to separate file

❌ **FORBIDDEN:**
- Waiting until all tests complete to save
- Losing data if execution is interrupted

**File Pattern:**
```
test-results-{testType}-{model}-{count}tests-{timestamp}.json
```

**Implementation Pattern:**
```javascript
// For multi-model runners
for (const model of models) {
  const modelResults = await runTestsForModel(model, prompts);

  // SAVE IMMEDIATELY after each model
  await saveSchemaCompliantResults(modelResults, {
    testType: 'performance',
    runName: `${model}-results`
  });
}

// For single-model runners with test suites
console.log('\n[1/4] Running Speed Tests...');
const speedResults = await runSpeedTests();

// SAVE IMMEDIATELY after each suite
await saveSchemaCompliantResults(speedResults, {
  testType: 'speed',
  runName: 'speed-suite'
});

console.log('\n[2/4] Running Accuracy Tests...');
const accuracyResults = await runAccuracyTests();

// SAVE IMMEDIATELY
await saveSchemaCompliantResults(accuracyResults, {
  testType: 'accuracy',
  runName: 'accuracy-suite'
});
```

---

### 3. Schema Validation (MANDATORY)

✅ **REQUIRED:**
- Validate all results before saving
- Use `saveSchemaCompliantResults()` for ALL saves
- Fail if validation fails (don't silently continue)

❌ **FORBIDDEN:**
- Saving invalid results
- Skipping validation to "speed things up"
- Using deprecated `saveReport()` function

**Implementation Pattern:**
```javascript
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

// Convert results to schema format
const schemaResults = results.map(r => convertToSchema(r));

// Save with validation (will throw if invalid)
try {
  saveSchemaCompliantResults(schemaResults, {
    testType: 'performance',
    runName: 'my-test'
  });
} catch (error) {
  console.error('Validation failed:', error.message);
  // Handle error - DON'T silently continue
}
```

---

### 4. Schema Conversion Function (MANDATORY)

✅ **REQUIRED:**
- Every test runner must have `convertToSchema()` function
- Converts runner-specific format to unified schema
- Must include ALL mandatory fields

**Mandatory Fields in Schema:**
```javascript
{
  metadata: {
    timestamp: "2026-03-26T...",     // REQUIRED
    testRunId: "test-run-1-...",     // REQUIRED
    runNumber: 1                      // REQUIRED
  },
  input: {
    promptId: "PROMPT_ID",            // REQUIRED
    fullPromptText: "...",            // REQUIRED - complete prompt
    fullPromptTokens: 2585            // REQUIRED
  },
  output: {
    response: "...",                  // REQUIRED - complete response
    responseTokens: 187               // REQUIRED
  },
  timing: {
    totalMs: 5234,                    // REQUIRED
    tokensPerSecond: 38.87            // REQUIRED
  },
  modelConfig: {
    modelName: "phi3"                 // REQUIRED
  },
  execution: {
    success: true,                    // REQUIRED
    responseValidated: true           // REQUIRED
  }
}
```

**Implementation Pattern:**
```javascript
function convertToSchema(result, runNumber, runName) {
  const timestamp = new Date(result.timestamp || new Date()).toISOString();

  return {
    metadata: {
      timestamp,
      testRunId: `test-run-${runNumber}-${runName.toLowerCase()}-${timestamp.split('T')[0]}`,
      runNumber,
      runName,
      runType: 'performance'
    },
    input: {
      promptId: result.promptId,
      fullPromptText: result.prompt || '',
      fullPromptTokens: result.inputTokens || 0
    },
    modelConfig: {
      modelName: result.modelName
    },
    output: {
      response: result.response || '',
      responseTokens: result.outputTokens || 0
    },
    timing: {
      totalMs: result.totalTimeMs,
      tokensPerSecond: result.tokensPerSec || 0
    },
    execution: {
      success: !!result.response && result.response.trim().length > 0,
      responseValidated: true,
      errors: []
    }
  };
}
```

---

### 5. Limited Model Scope (MANDATORY for local models)

✅ **STANDARD:**
- Run only FIRST 3 models by default (smollm3, phi3, mistral)

✅ **REASON:**
- Prevents multi-hour test runs
- Enables rapid iteration
- Maintains statistical significance with manageable time

❌ **FORBIDDEN:**
- Running all 10 models without explicit approval
- Running arbitrary model subsets without consistency

**Implementation Pattern:**
```javascript
// MANDATORY: Only first 3 models
const topModels = ['smollm3', 'phi3', 'mistral'];

// Use limited set for testing
const results = await runner.runPerformanceTests(prompts, runNumber, onModelComplete, topModels);
```

---

## CRITICAL: llama-bench and llama-server Mutual Exclusion

**NEW RULE (Added 2026-03-27):**

**NEVER run llama-bench and llama-server simultaneously on the same model.**

### The Problem

Both processes attempt to:
- Load the same model file (.gguf) into memory
- Allocate GPU resources for the same model
- Access the same model weights simultaneously

**Result:** Resource contention causing indefinite hangs, wasted execution time, data loss

### The Rule

**✅ CORRECT - Sequential execution:**
```javascript
async function runTests() {
  // Phase 1: HTTP tests (llama-server running)
  for (const prompt of prompts) {
    const result = await runHttpTest(prompt);  // Uses llama-server
    httpResults.push(result);
  }

  // Phase 2: Stop server COMPLETELY
  await stopServer();
  await verifyServerStopped();  // Endpoint must be unreachable

  // Phase 3: llama-bench (server is stopped)
  const benchResults = await runLlamaBench();  // Now safe

  // Phase 4: Merge results
  return mergeMetrics(httpResults, benchResults);
}
```

**❌ FORBIDDEN - Simultaneous:**
```javascript
async function runTests() {
  // llama-server is running
  const httpResult = await fetch('http://localhost:8081/...');

  // Try to run llama-bench ❌ WILL HANG FOREVER
  const benchResult = await exec('llama-bench -m model.gguf');
  // Process hangs for 16+ minutes at 100% CPU
}
```

### Pre-Flight Check (MANDATORY)

**Before starting ANY test:**
```javascript
// Check no conflicts exist
const serverRunning = await exec('ps aux | grep llama-server | grep -v grep');
const benchRunning = await exec('ps aux | grep llama-bench | grep -v grep');

if (serverRunning || benchRunning) {
  throw new Error('Conflict: llama-server or llama-bench already running');
}
```

### To Disable llama-bench

**If you don't want llama-bench integration:**
```bash
# Set environment variable
ENABLE_LLAMABENCH=false node run-performance-tests.js
```

**In code:**
```javascript
const useLlamaBench = process.env.ENABLE_LLAMABENCH !== 'false';

if (useLlamaBench) {
  // Only run llama-bench if enabled
}
```

---

## Test Runner Template (Copy This)

### Minimal Compliant Test Runner

```javascript
// File: run-my-test.js
// Description: My test runner following all mandatory requirements
// Author: Your Name
// Created: Date

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import { MY_PROMPTS } from './my-prompts.js';

async function runMyTest() {
  // 1. MANDATORY: Create runner and initialize logger
  const runner = new ResilientPerformanceTestRunner();
  const logFile = runner.initializeLogger('my-test-name');
  console.log(`📝 Logging to: ${logFile}\n`);

  // 2. MANDATORY: Limited model scope
  const models = ['smollm3', 'phi3', 'mistral'];  // First 3 only

  // 3. MANDATORY: onModelComplete callback for incremental saving
  const onModelComplete = async (modelName, modelResults) => {
    console.log(`\n💾 Saving ${modelName} results...`);

    // Convert to schema
    const schemaResults = modelResults.map((r, idx) => convertToSchema(r, idx + 1));

    // 4. MANDATORY: Schema validation on save
    try {
      await saveSchemaCompliantResults(schemaResults, {
        testType: 'my-test',
        runName: `${modelName}-results`
      });
      console.log(`✅ Saved ${modelResults.length} results`);
    } catch (error) {
      console.error(`❌ Save failed: ${error.message}`);
      throw error;  // Don't continue if save fails
    }
  };

  // Run tests with mandatory callback
  const results = await runner.runPerformanceTests(
    MY_PROMPTS,
    1,              // runNumber
    onModelComplete,// REQUIRED callback
    models          // Limited scope
  );

  console.log('\n✅ Test complete!');
  return results;
}

// 5. MANDATORY: Schema conversion function
function convertToSchema(result, runNumber) {
  return {
    metadata: {
      timestamp: new Date().toISOString(),
      testRunId: `my-test-${runNumber}`,
      runNumber
    },
    input: {
      promptId: result.promptId,
      fullPromptText: result.prompt || '',
      fullPromptTokens: result.inputTokens || 0
    },
    modelConfig: {
      modelName: result.modelName
    },
    output: {
      response: result.response || '',
      responseTokens: result.outputTokens || 0
    },
    timing: {
      totalMs: result.totalTimeMs,
      tokensPerSecond: result.tokensPerSec || 0
    },
    execution: {
      success: !!result.response,
      responseValidated: true,
      errors: []
    }
  };
}

// Run
runMyTest().catch(console.error);
```

---

## Checklist for New Test Runners

Before creating a new test runner, verify:

- [ ] **Logging initialized** - Uses runner.initializeLogger() or custom logger
- [ ] **Events logged** - MODEL_START, TESTS_START, TEST_COMPLETE, MODEL_COMPLETE
- [ ] **Incremental saving** - Saves after each model or suite, not at end
- [ ] **onModelComplete callback** - Provided to runPerformanceTests() if using that class
- [ ] **Schema validation** - Uses saveSchemaCompliantResults() not saveReport()
- [ ] **Schema conversion** - Has convertToSchema() function with all mandatory fields
- [ ] **Limited scope** - Runs only 3 models by default (for local testing)
- [ ] **llama-bench exclusion** - If using llama-bench, stops server first
- [ ] **Error handling** - Catches and logs errors, doesn't silently continue

---

## Common Test Runner Patterns

### Pattern A: Multi-Model Performance Testing

**Use case:** Test multiple local models sequentially
**Example:** run-performance-tests.js, run-multitier-performance.js

**Pattern:**
```javascript
1. Initialize logger
2. Loop through models sequentially:
   a. Force stop all models (ensure clean state)
   b. Start target model
   c. Verify model is healthy (test query)
   d. Run prompts on this model
   e. Call onModelComplete callback (saves results)
   f. Stop model
   g. Verify model stopped (endpoint unreachable)
3. Final summary
```

**Key requirement:** ONE model at a time, verified stops between models

---

### Pattern B: Single-Model Multi-Suite Testing

**Use case:** Test different capabilities (speed, accuracy, tools, context)
**Example:** run-all-tests.js, tests/*.js

**Pattern:**
```javascript
1. Initialize logger
2. Connect to running model (localhost:8088)
3. Run test suite 1
4. Save suite 1 results immediately
5. Run test suite 2
6. Save suite 2 results immediately
7. Run test suite 3
8. Save suite 3 results immediately
9. Aggregate summary
```

**Key requirement:** Save after each suite, not accumulate until end

---

### Pattern C: Compliance Testing with Mode Selection

**Use case:** Different test depths (pilot, quick, standard, comprehensive)
**Example:** run-enterprise-tests.js

**Pattern:**
```javascript
1. Parse command (pilot | quick | standard | comprehensive)
2. Initialize logger with mode name
3. Select prompt subset based on mode
4. Select model subset based on mode
5. Run tests
6. Save with schema validation
7. Report summary
```

**Key requirement:** Each mode (pilot, quick, etc.) initializes its own logger

---

## Enforcement Mechanisms

### Code-Level Enforcement

**ResilientPerformanceTestRunner enforces requirements:**

```javascript
async runPerformanceTests(prompts, runNumber, onModelComplete, modelFilter) {
  // Check 1: Logger must be initialized
  if (!this.logFile) {
    throw new Error('FATAL: Logger not initialized. Call initializeLogger() first');
  }

  // Check 2: Callback must be provided
  if (!onModelComplete) {
    throw new Error('FATAL: onModelComplete callback is REQUIRED for incremental saving');
  }

  // Checks pass → Continue with tests
}
```

**saveSchemaCompliantResults() enforces validation:**

```javascript
export function saveSchemaCompliantResults(results, options) {
  // Validate BEFORE saving
  const validation = validateTestResultBatch(results, options.runName);

  if (!validation.valid) {
    throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
  }

  // Only save if valid
  const filePath = generateFilePath(options);
  fs.writeFileSync(filePath, JSON.stringify(wrapper, null, 2));

  return { filePath, validated: results.length };
}
```

---

## Why These Requirements Exist

### Without Logging

**Problem:** Cannot debug issues during execution
- Which model was slow?
- Where did it fail?
- What was the timeline of events?

**Real example:** Test hangs at prompt 47/50 - which model? which prompt? No way to know.

---

### Without Incremental Saving

**Problem:** Data loss if execution crashes
- 6 hours of testing
- Crash at model 9/10
- All data lost (was accumulated in memory)

**Real example:** llama-server crashes → lose all results collected so far

---

### Without Schema Validation

**Problem:** Invalid data gets saved and analyzed
- Missing response field
- Empty responses counted as valid
- Downstream analysis breaks

**Real example:** Generate charts from invalid data → crashes or wrong conclusions

---

### Without Limited Scope

**Problem:** Test runs take too long
- 10 models × 50 prompts = 500 executions
- At 30 sec/prompt = 4+ hours
- Too slow for iteration

**Solution:** 3 models × 50 prompts = 150 executions (~1 hour)

---

## Special Case: llama-bench Integration

### If Your Test Runner Uses llama-bench

**MUST follow this pattern:**

```javascript
async function runWithLlamaBench() {
  // Phase 1: HTTP tests (llama-server)
  const httpResults = await runHttpTests();

  // Phase 2: STOP server completely
  await stopAllModels();

  // CRITICAL: Verify stopped
  await verifyNoServerRunning();

  // Phase 3: llama-bench (server must be stopped)
  if (useLlamaBench) {
    const benchResults = await runLlamaBench();
    return mergeBenchmarkData(httpResults, benchResults);
  }

  return httpResults;
}

async function verifyNoServerRunning() {
  const processes = await exec('ps aux | grep llama-server | grep -v grep');
  if (processes.stdout.trim() !== '') {
    throw new Error('FATAL: llama-server still running - cannot run llama-bench');
  }
}
```

---

## Examples of Compliant Test Runners

### ✅ Fully Compliant Runners

**run-multitier-performance.js:**
- ✅ Logging: Yes
- ✅ Incremental saving: Yes (per model)
- ✅ Schema validation: Yes
- ✅ Limited scope: Yes (3 models)
- ✅ llama-bench: N/A (doesn't use it)

**run-multitier-split-25.js:**
- ✅ Logging: Yes
- ✅ Incremental saving: Yes (per model)
- ✅ Schema validation: Yes
- ✅ Limited scope: Yes (3 models)
- ✅ llama-bench: Properly sequenced (stops server first)

**run-performance-tests.js:**
- ✅ Logging: Yes (added today)
- ✅ Incremental saving: Yes (per run)
- ✅ Schema validation: Yes
- ✅ Limited scope: Delegated to ResilientPerformanceTestRunner
- ✅ llama-bench: N/A

**run-enterprise-tests.js:**
- ✅ Logging: Yes (added today - all 5 functions)
- ✅ Incremental saving: Yes (per test mode)
- ✅ Schema validation: Yes
- ✅ Limited scope: Configurable
- ✅ llama-bench: N/A

**run-all-tests.js:**
- ✅ Logging: Yes (added today)
- ✅ Incremental saving: Yes (per suite)
- ✅ Schema validation: Yes (added today)
- ✅ Limited scope: N/A (single model)
- ✅ llama-bench: N/A

---

## Quick Reference Card

### Creating New Test Runner

**1. Copy template above** (or use existing runner as base)

**2. Customize these parts:**
- Test name (for logging)
- Prompt source (which prompts to load)
- Model selection (3 models or specific model)
- Result conversion (match your result format)

**3. Verify mandatory requirements:**
- Logger initialized ✅
- onModelComplete callback ✅
- saveSchemaCompliantResults used ✅
- convertToSchema function ✅
- Limited scope ✅

**4. Test:**
```bash
# Run your test
node run-my-test.js

# Verify logs created
ls logs/test-run-my-test-*.log

# Verify results saved
ls reports/my-test/2026-03-26/

# Verify schema compliance
cat reports/my-test/2026-03-26/test-results-*.json | jq '.results[0]'
```

---

## Troubleshooting

### Error: "Logger not initialized"

**Problem:** Forgot to call initializeLogger()

**Fix:**
```javascript
const runner = new ResilientPerformanceTestRunner();
const logFile = runner.initializeLogger('test-name');  // Add this line
```

---

### Error: "onModelComplete callback is REQUIRED"

**Problem:** Didn't provide callback to runPerformanceTests()

**Fix:**
```javascript
// Add callback function
const onModelComplete = async (modelName, results) => {
  await saveSchemaCompliantResults(results, {...});
};

// Pass it to runner
await runner.runPerformanceTests(prompts, 1, onModelComplete, models);
```

---

### Error: "Schema validation failed"

**Problem:** convertToSchema() missing mandatory fields

**Fix:** Check that conversion includes ALL mandatory fields (see list above)

---

### Test hangs forever (llama-bench conflict)

**Problem:** llama-server and llama-bench running simultaneously

**Fix:**
```bash
# Kill both
pkill llama-bench
llamacpp-manager stop --all

# Verify clean
ps aux | grep -E "llama-server|llama-bench" | grep -v grep  # Must be empty

# Re-run with sequential approach or disable llama-bench:
ENABLE_LLAMABENCH=false node run-my-test.js
```

---

## Summary

**5 Mandatory Requirements:**
1. ✅ Logging with timestamps
2. ✅ Incremental result saving
3. ✅ Schema validation
4. ✅ Schema conversion function
5. ✅ Limited model scope (3 models)

**1 Critical Rule:**
6. ✅ llama-bench and llama-server mutual exclusion

**All current test runners are compliant** (as of 2026-03-26 updates)

**Template provided above** - copy and customize for new runners

---

**Status:** Complete requirements documentation
**Enforcement:** Code-level (will throw errors if violated)
**Compliance:** 5/5 test runners (100%)

Contact: libor@arionetworks.com
