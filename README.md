# LLM Test Suite

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/README.md
**Description:** Enterprise LLM evaluation platform for comparing local vs cloud models across real-world business use cases
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-23
**Last Updated:** 2026-03-25

---

## Vision & Goals

### The Big Question

**"Can we use local LLMs instead of expensive cloud APIs for our enterprise use cases?"**

This test suite helps businesses answer that question with **data-driven evidence**.

### Primary Goals

1. **Enterprise Use Case Testing**
   - Test practical, real-world business tasks (not theoretical benchmarks)
   - Focus on tasks businesses actually need LLMs to do
   - Measure real-world accuracy and quality

2. **Local vs Cloud Comparison**
   - Help businesses evaluate cost-saving opportunities
   - Identify which tasks work well with local models (Llama 3, Mistral, Qwen)
   - Identify which tasks require cloud models (GPT-4, Claude)
   - Quantify accuracy/cost trade-offs

3. **Multi-Customer Platform**
   - Support vendor-agnostic baseline tests (any business can use)
   - Support customer-specific tests (ArionComply is first customer)
   - No hardcoded vendor assumptions
   - Scalable to unlimited customers

4. **Flexible Routing**
   - Test same prompt against multiple backends (comparison)
   - Route to direct LLMs, customer pipelines, or local instances
   - Measure value-add of customer enhancements (RAG, context injection)

---

## Overview

**Comprehensive LLM evaluation platform** with multiple testing modes:

1. **Basic Tests**: Speed, accuracy, tool calling, context window (single model)
2. **Enterprise Tests**: Multi-model testing across use cases, vendors, and routing profiles
3. **Comparison Tests**: Same prompt, multiple backends, side-by-side evaluation

**Supported Backends:**
- **Direct Cloud LLMs:** OpenAI (GPT-4), Anthropic (Claude), Cohere, Google (Gemini)
- **Local LLMs:** Llama 3, Mistral, Qwen 2.5, Phi-3 (via llamacpp-manager)
- **Customer Pipelines:** ArionComply (Supabase edge function with RAG)

**Current Test Suite:** 173 total prompts
- 52 generic compliance tests (vendor-agnostic, 10-50 tokens)
- 50 ArionComply multi-tier tests (2000+ tokens with TIER 1+2+3)
- 31 ArionComply platform workflow tests
- 30 intent classification tests
- 10 workflow understanding tests

**Use Cases Covered:**
- Compliance knowledge (GDPR, ISO 27001, SOC 2, HIPAA, 25+ more standards)
- Platform workflows (evidence upload, assessments, reporting)
- Multi-tier prompt construction (context injection, RAG enhancement)

## Test Categories

### 1. Speed/Performance Tests
- **Latency:** Time to first token
- **Throughput:** Tokens per second
- **Concurrent requests:** Multi-request handling
- **Various prompt lengths:** Short (10 tokens) to long (1000+ tokens)

### 2. Accuracy Tests
- **Instruction following:** Does it follow complex instructions?
- **Factual accuracy:** Can it answer known facts correctly?
- **Reasoning:** Can it solve logic problems?
- **Code generation:** Can it write working code?

### 3. Tool/Function Calling Tests
- **Simple function calls:** Single function with clear parameters
- **Multiple functions:** Choose correct function from many
- **Complex parameters:** Nested objects, arrays, optional fields
- **Error handling:** Graceful handling of invalid requests

### 4. Context Window Tests
- **Long conversations:** Multi-turn dialogues
- **Information retention:** Remember details from earlier in conversation
- **Context limits:** How does it behave at 10M token limit?

### LLM-as-Judge Evaluation (NEW!)

**Automated evaluation** of test results using cloud LLMs:
- **Claude (Anthropic)** - Expert compliance evaluation
- **GPT-4 (OpenAI)** - Benchmark comparison
- **Ensemble Mode** - Multiple judges, aggregate scores

**What judges evaluate:**
1. Topic coverage accuracy (better than keyword matching)
2. Response quality (correctness, completeness, appropriateness)
3. Workflow accuracy (correct steps, screens, buttons for ArionComply)
4. Hallucination detection (fabricated facts, wrong citations)

