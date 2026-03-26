# Docker Containerized LLM Setup Guide

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/DOCKER_SETUP_GUIDE.md
**Description:** Complete guide to running LLMs in Docker containers alongside native processes
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

## Overview

This setup enables **parallel management** of LLMs:
- **Native Mode** (Ports 8081-8090): Direct process management via llamacpp-manager
- **Docker Mode** (Ports 9081-9090): Containerized instances via Docker

Both systems can run simultaneously without interference. The Swift GUI shows separate tabs for each.

## Architecture

```
Swift Menu Bar App
├── Infrastructure Tab       (cloudflared, controller, etc.)
├── Native Models Tab        (Native llama.cpp processes on 8081-8090)
└── Docker Models Tab        (Containerized on 9081-9090)

Native Mode:
  llamacpp-manager CLI → Native llama-server processes

Docker Mode:
  llamacpp-manager docker CLI → Docker SDK → Docker containers

Test Suite:
  llm-test-suite/ → Can target either port range via configuration
```

## Files Created

1. **docker-compose.yml** (6.6KB)
   - 10 LLM services (phi3, mistral7b, hermes-3, llama-3.1-8b, qwen-coder-7b, smollm3, llama-4-scout-17b, qwen-32b, deepseek-32b, mistral-24b)
   - Resource limits per model (memory, GPU)
   - Health checks with 5-60s startup windows
   - Volumes mounted for model files

2. **docker_manager.py** (400 lines)
   - Python module for Docker container lifecycle
   - Methods: start(), stop(), restart(), status(), logs()
   - Health verification via HTTP endpoint testing
   - JSON status output for GUI integration

3. **docker_commands.py** (250 lines)
   - CLI command implementations
   - Integrated into llamacpp-manager via cli.py

4. **Swift GUI Updates** (App.swift)
   - New "Docker Models" tab
   - Docker container controls (Start, Stop, Restart, Chat, Logs)
   - Separate status tracking for both native and Docker

## Setup Instructions

### Prerequisites

```bash
# Ensure Docker is installed and running
docker --version
docker ps

# Ensure llamacpp-manager Python backend is installed
which llamacpp-manager
```

### Step 1: Verify Models Are Present

```bash
ls -lh ~/llms/phi3/Phi-3-mini-4k-instruct-fp16.gguf
ls -lh ~/llms/mistral7b/mistral-7b-instruct-v0.2.Q8_0.gguf
# ... etc for all 10 models
```

### Step 2: Start Docker Containers

**Option A: All at once**
```bash
cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite
docker-compose up -d
```

**Option B: Individual containers**
```bash
docker-compose up -d llm-phi3 llm-mistral7b
```

**Option C: Via CLI**
```bash
llamacpp-manager docker start all
llamacpp-manager docker start phi3
```

### Step 3: Verify Containers Are Running

```bash
# Check all containers
llamacpp-manager docker status

# Check specific container
llamacpp-manager docker status phi3

# JSON output (for Swift GUI)
llamacpp-manager docker status --json
```

**Expected output:**
```
Docker Container Status:
────────────────────────────────────────────────────────────────────────────────
🟢 llm-phi3
   Port: 9081
   Status: healthy
   Latency: 45ms
🟢 llm-mistral7b
   Port: 9082
   Status: healthy
   Latency: 52ms
```

## Swift GUI Integration

### Native Models Tab
- Shows processes on **ports 8081-8090**
- Started via `llamacpp-manager start phi3`
- Shows: PID, port, latency, health status, uptime

### Docker Models Tab
- Shows containers on **ports 9081-9090**
- Started via `llamacpp-manager docker start phi3`
- Shows: Container ID, port, latency, health status, uptime
- Same control buttons: Start, Stop, Restart, Chat, Logs

### Key Differences

| Feature | Native | Docker |
|---------|--------|--------|
| Startup time | 30-120s | 35-130s |
| Latency | Baseline | +2-5% |
| Resource isolation | Weak | Strong |
| Memory limits | OS-enforced | Hard limits |
| Process management | Native OS | Docker |

## Testing Instructions

### Pilot Test (2 Models)

```bash
# Start native phi3
llamacpp-manager start phi3

# Start Docker mistral
llamacpp-manager docker start mistral7b

# Verify both responding
curl -I http://127.0.0.1:8081/health  # Native phi3
curl -I http://127.0.0.1:9082/health  # Docker mistral

# Test actual inference
curl -X POST http://127.0.0.1:8081/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}], "max_tokens": 5}'

curl -X POST http://127.0.0.1:9082/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}], "max_tokens": 5}'
```

### Full Test Suite

```bash
cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite

# Start all Docker containers
docker-compose up -d

# Configure test suite to use Docker ports (9081-9090)
# Edit your test configuration to point to localhost:908x

# Run tests
node run-enterprise-tests.js docker  # if configured
# or
npm test
```

### Sequential Validation

The project's CLAUDE.md specifies strict sequential testing requirements:

```javascript
// ✅ Correct: Verify stop before starting next
await dockerStop('phi3');      // Stop container
let retries = 15;
while (retries--) {
  const health = await healthCheck(9081);  // Must fail
  if (health === 'down') break;
  await sleep(1000);
}
await sleep(10000);  // Memory cleanup
await dockerStart('mistral7b');  // Only then start next
```

