# llama-bench Integration Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/LLAMA-BENCH-INTEGRATION-ANALYSIS.md
**Description:** Analysis of using llama-bench vs custom performance measurement for commercial benchmarking service
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Executive Summary

**Question:** Why aren't we using llama-bench for performance metrics (tokens/sec, throughput)?

**Answer:** We **SHOULD** use llama-bench for pure performance runs, but keep custom runner for quality evaluation.

**Recommendation:** **HYBRID APPROACH** - Use both tools for different purposes:

- ✅ **llama-bench:** Authoritative performance metrics (Runs 1-5: pure speed)
- ✅ **Custom runner:** Quality evaluation + performance (Run 6: accuracy with metrics)

**Impact:** More accurate, more reliable, industry-standard benchmarks

---

## What is llama-bench?

**Tool:** Official llama.cpp benchmarking utility

**Purpose:** Measure model performance characteristics

**Capabilities:**
- ✅ Prompt processing speed (tokens/sec)
- ✅ Text generation speed (tokens/sec)
- ✅ Multiple prompt sizes (-p flag: 10,100,512,2000)
- ✅ Multiple generation lengths (-n flag: 128,256,512)
- ✅ Multiple repetitions for statistical confidence (-r flag)
- ✅ Different batch sizes (-b flag)
- ✅ Different thread counts (-t flag)
- ✅ GPU layer offloading (-ngl flag)
- ✅ Output formats: JSON, CSV, Markdown, SQL
- ✅ Built-in warmup runs
- ✅ Direct access to llama.cpp internals (no HTTP overhead)

**Location:** `/opt/homebrew/bin/llama-bench` (via Homebrew)

**Example Usage:**
```bash
llama-bench \
  -m /path/to/model.gguf \
  -p 512,2000 \
  -n 128,256 \
  -t 8,12 \
  -ngl 35 \
  -r 5 \
  -o json
```

---

## Current Approach (Custom Runner)

### What We're Doing

**File:** `performance-test-runner.js`, `run-performance-tests.js`

**Method:**
1. Start model via llamacpp-manager
2. Send HTTP request to `/v1/chat/completions`
3. Measure time with `Date.now()`
4. Extract metrics from API response (`data.timings`)
5. Calculate tokens/sec manually

**Code:**
```javascript
const startTime = Date.now();
const response = await fetch('http://127.0.0.1:8081/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({ messages, max_tokens: 500, temperature: 0.3 })
});
const data = await response.json();
const endTime = Date.now();

const metrics = {
  totalMs: endTime - startTime,  // ⚠️ Includes HTTP overhead!
  promptMs: data.timings.prompt_ms,
  predictedMs: data.timings.predicted_ms,
  tokensPerSec: data.timings.predicted_per_second  // ⚠️ From API response
};
```

**Metrics We Get:**
- ✅ Total time (includes network)
- ✅ Prompt processing time
- ✅ Generation time
- ✅ Tokens per second
- ✅ **Actual LLM response** (for quality evaluation)
- ✅ Token usage

---

## Comparison: Custom vs llama-bench

| Aspect | Custom Runner | llama-bench | Winner |
|--------|---------------|-------------|--------|
| **Accuracy** | API timing (has HTTP overhead) | Direct engine timing (no overhead) | 🏆 llama-bench |
| **Speed** | Slower (HTTP roundtrip) | Faster (direct) | 🏆 llama-bench |
| **Metrics** | Tokens/sec, latency | Tokens/sec, latency, + more | 🏆 llama-bench |
| **Control** | Can test exact prompts | Tests generic content | Custom |
| **Response Text** | ✅ Captures full response | ❌ No response text | 🏆 Custom |
| **Quality Eval** | ✅ Can evaluate accuracy | ❌ Cannot | 🏆 Custom |
| **Repeatability** | Good | Excellent (built-in -r flag) | 🏆 llama-bench |
| **Industry Standard** | Custom | llama.cpp official | 🏆 llama-bench |
| **Configuration** | Limited | Extensive (threads, batch, GPU) | 🏆 llama-bench |
| **Output Format** | Custom JSON | JSON, CSV, SQL, MD | 🏆 llama-bench |

---

## The Key Insight