**Output format:**
- Pass/Fail with detailed reasoning
- Detailed score breakdown (topic coverage: 85%, accuracy: 90%, etc.)
- Qualitative analysis (strengths, weaknesses, gaps)
- Human review queue for disagreements

**Configuration:** Set API keys in environment or config
```bash
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
```

See: `utils/cloud-llm-judge.js`, `review-interface.html`

### Subjective Quality Ratings (NEW!)

**Human-like evaluation** of LLM responses using structured rating format:
- **Standardized 1-5 scale** with detailed explanations
- **Multi-dimensional criteria** (readability, understandability, accuracy)
- **Quality flags** (hallucinations, context usage, major issues)
- **Machine-readable format** for aggregation and analysis

**Storage location:** `ratings/` directory
- Individual rating files: `claude-subjective-test-10.json`, etc.
- Master merged file: `claude-all-150-ratings.json` (all evaluations)

**Integration:**
- **Web viewer:** `viewer/response-viewer.html` displays ratings alongside responses
- **Analysis tools:** Load ratings for statistical comparison
- **Validation:** Schema-compliant format ensures data quality

**Documentation:**
- **Complete schema:** `docs/RATINGS-SCHEMA.md` (field specs, validation, examples)
- **Integration guide:** Code examples for loading and aggregating ratings
- **Storage conventions:** File naming, directory structure, versioning

**Example usage:**
```javascript
// Load and display ratings
const ratings = await fetch('/ratings/claude-all-150-ratings.json');
const data = await ratings.json();

// Find rating for specific response
const rating = data.ratings.find(r =>
  r.promptId === 'ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1' &&
  r.modelName === 'mistral'
);

console.log(`Rating: ${rating.rating}/5`);
console.log(`Explanation: ${rating.explanation}`);
```

**Current ratings:** 150 evaluations (50 prompts × 3 models × 2 runs)
- Mistral average: 4.08/5
- Phi3 average: 3.35/5
- SmolLM3 average: 2.73/5

---

## Quick Start

### Basic Tests (Single Model)

```bash
# Run all basic tests
npm test

# Run individual test suites
npm run test:speed      # Performance benchmarks
npm run test:accuracy   # Response quality
npm run test:tools      # Function calling
npm run test:context    # Long conversations
```

### Enterprise Tests (Multi-Model Compliance)

```bash
# View test statistics
npm run enterprise:stats

# Quick validation (20 tests, 2 models, ~5 min)
npm run enterprise:pilot

# Quick test (50 tests, 3 models, ~15 min)
npm run enterprise:quick

# Standard test (100 tests, 5 models, ~45 min)
npm run enterprise:standard

# Comprehensive (ALL tests, ALL 10 models, ~6-8 hours)
npm run enterprise:comprehensive

# Test function calling with Hermes
npm run enterprise:functions

# Export all prompts to markdown/CSV
node export-prompts.js
```

## Configuration