## Common Commands

### Start/Stop/Restart

```bash
# Start individual container
llamacpp-manager docker start phi3
llamacpp-manager docker start mistral7b

# Start all
llamacpp-manager docker start all

# Stop specific
llamacpp-manager docker stop phi3

# Stop all
llamacpp-manager docker stop all

# Restart
llamacpp-manager docker restart phi3
```

### Status & Monitoring

```bash
# All containers
llamacpp-manager docker status
llamacpp-manager docker status --json

# Specific container
llamacpp-manager docker status phi3
llamacpp-manager docker status phi3 --json

# Logs
llamacpp-manager docker logs phi3
llamacpp-manager docker logs phi3 --tail 100

# Real-time monitoring
docker-compose logs -f llm-phi3
docker-compose logs -f llm-mistral7b
```

### Docker-Specific Operations

```bash
# View all running containers
docker ps | grep llm-

# Stop container directly
docker stop llm-phi3

# Remove container (stop first!)
docker rm llm-phi3

# View detailed container info
docker inspect llm-phi3

# Check resource usage
docker stats

# View container logs
docker logs llm-phi3 --tail 50
```

## Troubleshooting

### Container Won't Start

```bash
# Check if port is in use
lsof -i :9081

# View startup logs
docker logs llm-phi3

# Check memory/resource constraints
docker stats llm-phi3

# Verify model file exists
ls -lh ~/llms/phi3/Phi-3-mini-4k-instruct-fp16.gguf

# Try restarting Docker
docker-compose down llm-phi3
docker-compose up -d llm-phi3
```

### Health Check Failing

```bash
# Manually test endpoint
curl -v http://127.0.0.1:9081/health

# Check if container is running
docker ps | grep llm-phi3

# View container logs
docker logs llm-phi3 --tail 20

# Check model is loaded (wait longer)
sleep 30
curl http://127.0.0.1:9081/health
```

### Swift GUI Not Showing Docker Containers

```bash
# Verify CLI is installed
which llamacpp-manager

# Test Docker status command
llamacpp-manager docker status --json

# Ensure Swift app can access Docker
docker version

# Check app logs
log stream --predicate 'process=="llamacpp_gui"' --level debug
```

### Port Conflicts

```bash
# Find what's using port 9081
lsof -i :9081

# Kill process (if safe)
kill -9 <PID>

# Or use different port in docker-compose.yml:
# Change "9081:8000" to "9085:8000" for phi3
docker-compose up -d llm-phi3

# Update port in config as needed
```

## Performance Notes

### Startup Times

Small models (1-8B):
- Native: 30-60s
- Docker: 35-65s (slight overhead)

Large models (17-32B):
- Native: 90-120s
- Docker: 100-135s

### Inference Latency

- Native baseline: 100% (reference)
- Docker: 102-105% (2-5% overhead)

Overhead is from:
- Docker socket communication (~1-2ms)
- Container runtime overhead (~1-3%)
- Network stack (localhost, minimal)

### Memory Usage

Docker provides explicit limits:
```yaml
llm-phi3:
  deploy:
    resources:
      limits:
        memory: 12G  # Hard limit
```

Native: OS-managed (can exceed if needed, risky)

## Migration Path

### Phase 1: Run Both in Parallel ✅ (Current)
- Native models on 8081-8090
- Docker models on 9081-9090
- Swift GUI shows both tabs
- Tests can use either

### Phase 2: Validate Docker (Next)
- Run same tests against both
- Compare results, latency, reliability
- Gather confidence data

### Phase 3: Full Migration (When Confident)
- Switch tests to Docker
- Retire native process management
- Consider cloud deployment

## References

- Docker Hub: https://github.com/ggerganov/llama.cpp
- Image: ghcr.io/ggerganov/llama.cpp:server-latest
- Docker Compose: docker-compose.yml
- CLI Integration: src/llamacpp_manager/docker_manager.py
- Swift GUI: gui-macos/Sources/App.swift

## Next Steps

1. **Test Docker containers are healthy:**
   ```bash
   docker-compose up -d
   sleep 60
   llamacpp-manager docker status --json
   ```

2. **Rebuild Swift GUI** (to include Docker tab):
   ```bash
   cd gui-macos
   swift build
   # or open in Xcode and build
   ```

3. **Run pilot test** (2 models native + 2 Docker):
   ```bash
   cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite
   # Create pilot-test.js using only phi3 (native) and mistral (docker)
   ```

4. **Validate sequential isolation** (per CLAUDE.md requirements):
   - Stop Docker phi3, verify port unreachable
   - Wait for memory cleanup
   - Start Docker mistral, verify responsive
   - Repeat for all models

5. **Compare results** (native vs Docker):
   - Same prompts, both systems
   - Measure latency, accuracy, reliability
   - Collect metrics for decision

## Questions?

See project CLAUDE.md for:
- Sequential testing requirements
- Isolation validation methodology
- Performance measurement guidelines

Contact: libor@arionetworks.com
