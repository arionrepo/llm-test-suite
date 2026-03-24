# LLM Test Suite

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/README.md
**Description:** Comprehensive test suite for evaluating local LLM server performance, accuracy, tool calling, and context handling
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-23

## Overview

Comprehensive LLM testing framework with two testing modes:

1. **Basic Tests**: Speed, accuracy, tool calling, context window (single model)
2. **Enterprise Tests**: Multi-model compliance testing across standards, personas, and company types

**Manages:** 10 LLM models via llamacpp-manager
**Tests:** 52+ compliance scenarios + 31 ArionComply workflows = 83+ total prompts

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

### Compliance Standards (15)
GDPR, CCPA, CPRA, HIPAA, EU AI Act, CA SB 1047, CA AB 2013, ISO 27001, ISO 27017, ISO 27018, SOC 2, NIST CSF, CIS Controls, PCI-DSS, CSA CCM, FedRAMP

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