Edit `config.js` to change:
- LLM server URL (default: http://localhost:8088)
- Test parameters (timeouts, repetitions, etc.)
- Model parameters (temperature, max_tokens, etc.)

## Output

Tests generate:
- **Console output:** Real-time progress
- **JSON reports:** `reports/test-results-TIMESTAMP.json`
- **Summary:** Pass/fail counts, performance metrics

## Requirements

- Node.js 18+ (for native fetch API)
- llama.cpp server running on port 8088
- Model loaded and ready

## Enterprise Testing Features

### Compliance Standards (29)

**Privacy & Data Protection:**
GDPR, CCPA, CPRA, HIPAA, PIPEDA

**AI Regulations:**
EU AI Act, CA SB 1047, CA AB 2013

**ISO Security & Privacy:**
ISO 27001, ISO 27002, ISO 27017, ISO 27018, ISO 27701, ISO 22301, ISO/IEC 27050

**Cloud Security:**
CSA CCM, CSA STAR, FedRAMP

**NIST Frameworks:**
NIST CSF, NIST 800-53, NIST 800-171

**Audit & Controls:**
SOC 2, SSAE 18, CIS Controls, COBIT

**Payment & Financial:**
PCI-DSS, SOX, GLBA

**Defense:**
CMMC 2.0

### Knowledge Types (5)
- **Factual**: Definitions, requirements, facts
- **Relational**: Cross-references, dependencies, relationships
- **Procedural**: Step-by-step processes, workflows
- **Exact Match**: Precise citations, regulation text
- **Synthesis**: Multi-document comparison, gap analysis

### User Personas (6)
- **Novice**: New to compliance, needs explanations
- **Practitioner**: Understands standards, needs implementation details
- **Manager**: Needs workflows and strategic guidance
- **Auditor**: Needs verification criteria and evidence requirements
- **Executive**: Needs business impact and risk summaries
- **Developer**: Needs technical implementation guidance

### Company Profiles (8)
Startup, SMB, Enterprise, SaaS Provider, Healthcare, Financial Services, Public Sector, AI Company

### ArionComply Workflows (10 categories)
- Evidence Management
- Control Assessment
- Framework Mapping
- Compliance Dashboard
- Risk Assessment
- Policy Management
- Audit Preparation
- Data Subject Requests
- Vendor Risk Assessment
- AI System Registration

### 2D Complexity Model (NEW!)

**Input Complexity** - How hard is the question to parse?
- Lexical: token count, technical density, word complexity
- Structural: multi-part, conditionals, specificity
- Score: 0-100

**Output Complexity** - How hard is the answer to generate?
- Response scope: expected tokens, knowledge depth
- Knowledge type: factual (simple) → synthesis (complex)
- Processing: multi-source, reasoning, synthesis required
- Score: 0-100

**Performance Prediction:**
```
weightedScore = (inputScore × 0.25) + (outputScore × 0.75)
Why: Output generation dominates performance (3x more important than parsing)

Example:
"What is GDPR?"
├─ Input: 8/100 (simple question)
└─ Output: 33/100 (moderate - needs comprehensive explanation)
→ Weighted: 27/100 → Predicted: ~10s (Actual: 14.8s ✓ accurate!)
```

See: `2D-COMPLEXITY-SUMMARY.md` and `METRICS-DOCUMENTATION.md`

### Retrieval Pipeline Diagnostics

**What This Tests:** Baseline LLM knowledge (NO retrieval systems connected)

**Purpose:** Identify which retrieval infrastructure TO BUILD based on where pure LLM fails

**Recommended Infrastructure (Based on Test Results):**
- **Vector DB** → For factual knowledge (baseline: 71%, target: 90%+)
- **Knowledge Graph** → For relational queries (baseline: 44%, CRITICAL GAP)
- **Structured Retrieval** → For procedural workflows (baseline: 12%, CRITICAL GAP)
- **Meilisearch** → For exact citation matching (baseline: 50%, needs improvement)
- **RAG Synthesis** → For cross-document analysis (baseline: 0%, CRITICAL GAP)

**Pilot Test Results (Baseline LLM Only):**
- Factual Knowledge: 71.3% - Decent baseline, improve with vector DB
- Relational Knowledge: 44.4% - **BUILD knowledge graph**
- Procedural Knowledge: 12.5% - **BUILD structured workflow docs**
- Synthesis Knowledge: 0% - **BUILD RAG multi-doc retrieval**

## Directory Structure

```
llm-test-suite/
├── README.md
├── package.json
├── config.js                     # Configuration
├── run-all-tests.js              # Basic test runner
├── run-enterprise-tests.js       # Enterprise test runner
├── export-prompts.js             # Prompt export utility
├── reports/                      # Test results (generated)
│   └── prompts/                  # Exported prompts (CSV/MD)
├── tests/                        # Basic tests
│   ├── speed-test.js
│   ├── accuracy-test.js
│   ├── tool-calling-test.js
│   └── context-window-test.js
├── enterprise/                   # Enterprise tests
│   ├── compliance-standards.js   # 15 standards taxonomy
│   ├── user-personas.js          # 6 user personas
│   ├── company-profiles.js       # 8 company types
│   ├── test-data-generator.js    # Test question generator
│   ├── enterprise-test-runner.js # Multi-model test executor
│   ├── functions/
│   │   └── compliance-functions.js  # 10 enterprise functions
│   └── arioncomply-workflows/
│       └── ui-tasks.js           # 31 application prompts
└── utils/
    ├── llm-client.js             # API client wrapper
    ├── test-helpers.js           # Shared utilities
    └── llamacpp-manager-client.js  # Model switching
```
