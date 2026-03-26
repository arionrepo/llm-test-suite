# Docker Profile Launch Guide

**File:** `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/DOCKER-PROFILE-LAUNCH-GUIDE.md`
**Description:** Guide for launching Docker containers with different configuration profiles
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Quick Start

Launch Docker containers with a specific profile using environment variables:

```bash
# Balanced profile (recommended for most testing)
export DOCKER_THREADS=10
export DOCKER_N_BATCH=1024
export DOCKER_N_PARALLEL=2

cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite
docker-compose up -d
```

---

## Available Profiles

### Conservative Profile
**Use Case:** Baseline accuracy testing with NO concurrency overhead

```bash
export DOCKER_THREADS=4
export DOCKER_N_BATCH=512
export DOCKER_N_PARALLEL=1

docker-compose up -d
```

**Results in:**
- Single concurrent request per model
- Minimal thread utilization (4 CPU threads)
- Smallest batch sizes
- Max memory: 35.2GB (for 32B models)
- Purpose: Pure model accuracy, no concurrency effects

### Balanced Profile (RECOMMENDED)
**Use Case:** Production-realistic testing with moderate load

```bash
export DOCKER_THREADS=10
export DOCKER_N_BATCH=1024
export DOCKER_N_PARALLEL=2

docker-compose up -d
```

**Results in:**
- 2 concurrent requests per model
- Balanced CPU utilization (10 threads)
- Medium batch sizes
- Max memory: 38.4GB (for 32B models)
- Purpose: Real-world simulation, most production workloads
- **This is the default if no env vars are set**

### Aggressive Profile
**Use Case:** Stress testing, throughput benchmarking

```bash
export DOCKER_THREADS=10
export DOCKER_N_BATCH=2048
export DOCKER_N_PARALLEL=4

docker-compose up -d
```

**Results in:**
- 4 concurrent requests per model
- Full CPU utilization (10 threads)
- Large batch sizes
- Max memory: 41.6GB (for 32B models)
- Purpose: Stress test, maximum throughput

---

## Per-Model Memory Customization

If you want different memory limits than defaults, set model-specific variables:

```bash
# Use balanced profile BUT with aggressive memory for largest model
export DOCKER_THREADS=10
export DOCKER_N_BATCH=1024
export DOCKER_N_PARALLEL=2

export DOCKER_QWEN32B_MEMORY=42G
export DOCKER_DEEPSEEK32B_MEMORY=42G
export DOCKER_MISTRAL24B_MEMORY=33G

docker-compose up -d
```

**Available memory variables:**
- DOCKER_PHI3_MEMORY (default: 7G)
- DOCKER_MISTRAL7B_MEMORY (default: 10G)
- DOCKER_HERMES3_MEMORY (default: 11G)
- DOCKER_LLAMA8B_MEMORY (default: 11G)
- DOCKER_QWENCODER_MEMORY (default: 9G)
- DOCKER_SMOLLM3_MEMORY (default: 4G)
- DOCKER_LLAMA17B_MEMORY (default: 24G)
- DOCKER_QWEN32B_MEMORY (default: 40G)
- DOCKER_DEEPSEEK32B_MEMORY (default: 40G)
- DOCKER_MISTRAL24B_MEMORY (default: 31G)

---

## Running Tests with Profiles

### Test with Balanced Profile

```bash
# 1. Start containers with balanced profile
export DOCKER_THREADS=10
export DOCKER_N_BATCH=1024
export DOCKER_N_PARALLEL=2

cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite
docker-compose up -d

# 2. Wait for containers to start (~1 minute)
sleep 60

# 3. Run test with config tracking
node run-enterprise-tests.js pilot --profile balanced

# 4. Results stored at:
# reports/compliance/2026-03-26/test-results-enterprise-pilot-*.json
# (includes dockerConfig metadata)
```

### Test All Profiles Sequentially

```bash
#!/bin/bash
# Script: test-all-profiles.sh

cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite

for PROFILE in conservative balanced aggressive; do
  echo "Testing with $PROFILE profile..."

  # Set environment variables based on profile
  case $PROFILE in
    conservative)
      export DOCKER_THREADS=4
      export DOCKER_N_BATCH=512
      export DOCKER_N_PARALLEL=1
      ;;
    balanced)
      export DOCKER_THREADS=10
      export DOCKER_N_BATCH=1024
      export DOCKER_N_PARALLEL=2
      ;;
    aggressive)
      export DOCKER_THREADS=10
      export DOCKER_N_BATCH=2048
      export DOCKER_N_PARALLEL=4
      ;;
  esac

  # Start containers
  docker-compose up -d
  sleep 60

  # Run tests
  node run-enterprise-tests.js quick --profile $PROFILE

  # Stop and wait for cleanup
  docker-compose down
  sleep 30
done

echo "All profiles tested!"
```

