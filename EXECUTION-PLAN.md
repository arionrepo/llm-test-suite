# Commercial Launch - Execution Plan

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/EXECUTION-PLAN.md
**Description:** Chronological execution order and dependencies for commercial launch readiness
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Execution Sequence

### Phase 1: Sequential Execution Required

These issues have dependencies and must be done in order:

#### Step 1: Fix fullPrompt Field
**File:** `performance-prompts.js`

**What to do:**
- Add `fullPrompt` field to all 50 prompts in PERFORMANCE_PROMPTS
- For simple prompts: `fullPrompt` = `input`
- Update `performance-test-runner.js` to capture and return `fullPromptText`

**Dependencies:** None - start here

**Blocks:** Step 2 (needs fullPrompt data)

**Files:**
- `performance-prompts.js`
- `performance-test-runner.js`

**Test:**
```bash
node run-performance-tests.js
cat reports/performance/*/test-results-*.json | jq '.results[0].input.fullPromptText'
# Should NOT be empty
```

---

#### Step 2: Fix Hardcoded Zeros
**Files:** `run-enterprise-tests.js`, `enterprise/enterprise-test-runner.js`

**What to do:**
- Add token count capture in `enterprise-test-runner.js:48-59`
  - Return `promptTokens`, `completionTokens`, `tokensPerSecond` from `result.timing`
- Update `convertEnterpriseResultsToSchema()` in `run-enterprise-tests.js:375-445`
  - Replace `fullPromptTokens: 0` with actual value
  - Replace `responseTokens: 0` with actual value
  - Remove `coherenceScore: 0.8` (fake metric)
  - Calculate `tokensPerSecond` from actual values
- Add helper functions:
  - `estimateTokenCount(text)` - Fallback: `Math.ceil(text.length / 4)`
  - `getModelQuantization(modelName)` - Map model to actual quantization

**Depends on:** Step 1 (needs fullPrompt to calculate tokens)

**Blocks:** Step 3 (validation only works with correct data)

**Files:**
- `enterprise/enterprise-test-runner.js`
- `run-enterprise-tests.js`

**Test:**
```bash
node run-enterprise-tests.js pilot
cat reports/compliance/*/test-results-*.json | jq '.results[0].input.fullPromptTokens'
# Should be > 0 (NOT zero)
cat reports/compliance/*/test-results-*.json | jq '.results[0].output.responseTokens'
# Should be > 0 (NOT zero)
```

---

#### Step 3: Remove Silent Validation Failures
**File:** `run-enterprise-tests.js`

**What to do:**
- Lines 186-198: Remove try/catch with legacy fallback
- Replace with hard fail on validation error
- Add helpful error messages showing what's wrong
- Repeat for lines 232-242, 287-297, 332-342 (4 locations total)
- Delete all `saveReport('enterprise-*', results)` fallback calls

**Depends on:** Steps 1 and 2 (validation only passes with correct data)

**Blocks:** None

**Files:**
- `run-enterprise-tests.js`

**Test:**
```bash
# Test success path
node run-enterprise-tests.js pilot
# Should save successfully

# Test failure path (temporarily break data, verify it fails loudly)
```

---

### Phase 2: Parallel Execution Possible

These issues are independent - can be done in any order or simultaneously:

#### Step 4: Extract Embedded HTML Data
**File:** `reports/prompts/prompt-viewer.html`

**What to do:**
- Extract CSS (lines 8-302) → `reports/prompts/styles.css`
- Extract JavaScript (lines 442-9900) → `reports/prompts/viewer-bundle.js`
- Extract JSON data (lines 444-8800) → `reports/prompts/prompts-data.json`
- Update HTML to load external files via `fetch()`
- Add pagination (50 prompts per page)
- Add loading spinner
- Add error handling

**Dependencies:** None

**Can run parallel with:** Steps 5, 6, 7

**Files:**
- `reports/prompts/prompt-viewer.html` (reduce to ~400 lines)
- CREATE `reports/prompts/styles.css`
- CREATE `reports/prompts/viewer-bundle.js`
- CREATE `reports/prompts/prompts-data.json`

**Test:**
```bash
open reports/prompts/prompt-viewer.html
# Should load < 1 second
# Should show only 50 prompts
# Pagination should work
```

---

