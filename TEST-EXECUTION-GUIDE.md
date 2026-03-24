# LLM Test Suite - Execution Guide

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/TEST-EXECUTION-GUIDE.md
**Description:** Complete guide for running tests - prerequisites, inputs, commands, interpretation
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-24

---

## Quick Start (Human or Agent)

### Minimal Prerequisites

1. **Node.js 18+** installed
2. **llamacpp-manager** installed and configured
3. **At least one model running** on its designated port

**Check prerequisites:**
```bash
node --version          # Should show v18.x or higher
llamacpp-manager status # Should show at least one model running
```

---

## Running Basic Tests

### Test a Single Running Model

**Use case:** Quick validation of currently running model

**Prerequisites:**
- One model running (check with `llamacpp-manager status`)

**Command:**
```bash
cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite

# Run all basic tests on current model (default: port 8088)
npm test
```

**What it tests:**
- Speed (latency, throughput, concurrent requests)
- Accuracy (instruction following, factual knowledge, reasoning)
- Tool calling (function selection, parameter accuracy)
- Context window (multi-turn conversations, retention)

**Duration:** ~2-3 minutes

**Output:** Console + JSON report in `reports/`

---

## Running Enterprise Tests

### 1. Pilot Test (Quickest Validation)

**Use case:** Quick validation before comprehensive testing

**Prerequisites:**
- 2 models can be started (default: llama-4-scout-17b, hermes-3-llama-8b)
- llamacpp-manager can start/stop models

**Command:**
```bash
npm run enterprise:pilot
```

**What it does:**
1. Starts llama-4-scout-17b (if not running)
2. Runs 20 compliance tests
3. Starts hermes-3-llama-8b
4. Runs same 20 tests
5. Generates comparison and diagnostics

**Tests:** 20 prompts × 2 models = 40 test executions

**Duration:** ~5 minutes

**Output:**
- Console output with real-time progress
- JSON report: `reports/test-results-enterprise-pilot-TIMESTAMP.json`
- **Diagnostics showing which retrieval infrastructure to build**

**What you get:**
```
📊 BASELINE LLM PERFORMANCE (Without Any Retrieval)
   ├─ Model comparison (which model performs better)
   ├─ Knowledge type gaps (Factual: 71%, Procedural: 12%, etc.)
   └─ Retrieval recommendations (Build knowledge graph, RAG, etc.)
```

---

### 2. Quick Test (Broader Coverage)

**Prerequisites:**
- 3 models can be started

**Command:**
```bash
npm run enterprise:quick
```

**Default models:** llama-4-scout-17b, hermes-3-llama-8b, qwen2.5-32b

**Tests:** 50 prompts × 3 models = 150 executions

**Duration:** ~15 minutes

**Output:** JSON report with extended diagnostics

---

### 3. Standard Test (Production-Level)

**Prerequisites:**
- 5 models can be started
- ~1 hour available

**Command:**
```bash
npm run enterprise:standard
```

**Default models:** llama-4-scout-17b, hermes-3-llama-8b, qwen2.5-32b, mistral-small-24b, deepseek-r1-qwen-32b

**Tests:** 100 prompts × 5 models = 500 executions

**Duration:** ~45 minutes to 1 hour

**Output:** Comprehensive comparison across models and knowledge types

---

### 4. Comprehensive Test (Full Validation)

**Prerequisites:**
- All 10 models available
- 6-8 hours available
- Sufficient disk space for reports (~500MB)

**Command:**
```bash
npm run enterprise:comprehensive
```

**All models:** phi3, smollm3, mistral, qwen2.5-32b, qwen-coder-7b, hermes-3-llama-8b, llama-3.1-8b, llama-4-scout-17b, mistral-small-24b, deepseek-r1-qwen-32b

**Tests:** 123 prompts × 10 models = 1,230 executions

**Duration:** ~6-8 hours

**Output:** Complete performance matrix for all models

---

## Custom Test Execution

### Test Specific Models

**Command:**
```bash
npm run enterprise:pilot -- --models "hermes-3-llama-8b,qwen2.5-32b"
```

**Syntax:**
```bash
npm run enterprise:[test-level] -- --models "model1,model2,model3"
```

**Available models:**
- phi3
- smollm3
- mistral
- qwen2.5-32b
- qwen-coder-7b
- hermes-3-llama-8b
- llama-3.1-8b
- llama-4-scout-17b
- mistral-small-24b
- deepseek-r1-qwen-32b

