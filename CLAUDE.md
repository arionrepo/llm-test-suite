# LLM Test Suite - Project Guidelines

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/CLAUDE.md
**Description:** Project-specific guidelines for LLM test suite development
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## Project Overview

Enterprise LLM testing framework for:
- Compliance knowledge evaluation (29 standards)
- ArionComply application-specific workflows
- Multi-model comparison (10 models via llamacpp-manager)
- Retrieval pipeline diagnostics (what infrastructure to build)

---

## CRITICAL: Always Use Existing Test Prompts (ENFORCED)

**NEVER create new prompts on the fly.**

**When running tests:**
- ✅ Use prompts from: `test-data-generator.js`, `AI_BACKEND_MULTI_TIER_TESTS`, existing test files
- ✅ Select from the 205+ existing prompts
- ✅ If different prompts needed, ASK FIRST

**Never do this:**
- ❌ Create new test prompts during test execution
- ❌ Make up prompts "on the fly"
- ❌ Invent new questions without approval

**Why:**
- We carefully designed 205 prompts with specific metadata
- They have complexity analysis, expected topics, retrieval strategies
- Creating new ones bypasses all that work
- Invalidates comparisons with previous tests

**If you think new prompts are needed:**
1. STOP
2. ASK the user
3. Explain why existing prompts insufficient
4. Get approval before creating anything new

**Rule:** Use what exists. Ask before creating.

---

## MANDATORY: Prompt Schema Compliance v2.3.0 (ENFORCED)

**When creating new test prompts (with user approval), ALL prompts MUST follow the standardized schema.**

**Reference:** `docs/PROMPT-SCHEMA.md` - Official schema specification (v2.3.0)
**Ground Truth:** `ground-truth/reference-urls.json` - Authoritative source URLs

### Required Fields (ALL Prompts)

```javascript
{
  // Core identification
  id: string,                    // Format: {VENDOR}_{STANDARD}_{TYPE}_{PERSONA}_{N}
                                 // Example: "GDPR_FACTUAL_NOVICE_1"
                                 //          "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1"

  // Categorization
  category: string,              // "compliance_knowledge" | "ai_backend_multitier" |
                                 // "arioncomply_workflow" | "tool_calling_test"

  vendor: string | null,         // "Generic" | "ArionComply" | vendor name
                                 // Use "Generic" for vendor-agnostic compliance tests
                                 // Use "ArionComply" for platform-specific tests

  // The test content
  question: string,              // The actual prompt/question (5-500 chars)

  expectedTopics: string[],      // Topics expected in response (2-10 items)
                                 // Use lowercase, be specific

  complexity: enum               // "beginner" | "intermediate" | "advanced" | "expert"
}
```

### Taxonomy Requirements (AT LEAST ONE Required)

**Every prompt MUST use at least ONE of these taxonomies:**

**Taxonomy A: Compliance Testing**
```javascript
{
  standard: string,              // "GDPR", "ISO_27001", "SOC_2", etc. (29 standards)
  knowledgeType: enum,           // "FACTUAL", "RELATIONAL", "PROCEDURAL",
                                 // "EXACT_MATCH", "SYNTHESIS"
  persona: enum                  // "NOVICE", "PRACTITIONER", "MANAGER",
                                 // "AUDITOR", "EXECUTIVE", "DEVELOPER"
}
```

**Taxonomy B: Enterprise Task Testing** (Future)
```javascript
{
  taskDomain: string,            // "customer_service", "document_processing", etc.
  taskType: enum,                // "generate", "analyze", "transform", "classify", "extract"
  businessFunction: string       // "sales", "support", "finance", "hr", "engineering"
}
```

**Taxonomy C: Platform Feature Testing** (Future)
```javascript
{
  platformFeature: string,       // "evidence_management", "assessment_workflows", etc.
  featureAction: enum,           // "upload", "view", "update", "delete", "configure"
  userContext: enum              // "first_time", "power_user", "admin", "auditor"
}
```