### Different Goals Need Different Tools

**Goal 1: Pure Performance Benchmarking**
- "How fast is phi3 vs mistral?"
- "What's the throughput difference between Q4 and Q5 quantization?"
- "How does performance scale with threads?"

**Best Tool:** ✅ **llama-bench**
- Authoritative measurements
- No HTTP overhead
- Industry-standard results
- Easy to reproduce

**Goal 2: Quality + Performance Benchmarking**
- "How accurate is phi3 on GDPR compliance questions?"
- "Does mistral correctly cite GDPR Article 6?"
- "Which model gives better guidance for ISO 27001 implementation?"

**Best Tool:** ✅ **Custom Runner**
- Must capture actual response text
- Must evaluate against expected topics
- Must assess quality/accuracy
- Performance is secondary

---

## Why We're NOT Using llama-bench (Currently)

### Reason 1: No Response Text Capture

**llama-bench output:**
```json
{
  "build_commit": "abc123",
  "build_number": 6510,
  "model_filename": "phi3.gguf",
  "model_size": 3821102080,
  "n_prompt": 512,
  "n_gen": 128,
  "t_pp_total": 423.5,        // Prompt processing time (ms)
  "t_tg_total": 3201.2,       // Text generation time (ms)
  "pp_speed_avg": 1208.3,     // Prompt tokens/sec
  "tg_speed_avg": 39.98       // Generation tokens/sec
}
```

**What's MISSING:**
- ❌ The actual generated text
- ❌ Cannot evaluate if response is correct
- ❌ Cannot check for hallucinations
- ❌ Cannot verify expected topics

**Impact:**
- Can measure "fast" but not "good"
- Cannot answer "Which model gives better compliance advice?"
- Cannot build quality evaluation dashboard

### Reason 2: Generic Test Content

**llama-bench** uses generic/random prompts:
- Tests with lorem ipsum or random tokens
- Or uses same prompt repeatedly
- Not testing YOUR specific use case

**Our Need:**
- Test with actual compliance questions
- Test with multi-tier prompts (TIER 1+2+3)
- Test with realistic business scenarios
- Measure performance ON YOUR WORKLOAD

### Reason 3: Need Both Speed AND Quality

**Customer Questions:**
1. "Which model is fastest?" → llama-bench answers this
2. "Which model gives best answers?" → Custom runner answers this
3. **"Which model is best value (speed + accuracy)?"** → Need BOTH tools

---

## Proposed Hybrid Approach

### Split Test Runs by Purpose

**Performance-Only Runs (Use llama-bench):**

**Runs 1-5:** Pure speed benchmarking
- Measure baseline performance
- Compare models on raw speed
- Test configuration impact (threads, batch size, quantization)
- **Don't need response text** (just measuring speed)

**Use:**
```bash
llama-bench \
  -m /path/to/phi3.gguf \
  -p 10,50,100,150,190 \  # Match our Run 1-5 token sizes
  -n 128,256,512 \        # Different response lengths
  -t 8,10,12 \            # Thread configurations
  -ngl 35 \               # GPU layers
  -r 5 \                  # 5 repetitions
  -o json > performance-run-llama-bench.json
```

**Quality + Performance Runs (Use custom runner):**

**Run 6:** Multi-tier accuracy benchmarking
- Send actual compliance prompts
- Capture full response text
- Evaluate quality/accuracy
- **Also measure performance** (secondary)

**Use:**
```javascript
// Our existing custom runner
const runner = new ResilientPerformanceTestRunner();
const results = await runner.runPerformanceTests(multiTierPrompts, 6);
```

---

## Detailed Integration Design

### Architecture: Dual-Mode Testing

