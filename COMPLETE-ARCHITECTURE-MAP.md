# LLM Test Suite - Complete Architecture & Workflow Map

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/COMPLETE-ARCHITECTURE-MAP.md
**Description:** Comprehensive technical architecture, data flows, and system design documentation
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-27
**Last Updated:** 2026-03-27

---

## EXECUTIVE SUMMARY

The LLM Test Suite is a comprehensive enterprise testing framework with clear separation between:
1. **Prompt Definition Layer** - Where tests are defined (source files)
2. **Test Execution Layer** - Where tests run against models (test runners)
3. **Evaluation Layer** - Where responses are rated and scored
4. **Visualization & Reporting Layer** - Where results are presented to users

Key insight: **172 test prompts flow through multiple test runners, each producing results that feed into different evaluation/visualization paths.**

---

## ARCHITECTURE LAYERS

### Layer 1: Prompt Definition (Source of Truth)

**Two Primary Editable Source Files:**

1. **Generic Compliance Prompts** (`enterprise/test-data-generator.js`)
   - 84 prompts across 29 standards
   - Organized by Standard → Knowledge Type → Persona
   - Function: `generateAllTests()` auto-populates fields
   
2. **ArionComply Multi-Tier Prompts** (`enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`)
   - 50 prompts with TIER1 + TIER2 + TIER3 structure
   - 6 tier2 modes, 5 org profiles
   - ~2300 tokens per prompt

**Supporting Configuration Files:**
- `enterprise/compliance-standards.js` - 29 standard definitions
- `enterprise/user-personas.js` - 6 persona definitions
- `enterprise/prompts/tier1-base-system.js` - TIER1 (1875 tokens)
- `enterprise/prompts/tier2-prompts.js` - TIER2 (400 tokens)
- `enterprise/prompts/org-profiles.js` - TIER3 templates (300 tokens)

**Schema Definitions:**
- `docs/PROMPT-SCHEMA.md` - INPUT schema v2.2.0
- `TEST-RESULT-SCHEMA.md` - OUTPUT schema

---

### Layer 2: Test Execution (Runners)

**Three Main Test Runner Scripts:**

1. **Performance Test Runner** (`run-performance-tests.js`)
   - Inputs: 5 complexity levels × 10 prompts = 50 prompts
   - Measures: Tokens/sec, latency, throughput
   - Output: `reports/performance/{date}/test-results-run-N-*.json`

2. **Enterprise Compliance Runner** (`run-enterprise-tests.js`)
   - Inputs: 84 generic compliance prompts
   - Modes: pilot (10), quick (25), standard (50), comprehensive (84)
   - Output: `reports/compliance/{date}/test-results-enterprise-*.json`

3. **Multi-Tier Runner** (`run-multitier-performance.js`)
   - Inputs: 50 ArionComply multi-tier prompts
   - Models: First 4 (smollm3, phi3, mistral, llama-3.1-8b)
   - Output: `reports/multitier/{date}/test-results-multitier-*.json`

**Supporting Infrastructure:**
- `performance-test-runner.js` - Base runner class
- `utils/llamacpp-manager-client.js` - Model lifecycle management
- `utils/logger.js` - Mandatory event logging
- `utils/test-helpers.js` - Schema compliance & file I/O
- `utils/test-result-validator.js` - Result validation

**MANDATORY Testing Standards:**
1. Logger initialization before any test
2. Per-prompt logging with ISO8601 timestamps
3. Incremental result saving per model (not at end)
4. onModelComplete callback required
5. Schema-compliant format via `saveSchemaCompliantResults()`
6. LLM response capture for ALL prompts (null check)
7. Sequential model execution (only 1 at a time)

---

### Layer 3: Exports & Snapshots (Read-Only)

**Generation Script:** `export-prompts.js`

**Outputs (4 formats of same 134 prompts):**
1. `unified-prompt-database.json` - Array of all prompts
2. `reports/prompts/compliance-prompts.csv` - Spreadsheet format
3. `reports/prompts/compliance-prompts.md` - Human-readable docs
4. `reports/prompts/prompt-viewer.html` - Interactive browser viewer

**Purpose:** Snapshots for viewing/analysis, NOT for testing (test runners read source files directly)

---

### Layer 4: Evaluation & Analysis

**Evaluation Scripts:**
- `auto-evaluate.js` - Claude/GPT-4 as judge
- `expert-evaluate-150.js` - Manual review samples
- `evaluate-responses.js`, `evaluate-all-150-responses.js` - Aggregate evaluation
- `identify-best-worst-responses.js` - Outlier detection
- `create-evaluation-sample.js` - Sample extraction

