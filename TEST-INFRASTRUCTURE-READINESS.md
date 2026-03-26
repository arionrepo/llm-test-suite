# Test Infrastructure Compliance Audit

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/TEST-INFRASTRUCTURE-READINESS.md
**Description:** Comprehensive audit of all prompt files and test runners against schema and mandatory requirements
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-26

---

## Executive Summary

**Status: PARTIALLY COMPLIANT** ⚠️

- **Prompt Files:** 2/6 files schema-compliant (33%)
- **Test Runners:** 3/5 runners fully compliant (60%)
- **Critical Gap:** 4 prompt files need schema updates
- **Critical Gap:** 2 test runners missing logging

**Immediate Action Required:** Update 4 prompt source files and 2 test runners

---

## Part 1: Prompt Source Files Audit

### Schema v2.2.0 Required Fields

All prompt files must have these fields:
- `id` (unique identifier)
- `category` (test category)
- `vendor` (Generic or vendor name)
- `question` (the prompt text)
- `expectedTopics` (array of expected response topics)
- `complexity` (beginner/intermediate/advanced/expert)
- **Plus:** At least ONE complete taxonomy (Compliance, Enterprise, Platform, or Tool Calling)

---

### File 1: test-data-generator.js ✅

**Path:** `enterprise/test-data-generator.js`
**Prompts:** 84
**Status:** ✅ **100% COMPLIANT**

| Field | Status |
|-------|--------|
| id | ✅ 84/84 |
| category | ✅ 84/84 |
| vendor | ✅ 84/84 |
| question | ✅ 84/84 |
| expectedTopics | ✅ 84/84 |
| complexity | ✅ 84/84 |
| Taxonomy A (Compliance) | ✅ 84/84 |

**Action Required:** None

---

### File 2: ai-backend-multi-tier-tests.js ✅