---

### Test Specific Standard

**Command:**
```bash
npm run enterprise:standard -- --standard GDPR
```

**Available standards:**
- GDPR
- EU_AI_ACT
- ISO_27001
- SOC_2
- PCI_DSS
- CSA_CCM
- (and 9 more - see compliance-standards.js)

---

### Test Specific Persona

**Command:**
```bash
npm run enterprise:standard -- --persona PRACTITIONER
```

**Available personas:**
- NOVICE
- PRACTITIONER
- MANAGER
- AUDITOR
- EXECUTIVE
- DEVELOPER

---

### Limit Number of Tests

**Command:**
```bash
npm run enterprise:quick -- --max-tests 25
```

**Use case:** Testing with resource constraints

---

### Combine Filters

**Command:**
```bash
npm run enterprise:standard -- \
  --models "hermes-3-llama-8b,llama-4-scout-17b" \
  --standard GDPR \
  --persona PRACTITIONER \
  --max-tests 30
```

**Result:** GDPR tests for practitioners, 30 tests max, 2 models only

---

## Test Inputs Explained

### No Manual Inputs Required

Tests are **fully automated** with embedded test data:

**Input data location:**
- Compliance tests: `enterprise/test-data-generator.js`
- ArionComply workflows: `enterprise/arioncomply-workflows/ui-tasks.js`
- Intent classification: `enterprise/arioncomply-workflows/intent-classification-tests.js`

**Questions are pre-defined**, for example:
```javascript
{
  question: "What is GDPR?",
  expectedTopics: ["regulation", "privacy", "EU", "data protection"],
  standard: "GDPR",
  knowledgeType: "FACTUAL",
  persona: "NOVICE"
}
```

**No user input needed during execution** - tests run completely autonomously.

---

## Required Configuration

### 1. Server URL (Already Configured)

**File:** `config.js`

```javascript
llmServer: {
  baseUrl: 'http://127.0.0.1:8088',  // Changed from localhost to 127.0.0.1
  timeout: 60000
}
```

**Note:** Node.js fetch requires `127.0.0.1`, not `localhost`

---

### 2. Model Ports (Managed by llamacpp-manager)

**Default port assignments:**
```javascript
{
  'phi3': 8081,
  'smollm3': 8082,
  'mistral': 8083,
  'qwen2.5-32b': 8084,
  'qwen-coder-7b': 8085,
  'hermes-3-llama-8b': 8086,
  'llama-3.1-8b': 8087,
  'llama-4-scout-17b': 8088,
  'mistral-small-24b': 8089,
  'deepseek-r1-qwen-32b': 8092
}
```

**Configured in:** `utils/llamacpp-manager-client.js`

**If your ports differ:** Edit the `models` object in llamacpp-manager-client.js

---

### 3. Test Parameters (Optional)

**File:** `config.js`

**Default settings:**
```javascript
modelParams: {
  temperature: 0.7,
  max_tokens: 500,
  top_p: 0.9,
  top_k: 40
}

tests: {
  speed: {
    repetitions: 5  // Run each speed test 5 times
  }
}
```

**To modify:** Edit `config.js` before running tests

---

## Model Management (Automated)

### Automatic Model Switching

**The test runner handles model management:**

1. **Check if model is running**
   ```bash
   llamacpp-manager status
   ```

2. **If not running, start it**
   ```bash
   llamacpp-manager start [model-name]
   ```

3. **Wait for model to be ready**
   - Polls `/health` endpoint
   - Waits up to 60 seconds
   - Confirms `{"status":"ok"}` response

4. **Run tests on model**

5. **Move to next model** (optionally stop previous model)

**This is fully automated** - you don't need to start/stop models manually.

---

## Understanding Test Output

### Console Output Structure