**Analysis Scripts:**
- `analyze-performance.js` - Timing/throughput metrics
- `comparative-analysis.js` - Model comparison
- `utils/analysis-loader.js`, `analysis-filter.js`, `analysis-aggregator.js` - Helpers

**Outputs:**
- `ratings/claude-ratings-*.json` - Detailed evaluations
- `ratings/best-25-responses.json` - Top performers
- `ratings/FINAL-EVALUATION-SUMMARY.md` - Human analysis
- `reports/performance-analysis.json` - Metrics

---

### Layer 5: Visualization & Reporting

**Backend API:**
- `viewer-server.js` - Express.js on port 7500
- Endpoint: `GET /api/files` - Discover test result & rating files
- File discovery: Glob patterns for `reports/**/*.json` and `ratings/*.json`

**Frontend Interfaces:**
1. `reports/prompts/prompt-viewer.html` - Browse prompts
   - Features: Filter by standard/persona/complexity, search, stats
   
2. `viewer/response-viewer.html` - Browse & rate results
   - Features: Load results, view full context, rate, compare models
   
3. `reports/performance-visualizations.html` - Charts
   - Tokens/sec, latency curves, comparative performance

**Markdown Reports:**
- `reports/COMPREHENSIVE-QUALITY-EVALUATION.md`
- `ratings/FINAL-EVALUATION-SUMMARY.md`
- `ratings/claude-subjective-evaluation-report.md`

---

## DATA FLOW DIAGRAMS

### Flow 1: Adding a Prompt to Test Suite

```
EDIT SOURCE FILE
enterprise/test-data-generator.js (generic) OR
enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js (ArionComply)
    ↓
[OPTIONAL] REGENERATE EXPORTS
node export-prompts.js
└─ Updates: all-prompts-comprehensive.json, csv, markdown, HTML viewer
    ↓
[OPTIONAL] VIEW IN BROWSER
open reports/prompts/prompt-viewer.html
    ↓
RUN TESTS
node run-enterprise-tests.js comprehensive (or quick for faster iteration)
└─ Loads source file directly, not exports
└─ Sends new prompt to all models
└─ Captures responses
└─ Saves to reports/compliance/{date}/
    ↓
EVALUATE RESULTS
node auto-evaluate.js
└─ Scores responses across quality dimensions
└─ Saves to ratings/claude-ratings-*.json
```

### Flow 2: Test Execution Pipeline

```
TEST RUNNER STARTS
├─ Initialize logger → logs/test-run-{name}-{timestamp}.log
├─ Load prompts from SOURCE FILES (not exports)
├─ Initialize models array (default: first 3 models)
│
FOR EACH MODEL:
├─ Start model via llamacpp-manager
├─ Verify health (test endpoint until responsive)
│
  FOR EACH PROMPT:
  ├─ Log: TEST_PROMPT_START
  ├─ Send prompt to LLM
  ├─ Capture response (MANDATORY - null check)
  ├─ Measure: totalMs, promptTokens, completionTokens, tokensPerSec
  ├─ Log: TEST_PROMPT_COMPLETE {metric values}
  └─ Collect result object
│
├─ Log: MODEL_COMPLETE
├─ onModelComplete(modelName, results) callback invoked
│  ├─ Transform to schema-compliant format
│  ├─ Validate against TEST-RESULT-SCHEMA
│  └─ Save to reports/{type}/{date}/test-results-{model}-*.json
│
└─ Stop model, wait for cleanup
    ↓
ALL MODELS COMPLETE
├─ Log: ALL_COMPLETE
├─ Print summary (models, prompts, total executions)
└─ Exit with status 0
```

### Flow 3: Result Analysis Pipeline