```
┌─────────────────────────────────────────────────────────┐
│                  Test Suite Entry Point                 │
│                                                          │
│  User runs: node run-performance-tests.js               │
└─────────────────────────────────────────────────────────┘
                         │
                         ├──────────────┬─────────────────┐
                         ▼              ▼                 ▼
            ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
            │ Runs 1-5 (SPEED) │ │ Run 6 (QUAL) │ │ Run 7 (CONFIG)   │
            │                  │ │              │ │                  │
            │ llama-bench      │ │ Custom       │ │ llama-bench      │
            │ (authoritative)  │ │ (accuracy)   │ │ (comparison)     │
            └──────────────────┘ └──────────────┘ └──────────────────┘
                         │              │                 │
                         ▼              ▼                 ▼
            ┌──────────────────────────────────────────────┐
            │      Unified Schema Conversion               │
            │                                              │
            │  - llama-bench JSON → Unified schema        │
            │  - Custom runner → Unified schema           │
            │  - Both saved to same directory structure   │
            └──────────────────────────────────────────────┘
                         │
                         ▼
            ┌──────────────────────────────────────────────┐
            │     reports/performance/2026-03-26/          │
            │                                              │
            │  - test-results-run-1-llamabench-*.json     │
            │  - test-results-run-6-quality-*.json        │
            │  - test-results-run-7-config-*.json         │
            └──────────────────────────────────────────────┘
```

### Implementation Plan

**Step 1: Create llama-bench wrapper**

**New File:** `utils/llama-bench-client.js`