```
============================================================
  ENTERPRISE COMPLIANCE MULTI-MODEL COMPARISON
============================================================

⚠️  BASELINE TESTING MODE
   Testing: Pure LLM responses (NO retrieval systems)
   Purpose: Identify which retrieval infrastructure to BUILD
   Current: No vector DB, no knowledge graph, no RAG pipeline

Test Suite Statistics:
  Total tests available: 52
  Running: 20 tests
  Across: 2 models
  Total test executions: 40

======================================================================
Testing Model: LLAMA-4-SCOUT-17B
======================================================================

[1/20] GDPR | FACTUAL | NOVICE
Q: What is GDPR?
✅ Score: 75% (3/4 topics)
Response: GDPR stands for General Data Protection Regulation...

[2/20] GDPR | FACTUAL | NOVICE
Q: What are the main principles of GDPR?
✅ Score: 100% (4/4 topics)
Response: The General Data Protection Regulation...

...

======================================================================
BASELINE LLM KNOWLEDGE ANALYSIS (NO RETRIEVAL SYSTEM TESTED)
======================================================================

⚠️  NOTE: This tests LLM training data ONLY (no RAG, no vector DB, no knowledge graph)
   Results show where retrieval infrastructure NEEDS TO BE BUILT

📊 BASELINE LLM PERFORMANCE (Without Any Retrieval):
   (Testing what models know from training data alone)

  llama-4-scout-17b        11/20 passed (avg score: 47.0%)
  hermes-3-llama-8b        12/20 passed (avg score: 52.6%)

📊 Knowledge Type Baseline Performance:
   (Shows what LLM knows WITHOUT vector DB, knowledge graph, or RAG)

  ✅ FACTUAL        17/20 passed (avg score: 71.3%)
  ⚠️ RELATIONAL     2/6 passed (avg score: 44.4%)
  ❌ PROCEDURAL     0/8 passed (avg score: 12.5%)
  ✅ EXACT_MATCH    4/4 passed (avg score: 50.0%)
  ❌ SYNTHESIS      0/2 passed (avg score: 0.0%)

======================================================================
🔧 RETRIEVAL INFRASTRUCTURE TO BUILD (Based on Baseline Gaps)
======================================================================

⚠️  These are RECOMMENDATIONS for what to implement, not current systems

1. PROCEDURAL Knowledge - HIGH PRIORITY
   ├─ Baseline LLM Score: 12.5% (Pass Rate: 0.0%)
   ├─ Gap Analysis: LLM training data insufficient for procedural queries
   ├─ Build This: STRUCTURED_RETRIEVAL
   └─ Implementation Actions:
      ├─ Create process flow diagrams and step-by-step guides
      ├─ Structure procedural knowledge with sequential relationships
      └─ Add implementation checklists and workflows

2. SYNTHESIS Knowledge - HIGH PRIORITY
   ├─ Baseline LLM Score: 0.0% (Pass Rate: 0.0%)
   ├─ Gap Analysis: LLM training data insufficient for synthesis queries
   ├─ Build This: RAG_SYNTHESIS
   └─ Implementation Actions:
      ├─ Improve multi-document retrieval
      ├─ Add framework comparison matrices
      └─ Enhance cross-standard analysis capabilities

...
```

---

### JSON Report Structure

**Location:** `reports/test-results-enterprise-[level]-TIMESTAMP.json`

**Top-level structure:**
```json
{
  "timestamp": "2026-03-24T...",
  "modelResults": {
    "llama-4-scout-17b": [ /* array of test results */ ],
    "hermes-3-llama-8b": [ /* array of test results */ ]
  },
  "diagnostics": {
    "byModel": { /* performance by model */ },
    "byKnowledgeType": { /* scores by knowledge type */ },
    "retrievalRecommendations": [ /* what to build */ ]
  }
}
```

**Individual test result:**
```json
{
  "success": true,
  "testId": "GDPR_FACTUAL_NOVICE_1",
  "question": "What is GDPR?",
  "response": "GDPR stands for...",
  "evaluation": {
    "containsExpectedTopics": 3,
    "totalExpectedTopics": 4,
    "foundTopics": ["regulation", "EU", "data protection"],
    "missingTopics": ["privacy"],
    "responseLength": 2391,
    "passed": true,
    "score": 75
  },
  "timing": {
    "totalMs": 14865,
    "promptMs": 186.02,
    "predictedMs": 14652.22,
    "promptTokens": 14,
    "completionTokens": 446,
    "tokensPerSec": 30.44
  },
  "standard": "GDPR",
  "knowledgeType": "FACTUAL",
  "persona": "NOVICE",
  "retrievalStrategy": "vector_db"
}
```

---

## Agent Execution Instructions

### For Autonomous Agents

**Scenario:** Agent needs to run tests and report results

**Step-by-step:**