```
TEST RESULTS SAVED
reports/compliance/2026-03-24/*.json
    ↓
EXTRACT RESPONSES
identify-best-worst-responses.js
└─ Reads test results
└─ Extracts all responses to ratings/extracted-responses-for-evaluation.json
    ↓
AUTO-EVALUATE
auto-evaluate.js
├─ Load extracted-responses-for-evaluation.json
├─ For each response:
│  ├─ Extract org context from prompt
│  ├─ Detect issues: hallucinations, fabricated data, <think> tags
│  ├─ Detect citations: Article numbers, control references
│  ├─ Score: relevance, completeness, accuracy, coherence
│  └─ Collect evaluation
└─ Save to ratings/claude-ratings-2026-03-26.json
    ↓
ANALYZE PERFORMANCE
analyze-performance.js
├─ Load test results
├─ Calculate: tokens/sec by model/complexity, latency, throughput
├─ Generate: reports/performance-analysis.json, performance-data.csv
├─ Identify: slowest prompts, fastest models, outliers
└─ Save to reports/
    ↓
HUMAN REVIEW
Manual examination of:
├─ ratings/FINAL-EVALUATION-SUMMARY.md
├─ ratings/best-25-responses.json
├─ ratings/claude-subjective-evaluation-report.md
└─ Conclusions & recommendations documented
```

### Flow 4: Viewer Access

```
USER STARTS BACKEND
node viewer-server.js
└─ Listens on port 7500
└─ Serves static files (HTML, CSS, JS)
    ↓
USER OPENS FRONTEND
open http://localhost:7500/viewer/response-viewer.html
(or ./viewer/response-viewer.html locally)
    ↓
FRONTEND LOADS AVAILABLE FILES
fetch('http://localhost:7500/api/files')
├─ Server globs: reports/performance/**/*.json
├─ Server globs: reports/*.json
├─ Server globs: ratings/*.json
└─ Returns: Array of files with timestamps, grouped by directory
    ↓
USER SELECTS FILE FROM DROPDOWN
Dynamically loads selected JSON
├─ fetch(/reports/compliance/2026-03-24/test-results-*.json) OR
└─ fetch(/ratings/claude-ratings-2026-03-26.json)
    ↓
FRONTEND DISPLAYS DATA
├─ Load test results into table
├─ Show: Prompt, Response, Timing, Quality metrics
├─ Provide: Filter controls (model, standard, persona)
├─ Provide: Search box (keyword matching)
├─ Provide: Rating interface (for manual evaluation)
├─ Provide: Comparison view (same prompt, different models)
└─ Allow: Export to CSV/JSON
    ↓
USER INTERACTION
├─ Filter by model: "Show only Mistral results"
├─ Filter by standard: "Show only GDPR"
├─ View full prompt (with TIER1+2+3 if multi-tier)
├─ View response text (complete, not truncated)
├─ See: tokens/sec, latency, response length
├─ Rate: Accuracy, relevance, completeness
└─ Compare: Same prompt across phi3, mistral, llama
```

---

## DIRECTORY STRUCTURE