```javascript
// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/llama-bench-client.js
// Description: Wrapper for llama-bench utility - provides performance benchmarking
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Wrapper for llama-bench utility.
 *
 * Business Purpose: Leverage official llama.cpp benchmarking tool for
 * authoritative performance measurements without HTTP overhead.
 *
 * Example:
 *   const bench = new LlamaBenchClient();
 *   const results = await bench.benchmark('phi3', {
 *     promptSizes: [10, 100, 512, 2000],
 *     generations: [128],
 *     repetitions: 5
 *   });
 */
export class LlamaBenchClient {
  constructor() {
    this.llamaBenchPath = '/opt/homebrew/bin/llama-bench';
    this.modelBasePath = null;  // Will detect from llamacpp-manager
  }

  /**
   * Find model file path for a given model name.
   *
   * Uses llamacpp-manager to locate the actual .gguf file.
   *
   * @param {string} modelName - Model name (e.g., 'phi3', 'mistral')
   * @returns {Promise<string>} Full path to .gguf file
   */
  async getModelPath(modelName) {
    try {
      const { stdout } = await execAsync(`llamacpp-manager models list`);

      // Parse output to find model file path
      // Format: "phi3: /path/to/phi3.gguf"
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes(modelName) && line.includes('.gguf')) {
          const match = line.match(/([^\s]+\.gguf)/);
          if (match) {
            return match[1];
          }
        }
      }

      throw new Error(`Model file not found for: ${modelName}`);
    } catch (error) {
      throw new Error(`Failed to locate model: ${error.message}`);
    }
  }

  /**
   * Run llama-bench for a specific model.
   *
   * @param {string} modelName - Model name (e.g., 'phi3')
   * @param {Object} options - Benchmark options
   * @param {Array<number>} options.promptSizes - Prompt sizes to test (default: [512])
   * @param {Array<number>} options.generations - Generation lengths (default: [128])
   * @param {Array<number>} options.threads - Thread counts (default: [8])
   * @param {number} options.gpuLayers - GPU layers to offload (default: 35)
   * @param {number} options.repetitions - Number of repetitions (default: 5)
   * @param {number} options.batchSize - Batch size (default: 2048)
   * @returns {Promise<Array>} Array of benchmark results
   *
   * Example:
   *   const results = await bench.benchmark('phi3', {
   *     promptSizes: [10, 100, 512, 2000],
   *     generations: [128, 256],
   *     repetitions: 5
   *   });
   */
  async benchmark(modelName, options = {}) {
    const {
      promptSizes = [512],
      generations = [128],
      threads = [8],
      gpuLayers = 35,
      repetitions = 5,
      batchSize = 2048
    } = options;

    // Get model file path
    const modelPath = await this.getModelPath(modelName);

    // Build command
    const promptStr = promptSizes.join(',');
    const genStr = generations.join(',');
    const threadStr = threads.join(',');

    const cmd = `${this.llamaBenchPath} ` +
      `-m "${modelPath}" ` +
      `-p ${promptStr} ` +
      `-n ${genStr} ` +
      `-t ${threadStr} ` +
      `-ngl ${gpuLayers} ` +
      `-b ${batchSize} ` +
      `-r ${repetitions} ` +
      `-o json`;

    console.log(`\n🔧 Running llama-bench for ${modelName}...`);
    console.log(`   Prompts: ${promptStr}`);
    console.log(`   Generations: ${genStr}`);
    console.log(`   Repetitions: ${repetitions}`);

    try {
      // Run benchmark (redirect stderr to /dev/null to skip metal init messages)
      const { stdout, stderr } = await execAsync(cmd + ' 2>/dev/null');

      // Parse JSON output
      const results = JSON.parse(stdout);

      console.log(`✅ Completed: ${results.length} benchmark runs`);

      return results;

    } catch (error) {
      console.error(`❌ llama-bench failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert llama-bench output to unified schema format.
   *
   * @param {Object} benchResult - Single result from llama-bench JSON output
   * @param {string} modelName - Model identifier
   * @param {number} runNumber - Test run number
   * @returns {Object} Result in unified schema format
   */
  convertToSchema(benchResult, modelName, runNumber) {
    const now = new Date().toISOString();

    return {
      metadata: {
        timestamp: now,
        testRunId: `llama-bench-run-${runNumber}-${now.split('T')[0]}`,
        runNumber: runNumber,
        runName: `LLAMABENCH_RUN${runNumber}`,
        runType: 'performance',
        focus: 'throughput',
        tool: 'llama-bench',  // ✅ Track which tool generated this
        environment: {
          llamaBenchVersion: benchResult.build_number,
          llamaBenchCommit: benchResult.build_commit
        }
      },

      input: {
        promptId: `bench-prompt-${benchResult.n_prompt}tokens`,
        fullPromptText: `[Generic ${benchResult.n_prompt}-token benchmark prompt]`,
        fullPromptTokens: benchResult.n_prompt
      },

      modelConfig: {
        modelName: modelName,
        modelSize: Math.round(benchResult.model_size / 1e9) + 'B',
        modelFile: benchResult.model_filename,
        parameters: {
          temperature: 0.8,  // llama-bench default
          threads: benchResult.n_threads,
          batchSize: benchResult.n_batch,
          ubatchSize: benchResult.n_ubatch,
          gpuLayers: benchResult.n_gpu_layers
        }
      },

      output: {
        response: '[llama-bench does not capture response text - use custom runner for quality evaluation]',
        responseTokens: benchResult.n_gen,  // Generated tokens
        responseCharacters: 0  // Unknown
      },

      timing: {
        totalMs: benchResult.t_pp_total + benchResult.t_tg_total,
        promptProcessingMs: benchResult.t_pp_total,
        generationMs: benchResult.t_tg_total,
        tokensPerSecond: benchResult.tg_speed_avg,         // ✅ Authoritative generation speed
        inputTokensPerSecond: benchResult.pp_speed_avg,    // ✅ Authoritative prompt speed
        outputTokensPerSecond: benchResult.tg_speed_avg,
        timePerToken: 1000 / benchResult.tg_speed_avg
      },

      resources: {
        modelPort: 0,  // N/A for llama-bench (doesn't use server)
        backend: benchResult.backend,
        gpuLayers: benchResult.n_gpu_layers
      },

      execution: {
        success: true,
        responseValidated: false,  // No response to validate
        errors: [],
        warnings: ['llama-bench does not capture response text - performance metrics only'],
        validationChecks: {
          responseNotEmpty: false,  // No response
          modelResponded: true,     // Model ran successfully
          noConnectionErrors: true,
          noTimeouts: true
        }
      }
    };
  }
}
```

**Step 2: Update run-performance-tests.js**

```javascript
// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-performance-tests.js

import { ResilientPerformanceTestRunner } from './performance-test-runner.js';
import { LlamaBenchClient } from './utils/llama-bench-client.js';
import { PERFORMANCE_PROMPTS } from './performance-prompts.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';

