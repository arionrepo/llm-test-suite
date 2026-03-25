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

## Test Result Validity Criteria

**A test run is only valid if:**

1. ✅ Only 1 model running at any time (verified via process count)
2. ✅ All stop verifications passed (endpoint unreachable)
3. ✅ All start verifications passed (test query succeeded)
4. ✅ No verification failures in audit log
5. ✅ Memory stable (not growing unbounded)

**If ANY criterion fails → results are INVALID, must re-run**

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