```
llm-test-suite/
│
├── SOURCE FILES (EDIT THESE)
│   ├── enterprise/
│   │   ├── test-data-generator.js              [84 generic prompts] ⭐
│   │   ├── compliance-standards.js             [29 standard definitions]
│   │   ├── user-personas.js                    [6 persona definitions]
│   │   ├── company-profiles.js                 [8 company type profiles]
│   │   ├── arioncomply-workflows/
│   │   │   ├── ai-backend-multi-tier-tests.js  [50 multi-tier prompts] ⭐
│   │   │   ├── intent-classification-tests.js  [Intent tests]
│   │   │   ├── next-action-tests.js            [Navigation tests]
│   │   │   └── prompt-schema-aligned.js        [Schema validation]
│   │   └── prompts/
│   │       ├── tier1-base-system.js            [TIER1: 1875 tokens]
│   │       ├── tier2-prompts.js                [TIER2: 6 modes]
│   │       ├── org-profiles.js                 [TIER3: 5 templates]
│   │       └── helpers.js
│   └── performance-prompts.js                  [50 speed test prompts]
│
├── TEST RUNNERS (EXECUTE TESTS)
│   ├── run-performance-tests.js
│   ├── run-enterprise-tests.js
│   ├── run-multitier-performance.js
│   ├── run-all-tests.js
│   ├── run-multitier-split-25.js
│   └── run-validation-test.js
│
├── UTILITIES
│   ├── performance-test-runner.js              [Base runner class]
│   └── utils/
│       ├── llm-client.js
│       ├── test-helpers.js
│       ├── test-result-validator.js
│       ├── prompt-complexity-analyzer.js
│       ├── llamacpp-manager-client.js
│       ├── logger.js
│       ├── analysis-loader.js
│       ├── analysis-filter.js
│       ├── analysis-aggregator.js
│       ├── schema-transformer.js
│       └── cloud-llm-judge.js
│
├── EXPORT SCRIPTS (GENERATE SNAPSHOTS)
│   ├── export-prompts.js
│   ├── view-test-prompts.js
│   └── prompt-viewer.js
│
├── EVALUATION SCRIPTS (RATE RESPONSES)
│   ├── auto-evaluate.js
│   ├── expert-evaluate-150.js
│   ├── evaluate-responses.js
│   ├── evaluate-all-150-responses.js
│   ├── identify-best-worst-responses.js
│   ├── create-evaluation-sample.js
│   ├── analyze-performance.js
│   └── comparative-analysis.js
│
├── BACKEND & FRONTEND (VISUALIZATION)
│   ├── viewer-server.js                        [Express API :7500] ⭐
│   └── viewer/
│       └── response-viewer.html                [Rating interface] ⭐
│
├── REPORTS (GENERATED OUTPUTS)
│   ├── prompts/
│   │   ├── all-prompts-comprehensive.json      [Export: JSON]
│   │   ├── compliance-prompts.csv              [Export: Spreadsheet]
│   │   ├── compliance-prompts.md               [Export: Markdown]
│   │   ├── arioncomply-prompts.md              [Export: Markdown]
│   │   ├── prompt-viewer.html                  [Export: Interactive]
│   │   ├── generate-viewer.js
│   │   └── open-viewer.sh
│   │
│   ├── performance/                            [Performance test results]
│   │   ├── {date}/
│   │   │   ├── test-results-run-1-tiny-*.json
│   │   │   ├── test-results-run-2-short-*.json
│   │   │   ├── test-results-run-3-medium-*.json
│   │   │   ├── test-results-run-4-long-*.json
│   │   │   └── test-results-run-5-verylong-*.json
│   │   │
│   │   ├── performance-run-1.json              [Aggregate from run]
│   │   ├── performance-aggregate.json          [Summary of all runs]
│   │   ├── performance-analysis.json           [Analysis output]
│   │   ├── performance-data.csv                [CSV metrics]
│   │   └── performance-visualizations.html     [Charts]
│   │
│   ├── compliance/                             [Compliance test results]
│   │   ├── {date}/
│   │   │   └── test-results-enterprise-*.json
│   │   │
│   │   └── test-results-enterprise-comprehensive-*.json
│   │
│   ├── multitier/                              [Multi-tier test results]
│   │   ├── {date}/
│   │   │   └── test-results-multitier-*.json
│   │   │
│   │   └── performance-run-6-multitier.json
│   │
│   └── prompts/summary.json
│
├── LOGS (EXECUTION LOGS)
│   └── logs/
│       ├── test-run-performance-*.log
│       ├── test-run-multitier-*.log
│       ├── test-run-split-25-*.log
│       └── test-run-validation-*.log
│
├── RATINGS (EVALUATION OUTPUTS)
│   └── ratings/
│       ├── README.md
│       ├── responses-for-evaluation-*.json           [Extracted responses]
│       ├── extracted-responses-for-evaluation.json   [Full response set]
│       ├── claude-ratings-*.json                     [Auto-evaluated]
│       ├── all-scored-responses.json                 [All with scores]
│       ├── best-25-responses.json                    [Top performers]
│       ├── evaluation-sample-*.json                  [Sample for review]
│       ├── expert-evaluation-sample-*.json           [Expert reviews]
│       ├── claude-subjective-*.json                  [Subjective analysis]
│       ├── EVALUATION-SUMMARY-*.md
│       ├── FINAL-EVALUATION-SUMMARY.md
│       └── claude-subjective-evaluation-report.md
│
├── DOCUMENTATION
│   ├── CLAUDE.md                                [Project standards]
│   ├── FILE-RELATIONSHIPS-GUIDE.md              [File organization]
│   ├── COMPLETE-ARCHITECTURE-MAP.md             [This file]
│   ├── TEST-RESULT-SCHEMA.md                    [OUTPUT schema]
│   ├── PROMPT-SCHEMA-COMPLIANCE-ANALYSIS.md
│   ├── PROMPT-COMPLEXITY-GAP-ANALYSIS.md
│   ├── ENHANCEMENT-PLAN.md
│   ├── docs/
│   │   ├── PROMPT-SCHEMA.md                     [INPUT schema v2.2.0]
│   │   ├── TAXONOMY-GUIDE.md
│   │   ├── SCHEMA-USAGE-GUIDE.md
│   │   ├── SCHEMA-IMPLEMENTATION-GUIDE.md
│   │   ├── SCHEMA-QUICK-REFERENCE.md
│   │   ├── README-UNIFIED-SCHEMA.md
│   │   ├── ANALYSIS-API-GUIDE.md
│   │   └── DESIGN.md
│   └── README.md
│
├── PROJECT CONFIG
│   ├── package.json
│   ├── config.js
│   ├── .claude/settings.local.json
│   └── unified-prompt-database.json             [Export: All prompts]
│
└── node_modules/
```