**Taxonomy D: Tool Calling Testing** (Planned - Not Yet Implemented)
```javascript
{
  toolCalling: {
    enabled: true,
    toolComplexity: enum,        // "single", "multi_selection", "complex_params",
                                 // "chaining", "parallel"
    toolDomain: enum,            // "data_retrieval", "transformation",
                                 // "external_action", "code_execution", "workflow"
    toolDefinitions: [...],      // OpenAI function calling format
    expectedToolCalls: [...]     // Expected tool calls with parameters
  }
}
```

### ArionComply Multi-Tier Extensions

**For ArionComply-specific multi-tier tests, also include:**

```javascript
{
  vendor: "ArionComply",         // REQUIRED
  category: "ai_backend_multitier",

  tier2Mode: string,             // "assessment" | "framework-gdpr" | "framework-iso27001" |
                                 // "product-value" | "product-features" | "general"

  tier1Content: string,          // TIER 1 base system prompt
  tier2Content: string,          // TIER 2 situational prompt
  tier3Context: string,          // TIER 3 org context (built from orgProfile)

  orgProfile: {                  // Organization profile for TIER 3
    industry: string,
    org_size: string,
    region: string,
    frameworks: string[],
    maturity_level: string,
    profile_completion: number
  },

  conversationHistory: [...],    // Array of prior messages (for mid-conversation tests)
  fullPrompt: string,            // Complete assembled prompt (TIER1+2+3+user)
  estimatedTokens: number        // Total token count
}
```

### Validation Rules

**Before adding any prompt:**

1. ✅ **Check ID uniqueness** - No duplicate IDs across all test files
2. ✅ **Verify taxonomy** - At least ONE taxonomy must be complete
3. ✅ **Validate vendor** - Use "Generic" or specific vendor name (PascalCase)
4. ✅ **Check expectedTopics** - 2-10 topics, lowercase, specific
5. ✅ **Assign complexity** - Match persona expertise and question complexity
6. ✅ **Follow naming** - Use SCREAMING_SNAKE_CASE for standards (GDPR, ISO_27001)

### Examples

**Generic Compliance Test:**
```javascript
{
  id: "GDPR_FACTUAL_NOVICE_1",
  category: "compliance_knowledge",
  vendor: "Generic",
  standard: "GDPR",
  knowledgeType: "FACTUAL",
  persona: "NOVICE",
  question: "What is GDPR?",
  expectedTopics: ["regulation", "privacy", "EU", "data protection"],
  complexity: "beginner"
}
```

**ArionComply Multi-Tier Test:**
```javascript
{
  id: "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
  category: "ai_backend_multitier",
  vendor: "ArionComply",
  standard: "GDPR",
  knowledgeType: "PROCEDURAL",
  persona: "NOVICE",
  tier2Mode: "assessment",
  question: "I want to assess my GDPR compliance",
  tier1Content: TIER1_BASE_SYSTEM,
  tier2Content: TIER2_PROMPTS.ASSESSMENT + "\\n\\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
  tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
  orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
  conversationHistory: [],
  fullPrompt: assembleFullPrompt(...),
  expectedTopics: ["gap assessment", "questionnaire", "controls", "evidence"],
  expectedBehavior: "Should initiate GDPR gap assessment workflow",
  complexity: "beginner",
  estimatedTokens: 2300
}
```

### Ground Truth & Reference Fields (NEW in v2.3.0)

**For better validation beyond keyword matching, add these fields:**

```javascript
{
  // Required fields...
  question: "What is GDPR?",
  expectedTopics: ["regulation", "privacy", "EU"],

  // NEW: Authoritative source (REQUIRED for new prompts)
  expectedReferenceURL: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  referenceSource: "EUR-Lex (Official EU GDPR Text)",
  referenceAccessibility: "free",

  // NEW: Essential facts (REQUIRED for new prompts)
  mustMention: [
    "EU regulation",
    "personal data",
    "effective 2018 OR May 2018"
  ],

  // NEW: Common misconceptions (RECOMMENDED)
  mustNotMention: [
    "only applies to EU companies",
    "GDPR is optional"
  ],

  // NEW: Full reference answer (OPTIONAL but encouraged)
  referenceAnswer: "GDPR (General Data Protection Regulation) is..."
}
```