1. **Verify prerequisites**
   ```bash
   cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite
   node --version  # Check Node.js
   llamacpp-manager status  # Check models
   ```

2. **Choose test level based on time available**
   ```bash
   # 5 minutes → pilot
   # 15 minutes → quick
   # 1 hour → standard
   # 8 hours → comprehensive
   ```

3. **Run test**
   ```bash
   npm run enterprise:pilot  # or quick, standard, comprehensive
   ```

4. **Wait for completion**
   - Tests run autonomously
   - Models start/stop automatically
   - No intervention needed

5. **Find results**
   ```bash
   # Latest report
   ls -lt reports/test-results-enterprise-*.json | head -1
   
   # Read results
   cat reports/test-results-enterprise-pilot-TIMESTAMP.json
   ```

6. **Extract key findings**
   ```bash
   # Using jq (if installed)
   cat reports/test-results-*.json | jq '.diagnostics.byKnowledgeType'
   
   # Or read the diagnostics section manually
   ```

---

### Expected Agent Output

**Agent should report:**

```
ENTERPRISE TEST EXECUTION REPORT

Execution Details:
- Test Level: pilot
- Models Tested: llama-4-scout-17b, hermes-3-llama-8b
- Tests Run: 40 (20 prompts × 2 models)
- Duration: 5 minutes 23 seconds
- Report: reports/test-results-enterprise-pilot-2026-03-24T12-00-00-000Z.json

Model Performance:
- llama-4-scout-17b: 11/20 passed (55%), avg score 47.0%
- hermes-3-llama-8b: 12/20 passed (60%), avg score 52.6%

Knowledge Type Baseline (LLM Only, No Retrieval):
- ✅ Factual: 71.3% - Vector DB recommended for improvement
- ⚠️ Relational: 44.4% - BUILD knowledge graph (MEDIUM priority)
- ❌ Procedural: 12.5% - BUILD structured workflows (HIGH priority)
- ✅ Exact Match: 50.0% - Meilisearch recommended
- ❌ Synthesis: 0.0% - BUILD RAG synthesis (HIGH priority)

HIGH PRIORITY RECOMMENDATIONS:
1. Build structured workflow documentation (procedural at 12.5%)
2. Build RAG multi-document synthesis pipeline (synthesis at 0%)
3. Build knowledge graph for regulation relationships (relational at 44%)

Conclusion: Baseline LLM insufficient for enterprise compliance.
Recommended: Implement multilayer retrieval (Vector DB + Knowledge Graph + RAG)
```

---

## Troubleshooting

### Problem: "Server health check failed"

**Cause:** Model not running or not ready

**Solution:**
```bash
# Check status
llamacpp-manager status

# Start model manually
llamacpp-manager start llama-4-scout-17b

# Wait for ready
curl http://127.0.0.1:8088/health
# Should return: {"status":"ok"}

# Then run tests
npm run enterprise:pilot
```

---

### Problem: "Model did not become ready within timeout"

**Cause:** Large model taking > 60 seconds to load

**Solution:**
1. Wait for model to finish loading
2. Check logs: `tail -f ~/Library/Logs/llamaCPPManager/llama-4-scout-17b.log`
3. Once ready, re-run tests
4. Or increase timeout in `utils/llamacpp-manager-client.js`

---

### Problem: "Error: fetch failed"

**Cause:** Using `localhost` instead of `127.0.0.1`

**Solution:**
- Already fixed in `config.js`
- If you see this, verify config.js has `http://127.0.0.1:8088`

---

### Problem: Tests timing out

**Cause:** Model too slow for complex prompts

**Solution:**
```javascript
// Edit config.js
llmServer: {
  timeout: 120000  // Increase to 2 minutes
}
```

---

## Viewing Results

### Method 1: Interactive HTML Viewer

**Command:**
```bash
# Generate viewer with latest data
node export-prompts.js
cd reports/prompts
node generate-viewer.js
open prompt-viewer.html
```

**Features:**
- Browse all 123 prompts
- Filter by standard, persona, complexity, performance
- See expected topics and guidance
- View complexity metrics

---

### Method 2: JSON Report

**Location:** `reports/test-results-enterprise-[level]-TIMESTAMP.json`

**Read with:**
```bash
# Pretty print
cat reports/test-results-*.json | python3 -m json.tool | less

# Extract specific section
cat reports/test-results-*.json | jq '.diagnostics.retrievalRecommendations'

# Find all HIGH priority recommendations
cat reports/test-results-*.json | jq '.diagnostics.retrievalRecommendations[] | select(.priority == "HIGH")'
```