---

## CURRENT STATE (As of 2026-03-27)

### Prompt Coverage
- **Generic Compliance:** 84 prompts (29 standards × 5 knowledge types × 6 personas)
- **ArionComply Multi-Tier:** 50 prompts (6 tier2 modes × ~8 prompts each)
- **Performance Tests:** 50 prompts (5 complexity levels × 10 each)
- **Other:** ~30 prompts (schema, intent, navigation)
- **TOTAL:** 214+ prompts

### Test Results Collected
- **Performance runs:** 5 runs × 10 models = 50 executions (reports/performance-run-*.json)
- **Compliance runs:** Latest comprehensive run (1.1MB test-results-enterprise-*.json)
- **Multi-tier runs:** 50 prompts × 4 models (reports/performance-run-6-multitier.json)

### Evaluation Status
- **Auto-evaluated:** 118KB claude-ratings JSON
- **Best performers:** 152KB best-25-responses JSON
- **All scored:** 924KB all-scored-responses JSON
- **Extracted:** 885KB extracted-responses-for-evaluation JSON
- **Final summary:** FINAL-EVALUATION-SUMMARY.md (human-written)

---

## KEY CONCEPTS

### "Build Prompts" = Edit Source Files
When you "build" or "add" prompts, you're editing:
- `enterprise/test-data-generator.js` (generic), OR
- `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` (ArionComply)

NOT running a build script or generator.

### "Regenerate Exports" = Update Snapshots
After editing source files, optionally run:
```bash
node export-prompts.js
```
This creates read-only snapshots (JSON, CSV, Markdown, HTML) for viewing/documentation.

### "Test Results" vs "Evaluations"
- **Test Results:** What model produced (response, timing, metrics)
  - Location: `reports/compliance/`, `reports/performance/`, `reports/multitier/`
  - Created by: Test runners

- **Evaluations:** How good the responses were (scores, quality metrics, judgments)
  - Location: `ratings/`
  - Created by: Evaluation scripts (auto-evaluate.js, expert-evaluate-150.js, etc.)

### "Mandatory Testing Standards"
These are ENFORCED (code will fail without them):
1. Logger initialization (test fails if logger not created)
2. Per-prompt logging with timestamps (no silent failures)
3. Incremental saving per model (via onModelComplete callback)
4. Schema validation before save (invalid results rejected)
5. LLM response capture validation (null/empty responses cause failure)
6. Sequential model execution (no overlapping model processes)

---

## IDENTIFIED GAPS & PAIN POINTS

1. **Fragmented Test Runners:** Duplicate logic across 3+ runners (logging, validation, saving)
2. **Stale Exports:** Exports don't auto-regenerate when source files edited
3. **Incomplete Linkage:** Some test results don't store complete fullPromptText
4. **Scattered Evaluation:** 25+ JSON files in ratings/ directory with overlapping data
5. **Limited Backend API:** Viewer-server only has `/api/files`, no data processing
6. **No Monitoring:** Manual test execution, no automated regression detection
7. **Manual Comparison:** Hard to compare same prompt across models
8. **Poor Documentation:** Test result metrics not explained, no interpretation guide

---

## QUICK REFERENCE

### Files to Edit When Adding Prompts
- `enterprise/test-data-generator.js` - Generic compliance
- `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` - ArionComply

### Test Runners (Run These)
- `node run-performance-tests.js` - Speed tests
- `node run-enterprise-tests.js {pilot|quick|standard|comprehensive}` - Compliance
- `node run-multitier-performance.js` - Multi-tier tests

### Exports (Generate These)
- `node export-prompts.js` - Creates JSON/CSV/MD/HTML snapshots

### Evaluation (Run These)
- `node auto-evaluate.js` - Auto-score responses
- `node analyze-performance.js` - Analyze timing metrics

### Visualization (Start This)
- `node viewer-server.js` - Start API server (port 7500)
- Open `viewer/response-viewer.html` in browser (or http://localhost:7500/)

---

**Status:** Complete architectural overview with all components mapped

Contact: libor@arionetworks.com