#### Step 5: Fix Analytics String Matching
**Files:** `utils/analysis-aggregator.js`, `utils/analysis-loader.js`

**What to do:**
- Add `extractStandardFromPromptId()` helper function
  - Handle single-word: GDPR, HIPAA, SOC_2
  - Handle multi-word: ISO_27001, EU_AI_ACT, NIST_800_53
- Update `aggregateByStandard()` line 169-176:
  - Replace string matching with `result.input?.metadata?.standard`
  - Use helper as fallback for legacy results
- Update `analysis-loader.js` lines 266-271:
  - Use `result.input?.metadata?.standard` directly
- Search and replace any other `promptId.includes()` logic

**Dependencies:** None

**Can run parallel with:** Steps 4, 6, 7

**Files:**
- `utils/analysis-aggregator.js`
- `utils/analysis-loader.js`

**Test:**
```bash
node -e "..." # Aggregation test showing ISO_27001, ISO_27701, ISO_27017 separate
```

---

#### Step 6: Add Atomic File Operations
**File:** `utils/test-helpers.js`

**What to do:**
- Update `saveSchemaCompliantResults()` line 156:
  - Write to `filePath + '.tmp'` instead of `filePath`
  - Verify temp file is valid JSON
  - Verify result count matches
  - Use `fs.renameSync(tempPath, filePath)` for atomic operation
- Add cleanup in catch block:
  - Delete `.tmp` file if write fails

**Dependencies:** None

**Can run parallel with:** Steps 4, 5, 7

**Files:**
- `utils/test-helpers.js`

**Test:**
```bash
# Run test
node run-enterprise-tests.js pilot
# Check no .tmp files remain
ls reports/compliance/*/*.tmp
# Should find nothing
```

---

#### Step 7: Add Input Validation
**File:** `run-enterprise-tests.js`

**What to do:**
- Add validation helpers to `utils/test-helpers.js`:
  - `validateStandard(standard)` - Check against 29 valid standards
  - `validatePersona(persona)` - Check against 6 valid personas
  - `validateMaxTests(max)` - Check is number 1-10000
- Update all test commands (pilot, quick, standard, comprehensive):
  - Validate options.standard before filtering
  - Validate options.persona before filtering
  - Validate options['max-tests'] before using
  - Check testSubset.length > 0 after filtering
  - Exit with clear error if invalid

**Dependencies:** None

**Can run parallel with:** Steps 4, 5, 6

**Files:**
- `run-enterprise-tests.js`
- `utils/test-helpers.js`

**Test:**
```bash
# Invalid standard
node run-enterprise-tests.js standard --standard INVALID
# Should exit immediately with error

# Valid standard
node run-enterprise-tests.js pilot --standard GDPR
# Should run successfully
```

---

### Phase 3: llama-bench Integration

Must be done AFTER Phase 1 and Phase 2 complete.

#### Step 8: llama-bench Integration

**Chronological sub-steps:**

**8.1: Create llama-bench wrapper**

**File:** CREATE `utils/llama-bench-client.js`

**What to do:**
- Implement `LlamaBenchClient` class
- `getModelPath(modelName)` - Locate .gguf file via `llamacpp-manager models list`
- `benchmark(modelName, options)` - Execute llama-bench command, parse JSON output
- `convertToSchema(benchResult, modelName, runNumber)` - Map to unified schema
- Handle errors, parse stdout/stderr

**Dependencies:** Steps 1-7 must be complete (needs working schema compliance)

**Blocks:** Step 8.2

---

**8.2: Update performance test runner**

**File:** `run-performance-tests.js`

**What to do:**
- Import `LlamaBenchClient`
- Replace Runs 1-5 logic:
  - Use llama-bench for speed measurement
  - Prompt sizes: [10, 50, 100, 150, 190]
  - 5 repetitions per test
  - Convert output to schema
- Keep Run 6 with custom runner (quality evaluation)
- Add Run 7 with llama-bench (configuration testing)
  - Test thread counts: [4, 8, 12, 16]

**Depends on:** Step 8.1 (needs wrapper)

**Blocks:** Step 8.3

---

**8.3: Test integration**

**What to do:**
- Run with single model (phi3) to verify llama-bench works
- Verify schema conversion produces valid results
- Verify results pass validation
- Compare llama-bench metrics vs custom runner (should be similar)

