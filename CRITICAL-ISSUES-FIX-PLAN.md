# Critical Issues - Comprehensive Fix Plan with llama-bench Integration

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/CRITICAL-ISSUES-FIX-PLAN.md
**Description:** Complete implementation plan for commercial launch: 7 critical fixes + llama-bench integration
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-26
**Status:** IMPLEMENTATION PLAN - Ready for execution

---

## Overview

**Total Work Streams:** 2 major streams
- **Stream 1:** 7 Critical Issues (data integrity, schema compliance)
- **Stream 2:** llama-bench Integration (authoritative performance metrics)

**Estimated Total Time:** 18-24 hours (2.5-3 days)
**Dependencies:** Stream 1 must complete before Stream 2
**Goal:** Production-ready commercial benchmarking service with industry-standard metrics

---

## Implementation Strategy

### Phase 1: Critical Fixes (Day 1-2, 12-16 hours)
Fix data integrity and schema compliance issues that prevent valid results.

### Phase 2: llama-bench Integration (Day 3, 4-6 hours)
Add authoritative performance measurement using llama.cpp official tooling.

### Phase 3: Validation & Documentation (Day 3, 2-3 hours)
End-to-end testing, documentation updates, customer deliverables.

---

## Issue #1: Missing fullPromptText in Performance Prompts

### Current State (BROKEN)

**File:** `performance-prompts.js`

```javascript
export const PERFORMANCE_PROMPTS = {
  RUN_1_TINY: [
    { id: 'TINY_01', input: 'What is GDPR?', tokens: 4 },
    { id: 'TINY_02', input: 'What is ISO 27001?', tokens: 5 },
    // ... 48 more prompts
  ],
  RUN_2_SHORT: [...],
  RUN_3_MEDIUM: [...],
  RUN_4_LONG: [...],
  RUN_5_VERYLONG: [...]
};
```

**File:** `run-performance-tests.js:159`

```javascript
input: {
  promptId: result.promptId,
  fullPromptText: result.fullPromptText || '',  // ⚠️ ALWAYS EMPTY!
  fullPromptTokens: result.inputTokens || 0
}
```

**File:** `performance-test-runner.js:227-232`

```javascript
return {
  runNumber,
  modelName,
  promptId: prompt.id,
  response: result.response,
  // ⚠️ No fullPromptText captured here either!
  // ...
};
```

### Root Cause

**Why this happened:**
1. Performance prompts were created before unified schema
2. Only needed `input` field for sending to LLM
3. `fullPromptText` requirement added later for schema compliance
4. Performance prompts not updated to match
5. Schema conversion assumes field exists but never populates it

**Evidence:**
- Run 6 MULTITIER uses `fullPrompt` field correctly (run-multitier-performance.js:12)
- Runs 1-5 don't have this field
- Current test results have `fullPromptText: ""` (empty)

### Proposed Fix

**Step 1:** Update `performance-prompts.js` structure

```javascript
export const PERFORMANCE_PROMPTS = {
  RUN_1_TINY: [
    {
      id: 'TINY_01',
      input: 'What is GDPR?',
      fullPrompt: 'What is GDPR?',  // ✅ ADD THIS - same as input for simple prompts
      tokens: 4
    },
    {
      id: 'TINY_02',
      input: 'What is ISO 27001?',
      fullPrompt: 'What is ISO 27001?',  // ✅ ADD THIS
      tokens: 5
    },
    // ... repeat for ALL 50 prompts
  ],

  // For VERYLONG with TIER markers, fullPrompt = input (it already has tiers)
  RUN_5_VERYLONG: [
    {
      id: 'VLONG_01',
      input: '[TIER 1: You are ArionComply AI...][TIER 2: GDPR Assessment...]...',
      fullPrompt: '[TIER 1: You are ArionComply AI...][TIER 2: GDPR Assessment...]...',
      tokens: 110
    }
  ]
};
```

**Step 2:** Update `performance-test-runner.js` to capture fullPromptText

```javascript
async runSingleTest(client, modelName, prompt, runNumber) {
  try {
    const result = await client.chatCompletion([
      { role: 'user', content: prompt.input }  // Send 'input' to LLM
    ], { max_tokens: 500, temperature: 0.3 });

    if (!result.success) {
      this.logIssue(modelName, 'test_execution', `Test ${prompt.id} failed`, result.error);
      return null;
    }

    // CRITICAL: Capture actual response text (not just metrics)
    if (!result.response || result.response.trim() === '') {
      this.logIssue(modelName, 'test_execution', `Test ${prompt.id} - response is empty`, 'Invalid test result');
      return null;
    }

    return {
      runNumber,
      modelName,
      promptId: prompt.id,
      fullPromptText: prompt.fullPrompt || prompt.input,  // ✅ USE fullPrompt field
      response: result.response,
      responseLength: result.response.length,
      responseTokens: result.timing.completionTokens,
      inputTokens: result.timing.promptTokens,
      // ... rest
    };
  } catch (error) {
    this.logIssue(modelName, 'test_execution', `Exception on ${prompt.id}`, error.message);
    return null;
  }
}
```

**Step 3:** Verify schema conversion receives fullPromptText

```javascript
// run-performance-tests.js:159 - Should now work
input: {
  promptId: result.promptId,
  fullPromptText: result.fullPromptText || result.input || '',  // ✅ Fallback chain
  fullPromptTokens: result.inputTokens || 0
}
```

### Why This Matters