---

## Verifying Profile Settings

### Check Running Container Configuration

```bash
# View environment variables in running container
docker exec llm-phi3 env | grep -E "THREADS|BATCH|PARALLEL"

# Example output:
# DOCKER_THREADS=10
# DOCKER_N_BATCH=1024
# DOCKER_N_PARALLEL=2
```

### Check Memory Limits

```bash
# View memory limit for specific container
docker inspect llm-qwen-32b | grep MemoryLimit

# Check all containers
docker ps --format "table {{.Names}}\t{{.MemoryLimit}}"
```

---

## Troubleshooting

### Container Exits Immediately

**Problem:** Container starts but exits immediately

**Solution:** Check logs for memory pressure
```bash
docker logs llm-phi3 | tail -20

# If you see "out of memory" or allocation errors:
# - Reduce N_PARALLEL (fewer concurrent requests)
# - Reduce N_BATCH (smaller batch sizes)
# - Increase model-specific memory limit
```

### Model Responding Slowly

**Problem:** Inference latency too high

**Solution:** Profile may be resource-constrained
```bash
# Check container memory usage
docker stats llm-phi3

# If near memory limit:
# - Increase model memory limit
# - Reduce N_PARALLEL
# - Use conservative profile for baseline

# If CPU at 100%:
# - Reduce N_PARALLEL
# - Reduce N_BATCH
# - Try conservative profile
```

### Port Already in Use

**Problem:** "Port 9081 already in use"

**Solution:** Stop existing containers
```bash
docker-compose down
sleep 10
docker-compose up -d
```

---

## Integration with Test Results

When you run tests, the profile configuration is automatically tracked in results:

```json
{
  "metadata": {
    "timestamp": "2026-03-26T12:00:00Z",
    "testType": "compliance",
    "runName": "enterprise-pilot",
    "dockerConfig": {
      "profileName": "balanced",
      "description": "Production-realistic - moderate concurrency for load testing",
      "purpose": "Real-world scenario - 2 concurrent requests",
      "threads": 10,
      "n_batch": 1024,
      "n_parallel": 2,
      "memory_overhead_percent": 120,
      "concurrent_requests": 2
    }
  },
  "results": [...]
}
```

This enables:
- Comparing accuracy across profiles
- Analyzing performance tradeoffs
- Identifying optimal configuration for your use case

---

## Example: Complete Testing Workflow

```bash
#!/bin/bash
# Full workflow: test model accuracy across all profiles

cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite

echo "🚀 Starting comprehensive profile testing..."

# Test 1: Conservative (baseline)
echo "📊 Conservative Profile (1 concurrent request)..."
export DOCKER_THREADS=4
export DOCKER_N_BATCH=512
export DOCKER_N_PARALLEL=1
docker-compose up -d
sleep 90
node run-enterprise-tests.js quick --profile conservative
docker-compose down
sleep 30

# Test 2: Balanced (default)
echo "📊 Balanced Profile (2 concurrent requests)..."
export DOCKER_THREADS=10
export DOCKER_N_BATCH=1024
export DOCKER_N_PARALLEL=2
docker-compose up -d
sleep 90
node run-enterprise-tests.js quick --profile balanced
docker-compose down
sleep 30

# Test 3: Aggressive (stress test)
echo "📊 Aggressive Profile (4 concurrent requests)..."
export DOCKER_THREADS=10
export DOCKER_N_BATCH=2048
export DOCKER_N_PARALLEL=4
docker-compose up -d
sleep 90
node run-enterprise-tests.js quick --profile aggressive
docker-compose down
sleep 30

echo "✅ All profiles tested!"
echo "📂 Results: reports/compliance/2026-03-26/"
```

---

## Performance Expectations

**System:** M4 Max with 128GB RAM, 12-core CPU, 59GB allocated for tests

| Profile | Latency | Throughput | Memory |
|---------|---------|-----------|--------|
| Conservative | Baseline | 1 req/s | 35.2GB (32B model) |
| Balanced | +2-3% | 2 req/s | 38.4GB (32B model) |
| Aggressive | +5-8% | 4 req/s | 41.6GB (32B model) |

Overhead is primarily from:
- Context switching between requests
- Memory allocation for concurrent request buffers
- Batch processing overhead

---

**Questions:** libor@arionetworks.com