**Depends on:** Step 8.2 (needs updated runner)

**Blocks:** Step 8.4

---

**8.4: Run full hybrid suite**

**What to do:**
- Execute all 7 runs (Runs 1-7)
- Verify all save to `reports/performance/YYYY-MM-DD/`
- Validate all results pass schema validation
- Verify dashboard can load and display results

**Depends on:** Step 8.3 (needs working integration)

**Blocks:** None (final step)

---

### Phase 4: Final Validation

Must be done AFTER all previous phases.

#### Step 9: End-to-End Validation

**Chronological sub-steps:**

**9.1: Run complete test suite**
```bash
node run-performance-tests.js  # All 7 runs
node run-enterprise-tests.js pilot
```

**Depends on:** Steps 1-8 complete

**Blocks:** Step 9.2

---

**9.2: Validate results**
- Load all results from `reports/`
- Run batch validation
- Verify 100% pass
- Check no hardcoded zeros
- Check all standards correctly classified

**Depends on:** Step 9.1 (needs results)

**Blocks:** Step 9.3

---

**9.3: Verify UI/dashboards**
- Open prompt-viewer.html → loads fast, pagination works
- Open analysis-dashboard.html → loads results, charts render
- Test all filters and search
- Verify can export data

**Depends on:** Step 9.2 (needs validated results)

**Blocks:** Step 9.4

---

**9.4: Update documentation**
- Update README.md with new hybrid approach
- Update TEST-EXECUTION-GUIDE.md
- Mark CRITICAL-ISSUES-FIX-PLAN.md as complete
- Create customer-facing benchmark report template

**Depends on:** Step 9.3 (needs working system)

**Blocks:** None (final step)

---

## Critical Path (Longest Sequential Chain)

```
Step 1 (fullPrompt)
  ↓
Step 2 (hardcoded zeros)
  ↓
Step 3 (silent failures)
  ↓
Wait for Steps 4-7 to complete (parallel work)
  ↓
Step 8.1 (llama-bench wrapper)
  ↓
Step 8.2 (update runner)
  ↓
Step 8.3 (test integration)
  ↓
Step 8.4 (full suite)
  ↓
Step 9.1 (run complete)
  ↓
Step 9.2 (validate)
  ↓
Step 9.3 (verify UI)
  ↓
Step 9.4 (docs)
  ↓
DONE
```

## Parallel Opportunities

**After Step 3 completes, can work on simultaneously:**
- Step 4 (HTML refactor)
- Step 5 (analytics fix)
- Step 6 (atomic operations)
- Step 7 (input validation)

All 4 are independent and can be done in any order or at the same time.

---

## Full Execution Order

### Sequence A: Critical Path (Cannot Parallelize)
1. Step 1: fullPrompt field
2. Step 2: hardcoded zeros
3. Step 3: silent failures
4. Wait for parallel work to complete
5. Step 8: llama-bench integration (all 4 sub-steps in order)
6. Step 9: final validation (all 4 sub-steps in order)

### Sequence B: Parallel Work (Can Do Simultaneously After Step 3)
- Step 4: HTML refactor (independent)
- Step 5: analytics (independent)
- Step 6: atomic ops (independent)
- Step 7: validation (independent)

---

## What This Means Practically

**Day 1:**
- Do Steps 1, 2, 3 in that exact order
- Cannot proceed to Step 2 until Step 1 done
- Cannot proceed to Step 3 until Step 2 done

**Day 2:**
- Do Steps 4, 5, 6, 7 in any order (or simultaneously if multiple people)
- All 4 must complete before moving to Step 8

**Day 3:**
- Do Step 8 (sub-steps 8.1 → 8.2 → 8.3 → 8.4 in order)
- Do Step 9 (sub-steps 9.1 → 9.2 → 9.3 → 9.4 in order)

---

## Detailed Implementation Instructions

All detailed code, testing criteria, and verification commands are in:
**CRITICAL-ISSUES-FIX-PLAN.md** (2,900 lines)

This document (EXECUTION-PLAN.md) shows ONLY the order and dependencies.

---

**Status:** Ready to execute
**Start:** Step 1 (fullPrompt field)
**Contact:** libor@arionetworks.com