**How to find reference URLs:**
- See `ground-truth/reference-urls.json` for all standard URLs
- For regulations: Link to official government source
- For ISO standards: Link to ISO.org + provide free alternative
- For article/control-specific: Use URL pattern from reference-urls.json

### Quality Checklist

**Before adding a new prompt:**

- [ ] Question is realistic (something a user would actually ask)
- [ ] Question is unambiguous (clear intent)
- [ ] expectedTopics are specific and verifiable (not too generic like "data", "information")
- [ ] expectedTopics count is 3-5 (ideal range)
- [ ] Complexity matches persona and question type
- [ ] Standard/KnowledgeType/Persona classifications are correct
- [ ] Vendor field is "Generic" or specific vendor name
- [ ] No duplicate or near-duplicate tests exist
- [ ] ID follows naming convention and is unique
- [ ] **NEW:** expectedReferenceURL points to authoritative source
- [ ] **NEW:** mustMention includes 3-5 essential facts
- [ ] **NEW:** mustNotMention includes 1-3 common misconceptions (if applicable)

### Where to Add New Prompts

**Generic Compliance Tests:**
- **File:** `enterprise/test-data-generator.js`
- **Location:** Add to `TEST_TEMPLATES[STANDARD][KNOWLEDGE_TYPE][PERSONA]` array
- **Format:** `{ q: "question", expectedTopics: [...] }`
- **Auto-generated fields:** id, category, vendor, standard, knowledgeType, persona, complexity