async function runAllPerformanceTests() {
  console.log('='.repeat(80));
  console.log('HYBRID PERFORMANCE TEST SUITE');
  console.log('='.repeat(80));
  console.log('Runs 1-5: llama-bench (authoritative performance)');
  console.log('Run 6:    Custom runner (quality + performance)');
  console.log('='.repeat(80));

  // ========== RUNS 1-5: Pure Performance (llama-bench) ==========

  const benchClient = new LlamaBenchClient();
  const models = ['smollm3', 'phi3', 'mistral'];
  const allBenchResults = [];

  console.log('\n📊 Phase 1: Performance Benchmarking (llama-bench)');
  console.log('   Purpose: Authoritative speed measurements\n');

  for (let runNum = 1; runNum <= 5; runNum++) {
    const prompts = PERFORMANCE_PROMPTS[`RUN_${runNum}_TINY`] ||
                    PERFORMANCE_PROMPTS[`RUN_${runNum}_SHORT`] ||
                    PERFORMANCE_PROMPTS[`RUN_${runNum}_MEDIUM`] ||
                    PERFORMANCE_PROMPTS[`RUN_${runNum}_LONG`] ||
                    PERFORMANCE_PROMPTS[`RUN_${runNum}_VERYLONG`];

    // Get average token count for this run
    const avgTokens = Math.round(
      prompts.reduce((sum, p) => sum + p.tokens, 0) / prompts.length
    );

    console.log(`\n=== Run ${runNum}: ${avgTokens} tokens (llama-bench) ===`);

    for (const model of models) {
      const benchResults = await benchClient.benchmark(model, {
        promptSizes: [avgTokens],  // Use actual prompt size from our tests
        generations: [128],         // Match our max_tokens
        threads: [8],
        gpuLayers: 35,
        repetitions: 5
      });

      // Convert to unified schema
      const schemaResults = benchResults.map(br =>
        benchClient.convertToSchema(br, model, runNum)
      );

      allBenchResults.push(...schemaResults);

      console.log(`   ${model}: ${benchResults[0].tg_speed_avg.toFixed(2)} tok/s`);
    }

    // Save per-run results
    saveSchemaCompliantResults(allBenchResults.filter(r => r.metadata.runNumber === runNum), {
      testType: 'performance',
      runName: `run-${runNum}-llamabench`
    });
  }

  // ========== RUN 6: Quality + Performance (Custom Runner) ==========

  console.log('\n📊 Phase 2: Quality Evaluation (custom runner)');
  console.log('   Purpose: Accuracy assessment + performance\n');

  const customRunner = new ResilientPerformanceTestRunner();
  const multiTierPrompts = Object.values(AI_BACKEND_MULTI_TIER_TESTS).slice(0, 50);

  const qualityResults = await customRunner.runPerformanceTests(multiTierPrompts, 6);

  // Convert and save
  const schemaResults = qualityResults.map(r => convertToSchema(r, 6, 'MULTITIER_QUALITY'));
  saveSchemaCompliantResults(schemaResults, {
    testType: 'performance',
    runName: 'run-6-quality-evaluation'
  });

  console.log('\n✅ Hybrid performance testing complete!');
  console.log(`   llama-bench runs: ${allBenchResults.length} (authoritative speed)`);
  console.log(`   Custom runs: ${qualityResults.length} (quality + speed)`);
}
```

---

## Benefits of Hybrid Approach

### 1. Authoritative Performance Metrics

**llama-bench advantages:**
- Direct engine measurement (no HTTP overhead)
- More accurate tokens/sec (official llama.cpp measurement)
- Consistent with industry benchmarks
- Easier to reproduce (standard tool)
- Can test parameter variations (threads, batch, quantization)

**Impact:**
- ✅ Performance numbers match llama.cpp official benchmarks
- ✅ Customers can verify results independently
- ✅ Industry credibility (using standard tool)

### 2. Quality Evaluation Where It Matters

**Custom runner advantages:**
- Captures actual response text
- Can evaluate accuracy/correctness
- Tests with real compliance prompts
- Measures quality + performance together

**Impact:**
- ✅ Can answer "Which model gives better compliance advice?"
- ✅ Can detect hallucinations, errors, low-quality responses
- ✅ Speed/quality tradeoff analysis

### 3. Best of Both Worlds

**Combined insights:**
- llama-bench: "phi3 generates 58 tok/s (official)"
- Custom runner: "phi3 scores 45% accuracy on GDPR questions"
- **Combined:** "phi3 is fast but inaccurate - not recommended"

vs

- llama-bench: "mistral generates 54 tok/s (official)"
- Custom runner: "mistral scores 87% accuracy on GDPR questions"
- **Combined:** "mistral is nearly as fast and much more accurate - recommended"

---

## Comparison: Current vs Hybrid

### Current Approach (All Custom)

**Strengths:**
- ✅ Uniform tooling
- ✅ Captures response text for all runs
- ✅ Easy to maintain

**Weaknesses:**
- ❌ HTTP overhead in measurements (~10-50ms per request)
- ❌ Not using authoritative llama.cpp benchmark
- ❌ Harder to compare with industry benchmarks
- ❌ Performance may not match official llama.cpp numbers

**Example Output:**
```
phi3 Performance:
  Run 1 (10 tokens):  62.3 tok/s
  Run 2 (50 tokens):  58.1 tok/s
  Run 3 (100 tokens): 55.4 tok/s