---

### Method 3: Exported Prompts

**Formats available:**
- `reports/prompts/all-prompts-comprehensive.json` - Complete JSON
- `reports/prompts/compliance-prompts.csv` - Spreadsheet
- `reports/prompts/compliance-prompts.md` - Markdown
- `reports/prompts/arioncomply-prompts.md` - Workflow documentation

---

## Performance Benchmarking

### Speed-Only Tests

**Command:**
```bash
npm run test:speed
```

**Measures:**
- Latency (time to first token)
- Throughput (tokens/second)
- Concurrent request handling

**Use case:** Quick performance check without accuracy validation

---

### Accuracy-Only Tests

**Command:**
```bash
npm run test:accuracy
```

**Measures:**
- Instruction following
- Factual accuracy
- Math/logic reasoning
- Code generation
- JSON format adherence

**Use case:** Validate model quality without performance measurement

---

## Test Statistics

### View Available Tests

**Command:**
```bash
npm run enterprise:stats
```

**Output:**
```
Total Tests: 123

By Standard:
  GDPR                     22 tests
  ISO_27001                9 tests
  EU_AI_ACT                8 tests
  ...

By Knowledge Type:
  FACTUAL                  21 tests
  PROCEDURAL               11 tests
  RELATIONAL               8 tests
  ...

By User Persona:
  PRACTITIONER             22 tests
  MANAGER                  15 tests
  ...

Available Models: 10
  phi3, smollm3, mistral, qwen2.5-32b, qwen-coder-7b,
  hermes-3-llama-8b, llama-3.1-8b, llama-4-scout-17b,
  mistral-small-24b, deepseek-r1-qwen-32b
```

---

## Export Test Prompts

### Generate All Export Formats

**Command:**
```bash
node export-prompts.js
```

**Creates:**
1. `reports/prompts/compliance-prompts.csv` - Spreadsheet
2. `reports/prompts/compliance-prompts.md` - Markdown
3. `reports/prompts/arioncomply-prompts.md` - Workflows
4. `reports/prompts/all-prompts-comprehensive.json` - Complete JSON with complexity

**JSON includes:**
- All 123 prompts
- Complexity analysis for each
- Expected topics, guidance, clarifications
- Performance class predictions

---

## Interpreting Results

### Knowledge Type Performance Thresholds

**Scoring guide:**

| Score | Interpretation | Action |
|-------|---------------|--------|
| 90-100% | Excellent | LLM baseline sufficient, optional enhancement |
| 70-89% | Good | Consider adding retrieval for improvement |
| 50-69% | Moderate | Retrieval recommended (medium priority) |
| 30-49% | Poor | Build retrieval infrastructure (high priority) |
| 0-29% | Critical | Immediate retrieval implementation required |

**From pilot test:**
- Factual 71.3% → Good, but vector DB recommended
- Relational 44.4% → Poor → BUILD knowledge graph
- Procedural 12.5% → Critical → BUILD structured workflows NOW
- Synthesis 0% → Critical → BUILD RAG synthesis NOW

---

### Model Comparison Insights

**What to look for:**

**Best overall performer:**
```
hermes-3-llama-8b: 60% pass rate, 52.6% avg score
llama-4-scout-17b: 55% pass rate, 47.0% avg score
```
**Interpretation:** Hermes slightly better for compliance questions

**Specialty analysis:**
```
# Check model specialty field
hermes-3-llama-8b: specialty = "function-calling"
qwen2.5-32b: specialty = "large-context"
deepseek-r1-qwen-32b: specialty = "reasoning"
```

**Match models to tasks:**
- Function calling → hermes-3-llama-8b
- Long documents → qwen2.5-32b (131k context)
- Complex reasoning → deepseek-r1-qwen-32b
- Code review → qwen-coder-7b

---

## Advanced Usage

### Test Function Calling

**Command:**
```bash
npm run enterprise:functions
```

**Default model:** hermes-3-llama-8b (trained for function calling)

**Tests:** 10 enterprise compliance functions
- identify_pii
- classify_data_sensitivity
- assess_ai_risk_level
- check_compliance_requirement
- map_controls_across_frameworks
- etc.

**Output:** Function calling accuracy for compliance operations