**ArionComply Multi-Tier Tests:**
- **File:** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`
- **Location:** Add to `AI_BACKEND_MULTI_TIER_TESTS` object
- **Format:** Complete object with all fields
- **Use helpers:** `buildTier3Context()`, `assembleFullPrompt()`

### Reference Documents

- **`docs/PROMPT-SCHEMA.md`** - Complete schema specification v2.2.0
- **`docs/TAXONOMY-GUIDE.md`** - Standards, personas, knowledge types reference
- **`ENHANCEMENT-PLAN.md`** - Planned infrastructure improvements
- **`PROMPT-SCHEMA-COMPLIANCE-ANALYSIS.md`** - Current compliance status

---

## MANDATORY TESTING STANDARDS (ALL TEST RUNNERS - NO EXCEPTIONS)

**These standards apply to EVERY test run - existing and future. No exceptions.**

### 1. Logging is MANDATORY
- ✅ **REQUIRED:** Initialize logger before ANY test execution
- ✅ **REQUIRED:** Log EVERY event with ISO8601 timestamp
- ✅ **REQUIRED:** Save logs to file (logs/test-run-{name}-{timestamp}.log)
- ❌ **FORBIDDEN:** Running tests without logging
- ❌ **FORBIDDEN:** Logs that are only in-memory (must be persisted to file)

**Logged events must include:**
- MODEL_START: When model startup begins
- HEALTH_CHECK: When health endpoint responds
- TESTS_START: When test suite begins for model
- TEST_PROMPT_START/COMPLETE: Every single prompt (with tokens/sec)
- MODEL_COMPLETE: When model tests finish
- All with timestamps (not durations)

### 2. Incremental Result Saving is MANDATORY
- ✅ **REQUIRED:** Save results immediately when each model completes
- ✅ **REQUIRED:** Do NOT accumulate all results until the very end
- ✅ **REQUIRED:** Each model's results saved to separate file
- ❌ **FORBIDDEN:** Waiting until all tests complete to save
- ❌ **FORBIDDEN:** Losing data if execution is interrupted

**File pattern:** `test-results-{testType}-{model}-{count}tests-{timestamp}.json`

### 3. onModelComplete Callback is MANDATORY
- ✅ **REQUIRED:** Provide onModelComplete callback to runPerformanceTests()
- ✅ **REQUIRED:** Implement per-model result saving in callback
- ❌ **FORBIDDEN:** Making callback optional (code will fail if missing)
- ❌ **FORBIDDEN:** Ignoring callback errors (must handle gracefully)

### 4. Schema Validation is MANDATORY
- ✅ **REQUIRED:** Validate all results before saving
- ✅ **REQUIRED:** Use saveSchemaCompliantResults() for all saves
- ✅ **REQUIRED:** Fail if validation fails (don't silently continue)
- ❌ **FORBIDDEN:** Saving invalid results
- ❌ **FORBIDDEN:** Skipping validation to "speed things up"

### 5. Test Scope is LIMITED (By Design)
- ✅ **STANDARD:** Run only FIRST 3 models (smollm3, phi3, mistral)
- ✅ **REASON:** Prevents multi-hour test runs, enables rapid iteration
- ✅ **REASON:** Maintains statistical significance with manageable time
- ❌ **FORBIDDEN:** Running all 10 models without explicit approval
- ❌ **FORBIDDEN:** Running arbitrary model subsets without consistency

### Why These Standards Are Non-Negotiable

**Without logging & incremental saving:**
- 🚨 Blind spots during execution - can't see what's slow
- 🚨 Data loss if execution fails mid-run
- 🚨 No visibility into individual model performance
- 🚨 Can't analyze trends (is model degrading over time?)
- 🚨 Unable to debug issues (no timeline of events)

**Without schema validation:**
- 🚨 Invalid data gets saved and analyzed
- 🚨 Inconsistent results format across test runs
- 🚨 Can't compare metrics between test runs
- 🚨 Broken downstream analysis pipelines

**Without incremental saving:**
- 🚨 All test data lost if execution crashes
- 🚨 Can't see results in real-time
- 🚨 No checkpointing for recovery
- 🚨 Memory accumulation for massive test runs

### Enforcement

**These standards are ENFORCED IN CODE:**
- `runPerformanceTests()` will **FAIL** if logger not initialized
- `runPerformanceTests()` will **FAIL** if callback not provided
- `saveSchemaCompliantResults()` will **FAIL** if validation fails
- Tests will **ONLY** run with exactly 3 models by default

**No workarounds. No exceptions. No "just this once."**

---

## CRITICAL: Sequential Model Testing Rules

### The Problem We Solve

**Resource Constraint:** Cannot load all 10 models simultaneously
- Models range from 1B to 32B parameters
- Total potential RAM: 100GB+
- Available RAM: ~64GB (M4 Max)
- **Must run ONE model at a time**

### What "Sequential" Really Means

**NOT acceptable:**
- Models overlapping during start/stop transitions
- Starting next model while previous still shutting down
- Assuming stop worked without verification

**IS required:**
- Complete stop verification before next start
- Endpoint must be unreachable (connection refused)
- Memory cleanup time between models
- Only 1 llama-server process at ANY time

### Stop Verification Requirements (MANDATORY)

**Never trust stop commands without testing:**

```javascript
// ❌ WRONG - Assumes success
await execAsync('llamacpp-manager stop model');
await sleep(2000);
return true; // Assumed success!

// ✅ CORRECT - Verifies with endpoint test
await execAsync('llamacpp-manager stop model');

// Try to connect - MUST fail when stopped
for (let i = 0; i < 15; i++) {
    try {
        await fetch(`http://127.0.0.1:${port}/health`);
        // Still responding! Wait more...
        await sleep(2000);
    } catch (error) {
        // Connection refused = VERIFIED STOPPED ✓
        break;
    }
}

// Wait for memory cleanup
await sleep(10000);
```

### Start Verification Requirements (MANDATORY)

**Never assume model is ready without test query:**

```javascript
// ❌ WRONG - Just checks health
const health = await fetch('http://127.0.0.1:8081/health');
if (health.ok) return true; // Might not actually work!

