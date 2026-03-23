# LLM Test Suite

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/README.md
**Description:** Comprehensive test suite for evaluating local LLM server performance, accuracy, tool calling, and context handling
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-23

## Overview

Test suite for llama.cpp server running at `http://localhost:8088`.

**Current Model:** Llama-4-Scout-17B-16E-Instruct (Q6_K, ~107B params)

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

```bash
# Install dependencies (none currently, uses Node.js built-ins)
npm install

# Run all tests
npm test

# Run individual test suites
npm run test:speed
npm run test:accuracy
npm run test:tools
npm run test:context
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

## Directory Structure

```
llm-test-suite/
├── README.md
├── package.json
├── config.js                    # Configuration
├── run-all-tests.js             # Master test runner
├── reports/                     # Test results (generated)
├── tests/
│   ├── speed-test.js           # Performance benchmarks
│   ├── accuracy-test.js        # Response quality tests
│   ├── tool-calling-test.js    # Function calling tests
│   └── context-window-test.js  # Long conversation tests
└── utils/
    ├── llm-client.js           # API client wrapper
    └── test-helpers.js         # Shared utilities
```