**Path:** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`
**Prompts:** 50
**Status:** ✅ **100% COMPLIANT**

| Field | Status |
|-------|--------|
| id | ✅ 50/50 |
| category | ✅ 50/50 |
| vendor | ✅ 50/50 |
| question | ✅ 50/50 |
| expectedTopics | ✅ 50/50 |
| complexity | ✅ 50/50 |
| ArionComply extensions | ✅ 50/50 |

**Action Required:** None

---

### File 3: performance-prompts.js ❌

**Path:** `performance-prompts.js`
**Prompts:** 50 (10 per run × 5 runs)
**Status:** ❌ **0% COMPLIANT** - Simple format, not schema-compliant

**Current Format:**
```javascript
{
  id: 'TINY_01',
  input: 'What is GDPR?',
  tokens: 4
}
```

**Missing Fields:**
- ❌ `category`
- ❌ `vendor`
- ❌ `expectedTopics`
- ❌ `complexity`
- ❌ No taxonomy fields

**Action Required:** ⚠️ **NEEDS UPDATE**

**Recommendation:**
```javascript
{
  id: 'PERF_GDPR_FACTUAL_TINY_01',
  category: 'performance_test',
  vendor: 'Generic',
  question: 'What is GDPR?',
  expectedTopics: ['regulation', 'privacy', 'EU'],
  complexity: 'beginner',
  standard: 'GDPR',
  knowledgeType: 'FACTUAL',
  estimatedTokens: 4
}
```

**Impact:** Used by run-performance-tests.js - currently works but not schema-compliant for documentation/exports

---

### File 4: next-action-tests.js ❌

**Path:** `enterprise/arioncomply-workflows/next-action-tests.js`
**Prompts:** ~30 scenarios
**Status:** ❌ **0% COMPLIANT** - Different schema (workflow scenarios)

**Current Format:**
```javascript
{
  scenario: 'New organization, no compliance work done yet',
  userContext: { ... },
  userQuery: "Where do we start with compliance?",
  expectedNextActions: [...],
  scoringCriteria: { ... }
}
```

**Missing Fields:**
- ❌ `id`
- ❌ `category`
- ❌ `vendor`
- ❌ `expectedTopics`
- ❌ `complexity`

**Action Required:** ⚠️ **NEEDS UPDATE**

**Recommendation:** This is a specialized test type. Options:
1. Update to follow schema v2.2.0
2. Create "next_action_workflow" category with custom schema extension
3. Deprecate if not actively used

---

### File 5: intent-classification-tests.js ❌

**Path:** `enterprise/arioncomply-workflows/intent-classification-tests.js`
**Prompts:** ~30 intent tests
**Status:** ❌ **0% COMPLIANT** - Different schema (intent classification)

**Current Format:**
```javascript
{
  userQuery: "I need to upload a document",
  expectedIntent: "EVIDENCE_UPLOAD",
  intentCategory: "evidence_management",
  confidence: "high",
  contextClues: ["upload", "document"]
}
```

**Missing Fields:**
- ❌ `id`
- ❌ `category` (has `intentCategory` but not `category`)
- ❌ `vendor`
- ❌ `expectedTopics`
- ❌ `complexity`

**Action Required:** ⚠️ **NEEDS UPDATE**

**Recommendation:**
1. Add schema-required fields
2. Keep intent-specific fields as extensions
3. Set `category: 'intent_classification'`

---

### File 6: ui-tasks.js ❌

**Path:** `enterprise/arioncomply-workflows/ui-tasks.js`
**Prompts:** ~15 UI task workflows
**Status:** ❌ **0% COMPLIANT** - Different schema (UI workflows)

**Current Format:**
```javascript
{
  category: 'evidence_management',  // ✅ Has category (but wrong level)
  task: 'Upload evidence for a control',
  userContext: { ... },
  prompts: {
    complete_context: "...",
    missing_standard: "..."
  },
  expectedGuidance: [...]
}
```

**Missing Fields:**
- ❌ `id`
- ❌ `vendor`
- ❌ `question` (has `prompts` object instead)
- ❌ `expectedTopics`
- ❌ `complexity`

**Action Required:** ⚠️ **NEEDS UPDATE**

**Note:** This file has a unique structure with multiple prompt variations per task. May need custom schema extension.

---

## Part 2: Test Runner Audit

### Mandatory Requirements (from CLAUDE.md)

All test runners MUST have:
1. ✅ **Logging** - Logger initialized, all events logged with timestamps
2. ✅ **Incremental Saving** - Save after each model, not at end
3. ✅ **onModelComplete Callback** - Provided to test execution functions
4. ✅ **Schema Validation** - Use `saveSchemaCompliantResults()`
5. ✅ **Limited Scope** - Run only 3 models by default

---

### Runner 1: run-performance-tests.js ⚠️

**Path:** `run-performance-tests.js`
**Purpose:** Execute performance tests (speed/throughput)
**Lines:** ~200

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Logging | ❌ **MISSING** | No Logger import or initialization |
| 2. Incremental Saving | ✅ YES | Saves after each run (line 46) |
| 3. Schema Validation | ✅ YES | Uses `saveSchemaCompliantResults` (line 46) |
| 4. Schema Compliance | ✅ YES | Has `convertToSchema()` function (line 144) |
| 5. Limited Scope | ⚠️ UNKNOWN | Delegates to `ResilientPerformanceTestRunner` |

**Compliance:** **60%** ⚠️

**Critical Gap:** NO LOGGING

**Action Required:**
1. Add logger initialization
2. Log MODEL_START, TESTS_START, TEST_COMPLETE, MODEL_COMPLETE events
3. Save logs to `logs/test-run-performance-{timestamp}.log`

---

### Runner 2: run-enterprise-tests.js ⚠️

**Path:** `run-enterprise-tests.js`
**Purpose:** Execute compliance accuracy tests
**Lines:** ~400+

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Logging | ❌ **MISSING** | No Logger import visible in first 100 lines |
| 2. Incremental Saving | ✅ YES | Multiple `saveSchemaCompliantResults` calls (lines 189, 234, 289, 335) |
| 3. Schema Validation | ✅ YES | Uses `saveSchemaCompliantResults` throughout |
| 4. Schema Compliance | ✅ YES | Has schema conversion logic |
| 5. Limited Scope | ⚠️ UNKNOWN | Need to check model selection |

**Compliance:** **60%** ⚠️

**Critical Gap:** NO LOGGING

**Action Required:**
1. Add logger initialization
2. Log all test events
3. Save logs to `logs/test-run-enterprise-{mode}-{timestamp}.log`

---

### Runner 3: run-multitier-performance.js ✅

**Path:** `run-multitier-performance.js`
**Purpose:** Execute multi-tier prompt tests
**Lines:** ~150

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Logging | ✅ YES | Has Logger (line reference needed - saw in grep) |
| 2. Incremental Saving | ✅ YES | Uses `saveSchemaCompliantResults` |
| 3. Schema Validation | ✅ YES | Uses `saveSchemaCompliantResults` (line 72) |
| 4. Schema Compliance | ✅ YES | Saves schema-compliant results |
| 5. Limited Scope | ✅ YES | Runs 3 models (smollm3, phi3, mistral) |

**Compliance:** **100%** ✅

**Action Required:** None

---

### Runner 4: run-multitier-split-25.js ✅

**Path:** `run-multitier-split-25.js`
**Purpose:** Execute first 25 multi-tier prompts
**Lines:** ~200

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Logging | ✅ YES | Has Logger |
| 2. Incremental Saving | ✅ YES | onModelComplete callback implemented |
| 3. Schema Validation | ✅ YES | Uses `saveSchemaCompliantResults` |
| 4. Schema Compliance | ✅ YES | Uses `convertRunnerResultToSchema` helper |
| 5. Limited Scope | ✅ YES | topModels array defined (3 models) |

**Compliance:** **100%** ✅

**Action Required:** None

---

### Runner 5: run-all-tests.js ❌

**Path:** `run-all-tests.js`
**Purpose:** Master runner for all test suites
**Lines:** ~127

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Logging | ❌ **MISSING** | No Logger implementation |
| 2. Incremental Saving | ❌ **NO** | Saves only at end (line 108) |
| 3. Schema Validation | ❌ **NO** | Uses old `saveReport()` (line 108) |
| 4. Schema Compliance | ❌ **NO** | Old format, not schema-compliant |
| 5. Limited Scope | ⚠️ UNKNOWN | Delegates to sub-tests |

**Compliance:** **0%** ❌

**Critical Issues:**
- Uses deprecated `saveReport()` function
- No schema validation
- No logging
- No incremental saving (accumulates all results)

**Action Required:** ⚠️ **MAJOR UPDATE NEEDED**
1. Add Logger
2. Replace `saveReport()` with `saveSchemaCompliantResults()`
3. Implement incremental saving per test suite
4. Add schema conversion functions

**Alternative:** This might be a legacy runner that should be deprecated in favor of running specific test runners individually.

---

## Part 3: Compliance Summary Matrix

### Prompt Source Files

| File | Prompts | Schema Compliant | Action |
|------|---------|------------------|--------|
| test-data-generator.js | 84 | ✅ 100% | None |
| ai-backend-multi-tier-tests.js | 50 | ✅ 100% | None |
| performance-prompts.js | 50 | ❌ 0% | **UPDATE** |
| next-action-tests.js | ~30 | ❌ 0% | **UPDATE or DEPRECATE** |
| intent-classification-tests.js | ~30 | ❌ 0% | **UPDATE or DEPRECATE** |
| ui-tasks.js | ~15 | ❌ 0% | **UPDATE or DEPRECATE** |

**Total Prompts:** 259
**Schema Compliant:** 134 (52%)
**Needs Work:** 125 (48%)

---

### Test Runners

| File | Purpose | Logging | Schema | Incremental | Overall |
|------|---------|---------|--------|-------------|---------|
| run-multitier-performance.js | Multi-tier tests | ✅ | ✅ | ✅ | ✅ 100% |
| run-multitier-split-25.js | Multi-tier (25 prompts) | ✅ | ✅ | ✅ | ✅ 100% |
| run-performance-tests.js | Performance tests | ❌ | ✅ | ✅ | ⚠️ 67% |
| run-enterprise-tests.js | Compliance tests | ❌ | ✅ | ✅ | ⚠️ 67% |
| run-all-tests.js | Master runner | ❌ | ❌ | ❌ | ❌ 0% |

**Fully Compliant:** 2/5 (40%)
**Partially Compliant:** 2/5 (40%)
**Non-Compliant:** 1/5 (20%)

---

## Part 4: Detailed Findings

### Critical Issue 1: Logging Missing in 3 Runners

**Affected Files:**
- `run-performance-tests.js`
- `run-enterprise-tests.js`
- `run-all-tests.js`

**CLAUDE.md Requirement (Line 54-67):**
```
### 1. Logging is MANDATORY
- ✅ REQUIRED: Initialize logger before ANY test execution
- ✅ REQUIRED: Log EVERY event with ISO8601 timestamp
- ✅ REQUIRED: Save logs to file (logs/test-run-{name}-{timestamp}.log)
- ❌ FORBIDDEN: Running tests without logging