⚠️ These numbers include HTTP overhead (fetch + JSON parse)
⚠️ May differ from official llama.cpp benchmarks
```

### Hybrid Approach (Proposed)

**Strengths:**
- ✅ Authoritative performance (llama-bench)
- ✅ Quality evaluation (custom runner)
- ✅ Industry-standard metrics
- ✅ Can verify against llama.cpp official results
- ✅ Faster execution (llama-bench is optimized)

**Weaknesses:**
- ⚠️ Two tools to maintain
- ⚠️ Different output formats to convert
- ⚠️ Slightly more complex

**Example Output:**
```
phi3 Performance (llama-bench - authoritative):
  Run 1 (10 tokens):  64.1 tok/s ±0.3
  Run 2 (50 tokens):  59.8 tok/s ±0.5
  Run 3 (100 tokens): 57.2 tok/s ±0.4
  ✅ Measured directly via llama.cpp (no HTTP overhead)

phi3 Quality (custom runner):
  GDPR compliance: 45% accuracy (23/50 topics found)
  ISO 27001: 38% accuracy (19/50 topics found)
  ⚠️ Frequent hallucinations detected
  ❌ Not recommended for compliance use
```

---

## When to Use Each Tool

### Use llama-bench For:

✅ **Pure performance comparison:**
- "Is phi3 faster than mistral?"
- "How does Q4 vs Q5 quantization affect speed?"
- "What's the optimal thread count?"

✅ **Configuration optimization:**
- Testing different batch sizes
- Testing different GPU layer counts
- Testing different memory configurations

✅ **Industry-standard benchmarks:**
- Publishing official performance numbers
- Comparing with llama.cpp community results
- Validating hardware performance

✅ **Automated performance regression testing:**
- CI/CD pipeline performance tests
- Detect performance degradation
- No need for quality evaluation

### Use Custom Runner For:

✅ **Quality + performance combined:**
- "Which model gives best compliance advice?"
- "Does accuracy decrease with faster models?"
- "Which model is best value (speed × accuracy)?"

✅ **Content evaluation:**
- Testing specific prompts
- Evaluating response accuracy
- Detecting hallucinations
- Measuring topic coverage

✅ **Application-specific testing:**
- Multi-tier prompts (TIER 1+2+3)
- Conversation workflows
- Tool calling tests
- RAG-enhanced prompts

✅ **Customer-specific benchmarks:**
- Testing on customer's actual prompts
- Industry-specific evaluation
- Custom quality criteria

---

## Recommended Test Suite Structure

### Runs 1-5: Speed Benchmarking (llama-bench)

**Purpose:** Measure pure performance across prompt sizes

**Tool:** llama-bench

**Metrics:**
- Prompt processing speed (tok/s)
- Text generation speed (tok/s)
- Total latency (ms)
- With 5 repetitions for confidence intervals

**No Quality Evaluation:** (llama-bench doesn't capture responses)

**Time:** ~30 minutes (much faster than custom runner)

### Run 6: Quality Benchmarking (Custom Runner)

**Purpose:** Evaluate accuracy and correctness with real prompts

**Tool:** Custom runner

**Metrics:**
- Topic coverage (%)
- Accuracy score (%)
- Hallucination detection
- **Also: Speed metrics** (for reference)

**With Response Capture:** Full text for analysis

**Time:** ~2-3 hours (50 prompts × 3 models × quality evaluation)

### Run 7: Configuration Testing (llama-bench)

**Purpose:** Find optimal configuration (threads, batch, quantization)

**Tool:** llama-bench

**Test Matrix:**
- Threads: 4, 8, 12, 16
- Batch: 512, 1024, 2048
- Quantization: Q4_K_M, Q5_K_M, Q8_0

**Goal:** Identify best performance configuration

**Time:** ~45 minutes

---

## Migration Path

### Phase 1: Add llama-bench Support (2-3 hours)

1. Create `utils/llama-bench-client.js` (60 min)
2. Add llama-bench mode to `run-performance-tests.js` (45 min)
3. Test with one model (30 min)
4. Validate schema conversion (30 min)

### Phase 2: Switch Runs 1-5 to llama-bench (1-2 hours)

1. Update run-performance-tests.js logic (45 min)
2. Run complete test suite (30 min)
3. Compare old vs new results (validate similar) (45 min)

### Phase 3: Keep Both Options (30 min)

1. Add `--tool` flag: `--tool llama-bench` or `--tool custom`
2. Default: llama-bench for Runs 1-5, custom for Run 6
3. Allow override for specific use cases

---

## Technical Advantages of llama-bench

### 1. No HTTP Overhead

**Current (Custom Runner):**
```
Total Time = Model Processing + HTTP Overhead
           = 3200ms + 50ms (fetch + JSON parse + network)
           = 3250ms