---

### Monitor Test Progress

**For long-running tests:**

```bash
# Terminal 1: Run test
npm run enterprise:comprehensive

# Terminal 2: Monitor progress
tail -f reports/test-results-enterprise-*.json  # Won't work during execution

# Or watch console output
```

---

## Test Data Modification

### Adding New Test Questions

**File:** `enterprise/test-data-generator.js`

**Structure:**
```javascript
TEST_TEMPLATES = {
  GDPR: {
    FACTUAL: {
      NOVICE: [
        { 
          q: 'Your new question here?', 
          expectedTopics: ['topic1', 'topic2'] 
        }
      ]
    }
  }
}
```

**After editing:**
```bash
# Re-export prompts
node export-prompts.js

# Run tests with new questions
npm run enterprise:pilot
```

---

### Adding New Standards

**File:** `enterprise/compliance-standards.js`

**Add new standard:**
```javascript
export const COMPLIANCE_STANDARDS = {
  // ... existing ...
  
  YOUR_NEW_STANDARD: {
    name: 'Full Name of Standard',
    category: 'security-framework',
    jurisdiction: 'International',
    year: 2024,
    keyTopics: ['topic1', 'topic2'],
    retrievalNeeds: ['vector_db', 'knowledge_graph']
  }
}
```

**Then add test questions in test-data-generator.js**

---

## CI/CD Integration

### Running Tests in Automation

**GitHub Actions example:**

```yaml
name: LLM Compliance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install llamacpp-manager
        run: pip3 install llamacpp-manager
      
      - name: Start test model
        run: llamacpp-manager start llama-4-scout-17b
      
      - name: Run pilot test
        run: npm run enterprise:pilot
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: reports/
```

---

## Metrics Reference Summary

### Prompt Complexity Metrics (13 total)

| Metric | Type | Range | Purpose |
|--------|------|-------|---------|
| Character Count | Integer | 1-1000+ | Prompt length |
| Word Count | Integer | 1-200+ | Word-level length |
| Estimated Tokens | Integer | 1-500+ | Cost/context estimation |
| Sentence Count | Integer | 1-10+ | Structural complexity |
| Question Count | Integer | 0-5+ | Multi-question detection |
| Technical Term Count | Integer | 0-20+ | Domain specificity |
| Technical Density | Percentage | 0-100% | Expertise level |
| Is Multi-Part | Boolean | true/false | Compound questions |
| Has List Request | Boolean | true/false | Enumeration expected |
| Has Comparison | Boolean | true/false | Synthesis required |
| Complexity Score | Integer | 0-100 | Overall complexity |
| Complexity Level | Category | simple/moderate/complex/very_complex | Human-readable |
| Performance Class | Category | fast/medium/slow/very_slow | Speed prediction |

### Knowledge Type Metrics (5 types)

| Knowledge Type | Baseline | Retrieval Strategy | Priority |
|---------------|----------|-------------------|----------|
| Factual | 71.3% | Vector DB | Low |
| Relational | 44.4% | Knowledge Graph | Medium |
| Procedural | 12.5% | Structured Retrieval | HIGH |
| Exact Match | 50.0% | Meilisearch | Medium |
| Synthesis | 0.0% | RAG Multi-Doc | HIGH |

### Performance Metrics (6 measurements)

| Metric | Unit | Typical Range | Source |
|--------|------|--------------|--------|
| Total Response Time | ms | 300-20000ms | Calculated |
| Prompt Processing Time | ms | 50-500ms | llama.cpp |
| Response Generation Time | ms | 200-15000ms | llama.cpp |
| Prompt Tokens | tokens | 10-100 | llama.cpp |
| Completion Tokens | tokens | 50-500 | llama.cpp |
| Tokens/Second | tok/s | 20-60 | llama.cpp |

---

## Related Documentation

- **Metrics Implementation:** `utils/prompt-complexity-analyzer.js`
- **All Metrics Explained:** `METRICS-DOCUMENTATION.md` (this file)
- **Test Data Structure:** `enterprise/test-data-generator.js`
- **Execution Logic:** `enterprise/enterprise-test-runner.js`
- **ArionComply Alignment:** `enterprise/arioncomply-workflows/prompt-schema-aligned.js`
- **Model Management:** `utils/llamacpp-manager-client.js`

---

## Questions?

Contact: libor@arionetworks.com