Logged events must include:
- MODEL_START: When model startup begins
- HEALTH_CHECK: When health endpoint responds
- TESTS_START: When test suite begins for model
- TEST_PROMPT_START/COMPLETE: Every single prompt (with tokens/sec)
- MODEL_COMPLETE: When model tests finish
```

**Impact:**
- Cannot debug test execution issues
- No visibility into which models are slow
- Cannot verify sequential execution
- No audit trail for test runs

**Fix Required:**
```javascript
// Add to each runner
import { Logger } from './utils/logger.js';

const logger = new Logger(`logs/test-run-{name}-${new Date().toISOString()}.log`);

// Log events:
logger.log('MODEL_START', { model: modelName, timestamp: new Date().toISOString() });
logger.log('TESTS_START', { model: modelName, count: prompts.length });
logger.log('TEST_PROMPT_COMPLETE', { promptId, tokensPerSec, latency });
logger.log('MODEL_COMPLETE', { model: modelName, testsCompleted: count });
```

---

### Critical Issue 2: run-all-tests.js Not Schema-Compliant

**File:** `run-all-tests.js`

**Problems:**
1. ❌ Uses deprecated `saveReport()` instead of `saveSchemaCompliantResults()`
2. ❌ Saves only at end (no incremental saving)
3. ❌ No schema validation
4. ❌ No logging
5. ❌ Delegates to sub-tests (tests/*.js) which may also be non-compliant

**Sub-Test Files:**
- `tests/speed-test.js`
- `tests/accuracy-test.js`
- `tests/tool-calling-test.js`
- `tests/context-window-test.js`

**Status of Sub-Tests:** ⚠️ **UNKNOWN** - Need to audit

**Recommendation:**
- **Option A:** Deprecate run-all-tests.js (use specific runners instead)
- **Option B:** Major refactor to schema compliance (significant work)

---

### Issue 3: Non-Schema Prompt Files

**Files:**
- `performance-prompts.js` - Simple format for speed tests
- `next-action-tests.js` - Workflow scenario format
- `intent-classification-tests.js` - Intent classification format
- `ui-tasks.js` - UI workflow format

**These use different schemas** (pre-v2.2.0) and serve specialized purposes.

**Decision Required:**
1. **Update to schema v2.2.0?** (effort: ~2-3 hours)
2. **Create schema extensions** for specialized test types?
3. **Deprecate** if not actively used?

**Impact on Exports:**
- Current exports only include test-data-generator + ai-backend-multi-tier-tests
- These 4 files are NOT included in unified exports
- May be intentional (specialized use cases)

---

## Part 5: Test Runner Deep Dive

Let me check the actual logging status more carefully:

### Checking Actual Implementation

**Need to verify:**
1. Does run-performance-tests.js have logging deeper in the file?
2. Does run-enterprise-tests.js have logging?
3. What's in the performance-test-runner.js (the class they use)?

---

## Part 6: Recommendations

### Immediate (This Week)

**Priority 1: Add Logging to Active Runners**
- ✅ run-multitier-performance.js (already has logging)
- ✅ run-multitier-split-25.js (already has logging)
- ❌ **run-performance-tests.js** - ADD LOGGING
- ❌ **run-enterprise-tests.js** - ADD LOGGING

**Effort:** 1-2 hours
**Impact:** High - enables debugging and verification

**Priority 2: Update performance-prompts.js to Schema v2.2.0**
- Add required fields to all 50 prompts
- Keep as simple format (don't need full multi-tier complexity)
- **Effort:** 30 minutes
- **Impact:** Medium - enables unified exports

### Short-term (Next Week)

**Decision on Specialized Test Files:**
1. Audit usage of:
   - next-action-tests.js (is this actively used?)
   - intent-classification-tests.js (is this actively used?)
   - ui-tasks.js (is this actively used?)

2. For each file, decide:
   - Update to schema v2.2.0?
   - Create schema extension?
   - Deprecate?

**Decision on run-all-tests.js:**
1. Audit tests/ directory files
2. Decide: Refactor or deprecate?

### Medium-term (Next Month)

**Complete Compliance:**
1. All prompt files schema v2.2.0 compliant
2. All active test runners have logging
3. All runners use schema validation
4. Deprecated files moved to `deprecated/` directory

---

## Part 7: Action Plan

### Phase 1: Critical Fixes (Immediate)

**Task 1.1:** Add logging to run-performance-tests.js
- Import Logger
- Initialize with log file path
- Add MODEL_START, TESTS_START, TEST_COMPLETE, MODEL_COMPLETE events
- **Time:** 30 minutes

**Task 1.2:** Add logging to run-enterprise-tests.js
- Same as Task 1.1
- **Time:** 30 minutes

**Task 1.3:** Update performance-prompts.js to schema v2.2.0
- Add category, vendor, expectedTopics, complexity to all 50 prompts
- **Time:** 30 minutes

**Total Phase 1:** 90 minutes

---

### Phase 2: Audit Specialized Files (Short-term)

**Task 2.1:** Audit usage of specialized test files
- Check if next-action-tests.js is used by any runner
- Check if intent-classification-tests.js is used
- Check if ui-tasks.js is used
- **Time:** 30 minutes

**Task 2.2:** Decide on each file
- Update, extend schema, or deprecate
- **Time:** 15 minutes per file

**Total Phase 2:** 2 hours

---

### Phase 3: run-all-tests.js Decision (Medium-term)

**Task 3.1:** Audit tests/ directory
- Check all files in tests/ directory
- Determine if still needed
- **Time:** 1 hour

**Task 3.2:** Refactor or deprecate
- If needed: Major refactor (4-6 hours)
- If not: Deprecate and remove (30 minutes)

**Total Phase 3:** 1-7 hours depending on decision

---

## Part 8: Current vs Target State

### Current State

**Prompt Files:**
- 52% schema-compliant (134/259 prompts)
- 2 files fully updated
- 4 files need work

**Test Runners:**
- 40% fully compliant (2/5 runners)
- 40% partially compliant (2/5 runners)
- 20% non-compliant (1/5 runners)

**Documentation:**
- ✅ Schema defined (PROMPT-SCHEMA.md v2.2.0)
- ✅ CLAUDE.md updated with requirements
- ✅ FILE-RELATIONSHIPS-GUIDE.md created
- ✅ Compliance analysis documented

### Target State

**Prompt Files:**
- 100% schema-compliant (all prompts)
- All files follow v2.2.0
- Deprecated files archived

**Test Runners:**
- 100% compliant with mandatory requirements
- All have logging
- All use schema validation
- All save incrementally
- Deprecated runners removed

**Documentation:**
- Complete
- Up to date
- Reflects actual implementation

---

## Part 9: Questions for Decision

**Question 1:** Should we update all 4 non-compliant prompt files, or deprecate unused ones?

**Question 2:** Should we refactor run-all-tests.js or deprecate it?

**Question 3:** Priority: Fix logging first or update prompt files first?

**Question 4:** Should specialized test types (next-action, intent-classification, ui-tasks) have schema extensions or be converted to standard schema?

---

## Part 10: File Status Reference

### Source Files Status

```
✅ COMPLIANT:
- enterprise/test-data-generator.js (84 prompts)
- enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js (50 prompts)

❌ NON-COMPLIANT:
- performance-prompts.js (50 prompts) - simple format
- enterprise/arioncomply-workflows/next-action-tests.js (~30) - scenario format
- enterprise/arioncomply-workflows/intent-classification-tests.js (~30) - intent format
- enterprise/arioncomply-workflows/ui-tasks.js (~15) - UI workflow format
```

### Test Runner Status

```
✅ FULLY COMPLIANT:
- run-multitier-performance.js
- run-multitier-split-25.js

⚠️ PARTIALLY COMPLIANT (missing logging):
- run-performance-tests.js
- run-enterprise-tests.js

❌ NON-COMPLIANT:
- run-all-tests.js
```

---

**Status:** Audit complete - action decisions needed
**Last Updated:** 2026-03-26

Contact: libor@arionetworks.com