**Business Impact:**
- ❌ **Without fix:** Cannot reproduce tests (don't know exact prompt)
- ❌ **Without fix:** Audit trail incomplete
- ❌ **Without fix:** Violates unified schema (validation will fail)
- ✅ **With fix:** Complete prompt/response pairs for every test
- ✅ **With fix:** Reproducible benchmarks
- ✅ **With fix:** Schema validation passes

**Customer Impact:**
- Customers cannot verify what was actually tested
- Cannot re-run specific tests to validate results
- Cannot trust benchmark validity

### Implementation Steps

**Time Estimate:** 2 hours

**Dependencies:** None

**Steps:**

1. **Update performance-prompts.js** (60 minutes)
   - Add `fullPrompt` field to all 50 prompts
   - For Runs 1-4: `fullPrompt` = `input` (simple prompts)
   - For Run 5: `fullPrompt` = `input` (already has TIER markers)
   - Verify JSON structure valid

2. **Update performance-test-runner.js** (30 minutes)
   - Line 227-242: Add `fullPromptText: prompt.fullPrompt || prompt.input`
   - Verify field propagates to return value

3. **Test with Run 1** (30 minutes)
   - Run: `node run-performance-tests.js` (just Run 1)
   - Check output file: `fullPromptText` should NOT be empty
   - Validate: `node -e "import('./utils/test-result-validator.js').then(...)"`
   - Verify validation passes

4. **Document change** (optional)
   - Update SCHEMA-IMPLEMENTATION-GUIDE.md with this example

### Testing Criteria

**Success:**
- [ ] All 50 prompts have `fullPrompt` field
- [ ] `fullPrompt` matches `input` for simple prompts
- [ ] Test results have non-empty `fullPromptText`
- [ ] Schema validation passes for all results
- [ ] Can reproduce test by copying `fullPromptText` and running manually

**Verification Commands:**

```bash
# Check prompts file has fullPrompt
node -e "import('./performance-prompts.js').then(m => {
  const p = m.PERFORMANCE_PROMPTS.RUN_1_TINY[0];
  console.log('Has fullPrompt:', !!p.fullPrompt);
  console.log('Value:', p.fullPrompt);
})"

# Run test and check result
node run-performance-tests.js
cat reports/performance/2026-03-26/test-results-*.json | jq '.results[0].input.fullPromptText'
# Should output: "What is GDPR?" (NOT empty string)

# Validate schema
node -e "import('./utils/test-result-validator.js').then(({validateTestResultBatch}) => {
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('./reports/performance/2026-03-26/test-results-run-1-tiny-*.json'));
  const v = validateTestResultBatch(data.results, 'Run 1');
  console.log('Valid:', v.valid);
  console.log('Errors:', v.errors.length);
})"
```

### Rollback Plan

If this breaks something:
- Revert changes to performance-prompts.js
- Schema conversion will use `result.input` as fallback
- Tests still run, just validation will fail

### Files Affected

- ✏️ `performance-prompts.js` (add fullPrompt to 50 prompts)
- ✏️ `performance-test-runner.js` (capture fullPromptText)
- 📄 `run-performance-tests.js` (already has fallback, no change needed)

---

## Issue #2: Silent Schema Validation Failures

### Current State (BROKEN)

**File:** `run-enterprise-tests.js:186-198`

```javascript
// Save with schema validation and Docker config
try {
  const schemaResults = convertEnterpriseResultsToSchema(results, 'pilot');
  saveSchemaCompliantResults(schemaResults, {
    testType: 'compliance',
    runName: 'enterprise-pilot',
    dockerConfig: configMetadata
  });
} catch (error) {
  console.error('Failed to save schema-compliant results:', error.message);
  console.log('Falling back to legacy format...');
  saveReport('enterprise-pilot', results);  // ⚠️ SAVES INVALID DATA!
}

console.log('\n✅ Pilot test complete!');  // ⚠️ Says "complete" even if validation failed!
```

**Same pattern in:**
- `run-enterprise-tests.js:232-242` (quick test)
- `run-enterprise-tests.js:287-297` (standard test)
- `run-enterprise-tests.js:332-342` (comprehensive test)

### Root Cause

**Why this happened:**
1. Schema validation was added AFTER test runners were written
2. Developers wanted to avoid breaking existing workflows
3. "Fallback to legacy" seemed safer than hard failure
4. Did not consider impact on data quality

**Consequences:**
- Invalid results silently saved
- Customers receive incomplete data
- No way to know data is bad after the fact
- Defeats purpose of having schema validation

### Proposed Fix

**Replace ALL try/catch blocks with hard failures:**

```javascript
// Save with schema validation and Docker config
const schemaResults = convertEnterpriseResultsToSchema(results, 'pilot');

try {
  const saveResult = saveSchemaCompliantResults(schemaResults, {
    testType: 'compliance',
    runName: 'enterprise-pilot',
    dockerConfig: configMetadata
  });

  console.log('\n✅ Results saved and validated!');
  console.log(`   Path: ${saveResult.filePath}`);
  console.log(`   Validated: ${saveResult.validated}/${schemaResults.length}`);

  if (saveResult.failed > 0) {
    console.error(`\n⚠️  WARNING: ${saveResult.failed} results failed validation`);
    console.error('   Check logs for details');
  }

} catch (error) {
  console.error('\n❌ VALIDATION FAILED - CANNOT SAVE RESULTS');
  console.error('='.repeat(70));
  console.error('Error:', error.message);
  console.error('\nThis means the test results do not meet schema requirements.');
  console.error('Fix the data capture code before saving results.');
  console.error('\nDO NOT use legacy format - it bypasses quality checks.');
  console.error('='.repeat(70));

  // Show which results failed
  if (error.message.includes('VALIDATION FAILED')) {
    console.error('\nTo debug, check:');
    console.error('  1. Are all response fields populated?');
    console.error('  2. Are token counts non-zero?');
    console.error('  3. Are all metadata fields present?');
    console.error('\nRun validation manually:');
    console.error('  node -e "import(\'./utils/test-result-validator.js\').then(...)"');
  }

  process.exit(1);  // ✅ HARD FAIL - don't continue with invalid data
}

console.log('\n✅ Pilot test complete!');
```

**Remove legacy fallback entirely:**

```javascript
// DELETE these lines:
// } catch (error) {
//   console.error('Failed to save schema-compliant results:', error.message);
//   saveReport('enterprise-pilot', results);  // ❌ DELETE THIS
// }
```

### Why This Matters

**Current Behavior (BAD):**
```
Test runs → Validation fails → Catches error → Saves anyway → Says "✅ complete"
```

**Customer sees:** "Test completed successfully!"
**Reality:** Invalid data was saved

**Fixed Behavior (GOOD):**
```
Test runs → Validation fails → Throws error → Shows helpful message → Exits
```

**Customer sees:** Clear error with fix instructions
**Reality:** No invalid data saved, customer knows to fix before retrying

**Business Impact:**
- ❌ **Without fix:** Customers get invalid results, don't know it
- ❌ **Without fix:** Support burden (customers complain results don't make sense)
- ✅ **With fix:** Fail fast, clear error messages
- ✅ **With fix:** Only valid data saved
- ✅ **With fix:** Customer confidence in data quality

### Implementation Steps

**Time Estimate:** 1 hour

**Dependencies:** None (can do immediately)

**Steps:**

1. **Update run-enterprise-tests.js** (20 minutes)
   - Lines 186-198: Replace try/catch with hard fail (pilot test)
   - Lines 232-242: Same for quick test
   - Lines 287-297: Same for standard test
   - Lines 332-342: Same for comprehensive test

2. **Remove saveReport fallback** (10 minutes)
   - Delete `saveReport('enterprise-pilot', results)` lines
   - Delete `saveReport('enterprise-quick', results)` lines
   - Delete `saveReport('enterprise-standard', results)` lines
   - Delete `saveReport('enterprise-comprehensive', results)` lines

3. **Add helpful error messages** (20 minutes)
   - Add debug instructions
   - Add link to validation docs
   - Add common fix suggestions

4. **Test failure scenario** (10 minutes)
   - Temporarily break schema conversion (remove a required field)
   - Run test
   - Verify it fails with clear error
   - Verify no file saved
   - Fix schema conversion
   - Verify test passes

### Testing Criteria

**Success:**
- [ ] Test with valid data → Saves successfully
- [ ] Test with invalid data → Fails with clear error message
- [ ] No legacy format files saved on failure
- [ ] Error message explains what's wrong
- [ ] Error message shows how to debug
- [ ] process.exit(1) called on validation failure

**Verification Commands:**

```bash
# Test success path
node run-enterprise-tests.js pilot
# Should save to reports/compliance/2026-03-26/test-results-*.json

# Test failure path (temporarily break data)
node -e "
// Manually test validation failure
import('./run-enterprise-tests.js').then(async (m) => {
  // This should fail validation
  const badData = [{ metadata: {}, input: {}, output: { response: '' } }];
  try {
    await saveSchemaCompliantResults(badData, { testType: 'test', runName: 'test' });
    console.log('❌ FAIL: Should have thrown error');
  } catch (error) {
    console.log('✅ PASS: Threw error as expected');
    console.log('Error:', error.message);
  }
});
"

# Verify no legacy files created
ls reports/*.json | grep -v performance-run | wc -l
# Should be 0 (no legacy files)
```

### Rollback Plan

If customers complain about "too strict":
- Can add `--allow-invalid` flag for debugging
- But NEVER save invalid data to production directories
- Save to `reports/debug/` instead with clear warning

### Files Affected

- ✏️ `run-enterprise-tests.js` (4 try/catch blocks)
- 📄 `run-performance-tests.js` (already has similar pattern, update for consistency)

---

## Issue #3: Hardcoded Zero Values in Schema Conversion

### Current State (BROKEN)

**File:** `run-enterprise-tests.js:375-445`

```javascript
function convertEnterpriseResultsToSchema(enterpriseResults, testName) {
  const schemaResults = [];

  for (const [modelName, modelResults] of Object.entries(enterpriseResults.modelResults)) {
    modelResults.forEach(result => {
      if (result.success) {
        schemaResults.push({
          metadata: { /* ... OK ... */ },

          input: {
            promptId: result.testId || `test-${testIndex}`,
            fullPromptText: result.question || '',        // ⚠️ Only user message, not full prompt!
            fullPromptTokens: 0                            // ⚠️ HARDCODED ZERO!
          },

          output: {
            response: result.response || '',
            responseTokens: 0,                             // ⚠️ HARDCODED ZERO!
            responseCharacters: (result.response || '').length
          },

          quality: {
            relevanceScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
            completenessScore: result.evaluation?.passed ? 1.0 : 0.5,
            accuracyScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
            coherenceScore: 0.8,                           // ⚠️ FAKE METRIC!
            overallScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
            // ...
          },

          timing: {
            totalMs: result.timing?.totalMs || 0,
            tokensPerSecond: 0                             // ⚠️ HARDCODED ZERO!
          }
        });
      }
    });
  }

  return schemaResults;
}
```

**File:** `run-performance-tests.js:144-197`

```javascript
function convertToSchema(result, runNumber, runName) {
  return {
    input: {
      fullPromptText: result.fullPromptText || '',  // ⚠️ Empty (Issue #1)
      fullPromptTokens: result.inputTokens || 0     // ⚠️ May be 0 if not populated
    },

    modelConfig: {
      modelName: result.modelName,
      quantization: 'Q4_K_M'  // ⚠️ HARDCODED - may not be true for all models!
    },

    output: {
      response: result.response || '',
      responseTokens: result.outputTokens || result.responseTokens || 0,  // ✅ OK
      responseCharacters: (result.response || '').length
    }
  };
}
```

### Root Cause

**Why this happened:**
1. **fullPromptTokens = 0:** Result object doesn't capture prompt tokens (Issue #1)
2. **responseTokens = 0:** Enterprise runner doesn't capture timing.completionTokens
3. **coherenceScore = 0.8:** No actual coherence evaluation implemented, placeholder used
4. **tokensPerSecond = 0:** Not calculated from timing data
5. **quantization = 'Q4_K_M':** Assumed all models use same quantization

**Evidence:**
- Check saved files: `cat reports/test-results-*.json | jq '.results[0].input.fullPromptTokens'` → 0
- Check saved files: `cat reports/test-results-*.json | jq '.results[0].output.responseTokens'` → 0

### Proposed Fix

**Step 1:** Fix enterprise runner to capture token counts

**File:** `enterprise/enterprise-test-runner.js:22-69`

```javascript
async runTest(test, modelName) {
  const port = this.managerClient.getModelPort(modelName);
  if (!port) {
    return { success: false, error: 'Model port not found' };
  }

  const client = new LLMClient('http://127.0.0.1:' + port);
  const startTime = Date.now();

  try {
    const result = await client.chatCompletion([
      { role: 'user', content: test.question }
    ], {
      max_tokens: 500,
      temperature: 0.3,
      timeout: 30000
    });

    if (!result.success) {
      return { ...result, testId: test.id };
    }

    // Evaluate response quality
    const evaluation = this.evaluateResponse(result.response, test);

    return {
      success: true,
      testId: test.id,
      question: test.question,
      response: result.response,
      evaluation,
      timing: result.timing,  // ✅ Now includes timing object

      // ✅ ADD: Token counts from timing
      promptTokens: result.timing?.promptTokens || 0,
      completionTokens: result.timing?.completionTokens || 0,
      tokensPerSecond: result.timing?.tokensPerSecond || 0,

      standard: test.standard,
      knowledgeType: test.knowledgeType,
      persona: test.persona,
      retrievalStrategy: test.retrievalStrategy
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      testId: test.id,
      timing: { totalMs: Date.now() - startTime }
    };
  }
}
```

**Step 2:** Fix schema conversion to use actual values

**File:** `run-enterprise-tests.js:375-445`

```javascript
function convertEnterpriseResultsToSchema(enterpriseResults, testName) {
  const schemaResults = [];
  const now = new Date().toISOString();

  if (enterpriseResults.modelResults) {
    let testIndex = 0;
    for (const [modelName, modelResults] of Object.entries(enterpriseResults.modelResults)) {
      if (Array.isArray(modelResults)) {
        modelResults.forEach(result => {
          if (result.success) {

            // ✅ CALCULATE actual token counts
            const promptTokens = result.promptTokens || estimateTokenCount(result.question);
            const responseTokens = result.completionTokens || estimateTokenCount(result.response);

            schemaResults.push({
              metadata: {
                timestamp: now,
                testRunId: `test-run-enterprise-${testName}-${now.split('T')[0]}`,
                runNumber: 1,
                runName: `ENTERPRISE_${testName.toUpperCase()}`,
                runType: 'compliance',
                focus: 'accuracy'
              },

              input: {
                promptId: result.testId || `test-${testIndex}`,
                fullPromptText: result.question || '',        // ⚠️ Still only question, not full prompt
                fullPromptTokens: promptTokens                // ✅ ACTUAL VALUE
              },

              modelConfig: {
                modelName: modelName,
                // ✅ GET actual quantization from model info
                quantization: getModelQuantization(modelName)
              },

              output: {
                response: result.response || '',
                responseTokens: responseTokens,               // ✅ ACTUAL VALUE
                responseCharacters: (result.response || '').length
              },

              quality: {
                relevanceScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                completenessScore: result.evaluation?.passed ? 1.0 : 0.5,
                accuracyScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                // ✅ REMOVE coherenceScore (not calculated)
                // coherenceScore: 0.8,  // ❌ DELETE
                overallScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                topicAnalysis: {
                  expectedTopics: result.evaluation?.missingTopics || [],
                  foundTopics: result.evaluation?.foundTopics || [],
                  missingTopics: result.evaluation?.missingTopics || [],
                  extraneousTopics: [],
                  topicCoverage: result.evaluation?.passed ? 1.0 : 0.5
                }
              },

              timing: {
                totalMs: result.timing?.totalMs || 0,
                tokensPerSecond: result.tokensPerSecond ||    // ✅ ACTUAL VALUE
                                (result.timing?.tokensPerSecond) ||
                                (responseTokens / (result.timing?.totalMs / 1000))
              },

              execution: {
                success: result.success,
                responseValidated: result.response && result.response.trim() !== '',
                errors: result.error ? [result.error] : [],
                warnings: [],
                validationChecks: {
                  responseNotEmpty: result.response && result.response.trim() !== '',
                  responseWithinTokenLimit: responseTokens <= 500,
                  modelResponded: !!result.response,
                  noConnectionErrors: true,
                  noTimeouts: true
                }
              }
            });

            testIndex++;
          }
        });
      }
    }
  }

  if (schemaResults.length === 0) {
    throw new Error('No valid results found to convert to schema format');
  }

  return schemaResults;
}

// ✅ ADD helper function
function estimateTokenCount(text) {
  if (!text) return 0;
  // Rough estimate: ~4 chars per token (English)
  // More accurate: use tiktoken library
  return Math.ceil(text.length / 4);
}

// ✅ ADD helper function
function getModelQuantization(modelName) {
  // Look up actual quantization from llamacpp-manager config
  const quantizationMap = {
    'phi3': 'Q4_K_M',
    'smollm3': 'Q4_K_M',
    'mistral': 'Q4_K_M',
    'llama-3.1-8b': 'Q4_K_M',
    'hermes-3-llama-8b': 'Q4_K_M',
    'qwen2.5-32b': 'Q5_K_M',  // Larger models often use Q5
    'llama-4-scout-17b': 'Q4_K_M',
    'mistral-small-24b': 'Q5_K_M',
    'deepseek-r1-qwen-32b': 'Q4_K_M'
  };
  return quantizationMap[modelName] || 'unknown';
}
```

### Why This Matters

**Impact of Wrong Token Counts:**

```
BEFORE (with zeros):
- Tokens/sec calculation: 0 / (time/1000) = 0 (meaningless!)
- Cost calculation: 0 tokens × $0.01/1k = $0 (wrong!)
- Prompt complexity: 0 tokens = "tiny" (wrong classification!)

AFTER (with actual counts):
- Tokens/sec: 187 / (5.2s) = 35.96 tok/s (real metric)
- Cost: 2585 input + 187 output = 2772 tokens × $0.01/1k = $0.027
- Prompt complexity: 2585 tokens = "very large" (correct!)
```

**Customer Impact:**
- Cannot make informed cost decisions
- Cannot compare model efficiency
- Cannot validate benchmark accuracy
- Metrics dashboard shows wrong data

### Implementation Steps

**Time Estimate:** 3 hours

**Dependencies:** Should do after Issue #1 (fullPromptText)

**Steps:**

1. **Add token count capture in enterprise-test-runner.js** (45 minutes)
   - Lines 48-59: Add `promptTokens`, `completionTokens`, `tokensPerSecond` to return
   - Use `result.timing` fields from LLM client

2. **Add helper functions** (30 minutes)
   - `estimateTokenCount(text)` - Rough estimate for fallback
   - `getModelQuantization(modelName)` - Look up actual quantization
   - Add to `run-enterprise-tests.js` at top level

3. **Update convertEnterpriseResultsToSchema** (60 minutes)
   - Lines 399-409: Use actual promptTokens instead of 0
   - Use actual completionTokens instead of 0
   - Calculate tokensPerSecond from actual values
   - Use getModelQuantization() for modelConfig
   - Remove coherenceScore fake metric

4. **Test with real data** (45 minutes)
   - Run pilot test: `node run-enterprise-tests.js pilot`
   - Check results: `cat reports/compliance/2026-03-26/*.json | jq '.results[0]'`
   - Verify `fullPromptTokens` is NOT zero
   - Verify `responseTokens` is NOT zero
   - Verify `tokensPerSecond` is calculated correctly
   - Verify no `coherenceScore` in output

### Testing Criteria

**Success:**
- [ ] `input.fullPromptTokens` > 0 for all results
- [ ] `output.responseTokens` > 0 for all results
- [ ] `timing.tokensPerSecond` > 0 for all results
- [ ] No `coherenceScore` field in results
- [ ] `modelConfig.quantization` matches actual model
- [ ] Token counts roughly match expected (question length ~= tokens × 4)

**Verification Commands:**

```bash
# Run test
node run-enterprise-tests.js pilot

# Check token counts are not zero
cat reports/compliance/2026-03-26/test-results-*.json | jq '
  .results[] |
  {
    promptId: .input.promptId,
    promptTokens: .input.fullPromptTokens,
    responseTokens: .output.responseTokens,
    tokensPerSec: .timing.tokensPerSecond
  }
' | head -20

# All values should be > 0

# Check no fake metrics
cat reports/compliance/2026-03-26/test-results-*.json | jq '.results[0].quality.coherenceScore'
# Should output: null (field doesn't exist)
```

### Rollback Plan

If token estimation is inaccurate:
- Can integrate tiktoken library for exact counts
- For now, estimate is better than zero
- Document estimation method in schema

### Files Affected

- ✏️ `enterprise/enterprise-test-runner.js` (add token count capture)
- ✏️ `run-enterprise-tests.js` (fix conversion, add helpers)
- ✏️ `run-performance-tests.js` (similar fix for consistency)

---

## Issue #4: Massive Embedded Data in HTML (357KB)

### Current State (BROKEN)

**File:** `reports/prompts/prompt-viewer.html`

**Size:** 9,910 lines, 357KB

**Structure:**
```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <div class="container">...</div>

  <script>
    // ⚠️ LINE 444: EMBEDDED JSON DATA (8000+ lines!)
    const allData = {
      "metadata": {...},
      "performanceTestRuns": {
        "1": { "prompts": [{...}, {...}, ...] },
        "2": { "prompts": [{...}, {...}, ...] },
        "3": { "prompts": [{...}, {...}, ...] },
        // ... thousands more lines ...
      },
      "simpleComplianceTests": [{...}, {...}, ...],
      "multiTierTests": [{...}, {...}, ...],
      "arioncomplyWorkflows": [{...}, {...}, ...],
      // ... thousands more lines ...
    };

    // LINE 8800: JavaScript logic starts
    function initializeViewer() { ... }
  </script>
</body>
</html>
```

**Problems:**
1. Browser must parse 357KB of JavaScript on load
2. Mobile browsers choke (timeout, freeze)
3. Cannot update data without regenerating entire HTML
4. No pagination - loads ALL 255 prompts at once
5. Will break completely at 500+ prompts goal
6. Poor developer experience (9,910 line file)

### Root Cause

**Why this happened:**
1. Quick prototype started with embedded data
2. Worked fine with 50 prompts
3. Grew to 255 prompts without refactoring
4. "Good enough for now" became permanent

**Scalability Analysis:**
- 255 prompts = 357KB
- 500 prompts (goal) = ~700KB (browser timeout)
- 1000 prompts = ~1.4MB (completely broken)

### Proposed Fix

**Split into separate files:**

```
reports/prompts/
├── prompt-viewer.html        (UI only, ~400 lines)
├── prompts-data.json         (All prompts, ~350KB)
├── viewer-bundle.js          (Logic, ~1000 lines)
└── styles.css                (Styles, ~300 lines)
```

**Step 1:** Create `prompts-data.json`

```bash
# Extract just the data section
node -e "
import('./export-prompts.js').then(m => {
  const data = m.generateAllPromptsData();
  const fs = require('fs');
  fs.writeFileSync(
    './reports/prompts/prompts-data.json',
    JSON.stringify(data, null, 2)
  );
});
"
```

**Step 2:** Update `prompt-viewer.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LLM Test Prompts Viewer</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>LLM Test Prompts Viewer</h1>
            <div class="subtitle">Enterprise Compliance & ArionComply Application Testing</div>
        </div>

        <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Loading prompts...</p>
        </div>

        <div id="app" style="display: none;">
            <!-- UI elements here -->
            <div class="stats" id="stats"></div>
            <div class="controls" id="controls"></div>
            <div class="content" id="content"></div>
        </div>
    </div>

    <!-- ✅ Load data externally -->
    <script src="viewer-bundle.js"></script>
    <script>
        // Load data from external JSON
        fetch('./prompts-data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load prompts data: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                initializeViewer(data);
            })
            .catch(error => {
                document.getElementById('loading').innerHTML = `
                    <div style="color: red;">
                        <h3>Error Loading Data</h3>
                        <p>${error.message}</p>
                        <p>Make sure prompts-data.json exists in reports/prompts/</p>
                    </div>
                `;
            });
    </script>
</body>
</html>
```

**Step 3:** Add pagination (show 50 prompts per page)

```javascript
// viewer-bundle.js
let currentPage = 1;
const PROMPTS_PER_PAGE = 50;

function renderPrompts(prompts) {
    const start = (currentPage - 1) * PROMPTS_PER_PAGE;
    const end = start + PROMPTS_PER_PAGE;
    const page = prompts.slice(start, end);

    const content = document.getElementById('content');
    content.innerHTML = page.map(p => renderPromptCard(p)).join('');

    // Add pagination controls
    renderPagination(prompts.length);
}

function renderPagination(total) {
    const totalPages = Math.ceil(total / PROMPTS_PER_PAGE);

    let html = '<div class="pagination">';

    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }

    // Page numbers
    html += `<span>Page ${currentPage} of ${totalPages} (${total} prompts)</span>`;

    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }

    html += '</div>';

    document.getElementById('pagination').innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    applyFilters(); // Re-render with current filters
}
```

### Why This Matters

**Performance Impact:**

```
BEFORE:
- Initial load: 2-5 seconds (parsing 357KB JS)
- Mobile load: 8-15 seconds (or timeout)
- Memory: 50-100MB (entire dataset in memory)
- Scrolling: Laggy (rendering 255 cards)

AFTER:
- Initial load: 0.5-1 second (small HTML + CSS)
- Data load: 0.3-0.5 seconds (JSON parsing)
- Memory: 5-10MB (only current page in DOM)
- Scrolling: Smooth (only 50 cards rendered)
```

**Scalability:**

```
BEFORE:
- 255 prompts: 357KB (slow but works)
- 500 prompts: ~700KB (browser timeout)
- 1000 prompts: ~1.4MB (completely broken)

AFTER:
- 255 prompts: 350KB JSON (fine)
- 500 prompts: 700KB JSON (fine)
- 1000 prompts: 1.4MB JSON (fine)
- Only 50 prompts rendered at once
```

### Implementation Steps

**Time Estimate:** 4-6 hours

**Dependencies:** None

**Steps:**

1. **Extract CSS to external file** (30 minutes)
   - Lines 8-302: Copy all `<style>` content
   - Create `reports/prompts/styles.css`
   - Replace `<style>...</style>` with `<link rel="stylesheet" href="styles.css">`

2. **Extract JavaScript to external file** (60 minutes)
   - Lines 442-9900: Copy all JavaScript (except embedded data)
   - Create `reports/prompts/viewer-bundle.js`
   - Move all functions to bundle
   - Export `initializeViewer(data)` function

3. **Create prompts-data.json** (30 minutes)
   - Extract lines 444-8800 (the `allData` object)
   - Save to `reports/prompts/prompts-data.json`
   - Verify JSON is valid

4. **Update HTML to load externally** (45 minutes)
   - Remove embedded data and scripts
   - Add fetch() to load JSON
   - Add loading spinner
   - Add error handling
   - Link to external CSS and JS

5. **Implement pagination** (90 minutes)
   - Add pagination controls to HTML
   - Implement page navigation
   - Update renderPrompts() to show only current page
   - Update filters to work with pagination
   - Test with all 255 prompts

6. **Test all functionality** (60 minutes)
   - Test: Page load speed
   - Test: Filter by standard, persona, complexity
   - Test: Search functionality
   - Test: Pagination (next, prev, direct page)
   - Test: Charts still render
   - Test: Mobile responsiveness

### Testing Criteria

**Success:**
- [ ] HTML file < 1000 lines
- [ ] Initial page load < 1 second
- [ ] Only 50 prompts rendered at once
- [ ] Pagination works (next, prev, page numbers)
- [ ] All filters still work
- [ ] Charts still render
- [ ] Search still works
- [ ] Data loads from external JSON
- [ ] Error handling if JSON missing

**Verification Commands:**

```bash
# Check file sizes
wc -l reports/prompts/prompt-viewer.html  # Should be ~400 lines
wc -l reports/prompts/viewer-bundle.js    # Should be ~1000 lines
wc -l reports/prompts/styles.css          # Should be ~300 lines
du -h reports/prompts/prompts-data.json   # Should be ~350KB

# Test loading
open reports/prompts/prompt-viewer.html
# Should load instantly, show loading spinner, then prompts

# Test pagination
# Click "Next" button → should show prompts 51-100
# Click "Previous" → should show prompts 1-50

# Test with network throttling (simulate slow connection)
# Open DevTools → Network → Throttling → Slow 3G
# Reload page → should still load within 5 seconds
```

### Rollback Plan

Keep current viewer as `prompt-viewer-legacy.html`:
```bash
cp reports/prompts/prompt-viewer.html reports/prompts/prompt-viewer-legacy.html
```

If new version has issues, users can use legacy version while bugs are fixed.

### Files Affected

- ✏️ `reports/prompts/prompt-viewer.html` (reduce from 9,910 to ~400 lines)
- ✅ CREATE `reports/prompts/prompts-data.json` (new file, 350KB)
- ✅ CREATE `reports/prompts/viewer-bundle.js` (new file, ~1000 lines)
- ✅ CREATE `reports/prompts/styles.css` (new file, ~300 lines)

---

## Issue #5: String Matching Instead of Metadata for Standard Detection

### Current State (BROKEN)

**File:** `utils/analysis-aggregator.js:164-182`

```javascript
export function aggregateByStandard(results) {
  const byStandard = {};

  // Group by standard (extract from promptId)
  for (const result of results) {
    const promptId = result.input?.promptId || '';
    let standard = 'other';

    // ⚠️ STRING MATCHING - WRONG APPROACH!
    if (promptId.includes('GDPR')) standard = 'GDPR';
    else if (promptId.includes('ISO')) standard = 'ISO-27001';  // ⚠️ LUMPS ALL ISO!
    else if (promptId.includes('HIPAA')) standard = 'HIPAA';
    else if (promptId.includes('SOC2')) standard = 'SOC2';
    else if (promptId.includes('CCPA')) standard = 'CCPA';

    // What about ISO_27002, ISO_27017, ISO_27018, ISO_27701?
    // All get classified as "ISO-27001" (WRONG!)

    if (!byStandard[standard]) {
      byStandard[standard] = [];
    }
    byStandard[standard].push(result);
  }

  // ...
}
```

**File:** `utils/analysis-loader.js:266-271`

```javascript
// Extract standard (if present)
if (result.input?.promptId?.includes('GDPR')) {
  standards.add('GDPR');
} else if (result.input?.promptId?.includes('ISO')) {
  standards.add('ISO-27001');  // ⚠️ SAME PROBLEM!
}
```

### Root Cause

**Why this happened:**
1. Before unified schema, promptId was only source of metadata
2. String matching was "good enough" with limited standards
3. Unified schema added `input.metadata.standard` field
4. Analysis code not updated to use new field
5. Now have 6 ISO standards, all misclassified

**Evidence:**
- Test prompt has: `{ standard: "ISO_27701", ... }`
- Schema has: `result.input.metadata.standard = "ISO_27701"`
- But analytics do: `if (promptId.includes('ISO'))` → All become "ISO-27001"

**Real-World Example:**

```javascript
// Customer runs test with ISO 27701 prompts
Prompt: "ISO_27701_FACTUAL_NOVICE_1"
Metadata: { standard: "ISO_27701" }

// Analytics classify as:
Standard: "ISO-27001"  // ⚠️ WRONG!

// Customer looks for ISO 27701 results:
Filter: standard = "ISO_27701"
Results: 0 found (because all are labeled "ISO-27001")
```

### Proposed Fix

**Use metadata field consistently:**

**File:** `utils/analysis-aggregator.js:164-182`

```javascript
export function aggregateByStandard(results) {
  const byStandard = {};

  // Group by standard using METADATA FIELD (not string matching)
  for (const result of results) {
    // ✅ CORRECT: Use metadata field
    const standard = result.input?.metadata?.standard ||
                     extractStandardFromPromptId(result.input?.promptId) ||
                     'unknown';

    if (!byStandard[standard]) {
      byStandard[standard] = [];
    }
    byStandard[standard].push(result);
  }

  // ...
}

// ✅ ADD: Fallback for legacy results without metadata
function extractStandardFromPromptId(promptId) {
  if (!promptId) return 'unknown';

  // Try to extract standard from ID
  // Format: STANDARD_KNOWLEDGETYPE_PERSONA_N
  const parts = promptId.split('_');

  // Handle multi-word standards (ISO_27001, EU_AI_ACT)
  if (parts.length >= 2) {
    // If second part is numeric, it's part of standard name
    if (!isNaN(parts[1])) {
      return `${parts[0]}_${parts[1]}`;  // ISO_27001
    }
    // If second part is "AI", it's part of standard name
    if (parts[1] === 'AI') {
      return `${parts[0]}_${parts[1]}_${parts[2]}`;  // EU_AI_ACT
    }
    return parts[0];  // GDPR, HIPAA, etc.
  }

  return 'unknown';
}
```

**File:** `utils/analysis-loader.js:266-271`

```javascript
// Extract standard from metadata (NOT string matching)
const standard = result.input?.metadata?.standard;
if (standard) {
  standards.add(standard);
}
```

### Why This Matters

**Current Analytics (WRONG):**

```
Standard         Test Count
─────────────────────────
ISO-27001        78        ← Includes 27001, 27002, 27017, 27018, 27701!
GDPR             52        ← OK
SOC2             15        ← OK
```

**Fixed Analytics (RIGHT):**

```
Standard         Test Count
─────────────────────────
ISO_27001        35        ← Only ISO 27001
ISO_27002        8         ← Separate
ISO_27017        12        ← Separate
ISO_27018        10        ← Separate
ISO_27701        13        ← Separate
GDPR             52        ← OK
SOC_2            15        ← OK
```

**Customer Impact:**
- Cannot filter by specific ISO standard
- Analytics dashboards show wrong breakdowns
- Model performance per standard is inaccurate
- Benchmark reports are misleading

### Implementation Steps

**Time Estimate:** 2 hours

**Dependencies:** Should be done after Issue #3 (ensures metadata is populated)

**Steps:**

1. **Add extractStandardFromPromptId() helper** (30 minutes)
   - Add to `utils/analysis-aggregator.js` at top
   - Handle single-word standards (GDPR, HIPAA, SOC_2)
   - Handle multi-word standards (ISO_27001, EU_AI_ACT, NIST_800_53)
   - Test with all 29 standard names

2. **Update aggregateByStandard()** (20 minutes)
   - Line 169-176: Replace string matching
   - Use `result.input?.metadata?.standard`
   - Use extractStandardFromPromptId() as fallback
   - Test with mixed results (some with metadata, some without)

3. **Update analysis-loader.js** (15 minutes)
   - Lines 266-271: Use metadata field
   - Remove string matching logic

4. **Update all other string-matching locations** (30 minutes)
   - Search codebase: `grep -r "promptId.includes" **/*.js`
   - Replace all with metadata field access
   - Add fallback to extraction function

5. **Test with actual results** (25 minutes)
   - Load existing test results
   - Run: `aggregateByStandard(results)`
   - Verify each ISO standard is separate
   - Verify GDPR, HIPAA, SOC_2 still work
   - Verify 'unknown' category for prompts without standard

### Testing Criteria

**Success:**
- [ ] ISO 27001, 27002, 27017, 27018, 27701 are separate categories
- [ ] GDPR, HIPAA, SOC_2 still classified correctly
- [ ] Results without metadata use ID extraction fallback
- [ ] No "other" category unless truly unknown
- [ ] All 29 standards can be individually aggregated

**Verification Commands:**

```bash
# Test aggregation
node -e "
import('./utils/analysis-loader.js').then(loader => {
  import('./utils/analysis-aggregator.js').then(agg => {
    const results = loader.loadResultsFromDate('compliance', '2026-03-26');
    const byStd = agg.aggregateByStandard(results);

    console.log('Standards found:');
    byStd.forEach(s => {
      console.log(\`  \${s.standard.padEnd(20)} \${s.count} tests\`);
    });
  });
});
"

# Should show:
# Standards found:
#   GDPR                 52 tests
#   ISO_27001            35 tests
#   ISO_27701            13 tests
#   ISO_27017            12 tests
#   (etc - each separate)
```

### Rollback Plan

If metadata field is not always populated:
- Keep extractStandardFromPromptId() as primary method
- Use metadata as secondary source
- But fix underlying issue (populate metadata)

### Files Affected

- ✏️ `utils/analysis-aggregator.js` (add helper, fix aggregateByStandard)
- ✏️ `utils/analysis-loader.js` (use metadata field)
- 🔍 Search and replace in any other files using string matching

---

## Issue #6: No Atomic File Operations

### Current State (BROKEN)

**File:** `utils/test-helpers.js:156`

```javascript
// Write to disk
fs.writeFileSync(filePath, JSON.stringify(resultWrapper, null, 2));
// ⚠️ If this fails mid-write (power loss, disk full, crash):
//    - File is corrupted
//    - Partial JSON written
//    - Cannot parse
//    - All test results LOST
```

**What Can Go Wrong:**

1. **Power Loss During Write:**
   ```
   {
     "metadata": { "timestamp": "2026-03-26T10:30:00Z" },
     "results": [
       { "input": { ... }, "output": { ...
   ```
   ← Power cuts here → File ends abruptly, invalid JSON

2. **Disk Full:**
   ```
   writeFileSync() → Disk full at 80% written → Partial file
   ```

3. **Process Crash:**
   ```
   stringify() → SIGKILL → Write incomplete
   ```

### Root Cause

**Why this happened:**
- Direct file writes are simple and "usually work"
- Atomic operations require extra code
- Risk seems low in development
- But in production with thousands of tests: probability × impact = high risk

**Probability:**
- 1000 test saves per day
- 0.01% failure rate
- = 1 corruption every 10 days

### Proposed Fix

**Use atomic write pattern:**

```javascript
export function saveSchemaCompliantResults(results, options = {}) {
  // ... validation code ...

  const filePath = path.join(dirPath, filename);
  const tempPath = filePath + '.tmp';  // ✅ Write to temp file first

  // Prepare result wrapper
  const resultWrapper = {
    metadata: { ... },
    results: resultsArray
  };

  try {
    // ✅ STEP 1: Write to temporary file
    fs.writeFileSync(tempPath, JSON.stringify(resultWrapper, null, 2));

    // ✅ STEP 2: Verify temp file is valid JSON
    const verification = JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
    if (!verification.results || verification.results.length !== resultsArray.length) {
      throw new Error('Temp file verification failed - written data does not match');
    }

    // ✅ STEP 3: Atomic rename (POSIX guarantee: all-or-nothing)
    fs.renameSync(tempPath, filePath);

    console.log(`\n📊 Schema-compliant results saved:`);
    console.log(`   Path: ${filePath}`);
    console.log(`   Results: ${resultsArray.length}`);
    console.log(`   Validated: ${validationResult ? validationResult.summary : 'not-validated'}`);

    return {
      filePath,
      validated: validationResult ? resultsArray.length - validationResult.failedResults : 0,
      failed: validationResult ? validationResult.failedResults : 0,
      errors: validationResult ? validationResult.errors : []
    };

  } catch (error) {
    // ✅ STEP 4: Cleanup temp file on failure
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}
```

### Why This Matters

**Failure Scenarios:**

**Scenario 1: Power Loss**
```
BEFORE (direct write):
- Writing to final file
- Power cuts at 80%
- File is corrupted (partial JSON)
- All test results LOST

AFTER (atomic):
- Writing to .tmp file
- Power cuts at 80%
- .tmp file corrupted (but final file never created)
- No data loss (retry writes new .tmp)
```

**Scenario 2: Disk Full**
```
BEFORE:
- Writes until disk full
- Partial file saved
- File is corrupted

AFTER:
- Writes .tmp until disk full
- Exception thrown
- No .tmp file left behind (cleanup)
- Final file never created
- Retry after freeing space
```

**Customer Impact:**
- ❌ **Without fix:** Random data loss (1 in 1000 saves)
- ❌ **Without fix:** Corrupted files cannot be recovered
- ✅ **With fix:** All-or-nothing guarantee
- ✅ **With fix:** No partial writes
- ✅ **With fix:** Enterprise-grade reliability

### Implementation Steps

**Time Estimate:** 90 minutes

**Dependencies:** None

**Steps:**

1. **Update saveSchemaCompliantResults()** (45 minutes)
   - Line 156: Change to write to `filePath + '.tmp'`
   - Add JSON verification step
   - Add atomic rename
   - Add temp file cleanup in catch block

2. **Add verification function** (15 minutes)
   - Verify temp file parses as valid JSON
   - Verify result count matches expected
   - Verify all required fields present

3. **Test failure scenarios** (30 minutes)
   - Test: Disk full simulation (fill /tmp, watch behavior)
   - Test: Kill process during write (pkill -9)
   - Test: Large file write (1000+ results)
   - Verify: No .tmp files left behind
   - Verify: Final file only created on success

### Testing Criteria

**Success:**
- [ ] Normal write: Creates .tmp, verifies, renames to final
- [ ] Write failure: No final file created, .tmp cleaned up
- [ ] Process kill: No final file if killed during write
- [ ] Disk full: Exception thrown, no partial file
- [ ] No .tmp files left in directory after completion

**Verification Commands:**

```bash
# Test normal write
node run-enterprise-tests.js pilot
ls reports/compliance/2026-03-26/*.tmp
# Should find: nothing (temp files deleted after rename)

# Test write failure (simulate disk full)
node -e "
import('./utils/test-helpers.js').then(({saveSchemaCompliantResults}) => {
  // Create huge data to fill disk
  const fakeResults = Array(100000).fill({
    metadata: { timestamp: new Date().toISOString(), testRunId: 'test', runNumber: 1 },
    input: { promptId: 'test', fullPromptText: 'x'.repeat(10000), fullPromptTokens: 1 },
    output: { response: 'y'.repeat(10000), responseTokens: 1 },
    timing: { totalMs: 1000, tokensPerSecond: 1 },
    execution: { success: true, responseValidated: true }
  });

  try {
    saveSchemaCompliantResults(fakeResults, {testType: 'test', runName: 'huge'});
  } catch (error) {
    console.log('Expected error:', error.message);
    // Check no .tmp files left behind
    const fs = require('fs');
    const tmpFiles = fs.readdirSync('reports/test/').filter(f => f.endsWith('.tmp'));
    console.log('Temp files remaining:', tmpFiles.length);  // Should be 0
  }
});
"
```

### Rollback Plan

If atomic rename causes issues on Windows (different filesystem):
- Add platform detection
- Use atomic rename on POSIX (Mac, Linux)
- Use write-verify-delete pattern on Windows

### Files Affected

- ✏️ `utils/test-helpers.js` (update saveSchemaCompliantResults function)

---

## Issue #7: No Input Validation on User Options

### Current State (BROKEN)

**File:** `run-enterprise-tests.js:274-282`

```javascript
// Apply filters if specified
let testSubset = allTests;
if (options.standard) {
  testSubset = testSubset.filter(t => t.standard === options.standard);
  // ⚠️ If user types "GDPRRRR", testSubset becomes empty array
  // ⚠️ No error, no warning, just runs zero tests!
}
if (options.persona) {
  testSubset = testSubset.filter(t => t.persona === options.persona);
  // ⚠️ Same problem
}

testSubset = testSubset.slice(0, options['max-tests'] || 100);
// ⚠️ What if user types --max-tests -1? Or 999999999?
```

**User Experience:**

```bash
$ node run-enterprise-tests.js standard --standard GDPRRRR

🚀 Running STANDARD TEST
   Tests: 100 | Models: 5 | Duration: ~45 minutes

📊 Using Docker profile: balanced
   ✅ Profile "balanced" fits...

Testing Model: LLAMA-4-SCOUT-17B
=================================
# ⚠️ Runs ZERO tests (testSubset is empty)
# ⚠️ User wastes 2 hours waiting for nothing
# ⚠️ No error message explaining the typo

✅ Standard test complete!  ← Says "complete" despite zero tests!
```

### Root Cause

**Why this happened:**
- Assumes users read documentation carefully
- No defensive programming
- Filter returns empty array (valid JS, but wrong intent)
- No sanity checks on result count

### Proposed Fix

**Add validation for all user inputs:**

```javascript
async function runStandardTest(runner, options) {
  console.log('\n🚀 Running STANDARD TEST');

  // ✅ STEP 1: Validate user inputs BEFORE loading tests

  // Validate standard option
  if (options.standard) {
    const validStandards = [
      'GDPR', 'CCPA', 'CPRA', 'PIPEDA', 'LGPD', 'UK_GDPR', 'POPIA',
      'ISO_27001', 'ISO_27002', 'ISO_27017', 'ISO_27018', 'ISO_27701',
      'NIST_CSF', 'NIST_800_53', 'NIST_800_171',
      'SOC_2', 'ISO_22301', 'PCI_DSS', 'HIPAA', 'FEDRAMP', 'CMMC_2_0',
      'COBIT', 'SSAE_18', 'SOX', 'GLBA', 'CIS_CONTROLS', 'CSA_CCM',
      'EU_AI_ACT', 'ISO_27050', 'CA_SB_1047', 'CA_AB_2013'
    ];

    if (!validStandards.includes(options.standard)) {
      console.error(`\n❌ Invalid standard: "${options.standard}"`);
      console.error(`\nDid you mean one of these?`);

      // ✅ Suggest similar standards (fuzzy match)
      const suggestions = validStandards
        .filter(s => s.toLowerCase().includes(options.standard.toLowerCase()))
        .slice(0, 5);

      if (suggestions.length > 0) {
        console.error(`  ${suggestions.join(', ')}`);
      } else {
        console.error(`  Valid standards: ${validStandards.slice(0, 10).join(', ')}, ...`);
        console.error(`  (See docs/TAXONOMY-GUIDE.md for complete list)`);
      }

      process.exit(1);
    }
  }

  // Validate persona option
  if (options.persona) {
    const validPersonas = ['NOVICE', 'PRACTITIONER', 'MANAGER', 'AUDITOR', 'EXECUTIVE', 'DEVELOPER'];

    if (!validPersonas.includes(options.persona)) {
      console.error(`\n❌ Invalid persona: "${options.persona}"`);
      console.error(`   Valid personas: ${validPersonas.join(', ')}`);
      process.exit(1);
    }
  }

  // Validate max-tests option
  if (options['max-tests']) {
    const maxTests = parseInt(options['max-tests']);
    if (isNaN(maxTests) || maxTests < 1 || maxTests > 10000) {
      console.error(`\n❌ Invalid max-tests: "${options['max-tests']}"`);
      console.error(`   Must be a number between 1 and 10000`);
      process.exit(1);
    }
  }

  // ✅ STEP 2: Load and filter tests
  const allTests = generateAllTests();
  let testSubset = allTests;

  if (options.standard) {
    testSubset = testSubset.filter(t => t.standard === options.standard);
  }
  if (options.persona) {
    testSubset = testSubset.filter(t => t.persona === options.persona);
  }

  testSubset = testSubset.slice(0, options['max-tests'] || 100);

  // ✅ STEP 3: Sanity check result count
  if (testSubset.length === 0) {
    console.error(`\n❌ No tests match your filter criteria`);
    console.error(`   Standard: ${options.standard || 'any'}`);
    console.error(`   Persona: ${options.persona || 'any'}`);
    console.error(`   Max tests: ${options['max-tests'] || 100}`);
    console.error(`\nAvailable tests: ${allTests.length}`);
    console.error(`After filters: ${testSubset.length} (zero!)`);
    console.error(`\nCheck your filter values and try again.`);
    process.exit(1);
  }

  console.log(`   Tests to run: ${testSubset.length}`);
  console.log(`   Across: ${models.length} models`);
  console.log(`   Total executions: ${testSubset.length * models.length}`);

  // ... continue with test execution ...
}
```

### Why This Matters

**Current UX (BAD):**

```bash
# User makes typo
$ node run-enterprise-tests.js standard --standard GDPRR

# 2 hours later...
✅ Standard test complete!

# User checks results
$ cat reports/compliance/2026-03-26/*.json
# Empty file or zero results

# User is confused, files support ticket
```

**Fixed UX (GOOD):**

```bash
# User makes typo
$ node run-enterprise-tests.js standard --standard GDPRR

❌ Invalid standard: "GDPRR"

Did you mean one of these?
  GDPR

# User fixes immediately
$ node run-enterprise-tests.js standard --standard GDPR

🚀 Running STANDARD TEST
   Tests to run: 52
   ...
```

**Customer Impact:**
- Saves time (fail fast vs 2-hour wasted run)
- Clear error messages (helpful, not confusing)
- Professional experience (enterprise-grade validation)

### Implementation Steps

**Time Estimate:** 2 hours

**Dependencies:** None

**Steps:**

1. **Create validation helpers** (30 minutes)
   - Add to `utils/test-helpers.js`
   - `validateStandard(standard)` - Returns { valid, suggestions }
   - `validatePersona(persona)` - Returns { valid, message }
   - `validateMaxTests(max)` - Returns { valid, message }

2. **Update all test commands** (60 minutes)
   - runPilotTest: Add validation
   - runQuickTest: Add validation
   - runStandardTest: Add validation (example above)
   - runComprehensiveTest: Add validation

3. **Add sanity check for zero results** (15 minutes)
   - After applying filters, check `testSubset.length > 0`
   - If zero, show error with filter values
   - Exit before wasting time starting models

4. **Test all validation paths** (15 minutes)
   - Invalid standard → Error
   - Invalid persona → Error
   - Invalid max-tests → Error
   - Zero results after filter → Error
   - Valid inputs → Success

### Testing Criteria

**Success:**
- [ ] Invalid standard → Clear error, exits immediately
- [ ] Invalid persona → Clear error, exits immediately
- [ ] Invalid max-tests → Clear error
- [ ] Filters result in zero tests → Clear error
- [ ] Valid inputs → Test runs normally
- [ ] Error messages suggest fixes

**Verification Commands:**

```bash
# Test invalid standard
node run-enterprise-tests.js standard --standard INVALID
# Should exit immediately with error and suggestions

# Test invalid persona
node run-enterprise-tests.js standard --persona INVALID_PERSONA
# Should exit immediately with error

# Test invalid max-tests
node run-enterprise-tests.js standard --max-tests abc
# Should exit with error

# Test zero results
node run-enterprise-tests.js standard --standard GDPR --persona EXECUTIVE
# If no GDPR+EXECUTIVE tests exist, should error before running models

# Test valid inputs
node run-enterprise-tests.js pilot --standard GDPR
# Should run successfully
```

### Rollback Plan

None needed - this is pure addition, doesn't change existing logic.

### Files Affected

- ✏️ `run-enterprise-tests.js` (add validation to all test functions)
- ✏️ `utils/test-helpers.js` (add validation helper functions)

---

## Combined Implementation Timeline

### Day 1 (6-8 hours)

**Morning (3-4 hours):**
- ✅ Issue #1: Fix fullPromptText (2 hours)
- ✅ Issue #2: Remove silent validation failures (1 hour)
- ✅ Coffee break + testing (1 hour)

**Afternoon (3-4 hours):**
- ✅ Issue #3: Fix hardcoded zeros (3 hours)
- ✅ Testing and validation (1 hour)

**End of Day 1:**
- Data integrity issues resolved
- Schema compliance working
- Valid test results being saved

### Day 2 (6-8 hours)

**Morning (3-4 hours):**
- ✅ Issue #4: Fix embedded HTML data (4 hours)
- Includes: Extract CSS, JS, create JSON, add pagination

**Afternoon (3-4 hours):**
- ✅ Issue #5: Fix analytics string matching (2 hours)
- ✅ Issue #6: Add atomic file operations (1.5 hours)
- ✅ Issue #7: Add input validation (2 hours)

**End of Day 2:**
- All 7 critical issues resolved
- Production-ready data pipeline
- Professional UX
- Reliable file operations

### Total Time: 12-16 hours (1.5-2 days)

---

## Testing Strategy

### Unit Tests (After Each Fix)

```bash
# After Issue #1
npm test  # Verify prompts have fullPrompt field

# After Issue #2
# (Test validation failure path manually)

# After Issue #3
# Check token counts in saved results

# After Issue #4
# Load viewer, check load time < 1s

# After Issue #5
# Run aggregation, check standards are separate

# After Issue #6
# Simulate failures, verify no corruption

# After Issue #7
# Test invalid inputs, verify clear errors
```

### Integration Tests (After All Fixes)

```bash
# End-to-end test
node run-enterprise-tests.js pilot

# Verify:
# 1. Test runs successfully
# 2. Results saved to correct location
# 3. Schema validation passes
# 4. All token counts > 0
# 5. All standards correctly classified
# 6. File is valid JSON
# 7. No .tmp files left behind

# Load in viewer
open reports/prompts/prompt-viewer.html
# Verify:
# 1. Loads < 1 second
# 2. Shows 50 prompts
# 3. Pagination works
# 4. Filters work
# 5. Charts render
```

### Regression Tests (Ensure Nothing Broke)

```bash
# Run existing tests
node run-performance-tests.js
node run-multitier-performance.js
node run-enterprise-tests.js pilot

# All should complete successfully
# All results should validate
# All files should be valid JSON
```

---

## Success Criteria

**Phase 1 Complete When:**

- [ ] All 7 critical issues resolved
- [ ] All test runners save valid schema-compliant results
- [ ] All token counts are actual (not zero)
- [ ] No hardcoded fake metrics
- [ ] UI loads fast (< 1s) and scales to 500+ prompts
- [ ] Analytics use metadata (not string matching)
- [ ] File operations are atomic
- [ ] User inputs are validated
- [ ] No silent failures
- [ ] Clear error messages guide users to fixes
- [ ] Complete end-to-end test passes

**Ready for Commercial Beta When:**

- [ ] All Phase 1 issues resolved
- [ ] Tested with 1000+ prompts
- [ ] Tested with 10 models × 100 prompts = 1000 executions
- [ ] No data loss in stress testing
- [ ] Performance meets SLA (< 5s per test)
- [ ] Documentation updated
- [ ] Customer-facing error messages professional

---

## Risk Assessment

### Low Risk Fixes (Safe)

- ✅ Issue #1 (fullPromptText) - Pure addition
- ✅ Issue #7 (input validation) - Pure addition
- ✅ Issue #6 (atomic writes) - Drop-in replacement

### Medium Risk Fixes (Test Carefully)

- ⚠️ Issue #2 (silent failures) - Changes error handling
- ⚠️ Issue #5 (analytics) - Changes aggregation logic

### Higher Risk Fixes (Requires Thorough Testing)

- ⚠️ Issue #3 (hardcoded zeros) - Changes schema conversion
- ⚠️ Issue #4 (embedded data) - Significant refactor

**Mitigation:**
- Test each fix independently
- Keep legacy viewer as backup
- Version all changes in git
- Can rollback individual fixes if needed

---

## Questions to Resolve Before Starting

1. **Token Estimation Method:**
   - Use simple estimate (chars/4)?
   - Or integrate tiktoken library (accurate but dependency)?
   - **Recommendation:** Start with estimate, upgrade to tiktoken in Phase 2

2. **Coherence Score:**
   - Remove entirely?
   - Or implement actual coherence evaluation?
   - **Recommendation:** Remove for now (optional field), implement later if needed

3. **Legacy Format Support:**
   - Keep saveReport() for backwards compatibility?
   - Or delete entirely?
   - **Recommendation:** Keep function but ONLY allow in debug mode, never production

4. **Prompt Viewer:**
   - Build new viewer from scratch (2-3 days)?
   - Or refactor existing (4-6 hours)?
   - **Recommendation:** Refactor existing, works well once data is external

---

**Contact:** libor@arionetworks.com
**Status:** Ready for implementation approval
**Next Step:** Review this plan, ask questions, then I'll implement in priority order