// ✅ CORRECT - Sends actual test message
const health = await fetch('http://127.0.0.1:8081/health');
const data = await health.json();

if (data.status === 'ok') {
    // SEND TEST QUERY to verify functional
    const test = await fetch('http://127.0.0.1:8081/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
            messages: [{role: 'user', content: 'test'}],
            max_tokens: 5
        })
    });

    const result = await test.json();

    // Verify valid response structure
    if (result.choices && result.choices[0]) {
        return true; // VERIFIED FUNCTIONAL ✓
    }
}
```

### Timeouts Based on Model Size

**Never use fixed timeouts:**

```javascript
// ❌ WRONG - Same timeout for all
const timeout = 60000; // Too short for large models

// ✅ CORRECT - Size-based timeouts
const size = parseInt(modelInfo.size); // "17B" → 17
const timeout = size >= 17 ? 300000 :  // 5 min for 17B+
               size >= 10 ? 180000 :  // 3 min for 10-16B
               120000;                // 2 min for smaller
```

---

## Prompt Complexity Requirements

### Current Gap

**Our current tests:** Simple single-message prompts
```javascript
messages: [{role: 'user', content: 'What is GDPR?'}]
```

**ArionComply's actual prompts:** Multi-tier system
```javascript
messages: [
    {role: 'system', content: TIER1_base_system},      // Core identity
    {role: 'system', content: TIER2_framework_gdpr},   // GDPR expertise
    {role: 'system', content: TIER3_org_context},      // Org-specific
    {role: 'user', content: 'What are our GDPR compliance gaps?'}
]
// Plus RAG context inserted between system and user messages
```

### Requirements for Realistic Testing

**Must test prompts that match production complexity:**

1. **Multi-tier prompt structure**
   - TIER 1: Base system prompt (~500-1000 tokens)
   - TIER 2: Framework/mode specific (~300-800 tokens)
   - TIER 3: Organization context with variables (~200-400 tokens)
   - User query (~10-100 tokens)
   - **Total input: 1000-2300 tokens** (not the 10-20 we're testing now)

2. **Variable substitution**
   - Test with actual org context variables
   - Industry, size, region, frameworks, maturity
   - Ensure variables affect response appropriately

3. **RAG context simulation**
   - Include retrieved document snippets
   - Test with 1k, 3k, 5k tokens of context
   - Measure how context affects accuracy

4. **Intent-based prompt selection**
   - Test if correct TIER 2 prompt would be selected
   - Verify intent classification accuracy

### Test Categories Needed

**Current:** 52 compliance tests (mostly simple factual)

**Missing:**
- **Multi-tier prompts** (0 tests) - Need 20-30
- **Long context prompts** (0 tests) - Need 15-20
- **RAG-enhanced prompts** (0 tests) - Need 20-25
- **Variable substitution** (0 tests) - Need 10-15

**Target:** 120-150 tests total, with realistic complexity distribution

---

## CRITICAL: Unified Test Result Schema (ENFORCED)

**ALL test executions MUST follow the unified test result schema.**

**See:** `TEST-RESULT-SCHEMA.md` - Complete reference for comprehensive data capture

### Philosophy: Capture Everything, Focus Selectively

Every test run captures:
1. ✅ **WHAT WAS SENT** - Complete input with all context/tiers
2. ✅ **WHAT WAS RECEIVED** - Complete response text
3. ✅ **HOW IT PERFORMED** - All timing and throughput metrics
4. ✅ **HOW IT PERFORMED QUALITATIVELY** - All quality and accuracy metrics
5. ✅ **WHERE IT WAS RUN** - Environment, models, configuration
6. ✅ **WHEN IT WAS RUN** - Timestamps and execution metadata

**Then different test runs can focus analysis on different aspects** (performance vs accuracy), but underlying data ALWAYS contains everything.

### Mandatory Fields (ALWAYS Required)

**These MUST be in every result, no exceptions:**

```javascript
{
  "metadata": {
    "timestamp": "2026-03-26T10:30:45.123Z",  // REQUIRED
    "testRunId": "test-run-6-multitier-...",  // REQUIRED
    "runNumber": 6                             // REQUIRED
  },
  "input": {
    "promptId": "ARION_MULTITIER_...",        // REQUIRED
    "fullPromptText": "[TIER 1]...[TIER 2]... // REQUIRED - COMPLETE text
    "fullPromptTokens": 2585                   // REQUIRED
  },
  "output": {
    "response": "The General Data Protection...", // REQUIRED - COMPLETE response
    "responseTokens": 187                      // REQUIRED
  },
  "timing": {
    "totalMs": 5234,                           // REQUIRED
    "tokensPerSecond": 38.87                   // REQUIRED
  },
  "execution": {
    "success": true,                           // REQUIRED
    "responseValidated": true                  // REQUIRED - must verify response not empty
  }
}
```

### Optional Fields (Context-Dependent)

Include when applicable:
- **Quality metrics** - when evaluating accuracy/relevance
- **Resource metrics** - when measuring system impact
- **Compliance analysis** - when testing standards
- **Topic analysis** - when evaluating knowledge coverage

### Test Runner Implementation Checklist

**All test runners MUST:**

1. ✅ Capture COMPLETE input prompt (all tiers, all context)
2. ✅ Capture COMPLETE output response (not truncated)
3. ✅ Include model configuration (temperature, max_tokens, etc.)
4. ✅ Include timing metrics (total, prompt processing, generation)
5. ✅ Include resource usage (CPU, memory, GPU)
6. ✅ Validate response is not null/empty before saving
7. ✅ Validate against schema before writing file
8. ✅ Write to dated directory: `reports/{type}/{YYYY-MM-DD}/`
9. ✅ Include testRunId and timestamp in filename
10. ✅ Log any validation failures clearly

**If ANY mandatory field is missing or empty:**
- ❌ Test result is INVALID
- ❌ Mark result as failed in log
- ❌ DO NOT include in analysis
- ❌ Must re-run test to get valid data

### Viewer Integration Requirement

**The prompt viewer MUST show (for each prompt):**
1. Complete prompt text (fullPromptText with all tiers)
2. LLM response that was generated for that prompt
3. Performance metrics (tokens/sec, latency, timing breakdown)
4. Quality metrics (if available - accuracy, completeness, etc.)
5. Resource metrics (CPU, memory, GPU usage)
6. Execution metadata (model, timestamp, status)

---

## Test Result Validity Criteria

**A test run is only valid if:**

1. ✅ Only 1 model running at any time (verified via process count)
2. ✅ All stop verifications passed (endpoint unreachable)
3. ✅ All start verifications passed (test query succeeded)
4. ✅ **LLM responses captured for ALL test prompts** (not null, not empty)
5. ✅ Response text stored in result file alongside metrics
6. ✅ No verification failures in audit log
7. ✅ Memory stable (not growing unbounded)

**If ANY criterion fails → results are INVALID, must re-run**

**ESPECIALLY:** If response capture fails for ANY prompt, the entire test run is invalid

### Manual Monitoring During Tests

**Always monitor during pilot tests:**

```bash
# Terminal 1: Run test
node run-enterprise-tests.js pilot

# Terminal 2: Process count (should always be 0 or 1)
watch -n 1 'ps aux | grep llama-server | grep -v grep | wc -l'

# Terminal 3: Memory usage
watch -n 5 'top -l 1 | grep PhysMem'

# Terminal 4: Port listeners (should never show >1)
watch -n 2 'lsof -i :8081,:8082 | grep LISTEN | wc -l'
```

---

## Git Commit Standards

**Author:** Libor Ballaty <libor@arionetworks.com>
**End with:** Questions: libor@arionetworks.com
**No AI attribution**

---

## Questions Before Proceeding

**Always ask when:**
- Test approach might not match production reality
- Resource implications unclear
- Verification strategy uncertain
- Results might be invalid

**Never assume - always verify through actual testing.**

---

Contact: libor@arionetworks.com