Measured Speed = 128 tokens / 3.25s = 39.4 tok/s
```

**llama-bench:**
```
Total Time = Model Processing Only
           = 3200ms (direct engine call)

Measured Speed = 128 tokens / 3.2s = 40.0 tok/s  ✅ More accurate
```

**Difference:** ~1.5% more accurate

### 2. Authoritative Source

**Customers ask:** "Why is your phi3 benchmark 58 tok/s but llama.cpp docs say 62 tok/s?"

**Current Answer:** "We measure via HTTP API which has overhead..."

**With llama-bench:** "We use llama-bench (llama.cpp official tool) - same methodology as llama.cpp benchmarks"

### 3. Parameter Sweep Capabilities

**llama-bench can test configurations in one command:**

```bash
llama-bench \
  -m phi3.gguf \
  -p 512 \
  -n 128 \
  -t 4,8,12,16 \      # Test 4 thread counts
  -b 512,1024,2048 \  # Test 3 batch sizes
  -ngl 0,35 \         # Test CPU vs GPU
  -r 5 \
  -o json
```

**Outputs:** 4 × 3 × 2 × 5 = 120 measurements in one run

**Current approach:** Would need custom code for each variation

### 4. Statistical Confidence

**llama-bench:**
- Built-in repetitions (-r 5)
- Calculates mean, stddev automatically
- Warmup runs (excluded from measurements)
- Professional statistical methodology

**Current:**
- We run once per prompt
- No built-in repetitions
- No warmup
- Manual statistics

---

## Recommendation: Hybrid Implementation

### Proposed Test Suite

```
Performance Test Suite
├── Runs 1-5: Speed Benchmarking (llama-bench)
│   ├── Run 1: 10 tokens   → llama-bench -p 10 -n 128
│   ├── Run 2: 50 tokens   → llama-bench -p 50 -n 128
│   ├── Run 3: 100 tokens  → llama-bench -p 100 -n 128
│   ├── Run 4: 150 tokens  → llama-bench -p 150 -n 128
│   └── Run 5: 190 tokens  → llama-bench -p 190 -n 128
│
│   Metrics: Authoritative tok/s, latency
│   Time: ~30 minutes (faster than custom)
│   Response Text: No (don't need for pure speed)
│
├── Run 6: Quality Benchmarking (Custom Runner)
│   ├── 50 multi-tier prompts (2000-2500 tokens)
│   ├── Full response capture
│   ├── Quality evaluation
│   └── Speed measurement (for reference)
│
│   Metrics: Accuracy, topic coverage, tok/s
│   Time: ~2-3 hours
│   Response Text: Yes (required for quality eval)
│
└── Run 7: Configuration Testing (llama-bench)
    ├── Test thread counts: 4,8,12,16
    ├── Test batch sizes: 512,1024,2048
    └── Test quantizations: Q4,Q5,Q8

    Metrics: Optimal configuration discovery
    Time: ~45 minutes
    Response Text: No
```

### Customer Deliverables

**Performance Report:**
```
Model: phi3 (3.8B, Q4_K_M)

Speed (llama-bench - authoritative):
  Prompt Processing: 1,208 tok/s
  Text Generation:   58.3 tok/s ±0.4
  Latency:          3,201ms ±45ms

Quality (custom evaluation):
  GDPR Accuracy:    45%
  ISO 27001:        38%
  Overall Score:    41.5%

Recommendation: ❌ Not suitable for compliance
  Reason: Fast but inaccurate, frequent hallucinations
```

**vs**

```
Model: mistral (7B, Q4_K_M)

Speed (llama-bench - authoritative):
  Prompt Processing: 1,124 tok/s
  Text Generation:   54.2 tok/s ±0.3
  Latency:          3,456ms ±38ms

Quality (custom evaluation):
  GDPR Accuracy:    87%
  ISO 27001:        84%
  Overall Score:    85.5%

Recommendation: ✅ Recommended for compliance
  Reason: Slightly slower but highly accurate
  Value: Best quality/speed tradeoff
```

---

## Implementation Timeline

### Option A: Add llama-bench Now (3-4 hours)

**Day 1 Morning:**
- Create llama-bench-client.js wrapper (90 min)
- Update run-performance-tests.js for hybrid mode (60 min)
- Test with Run 1 only (30 min)
- Validate results (30 min)

**Result:** Can run Runs 1-5 with llama-bench

### Option B: Fix Critical Issues First, Then Add llama-bench

**Day 1-2:** Fix Issues #1-7 (12-16 hours)
**Day 3:** Add llama-bench integration (3-4 hours)

**Reason:** Get data integrity right first, then enhance with llama-bench

---

## Decision Matrix

| Factor | Keep Custom Only | Add llama-bench Hybrid |
|--------|------------------|------------------------|
| **Accuracy** | Good (has HTTP overhead) | ✅ Excellent (authoritative) |
| **Credibility** | Custom = less trusted | ✅ Industry-standard tool |
| **Speed** | Slower (HTTP roundtrip) | ✅ Faster (direct) |
| **Quality Eval** | ✅ Yes | ✅ Yes (via custom runner) |
| **Complexity** | ✅ Simple (one tool) | ⚠️ More complex (two tools) |
| **Maintenance** | ✅ Less code | ⚠️ More integration code |
| **Customer Value** | Good | ✅ Better (authoritative + quality) |

---

## Questions for You

Before implementing hybrid approach:

1. **Timing:** Should we add llama-bench integration now, or after fixing critical issues #1-7?

2. **Scope:** Should we:
   - Replace Runs 1-5 entirely with llama-bench? (lose response text for those)
   - Run BOTH llama-bench AND custom for Runs 1-5? (double time, but have both)
   - Add llama-bench as Run 7 (configuration testing)?

3. **Response Text:** Are you okay with Runs 1-5 NOT having response text if using llama-bench?
   - Pro: More accurate speed metrics
   - Con: Cannot evaluate quality for those runs

4. **Customer Deliverable:** Should performance reports explicitly label "Measured with llama-bench (official)" for credibility?

---

## My Recommendation

**Two-Phase Approach:**

**Phase 1 (This Week):** Fix critical issues #1-7
- Get data integrity right
- Ensure schema compliance
- Valid, reproducible results

**Phase 2 (Next Week):** Add llama-bench integration
- Runs 1-5: llama-bench (speed only)
- Run 6: Custom runner (quality + speed)
- Run 7: llama-bench parameter sweep

**Rationale:**
1. Fix data quality first (no point in accurate speed if data is wrong)
2. Then enhance with llama-bench (icing on cake)
3. Customers get best of both worlds

**Total Time:**
- Week 1: Fix critical issues (12-16 hours)
- Week 2: Add llama-bench (3-4 hours)
- **Total: 15-20 hours over 2 weeks**

---

**Status:** Awaiting decision on approach and timing
**Contact:** libor@arionetworks.com
